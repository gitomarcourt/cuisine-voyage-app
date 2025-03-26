import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/**
 * Configuration Supabase pour l'authentification et la gestion des données
 * 
 * L'URL et la clé d'API sont spécifiques à votre projet Supabase.
 * Les valeurs sont stockées dans les variables d'environnement (.env)
 */

// Configuration URL et clé anonyme
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://supabase.sortium.fr';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLWRlbW8iLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTc5OTUzNTYwMH0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

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