import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Vérifier si les variables d'environnement sont définies
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('⚠️ Variables d\'environnement Supabase manquantes!');
  console.error('Assurez-vous que votre fichier .env est correctement configuré.');
  console.error('Si vous êtes en train de déployer, assurez-vous d\'avoir configuré les variables d\'environnement.');
}

export const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || '',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
); 