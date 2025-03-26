import * as React from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Alert } from 'react-native';
import { Profile } from '../types/models';
import { 
  AuthContextType, 
  AuthResult, 
  UpdateProfileFormData 
} from '../types/auth';
import { useNavigation } from '@react-navigation/native';

// Créer le contexte avec une valeur par défaut
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour accéder au contexte
export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// Composant Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [userProfile, setUserProfile] = React.useState<Profile | null>(null);
  const navigation = useNavigation();

  // Effet pour vérifier la session au chargement
  React.useEffect(() => {
    // Vérifier s'il y a une session active
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        
        // Charger le profil si une session existe
        if (data.session) {
          await fetchUserProfile(data.session.user.id);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Configurer l'écouteur pour les changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`Supabase auth event: ${event}`);
        setSession(newSession);
        
        // Charger ou effacer le profil selon l'état de la session
        if (newSession) {
          await fetchUserProfile(newSession.user.id);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Nettoyage
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Fonction pour récupérer le profil utilisateur
  const fetchUserProfile = async (userId: string) => {
    try {
      // Vérifier si un profil existe déjà
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        // Si le profil n'existe pas, le créer automatiquement
        if (error.code === 'PGRST116') {
          // Récupérer les données utilisateur pour obtenir le username
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            const username = userData.user.user_metadata?.username || 'user' + Math.floor(Math.random() * 10000);
            
            // Créer le profil
            const newProfile = {
              id: userId,
              username,
              is_premium: false,
              created_at: new Date().toISOString()
            };
            
            const { data: insertedProfile, error: insertError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single();
              
            if (insertError) {
              console.error('Erreur lors de la création automatique du profil:', insertError);
            } else {
              setUserProfile(insertedProfile);
              return;
            }
          }
        }
        
        throw error;
      }
      
      setUserProfile(data);
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
    }
  };

  // Fonction de connexion
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Rediriger vers l'écran principal après connexion réussie
      if (navigation && typeof navigation.reset === 'function') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' as never }],
        });
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  };

  // Fonction d'inscription
  const signUp = async (email: string, password: string, username: string): Promise<AuthResult> => {
    try {
      // Inscription de l'utilisateur avec le nom d'utilisateur dans les métadonnées
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username,
            name: username,
          },
        },
      });

      if (error) throw error;

      // Connecter l'utilisateur immédiatement après l'inscription
      if (data.user) {
        // Si pas de session, c'est que la vérification par email est activée - forcer la connexion directe
        if (!data.session) {
          console.log('Pas de session après inscription, tentative de connexion directe...');
          const { error: loginError, data: loginData } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (loginError) throw loginError;
          
          if (loginData.user) {
            // Mettre à jour les métadonnées utilisateur pour inclure le nom d'affichage
            await supabase.auth.updateUser({
              data: { 
                username,
                display_name: username,
                name: username,
              }
            });
            
            await createUserProfile(loginData.user.id, username);
            
            // Rediriger vers l'écran principal après connexion réussie
            if (navigation && typeof navigation.reset === 'function') {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' as never }],
              });
            }
            
            return { success: true, data: loginData };
          }
        } else {
          // Si on a une session, c'est que l'auto-confirmation est déjà activée côté serveur
          // Mettre à jour les métadonnées utilisateur
          await supabase.auth.updateUser({
            data: { 
              username,
              display_name: username,
              name: username,
            }
          });
          
          await createUserProfile(data.user.id, username);
          
          // Rediriger vers l'écran principal après connexion réussie
          if (navigation && typeof navigation.reset === 'function') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' as never }],
            });
          }
        }
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  };

  // Fonction utilitaire pour créer un profil utilisateur
  const createUserProfile = async (userId: string, username: string) => {
    try {
      // Vérifier d'abord si un profil existe déjà pour cet utilisateur
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      // Si un profil existe déjà, ne pas en créer un nouveau
      if (existingProfile) {
        console.log('Profil existant trouvé, pas besoin d\'en créer un nouveau');
        setUserProfile(existingProfile);
        return;
      }
      
      // Créer le profil avec un .select() pour récupérer le profil créé
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: username,
          is_premium: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (profileError) {
        console.error('Erreur lors de la création du profil:', profileError);
      } else {
        // Mettre à jour l'état du profil utilisateur
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
    }
  };

  // Fonction de déconnexion
  const signOut = async (): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Rediriger vers l'écran d'onboarding après déconnexion
      if (navigation && typeof navigation.reset === 'function') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding' as never }],
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  };
  
  // Fonction de réinitialisation de mot de passe
  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'com.cuisinevoyage://reset-password',
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  };
  
  // Fonction de mise à jour du profil
  const updateProfile = async (data: UpdateProfileFormData): Promise<AuthResult> => {
    try {
      if (!session?.user) {
        throw new Error('Aucun utilisateur connecté');
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', session.user.id);
        
      if (error) throw error;
      
      // Mettre à jour le profil local
      if (userProfile) {
        setUserProfile({ ...userProfile, ...data });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  };
  
  // Fonction de mise à jour du mot de passe
  const updatePassword = async (password: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  };
  
  // Créer la valeur du contexte
  const value: AuthContextType = {
    session,
    loading,
    userProfile,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    updatePassword,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 