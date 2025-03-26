import os
import openai
import random
import logging
from typing import Dict, Any
from dotenv import load_dotenv

# Configuration du logging
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement
load_dotenv()

# Configuration OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# Configuration OpenAI
client = openai.OpenAI(api_key='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')

def escape_sql_string(s: str) -> str:
    """Échappe une chaîne de caractères pour le SQL"""
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def generate_with_ai(prompt: str) -> str:
    """Génère du texte avec l'API OpenAI."""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Tu es un chef cuisinier expert qui aide à générer des recettes détaillées."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Erreur lors de l'appel à OpenAI: {str(e)}")
        raise

def validate_recipe_data(data: Dict[str, Any]) -> bool:
    """Valide les données de la recette générée."""
    required_fields = {
        'recipe': ['title', 'country', 'region', 'description', 'preparation_time', 
                  'cooking_time', 'difficulty', 'servings', 'is_premium', 'image_url'],
        'ingredients': ['name', 'quantity', 'unit'],
        'steps': ['order_number', 'title', 'description'],
        'playlist': ['title', 'description', 'spotify_link'],
        'wine_pairing': ['name', 'description', 'region']
    }
    
    try:
        # Vérifier la recette
        for field in required_fields['recipe']:
            if field not in data['recipe']:
                logger.error(f"❌ Champ manquant dans recipe: {field}")
                return False
        
        # Vérifier les ingrédients
        if not data['ingredients']:
            logger.error("❌ Aucun ingrédient trouvé")
            return False
        for ingredient in data['ingredients']:
            for field in required_fields['ingredients']:
                if field not in ingredient:
                    logger.error(f"❌ Champ manquant dans ingredient: {field}")
                    return False
        
        # Vérifier les étapes
        if not data['steps']:
            logger.error("❌ Aucune étape trouvée")
            return False
        for step in data['steps']:
            for field in required_fields['steps']:
                if field not in step:
                    logger.error(f"❌ Champ manquant dans step: {field}")
                    return False
        
        # Vérifier la playlist
        for field in required_fields['playlist']:
            if field not in data['playlist']:
                logger.error(f"❌ Champ manquant dans playlist: {field}")
                return False
        
        # Vérifier l'accord de vin
        for field in required_fields['wine_pairing']:
            if field not in data['wine_pairing']:
                logger.error(f"❌ Champ manquant dans wine_pairing: {field}")
                return False
        
        return True
    except Exception as e:
        logger.error(f"❌ Erreur lors de la validation: {str(e)}")
        return False

def generate_recipe(recipe_name: str) -> dict:
    """Génère une recette complète avec toutes les informations associées."""
    try:
        logger.info(f"🔄 Début de la génération pour: {recipe_name}")
        
        # D'abord, déterminons l'origine de la recette
        logger.info("📍 Génération de l'origine...")
        origin_prompt = f"""Pour la recette {recipe_name}, donne-moi uniquement le pays d'origine dans ce format :
Pays: [nom du pays]"""
        
        origin_response = generate_with_ai(origin_prompt)
        country = origin_response.split("Pays:")[1].strip() if "Pays:" in origin_response else "Non spécifié"
        logger.info(f"✅ Origine déterminée: {country}")
        
        # Création du personnage et de son univers
        character_prompt = f"""Pour une recette de {country}, crée un personnage de chef cuisinier et son univers avec ces détails précis :
Nom: [prénom et nom typiques du pays]
Âge: [âge]
Ville: [ville du pays]
Restaurant: [nom et description de son établissement]
Histoire personnelle: [histoire riche du chef, ses motivations, sa famille]
Caractère: [traits de personnalité qui le rendent unique]
Philosophie culinaire: [sa vision de la cuisine]
Routine quotidienne: [description d'une journée type]"""

        character_info = generate_with_ai(character_prompt).split('\n')

        # Création de l'histoire immersive
        story_prompt = f"""Crée une histoire immersive et détaillée autour de la préparation de {recipe_name} avec notre chef comme personnage principal. L'histoire doit être une narration riche qui :

1. Décrit l'ambiance du restaurant/du lieu de préparation
2. Présente le chef et sa connexion personnelle avec cette recette
3. Explique l'importance culturelle et historique du plat
4. Décrit les ingrédients et leur signification
5. Termine sur une note émotionnelle ou culturelle

L'histoire doit inclure :
- Des descriptions sensorielles détaillées (odeurs, sons, textures)
- Des dialogues naturels et authentiques
- Des références culturelles et historiques
- Des anecdotes personnelles du chef
- Des détails sur les techniques traditionnelles

Format requis :
[Histoire narrative continue, environ 4-5 paragraphes détaillés]"""

        story = generate_with_ai(story_prompt)

        # Étapes avec le personnage adapté
        steps_prompt = f"""En suivant l'histoire de notre chef pour la recette {recipe_name}, crée des étapes détaillées et narratives. Chaque étape doit être une scène complète et riche qui :

1. Décrit l'action technique précise avec des détails sur les gestes et les mouvements
2. Inclut des conseils du chef basés sur son expérience
3. Explique l'importance de l'étape dans la tradition culinaire
4. Ajoute des détails sensoriels (odeurs, textures, sons)
5. Intègre des anecdotes personnelles ou culturelles
6. Décrit les réactions et les émotions du chef

Format pour chaque étape (minimum 3-4 phrases par étape) :
Étape 1: [Description technique détaillée avec gestes précis] [Conseils du chef avec explications] [Importance culturelle] [Détails sensoriels] [Anecdotes personnelles]
Étape 2: [Description technique détaillée avec gestes précis] [Conseils du chef avec explications] [Importance culturelle] [Détails sensoriels] [Anecdotes personnelles]
etc.

Utilise ce personnage et son univers :
{character_info}

L'histoire principale :
{story}"""

        # Modification du general_prompt pour une description plus riche
        general_prompt = f"""Pour la recette {recipe_name}, en utilisant notre personnage et son histoire :
{character_info}

Format requis :
Pays: {country}
Region: [nom de la région]
Description: [Description riche et détaillée qui inclut :
- L'histoire du plat dans la région
- La signification culturelle
- Les traditions associées
- Les ingrédients emblématiques
- L'importance dans la cuisine locale]
Temps de préparation: [X] min
Temps de cuisson: [X] min
Difficulté: [facile/moyen/difficile]
Portions: [nombre]"""
        
        general_info = generate_with_ai(general_prompt).split('\n')
        
        # Vérification et extraction sécurisée des données
        def extract_value(lines, key):
            for line in lines:
                if line.startswith(f"{key}:"):
                    return line.split(":", 1)[1].strip()
            return None

        title = recipe_name
        region = extract_value(general_info, "Region") or "Non spécifié"
        description = extract_value(general_info, "Description") or "Pas de description"
        
        try:
            prep_time = int(extract_value(general_info, "Temps de préparation").replace(" min", ""))
        except (ValueError, AttributeError):
            prep_time = 30  # Valeur par défaut
        
        try:
            cook_time = int(extract_value(general_info, "Temps de cuisson").replace(" min", ""))
        except (ValueError, AttributeError):
            cook_time = 45  # Valeur par défaut
        
        difficulty = extract_value(general_info, "Difficulté") or "moyen"
        
        try:
            servings = int(extract_value(general_info, "Portions"))
        except (ValueError, AttributeError):
            servings = 4  # Valeur par défaut

        # Ingrédients
        logger.info("🥕 Génération des ingrédients...")
        ingredients_prompt = f"""Pour la recette {recipe_name}, donne les ingrédients dans ce format précis :
[quantité] [unité] [ingrédient]
Par exemple:
300 g farine
2 unité oeufs
etc."""
        ingredients = generate_with_ai(ingredients_prompt).split('\n')
        ingredients = [i.strip('- ') for i in ingredients if i.strip('- ')]
        logger.info(f"✅ {len(ingredients)} ingrédients générés")
        
        # Étapes avec le personnage adapté
        steps = generate_with_ai(steps_prompt).split('\n')
        steps = [s.strip('123456789. ') for s in steps if s.strip('123456789. ')]
        logger.info(f"✅ {len(steps)} étapes générées")
        
        # Playlist
        logger.info("🎵 Génération de la playlist...")
        playlist_prompt = f"""Pour la recette {recipe_name}, propose une playlist dans ce format précis :
Titre: [nom de la playlist]
Description: [ambiance de la playlist]
Lien: spotify:playlist:[code]"""
        playlist = generate_with_ai(playlist_prompt).split('\n')
        logger.info("✅ Playlist générée")
        
        # Accord de vin
        logger.info("🍷 Génération de l'accord de vin...")
        wine_prompt = f"""Pour la recette {recipe_name}, propose un accord de vin dans ce format précis :
Nom: [nom du vin]
Description: [description de l'accord]"""
        wine = generate_with_ai(wine_prompt).split('\n')
        logger.info("✅ Accord de vin généré")
        
        # Construction du résultat
        recipe_data = {
            'recipe': {
                'title': recipe_name,
                'country': country,
                'region': region,
                'description': description,
                'preparation_time': prep_time,
                'cooking_time': cook_time,
                'difficulty': difficulty,
                'servings': servings,
                'is_premium': True,
                'image_url': f'https://source.unsplash.com/800x600/?{recipe_name.replace(" ", "%20")}',
                'latitude': round(random.uniform(-90, 90), 4),
                'longitude': round(random.uniform(-180, 180), 4),
                'story_intro': f"Découvrez la recette de {recipe_name}, inspirée des traditions culinaires de {region}. Préparez-vous à un voyage gustatif authentique.",
                'story_intro_audio_url': f"https://savorista.com/audio/stories/{recipe_name.replace(' ', '_').lower()}_intro.mp3"
            },
            'ingredients': [
                {
                    'name': ingredient.split(' ', 2)[-1],
                    'quantity': ingredient.split(' ')[0],
                    'unit': ingredient.split(' ')[1] if len(ingredient.split(' ')) > 2 else ''
                }
                for ingredient in ingredients
            ],
            'steps': [
                {
                    'order_number': i + 1,
                    'title': f'Étape {i + 1}',
                    'description': step,
                    'story_content': step,
                    'story_audio_url': f"https://savorista.com/audio/stories/{recipe_name.replace(' ', '_').lower()}_step{i+1}.mp3",
                    'story_background_image_url': f"https://source.unsplash.com/800x600/?{recipe_name.replace(' ', '%20')},{i+1}"
                }
                for i, step in enumerate(steps)
            ],
            'playlist': {
                'title': playlist[0].split(': ')[1] if len(playlist) > 0 and ': ' in playlist[0] else "Ambiance culinaire",
                'description': playlist[1].split(': ')[1] if len(playlist) > 1 and ': ' in playlist[1] else "Une sélection musicale pour accompagner votre cuisine",
                'spotify_link': playlist[2].split(': ')[1] if len(playlist) > 2 and ': ' in playlist[2] else "spotify:playlist:37i9dQZF1DXb9LIXaj5WhZ",
                'image_url': 'https://source.unsplash.com/800x600/?music'
            },
            'wine_pairing': {
                'name': wine[0].split(': ')[1] if len(wine) > 0 and ': ' in wine[0] else "Vin recommandé",
                'description': wine[1].split(': ')[1] if len(wine) > 1 and ': ' in wine[1] else "Un vin qui se marie parfaitement avec ce plat",
                'region': region,
                'image_url': 'https://source.unsplash.com/800x600/?wine'
            }
        }
        
        # Validation des données
        logger.info("🔍 Validation des données générées...")
        if not validate_recipe_data(recipe_data):
            raise ValueError("Les données générées sont invalides")
        
        logger.info("🎉 Génération terminée avec succès")
        return recipe_data
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la génération: {str(e)}")
        raise
