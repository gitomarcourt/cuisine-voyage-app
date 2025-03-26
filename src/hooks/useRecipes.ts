import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Recipe } from '../types/models';

export interface RecipeDetails {
  recipe: Recipe;
  ingredients: any[];
  steps: any[];
  winePairing: any;
  playlist: any;
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les recettes depuis Supabase
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Aucune donnée reçue de Supabase');
      }
      
      // Transformer les données pour correspondre à notre modèle
      const formattedRecipes: Recipe[] = data.map(recipe => ({
        id: recipe.id,
        title: recipe.title || '',
        country: recipe.country || '',
        region: recipe.region || '',
        description: recipe.description || '',
        image_url: recipe.image_url || 'https://source.unsplash.com/800x600/?food',
        cooking_time: recipe.cooking_time || 0,
        difficulty: recipe.difficulty || 'Facile',
        is_premium: recipe.is_premium || false,
        category_id: recipe.category_id,
        servings: recipe.servings || 4,
        created_at: recipe.created_at,
        updated_at: recipe.updated_at,
        // Propriétés additionnelles pour la compatibilité avec les composants existants
        imageSource: { uri: recipe.image_url || 'https://source.unsplash.com/800x600/?food' },
        cookingTime: recipe.cooking_time || 0,
        isPremium: recipe.is_premium || false
      }));
      
      setRecipes(formattedRecipes);
    } catch (err) {
      console.error('Erreur lors de la récupération des recettes:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la récupération des recettes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Fonction pour rafraîchir les recettes
  const refreshRecipes = useCallback(async () => {
    return fetchRecipes();
  }, [fetchRecipes]);

  async function getRecipeDetails(id: number): Promise<RecipeDetails | null> {
    try {
      // Récupérer la recette
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (recipeError) throw recipeError;

      // Récupérer les ingrédients
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('ingredients')
        .select('*')
        .eq('recipe_id', id);

      if (ingredientsError) throw ingredientsError;

      // Récupérer les étapes
      const { data: steps, error: stepsError } = await supabase
        .from('steps')
        .select('*')
        .eq('recipe_id', id)
        .order('order_number', { ascending: true });

      if (stepsError) throw stepsError;

      // Récupérer l'accord de vin
      const { data: winePairing, error: wineError } = await supabase
        .from('wine_pairings')
        .select('*')
        .eq('recipe_id', id)
        .single();

      if (wineError && wineError.code !== 'PGRST116') throw wineError;

      // Récupérer la playlist
      const { data: playlist, error: playlistError } = await supabase
        .from('playlists')
        .select('*')
        .eq('recipe_id', id)
        .single();

      if (playlistError && playlistError.code !== 'PGRST116') throw playlistError;

      return {
        recipe: {
          ...recipe,
          imageSource: { uri: recipe.image_url },
          cookingTime: recipe.cooking_time,
          isPremium: recipe.is_premium
        },
        ingredients: ingredients || [],
        steps: steps || [],
        winePairing: winePairing || null,
        playlist: playlist || null
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la recette:', error);
      return null;
    }
  }

  return { recipes, loading, error, getRecipeDetails, refreshRecipes };
}
