import os
import openai
import random
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

# Configuration de la clé API OpenAI
openai.api_key = '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'

# Fonction pour générer du contenu avec l'IA
def generate_with_ai(prompt):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content.strip()

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

def generate_recipe(recipe_name: str) -> Dict[str, Any]:
    """Génère une recette complète avec toutes les informations associées."""
    try:
        logger.info(f"🔄 Début de la génération pour: {recipe_name}")
        
        # D'abord, déterminons l'origine de la recette
        logger.info("📍 Génération de l'origine...")
        origin_prompt = f"""Pour la recette {recipe_name}, donne-moi uniquement le pays d'origine et la région dans ce format :
Pays: [pays]
Région: [région]"""
        
        origin = generate_with_ai(origin_prompt).split('\n')
        country = origin[0].split(': ')[1].strip()
        region = origin[1].split(': ')[1].strip()
        logger.info(f"✅ Origine déterminée: {country}, {region}")
        
        # Description de la recette
        logger.info("📝 Génération de la description...")
        description_prompt = f"""Donne-moi une description courte et alléchante pour {recipe_name}, une recette de {region}, {country}."""
        description = generate_with_ai(description_prompt)
        logger.info("✅ Description générée")
        
        # Informations de base
        logger.info("ℹ️ Génération des informations de base...")
        info_prompt = f"""Pour {recipe_name}, donne-moi ces informations dans ce format exact :
Temps de préparation (minutes): [nombre]
Temps de cuisson (minutes): [nombre]
Difficulté: [Facile/Moyen/Difficile]
Portions: [nombre]"""
        
        info = generate_with_ai(info_prompt).split('\n')
        prep_time = int(info[0].split(': ')[1])
        cook_time = int(info[1].split(': ')[1])
        difficulty = info[2].split(': ')[1]
        servings = int(info[3].split(': ')[1])
        logger.info("✅ Informations de base générées")
        
        # Ingrédients
        logger.info("🥕 Génération des ingrédients...")
        ingredients_prompt = f"""Liste les ingrédients pour {recipe_name} dans ce format :
- [quantité] [unité] [ingrédient]"""
        ingredients = generate_with_ai(ingredients_prompt).split('\n')
        ingredients = [i.strip('- ') for i in ingredients if i.strip('- ')]
        logger.info(f"✅ {len(ingredients)} ingrédients générés")
        
        # Étapes
        logger.info("📋 Génération des étapes...")
        steps_prompt = f"""Donne-moi les étapes détaillées pour préparer {recipe_name} dans ce format :
1. [description de l'étape]
2. [description de l'étape]
etc."""
        steps = generate_with_ai(steps_prompt).split('\n')
        steps = [s.strip('123456789. ') for s in steps if s.strip('123456789. ')]
        logger.info(f"✅ {len(steps)} étapes générées")
        
        # Playlist
        logger.info("🎵 Génération de la playlist...")
        playlist_prompt = f"""Pour {recipe_name}, suggère une playlist dans ce format :
Titre: [nom de la playlist]
Description: [description courte]
Lien Spotify: [lien]"""
        playlist = generate_with_ai(playlist_prompt).split('\n')
        logger.info("✅ Playlist générée")
        
        # Accord de vin
        logger.info("🍷 Génération de l'accord de vin...")
        wine_prompt = f"""Pour {recipe_name}, propose un accord de vin dans ce format :
Nom: [nom du vin]
Description: [description de l'accord]
Région: [région viticole]"""
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
                'image_url': f'https://source.unsplash.com/800x600/?{recipe_name.replace(" ", "%20")}'
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
                    'description': step
                }
                for i, step in enumerate(steps)
            ],
            'playlist': {
                'title': playlist[0].split(': ')[1],
                'description': playlist[1].split(': ')[1],
                'spotify_link': playlist[2].split(': ')[1]
            },
            'wine_pairing': {
                'name': wine[0].split(': ')[1],
                'description': wine[1].split(': ')[1],
                'region': wine[2].split(': ')[1]
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
