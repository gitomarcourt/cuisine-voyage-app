from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from generate_recipe import generate_recipe
from supabase import create_client
import os
import logging
import sys
import json
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration des logs
LOG_DIR = "logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler(
            os.path.join(LOG_DIR, 'recipe_server.log'),
            maxBytes=10000000,  # 10MB
            backupCount=5
        ),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Configuration de l'application
app = Flask(__name__)

# Configuration Supabase
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_KEY')
)

# En production, on limite les origines CORS
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'https://cuisine-voyage.com').split(',')
CORS(app, resources={
    r"/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-API-Key"]
    }
})

# Configuration de la sécurité
API_KEY = os.getenv('API_KEY')

def require_api_key(f):
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or api_key != API_KEY:
            return jsonify({'error': 'Accès non autorisé'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

def execute_sql(recipe_data):
    """Exécute le SQL pour insérer les données de la recette dans Supabase"""
    try:
        # 1. Insertion de la recette
        logger.info("Insertion de la recette dans la base de données...")
        
        recipe = recipe_data['recipe']
        recipe_insert = supabase.table('recipes').insert({
            'title': recipe['title'],
            'country': recipe['country'],
            'region': recipe['region'],
            'description': recipe['description'],
            'preparation_time': recipe['preparation_time'],
            'cooking_time': recipe['cooking_time'],
            'difficulty': recipe['difficulty'],
            'servings': recipe['servings'],
            'is_premium': recipe['is_premium'],
            'image_url': recipe['image_url'],
            'latitude': recipe['latitude'],
            'longitude': recipe['longitude'],
            'story_intro': recipe['story_intro'],
            'story_intro_audio_url': recipe['story_intro_audio_url']
        }).execute()
        
        if not recipe_insert.data or len(recipe_insert.data) == 0:
            raise Exception("Erreur lors de l'insertion de la recette")
            
        recipe_id = recipe_insert.data[0]['id']
        logger.info(f"Recette insérée avec l'ID: {recipe_id}")
        
        # 2. Insertion des ingrédients
        logger.info("Insertion des ingrédients...")
        for ingredient in recipe_data['ingredients']:
            supabase.table('ingredients').insert({
                'recipe_id': recipe_id,
                'name': ingredient['name'],
                'quantity': ingredient['quantity'],
                'unit': ingredient['unit']
            }).execute()
        
        # 3. Insertion des étapes
        logger.info("Insertion des étapes...")
        for step in recipe_data['steps']:
            supabase.table('steps').insert({
                'recipe_id': recipe_id,
                'order_number': step['order_number'],
                'title': step['title'],
                'description': step['description'],
                'story_content': step['story_content'],
                'story_audio_url': step['story_audio_url'],
                'story_background_image_url': step['story_background_image_url']
            }).execute()
        
        # 4. Insertion de la playlist
        logger.info("Insertion de la playlist...")
        supabase.table('playlists').insert({
            'recipe_id': recipe_id,
            'title': recipe_data['playlist']['title'],
            'description': recipe_data['playlist']['description'],
            'spotify_link': recipe_data['playlist']['spotify_link'],
            'image_url': recipe_data['playlist']['image_url']
        }).execute()
        
        # 5. Insertion de l'accord de vin
        logger.info("Insertion de l'accord de vin...")
        supabase.table('wine_pairings').insert({
            'recipe_id': recipe_id,
            'name': recipe_data['wine_pairing']['name'],
            'description': recipe_data['wine_pairing']['description'],
            'region': recipe_data['wine_pairing']['region'],
            'image_url': recipe_data['wine_pairing']['image_url']
        }).execute()
        
        logger.info("Toutes les données ont été insérées avec succès.")
        return True
        
    except Exception as e:
        logger.error(f"Erreur lors de l'exécution SQL: {str(e)}")
        raise e

def generate_step_response(step, status, message):
    return {
        'step': step,
        'status': status,
        'message': message
    }

@app.route('/generate-recipe', methods=['POST', 'OPTIONS'])
@require_api_key
def handle_generate_recipe():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        logger.info("Nouvelle requête de génération reçue")
        
        data = request.json
        recipe_name = data.get('recipeName')
        
        if not recipe_name:
            logger.error("Nom de recette manquant dans la requête")
            return jsonify({'error': 'Le nom de la recette est requis'}), 400
            
        # Vérifier si le client préfère une réponse JSON au lieu de SSE
        accept_header = request.headers.get('Accept', '')
        if 'application/json' in accept_header:
            # Mode simplifié - pas de streaming, juste une réponse JSON
            try:
                logger.info("Mode simplifié demandé (JSON)")
                recipe_data = generate_recipe(recipe_name)
                execute_sql(recipe_data)
                return jsonify({
                    'success': True,
                    'message': 'Recette générée et sauvegardée avec succès !'
                })
            except Exception as e:
                logger.error(f"Erreur lors de la génération (mode simplifié): {str(e)}")
                return jsonify({
                    'success': False,
                    'error': str(e),
                    'details': 'Erreur lors de la génération de la recette'
                }), 500

        # Mode streaming avec Server-Sent Events (SSE)
        def generate():
            try:
                # Étape 1: Initialisation
                yield 'data: ' + json.dumps(generate_step_response(
                    step=1,
                    status='loading',
                    message='Recherche de la recette...'
                )) + '\n\n'

                # Étape 2: Génération de la recette
                yield 'data: ' + json.dumps(generate_step_response(
                    step=2,
                    status='loading',
                    message='Génération des informations de base...'
                )) + '\n\n'
                
                recipe_data = generate_recipe(recipe_name)
                
                # Étape 3: Ajout des ingrédients
                yield 'data: ' + json.dumps(generate_step_response(
                    step=3,
                    status='loading',
                    message='Ajout des ingrédients...'
                )) + '\n\n'

                # Étape 4: Ajout des instructions
                yield 'data: ' + json.dumps(generate_step_response(
                    step=4,
                    status='loading',
                    message='Ajout des instructions de préparation...'
                )) + '\n\n'

                # Étape 5: Génération de l'histoire
                yield 'data: ' + json.dumps(generate_step_response(
                    step=5,
                    status='loading',
                    message='Création de l\'histoire immersive...'
                )) + '\n\n'

                # Étape 6: Accord de vin
                yield 'data: ' + json.dumps(generate_step_response(
                    step=6,
                    status='loading',
                    message='Recherche de l\'accord de vin parfait...'
                )) + '\n\n'

                # Étape 7: Playlist
                yield 'data: ' + json.dumps(generate_step_response(
                    step=7,
                    status='loading',
                    message='Création de la playlist d\'ambiance...'
                )) + '\n\n'

                # Sauvegarde dans Supabase
                logger.info("Sauvegarde dans Supabase...")
                execute_sql(recipe_data)

                # Étape finale: Succès
                yield 'data: ' + json.dumps(generate_step_response(
                    step=8,
                    status='completed',
                    message='Recette générée et sauvegardée avec succès !'
                )) + '\n\n'

            except Exception as e:
                logger.error(f"Erreur lors de la génération: {str(e)}")
                yield 'data: ' + json.dumps({
                    'error': str(e),
                    'details': 'Erreur lors de la génération de la recette'
                }) + '\n\n'

        # Configuration plus permissive des CORS pour les SSE
        response = Response(generate(), mimetype='text/event-stream')
        response.headers['Cache-Control'] = 'no-cache'
        response.headers['Connection'] = 'keep-alive'
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-API-Key, Accept'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['X-Accel-Buffering'] = 'no'
        return response
        
    except Exception as e:
        logger.error(f"Erreur serveur: {str(e)}")
        logger.exception(e)
        return jsonify({
            'error': str(e),
            'details': 'Erreur serveur inattendue'
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Démarrage du serveur en mode {'développement' if debug else 'production'}")
    app.run(host='0.0.0.0', port=port, debug=debug) 