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
    os.getenv('SUPABASE_URL', 'https://supabase.sortium.fr'),
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

def execute_sql(sql_query):
    """Exécute le SQL sur Supabase"""
    try:
        # Séparer les requêtes SQL (chaque requête se termine par un point-virgule)
        queries = [q.strip() for q in sql_query.split(';') if q.strip()]
        
        for query in queries:
            if query.lower().startswith('insert into recipes'):
                # Pour la table recipes, on récupère l'ID inséré
                result = supabase.table('recipes').insert(query).execute()
                recipe_id = result.data[0]['id']
                logger.info(f"Recette insérée avec l'ID: {recipe_id}")
            elif query:
                # Pour les autres tables, on exécute simplement la requête
                supabase.table(query.split()[2]).insert(query).execute()
        
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

        def generate():
            try:
                # Étape 1: Initialisation
                yield json.dumps(generate_step_response(
                    step=1,
                    status='loading',
                    message='Recherche de la recette...'
                )) + '\n'

                # Étape 2: Génération de la recette
                yield json.dumps(generate_step_response(
                    step=2,
                    status='loading',
                    message='Génération des informations de base...'
                )) + '\n'
                
                sql_query = generate_recipe(recipe_name)
                
                # Étape 3: Ajout des ingrédients
                yield json.dumps(generate_step_response(
                    step=3,
                    status='loading',
                    message='Ajout des ingrédients...'
                )) + '\n'

                # Étape 4: Ajout des instructions
                yield json.dumps(generate_step_response(
                    step=4,
                    status='loading',
                    message='Ajout des instructions de préparation...'
                )) + '\n'

                # Étape 5: Génération de l'histoire
                yield json.dumps(generate_step_response(
                    step=5,
                    status='loading',
                    message='Création de l\'histoire immersive...'
                )) + '\n'

                # Étape 6: Accord de vin
                yield json.dumps(generate_step_response(
                    step=6,
                    status='loading',
                    message='Recherche de l\'accord de vin parfait...'
                )) + '\n'

                # Étape 7: Playlist
                yield json.dumps(generate_step_response(
                    step=7,
                    status='loading',
                    message='Création de la playlist d\'ambiance...'
                )) + '\n'

                # Sauvegarde dans Supabase
                execute_sql(sql_query)

                # Étape finale: Succès
                yield json.dumps(generate_step_response(
                    step=8,
                    status='completed',
                    message='Recette générée et sauvegardée avec succès !'
                )) + '\n'

            except Exception as e:
                logger.error(f"Erreur lors de la génération: {str(e)}")
                yield json.dumps({
                    'error': str(e),
                    'details': 'Erreur lors de la génération de la recette'
                }) + '\n'

        return Response(generate(), mimetype='text/event-stream')
        
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