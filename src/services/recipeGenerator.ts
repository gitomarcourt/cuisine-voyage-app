import { supabase } from '../lib/supabase';

// Configuration de l'API de génération
const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.sortium.fr',
  apiKey: process.env.EXPO_PUBLIC_API_KEY || '',
};

export interface GenerationStatus {
  step: number;
  status: 'loading' | 'completed' | 'error';
  message: string;
}

// Types pour les données générées
export interface GeneratedRecipeData {
  recipe: {
    title: string;
    country: string;
    region: string;
    description: string;
    preparation_time: number;
    cooking_time: number;
    difficulty: string;
    servings: number;
    is_premium: boolean;
    image_url: string;
  };
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  steps: Array<{
    order_number: number;
    title: string;
    description: string;
  }>;
  playlist: {
    title: string;
    description: string;
    spotify_link: string;
  };
  wine_pairing: {
    name: string;
    description: string;
    region: string;
  };
}

export const recipeGeneratorService = {
  async generateRecipe(recipeName: string, onProgress: (status: GenerationStatus) => void): Promise<boolean> {
    try {
      console.log('🚀 Démarrage de la génération de la recette:', recipeName);
      
      // Étape 1: Connexion au serveur
      onProgress({
        step: 0,
        status: 'loading',
        message: 'Connexion au serveur de génération...'
      });

      // Étape 2: Génération et sauvegarde de la recette
      onProgress({
        step: 1,
        status: 'loading',
        message: 'Génération des informations de la recette...'
      });

      // Log détaillé de la configuration de l'API et du payload
      console.log('📡 Configuration API:', {
        baseUrl: API_CONFIG.baseUrl,
        apiKeyLength: API_CONFIG.apiKey ? API_CONFIG.apiKey.length : 0,
        apiKeyFirstChars: API_CONFIG.apiKey ? API_CONFIG.apiKey.substring(0, 3) + '...' : 'non définie'
      });
      
      const payload = { recipeName: recipeName };
      console.log('📡 Payload envoyé:', JSON.stringify(payload, null, 2));
      
      console.log('📡 Appel du serveur pour la génération à l\'URL:', `${API_CONFIG.baseUrl}/generate-recipe`);
      
      const generateResponse = await fetch(`${API_CONFIG.baseUrl}/generate-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_CONFIG.apiKey,
          'Accept': 'application/json', // Précise que nous attendons du JSON pour éviter le streaming
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Statut de la réponse:', generateResponse.status, generateResponse.statusText);
      
      if (!generateResponse.ok) {
        const errorData = await generateResponse.json().catch(() => ({ error: 'Erreur inconnue' }));
        console.error('❌ Erreur du serveur:', errorData);
        onProgress({
          step: 1,
          status: 'error',
          message: `Erreur lors de la génération: ${errorData.error || 'Erreur inconnue'}`
        });
        return false;
      }

      const result = await generateResponse.json();
      console.log('📋 Données reçues:', JSON.stringify(result, null, 2));

      if (!result.success) {
        console.error('❌ Erreur lors de la génération');
        onProgress({
          step: 1,
          status: 'error',
          message: result.error || 'Une erreur est survenue lors de la génération'
        });
        return false;
      }

      // La recette a été générée et sauvegardée avec succès
      onProgress({
        step: 5,
        status: 'completed',
        message: 'Recette générée et sauvegardée avec succès!'
      });
      
      return true;
    } catch (error) {
      console.error('❌ Erreur générale:', error);
      onProgress({
        step: 0,
        status: 'error',
        message: `Une erreur est survenue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
      return false;
    }
  },

  async saveRecipeToSupabase(recipeData: GeneratedRecipeData, onProgress: (status: GenerationStatus) => void): Promise<void> {
    // 3.1 Créer la recette de base
    console.log('📝 Sauvegarde de la recette principale...');
    onProgress({
      step: 2,
      status: 'loading',
      message: 'Sauvegarde de la recette'
    });

    const recipeToInsert = {
      ...recipeData.recipe,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: savedRecipe, error: recipeError } = await supabase
      .from('recipes')
      .insert([recipeToInsert])
      .select()
      .single();

    if (recipeError) throw recipeError;

    // 3.2 Sauvegarder les ingrédients
    onProgress({
      step: 3,
      status: 'loading',
      message: 'Sauvegarde des ingrédients'
    });

    const ingredientsToInsert = recipeData.ingredients.map(ingredient => ({
      ...ingredient,
      recipe_id: savedRecipe.id,
      created_at: new Date().toISOString()
    }));

    const { error: ingredientsError } = await supabase
      .from('ingredients')
      .insert(ingredientsToInsert);

    if (ingredientsError) throw ingredientsError;

    // 3.3 Sauvegarder les étapes
    onProgress({
      step: 4,
      status: 'loading',
      message: 'Sauvegarde des étapes'
    });

    const stepsToInsert = recipeData.steps.map(step => ({
      ...step,
      recipe_id: savedRecipe.id,
      created_at: new Date().toISOString()
    }));

    const { error: stepsError } = await supabase
      .from('steps')
      .insert(stepsToInsert);

    if (stepsError) throw stepsError;

    // 3.4 Sauvegarder la playlist
    onProgress({
      step: 5,
      status: 'loading',
      message: 'Sauvegarde de la playlist'
    });

    const playlistToInsert = {
      ...recipeData.playlist,
      recipe_id: savedRecipe.id,
      image_url: 'https://source.unsplash.com/800x600/?music',
      created_at: new Date().toISOString()
    };

    const { error: playlistError } = await supabase
      .from('playlists')
      .insert([playlistToInsert]);

    if (playlistError) throw playlistError;

    // 3.5 Sauvegarder l'accord de vin
    const winePairingToInsert = {
      ...recipeData.wine_pairing,
      recipe_id: savedRecipe.id,
      created_at: new Date().toISOString()
    };

    const { error: winePairingError } = await supabase
      .from('wine_pairings')
      .insert([winePairingToInsert]);

    if (winePairingError) throw winePairingError;
  }
};

export const generateRecipe = async (recipeName: string): Promise<Response> => {
  const response = await fetch('https://api.sortium.fr/generate-recipe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.EXPO_PUBLIC_API_KEY || '',
    },
    body: JSON.stringify({ recipeName }),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la génération de la recette');
  }

  return response;
}; 