import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Recipe, Ingredient, Step, WinePairing, Playlist, PlaylistTrack } from '../types/models';

export interface RecipeDetails {
  recipe: Recipe;
  ingredients: Ingredient[];
  steps: Step[];
  winePairing?: WinePairing;
  playlist?: Playlist;
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        
        // Récupérer les recettes depuis Supabase
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Transformer les données pour correspondre à notre modèle
        const formattedRecipes: Recipe[] = data.map(recipe => ({
          id: recipe.id,
          title: recipe.title,
          country: recipe.country,
          description: recipe.description,
          image_url: recipe.image_url,
          cooking_time: recipe.cooking_time,
          difficulty: recipe.difficulty,
          is_premium: recipe.is_premium,
          category_id: recipe.category_id,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          created_at: recipe.created_at,
          updated_at: recipe.updated_at,
          servings: recipe.servings || 4,
          // Propriétés additionnelles pour la compatibilité avec les composants existants
          imageSource: { uri: recipe.image_url },
          cookingTime: recipe.cooking_time,
          isPremium: recipe.is_premium
        }));
        
        setRecipes(formattedRecipes);
      } catch (err) {
        console.error('Erreur lors de la récupération des recettes:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  async function getRecipeDetails(id: number): Promise<RecipeDetails | null> {
    try {
      console.log('Récupération des détails de la recette ID:', id);
      
      // Récupérer les détails de la recette
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (recipeError || !recipeData) {
        throw recipeError || new Error('Recette non trouvée');
      }

      console.log('Données de recette récupérées:', JSON.stringify(recipeData));
      console.log('story_intro présent:', !!recipeData.story_intro);

      // Récupérer les ingrédients
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('ingredients')
        .select('*')
        .eq('recipe_id', id)
        .order('id');

      if (ingredientsError) throw ingredientsError;

      // Récupérer les étapes
      const { data: stepsData, error: stepsError } = await supabase
        .from('steps')
        .select('*')
        .eq('recipe_id', id)
        .order('order_number');

      if (stepsError) throw stepsError;

      console.log('Étapes récupérées, nombre:', stepsData?.length || 0);

      // Récupérer le vin assorti
      const { data: winePairingData, error: winePairingError } = await supabase
        .from('wine_pairings')
        .select('*')
        .eq('recipe_id', id)
        .single();

      // Récupérer la playlist
      const { data: playlistData, error: playlistError } = await supabase
        .from('playlists')
        .select('*')
        .eq('recipe_id', id)
        .single();

      let playlist = playlistData || undefined;

      // Si on a une playlist, récupérer les pistes
      if (playlist) {
        const { data: tracksData, error: tracksError } = await supabase
          .from('playlist_tracks')
          .select('*')
          .eq('playlist_id', playlist.id)
          .order('order_number');

        if (!tracksError) {
          playlist = { ...playlist, tracks: tracksData || [] };
        }
      }

      const details = {
        recipe: recipeData,
        ingredients: ingredientsData || [],
        steps: stepsData || [],
        winePairing: winePairingData || undefined,
        playlist: playlist,
      };

      console.log('Retour des détails de la recette avec story_intro:', !!details.recipe.story_intro);
      
      return details;
    } catch (err) {
      console.error('Error fetching recipe details:', err);
      return null;
    }
  }

  return { recipes, loading, error, getRecipeDetails };
}
