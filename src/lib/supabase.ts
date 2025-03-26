import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/**
 * Configuration Supabase pour l'authentification et la gestion des données
 * 
 * L'URL et la clé d'API sont spécifiques à votre projet Supabase.
 * Pour un environnement de production, ces valeurs devraient être stockées
 * dans des variables d'environnement (ex: .env) et non en dur dans le code.
 */

// Configuration URL et clé anonyme
const supabaseUrl = 'https://supabase.sortium.fr';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey AgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

// Création du client Supabase avec options pour React Native
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Utilisation d'AsyncStorage pour stocker les sessions
    storage: AsyncStorage,
    // Rafraîchissement automatique du token
    autoRefreshToken: true,
    // Persistance de la session pour les connexions ultérieures
    persistSession: true,
    // Ne pas détecter la session dans l'URL (spécifique au web)
    detectSessionInUrl: false,
  },
}); 