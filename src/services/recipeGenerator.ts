import { supabase } from '../lib/supabase';

// Configuration de l'API de génération
const API_CONFIG = {
  baseUrl: 'https://api.sortium.fr',  // URL de notre API de génération
  apiKey: process.env.EXPO_PUBLIC_API_KEY || '',
};

export interface GenerationStatus {
  step: number;
  status: 'loading' | 'completed' | 'error';
  message: string;
}

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface Step {
  order_number: number;
  title: string;
  description: string;
}

interface Playlist {
  title: string;
  description: string;
  spotify_link: string;
}

interface WinePairing {
  name: string;
  description: string;
  region: string;
}

interface Recipe {
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
}

interface GeneratedRecipeData {
  recipe: Recipe;
  ingredients: Ingredient[];
  steps: Step[];
  playlist: Playlist;
  wine_pairing: WinePairing;
}

export const recipeGeneratorService = {
  async generateRecipe(recipeName: string, onProgress: (status: GenerationStatus) => void): Promise<boolean> {
    try {
      console.log('🚀 Démarrage de la génération de la recette:', recipeName);
      
      // Étape 1: Vérification de la connexion au serveur
      onProgress({
        step: 0,
        status: 'loading',
        message: 'Connexion au serveur de génération...'
      });

      try {
        const response = await fetch(`${API_CONFIG.baseUrl}/ping`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_CONFIG.apiKey,
          },
        });

        if (!response.ok) {
          throw new Error('Le serveur de génération n\'est pas disponible');
        }
      } catch (error) {
        console.error('❌ Erreur de connexion au serveur:', error);
        onProgress({
          step: 0,
          status: 'error',
          message: 'Le serveur de génération n\'est pas disponible. Veuillez réessayer plus tard.'
        });
        return false;
      }

      // Étape 2: Génération de la recette
      onProgress({
        step: 1,
        status: 'loading',
        message: 'Génération des informations de la recette...'
      });

      console.log('📡 Appel du serveur pour la génération...');
      const generateResponse = await fetch(`${API_CONFIG.baseUrl}/generate-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_CONFIG.apiKey,
        },
        body: JSON.stringify({ recipe_name: recipeName })
      });

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

      if (!result.success || !result.data) {
        console.error('❌ Données invalides reçues du serveur');
        onProgress({
          step: 1,
          status: 'error',
          message: 'Les données générées sont invalides'
        });
        return false;
      }

      const recipeData = result.data as GeneratedRecipeData;
      console.log('✅ Données de recette validées');

      // Étape 3: Sauvegarde dans Supabase
      try {
        await this.saveRecipeToSupabase(recipeData, onProgress);
        
        onProgress({
          step: 5,
          status: 'completed',
          message: 'Recette générée et sauvegardée avec succès!'
        });
        
        return true;
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        onProgress({
          step: 5,
          status: 'error',
          message: `Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        });
        return false;
      }
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