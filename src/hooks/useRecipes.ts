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
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setRecipes(data || []);
      } catch (err) {
        console.error('Error fetching recipes:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  async function getRecipeDetails(id: number): Promise<RecipeDetails | null> {
    try {
      // Récupérer les détails de la recette
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (recipeError || !recipeData) {
        throw recipeError || new Error('Recette non trouvée');
      }

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

      return {
        recipe: recipeData,
        ingredients: ingredientsData || [],
        steps: stepsData || [],
        winePairing: winePairingData || undefined,
        playlist: playlist,
      };
    } catch (err) {
      console.error('Error fetching recipe details:', err);
      return null;
    }
  }

  return { recipes, loading, error, getRecipeDetails };
}
