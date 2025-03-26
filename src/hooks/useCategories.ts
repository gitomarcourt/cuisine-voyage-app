import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Category } from '../types/models';

// Catégories par défaut au cas où la base de données ne répond pas
const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: 'Asiatique', icon: 'noodles' },
  { id: 2, name: 'Méditerranéen', icon: 'food-drumstick' },
  { id: 3, name: 'Africain', icon: 'pot-steam' },
  { id: 4, name: 'Latino', icon: 'taco' },
  { id: 5, name: 'Européen', icon: 'pasta' }
];

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });
        
      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('Aucune catégorie trouvée, utilisation des catégories par défaut');
        return; // On garde les catégories par défaut
      }
      
      // Transformer les données pour s'assurer que tous les champs requis sont présents
      const formattedCategories: Category[] = data.map(category => ({
        id: category.id,
        name: category.name || 'Sans nom',
        icon: category.icon || 'food',
        created_at: category.created_at
      }));
      
      setCategories(formattedCategories);
    } catch (err) {
      console.error('Erreur lors de la récupération des catégories:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la récupération des catégories');
      // On garde les catégories par défaut en cas d'erreur
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fonction pour rafraîchir les catégories
  const refreshCategories = useCallback(async () => {
    return fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refreshCategories };
} 