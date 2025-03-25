from supabase import create_client
import os
from dotenv import load_dotenv
import logging

# Configuration du logging
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement
load_dotenv()

# Configuration Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# Création du client Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

async def save_recipe_to_supabase(recipe_data):
    """
    Sauvegarde une recette et toutes ses données associées dans Supabase
    """
    try:
        logger.info(f"Sauvegarde de la recette: {recipe_data['recipe']['title']}")
        
        # 1. Sauvegarde de la recette principale
        recipe_response = await supabase.table('recipes').insert(recipe_data['recipe']).execute()
        if 'error' in recipe_response:
            raise Exception(f"Erreur lors de la sauvegarde de la recette: {recipe_response['error']}")
        
        recipe_id = recipe_response['data'][0]['id']
        logger.info(f"Recette sauvegardée avec l'ID: {recipe_id}")

        # 2. Sauvegarde des ingrédients
        ingredients_data = [
            {**ingredient, 'recipe_id': recipe_id}
            for ingredient in recipe_data['ingredients']
        ]
        ingredients_response = await supabase.table('ingredients').insert(ingredients_data).execute()
        if 'error' in ingredients_response:
            raise Exception(f"Erreur lors de la sauvegarde des ingrédients: {ingredients_response['error']}")
        
        # 3. Sauvegarde des étapes
        steps_data = [
            {**step, 'recipe_id': recipe_id}
            for step in recipe_data['steps']
        ]
        steps_response = await supabase.table('steps').insert(steps_data).execute()
        if 'error' in steps_response:
            raise Exception(f"Erreur lors de la sauvegarde des étapes: {steps_response['error']}")

        # 4. Sauvegarde de la playlist
        playlist_data = {**recipe_data['playlist'], 'recipe_id': recipe_id}
        playlist_response = await supabase.table('playlists').insert(playlist_data).execute()
        if 'error' in playlist_response:
            raise Exception(f"Erreur lors de la sauvegarde de la playlist: {playlist_response['error']}")

        # 5. Sauvegarde de l'accord de vin
        wine_data = {**recipe_data['wine_pairing'], 'recipe_id': recipe_id}
        wine_response = await supabase.table('wine_pairings').insert(wine_data).execute()
        if 'error' in wine_response:
            raise Exception(f"Erreur lors de la sauvegarde de l'accord de vin: {wine_response['error']}")

        logger.info("✅ Toutes les données ont été sauvegardées avec succès")
        return True

    except Exception as e:
        logger.error(f"❌ Erreur lors de la sauvegarde des données: {str(e)}")
        raise e 