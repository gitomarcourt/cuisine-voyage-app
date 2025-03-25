export const config = {
  supabaseUrl: Deno.env.get('SUPABASE_URL') || 'http://votre-domaine-supabase:8000',
  supabaseKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'votre-cle-service-role',
}; 