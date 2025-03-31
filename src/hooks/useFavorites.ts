import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Recipe } from '../types/models';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuthContext();
  const userId = session?.user?.id;

  // Charger les favoris au démarrage et quand l'utilisateur change
  useEffect(() => {
    if (userId) {
      loadFavorites();
    } else {
      setFavorites([]);
      setFavoriteIds(new Set());
      setIsLoading(false);
    }
  }, [userId]);

  // Charger les recettes favorites de l'utilisateur
  const loadFavorites = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorite_recipes')
        .select(`
          recipe_id,
          recipes:recipe_id (
            id,
            title,
            country,
            region,
            description,
            preparation_time,
            cooking_time,
            difficulty,
            servings,
            is_premium,
            image_url,
            category_id
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur lors du chargement des favoris:', error);
        return;
      }

      // Extraire les recettes du résultat de la requête
      const recipes = data.map((item: any) => item.recipes);
      setFavorites(recipes);
      
      // Créer un Set des IDs des recettes favorites pour une recherche rapide
      const ids = new Set(recipes.map((recipe: Recipe) => recipe.id));
      setFavoriteIds(ids);
    } catch (error) {
      console.error('Erreur inattendue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si une recette est en favori
  const isFavorite = (recipeId: number): boolean => {
    return favoriteIds.has(recipeId);
  };

  // Ajouter une recette aux favoris
  const addFavorite = async (recipeId: number) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('favorite_recipes')
        .insert({
          user_id: userId,
          recipe_id: recipeId
        });

      if (error) {
        console.error('Erreur lors de l\'ajout aux favoris:', error);
        return false;
      }

      // Mettre à jour le state local
      await loadFavorites();
      return true;
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return false;
    }
  };

  // Retirer une recette des favoris
  const removeFavorite = async (recipeId: number) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('favorite_recipes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) {
        console.error('Erreur lors de la suppression des favoris:', error);
        return false;
      }

      // Mettre à jour le state local
      await loadFavorites();
      return true;
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return false;
    }
  };

  // Basculer l'état favori d'une recette
  const toggleFavorite = async (recipeId: number) => {
    return isFavorite(recipeId) 
      ? await removeFavorite(recipeId)
      : await addFavorite(recipeId);
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    loadFavorites
  };
} 