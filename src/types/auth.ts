import { Session, User, UserResponse } from '@supabase/supabase-js';
import { Profile } from './models';

/**
 * Interface pour les résultats des opérations d'authentification
 */
export interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Interface pour les données du formulaire de connexion
 */
export interface SignInFormData {
  email: string;
  password: string;
}

/**
 * Interface pour les données du formulaire d'inscription
 */
export interface SignUpFormData {
  email: string;
  password: string;
  username: string;
}

/**
 * Interface pour les données du formulaire de réinitialisation de mot de passe
 */
export interface ResetPasswordFormData {
  email: string;
}

/**
 * Interface pour les données du formulaire de mise à jour de profil
 */
export interface UpdateProfileFormData {
  username?: string;
  avatar_url?: string;
}

/**
 * Interface pour l'état de l'authentification
 */
export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

/**
 * Interface pour le contexte d'authentification
 */
export interface AuthContextType {
  session: Session | null;
  loading: boolean;
  userProfile: Profile | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, username: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updateProfile: (data: UpdateProfileFormData) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
} 