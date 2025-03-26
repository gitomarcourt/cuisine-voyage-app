import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
  StatusBar
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '../contexts/AuthContext';
import { theme } from '../styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecipes } from '../hooks/useRecipes';
import { Recipe } from '../types/models';
import { useToast } from '../components/Toast';
import { useConfirmDialog } from '../components/ConfirmDialog';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut, updateProfile, userProfile, resetPassword, updatePassword } = useAuthContext();
  const { recipes, loading: loadingRecipes } = useRecipes();
  const { showToast } = useToast();
  const { showConfirmDialog } = useConfirmDialog();

  // États pour l'édition du profil
  const [isEditing, setIsEditing] = React.useState(false);
  const [username, setUsername] = React.useState(userProfile?.username || '');
  const [saving, setSaving] = React.useState(false);
  
  // États pour le changement de mot de passe
  const [passwordModalVisible, setPasswordModalVisible] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Récupérer les recettes favorites en utilisant une vérification supplémentaire
  const favoriteRecipes = React.useMemo(() => {
    return recipes?.filter(recipe => {
      // Vérification de type sécurisée avec 'as any'
      return (recipe as any).is_favorite === true;
    }) || [];
  }, [recipes]);

  // Mettre à jour les états lorsque userProfile change
  React.useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || '');
    }
  }, [userProfile]);

  // Fonction pour se déconnecter
  const handleSignOut = async () => {
    showConfirmDialog({
      title: 'Déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      confirmText: 'Déconnexion',
      cancelText: 'Annuler',
      confirmType: 'danger',
      icon: 'log-out-outline',
      onConfirm: async () => {
        const { success } = await signOut();
        if (!success) {
          showToast({
            type: 'error',
            message: 'Erreur de déconnexion',
            description: 'Un problème est survenu lors de la déconnexion.'
          });
        }
      }
    });
  };
  
  // Fonction pour sauvegarder le profil
  const handleSaveProfile = async () => {
    if (!username.trim()) {
      showToast({
        type: 'error',
        message: 'Champ requis',
        description: 'Le nom d\'utilisateur ne peut pas être vide.'
      });
      return;
    }
    
    setSaving(true);
    
    try {
      const { success, error } = await updateProfile({ username });
      
      if (success) {
        setIsEditing(false);
        showToast({
          type: 'success',
          message: 'Profil mis à jour',
          description: 'Votre profil a été mis à jour avec succès.'
        });
      } else {
        showToast({
          type: 'error',
          message: 'Erreur',
          description: error || 'Une erreur est survenue lors de la mise à jour du profil.'
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour du profil.'
      });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  
  // Fonction pour demander la réinitialisation du mot de passe
  const handleResetPassword = async () => {
    try {
      const { success, error } = await resetPassword(userProfile?.username || '');
      
      if (success) {
        showToast({
          type: 'success',
          message: 'Email envoyé',
          description: 'Un email de réinitialisation du mot de passe a été envoyé à votre adresse email.'
        });
      } else {
        showToast({
          type: 'error',
          message: 'Erreur',
          description: error || 'Une erreur est survenue lors de la demande de réinitialisation.'
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Erreur',
        description: 'Une erreur est survenue.'
      });
      console.error(error);
    }
  };
  
  // Fonction pour changer le mot de passe
  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast({
        type: 'warning',
        message: 'Champs manquants',
        description: 'Veuillez remplir tous les champs.'
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showToast({
        type: 'error',
        message: 'Mots de passe différents',
        description: 'Les mots de passe ne correspondent pas.'
      });
      return;
    }
    
    if (newPassword.length < 6) {
      showToast({
        type: 'warning',
        message: 'Mot de passe trop court',
        description: 'Le mot de passe doit contenir au moins 6 caractères.'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { success, error } = await updatePassword(newPassword);
      
      if (success) {
        setPasswordModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast({
          type: 'success',
          message: 'Mot de passe modifié',
          description: 'Votre mot de passe a été modifié avec succès.'
        });
      } else {
        showToast({
          type: 'error',
          message: 'Erreur',
          description: error || 'Une erreur est survenue lors de la modification du mot de passe.'
        });
      }
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Erreur',
        description: 'Une erreur est survenue.'
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer, 
        { paddingBottom: insets.bottom + 90 }
      ]}
    >
      <StatusBar barStyle="dark-content" />
      
      {/* En-tête du profil */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 20 }]}>
        <Text style={styles.title}>Mon profil</Text>
      </View>
      
      {/* Carte du profil utilisateur */}
      <BlurView intensity={15} tint="light" style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.accent]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {userProfile?.username?.[0]?.toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
          </View>
          
          <View style={styles.profileInfo}>
            {isEditing ? (
              <TextInput
                style={styles.usernameInput}
                value={username}
                onChangeText={setUsername}
                placeholder="Nom d'utilisateur"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.username}>{userProfile?.username || 'Utilisateur'}</Text>
            )}
            
            <View style={styles.statusContainer}>
              <View 
                style={[
                  styles.statusBadge, 
                  userProfile?.is_premium ? styles.premiumBadge : styles.freeBadge
                ]}
              >
                <Text style={styles.statusText}>
                  {userProfile?.is_premium ? 'Premium' : 'Compte gratuit'}
                </Text>
              </View>
            </View>
          </View>
          
          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setIsEditing(false)}
                disabled={saving}
              >
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.editButton, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="checkmark" size={22} color="white" />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="pencil" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
      
      {/* Options du compte */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Paramètres du compte</Text>
        
        <TouchableOpacity 
          style={styles.option}
          onPress={() => setPasswordModalVisible(true)}
        >
          <View style={styles.optionIconContainer}>
            <Ionicons name="lock-closed-outline" size={22} color={theme.colors.text} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionText}>Changer le mot de passe</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
        </TouchableOpacity>
        
        {!userProfile?.is_premium && (
          <TouchableOpacity style={styles.option}>
            <View style={styles.optionIconContainer}>
              <Ionicons name="star-outline" size={22} color={theme.colors.text} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionText}>Passer à Premium</Text>
              <Text style={styles.optionSubtext}>Accédez à toutes les recettes et fonctionnalités</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Recettes favorites */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Mes recettes favorites</Text>
        
        {loadingRecipes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Chargement des recettes...</Text>
          </View>
        ) : favoriteRecipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="favorite-border" size={50} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>Vous n'avez pas encore de recettes favorites</Text>
            <Text style={styles.emptySubtext}>
              Explorez notre collection de recettes et ajoutez vos préférées ici
            </Text>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.favoritesContainer}
          >
            {favoriteRecipes.map(recipe => (
              <TouchableOpacity key={recipe.id} style={styles.favoriteCard}>
                <Image 
                  source={{ uri: recipe.image_url }} 
                  style={styles.favoriteImage}
                />
                <View style={styles.favoriteOverlay}>
                  <Text style={styles.favoriteTitle}>{recipe.title}</Text>
                  <Text style={styles.favoriteSubtitle}>{recipe.country}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
      
      {/* Bouton de déconnexion */}
      <TouchableOpacity 
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutButtonText}>Se déconnecter</Text>
      </TouchableOpacity>
      
      {/* Modal de changement de mot de passe */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <BlurView intensity={20} tint="light" style={styles.passwordModalContent}>
            <Text style={styles.modalTitle}>Changer le mot de passe</Text>
            
            <View style={styles.modalInput}>
              <Text style={styles.inputLabel}>Mot de passe actuel</Text>
              <TextInput
                style={styles.textInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Entrez votre mot de passe actuel"
              />
            </View>
            
            <View style={styles.modalInput}>
              <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
              <TextInput
                style={styles.textInput}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Minimum 6 caractères"
              />
            </View>
            
            <View style={styles.modalInput}>
              <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
              <TextInput
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Confirmez votre nouveau mot de passe"
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setPasswordModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalConfirmButton}
                onPress={handleChangePassword}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirmer</Text>
                )}
              </TouchableOpacity>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  profileCard: {
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    ...theme.shadows.medium,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  usernameInput: {
    fontSize: 20,
    color: theme.colors.text,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(211, 197, 184, 0.5)',
    borderRadius: theme.borderRadius.sm,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freeBadge: {
    backgroundColor: 'rgba(211, 197, 184, 0.3)',
  },
  premiumBadge: {
    backgroundColor: 'rgba(214, 182, 86, 0.2)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(211, 197, 184, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
  },
  editActions: {
    flexDirection: 'row',
  },
  sectionContainer: {
    marginTop: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(211, 197, 184, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  optionSubtext: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  favoritesContainer: {
    paddingVertical: theme.spacing.sm,
  },
  favoriteCard: {
    width: 150,
    height: 180,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginRight: theme.spacing.md,
    ...theme.shadows.small,
  },
  favoriteImage: {
    width: '100%',
    height: '100%',
  },
  favoriteOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: theme.spacing.sm,
  },
  favoriteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  favoriteSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  signOutButton: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(211, 197, 184, 0.2)',
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: theme.spacing.lg,
  },
  passwordModalContent: {
    width: '100%',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(211, 197, 184, 0.5)',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  modalCancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(211, 197, 184, 0.2)',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  modalConfirmButton: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.small,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});
