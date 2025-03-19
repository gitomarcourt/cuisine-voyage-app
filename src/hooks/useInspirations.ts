import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Inspiration } from '../types/models';

export function useInspirations() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInspirations() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('inspirations')
          .select('*')
          .order('id', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        setInspirations(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des inspirations:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    }

    fetchInspirations();
  }, []);

  return { inspirations, loading, error };
} 