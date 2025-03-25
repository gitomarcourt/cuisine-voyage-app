from flask import Flask, request, jsonify
from flask_cors import CORS
from generate_recipe import generate_recipe
import os
import logging
import sys
import socket
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

# En production, on limite les origines CORS
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'https://cuisine-voyage.com').split(',')
CORS(app, resources={
    r"/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configuration de la sécurité
API_KEY = os.getenv('API_KEY')  # Clé API pour sécuriser les requêtes

def require_api_key(f):
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or api_key != API_KEY:
            return jsonify({'error': 'Accès non autorisé'}), 401
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint pour les health checks"""
    return jsonify({
        "status": "healthy",
        "version": "1.0"
    })

@app.route('/ping', methods=['GET'])
@require_api_key
def ping():
    logger.info("Ping reçu")
    return jsonify({
        "status": "ok",
        "message": "pong!",
        "server": "Recipe Generator Server",
        "version": "1.0"
    })

@app.route('/generate-recipe', methods=['POST', 'OPTIONS'])
@require_api_key
def handle_generate_recipe():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        logger.info("Nouvelle requête de génération reçue")
        logger.debug("Headers reçus: %s", request.headers)
        
        data = request.json
        logger.debug("Données reçues: %s", data)
        
        recipe_name = data.get('recipeName')
        
        if not recipe_name:
            logger.error("Nom de recette manquant dans la requête")
            return jsonify({'error': 'Le nom de la recette est requis'}), 400
        
        logger.info(f"Génération de la recette: {recipe_name}")
        
        try:
            recipe_data = generate_recipe(recipe_name)
            logger.info("Recette générée avec succès")
            logger.debug(f"Données générées: {recipe_data}")
            
            return jsonify({
                'success': True,
                'data': recipe_data
            })
        except Exception as e:
            logger.error(f"Erreur lors de la génération de la recette: {str(e)}")
            logger.exception(e)
            return jsonify({
                'error': str(e),
                'details': 'Erreur lors de la génération de la recette'
            }), 500
        
    except Exception as e:
        logger.error(f"Erreur serveur: {str(e)}")
        logger.exception(e)
        return jsonify({
            'error': str(e),
            'details': 'Erreur serveur inattendue'
        }), 500

if __name__ == '__main__':
    # En production, on utilise gunicorn, donc ce bloc ne sera pas exécuté
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Démarrage du serveur en mode {'développement' if debug else 'production'}")
    app.run(host='0.0.0.0', port=port, debug=debug) 