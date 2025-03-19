export interface Recipe {
  id: number;
  title: string;
  country: string;
  region?: string;
  description: string;
  preparation_time: number;
  cooking_time: number;
  difficulty: string;
  servings: number;
  is_premium: boolean;
  image_url?: string;
  created_at: string;
}

export interface Ingredient {
  id: number;
  recipe_id: number;
  name: string;
  quantity?: string;
  unit?: string;
}

export interface Step {
  id: number;
  recipe_id: number;
  order_number: number;
  title: string;
  description: string;
  story_content?: string;
  audio_url?: string;
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