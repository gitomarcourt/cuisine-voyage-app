import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Hello from Generate Recipe function!')

serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérifier la méthode
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Récupérer les données de la requête
    const { recipeName } = await req.json()
    
    if (!recipeName) {
      throw new Error('Recipe name is required')
    }

    // Créer un client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Exécuter le script Python via un service externe ou un worker
    // Note: Dans un environnement Edge, nous ne pouvons pas exécuter directement Python
    // Il faudrait soit:
    // 1. Appeler un service externe qui exécute le script
    // 2. Réécrire la logique en TypeScript
    // 3. Utiliser un worker dédié
    
    // Pour l'instant, nous simulons la génération
    const generatedRecipe = {
      title: recipeName,
      country: 'France', // À remplacer par la vraie logique
      region: 'Île-de-France',
      description: `Une délicieuse recette de ${recipeName}...`,
      preparation_time: 30,
      cooking_time: 45,
      difficulty: 'Moyen',
      servings: 4,
      is_premium: true
    }

    // Insérer la recette dans la base de données
    const { data, error: insertError } = await supabaseClient
      .from('recipes')
      .insert([generatedRecipe])
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return new Response(
      JSON.stringify({
        success: true,
        data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 