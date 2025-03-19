export interface Recipe {
  id: number;
  title: string;
  country: string;
  region?: string;
  description: string;
  image_url: string;
  cooking_time: number;
  difficulty: string;
  is_premium: boolean;
  category_id?: number;
  ingredients?: any[];
  instructions?: any[];
  created_at?: string;
  updated_at?: string;
  servings: number;
  
  // Propriétés pour la compatibilité
  imageSource?: { uri: string };
  cookingTime?: number;
  isPremium?: boolean;
  
  // Propriétés pour l'expérience immersive
  story_intro?: string;
  story_intro_audio_url?: string;
  
  // Coordonnées géographiques
  latitude?: number;
  longitude?: number;
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit?: string;
}

export interface Instruction {
  step: number;
  description: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  created_at?: string;
}

export interface Inspiration {
  id: number;
  title: string;
  image_url: string;
  created_at?: string;
}

export interface Step {
  id: number;
  recipe_id: number;
  order_number: number;
  title: string;
  description: string;
  story_content?: string;
  audio_url?: string;
  // Propriétés pour l'expérience immersive
  story_audio_url?: string;
  story_background_image_url?: string;
}

export interface WinePairing {
  id: number;
  recipe_id: number;
  name: string;
  description: string;
  region: string;
  image_url?: string;
  purchase_link?: string;
}

export interface Playlist {
  id: number;
  recipe_id: number;
  title: string;
  description: string;
  spotify_link?: string;
  image_url?: string;
  tracks?: PlaylistTrack[];
}

export interface PlaylistTrack {
  id: number;
  playlist_id: number;
  name: string;
  artist: string;
  order_number: number;
}

export interface Profile {
  id: string;
  username?: string;
  avatar_url?: string;
  is_premium: boolean;
  premium_expiry_date?: string;
}

export interface CompletedRecipe {
  id: number;
  user_id: string;
  recipe_id: number;
  rating?: number;
  user_notes?: string;
  user_image_url?: string;
  completed_date: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

export interface UserBadge {
  id: number;
  user_id: string;
  badge_id: number;
  earned_date: string;
}

// Nouvelles interfaces pour l'expérience immersive
export interface StoryAmbiance {
  id: number;
  recipe_id: number;
  name: string;
  description: string;
  ambient_sound_url?: string;
  spotify_playlist_url?: string;
}

export interface RecipeExperience {
  id: number;
  user_id: string;
  recipe_id: number;
  current_step: number;
  is_story_mode: boolean;
  start_time: string;
  end_time?: string;
  is_completed: boolean;
}

export interface ExperienceMedia {
  id: number;
  experience_id: number;
  step_number: number;
  media_type: string;
  media_url: string;
  caption?: string;
} 