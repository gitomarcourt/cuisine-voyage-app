import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Category } from '../types/models';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('id', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        setCategories(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des catégories:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
} 