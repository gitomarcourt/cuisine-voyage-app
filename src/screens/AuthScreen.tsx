import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Image,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuthContext } from '../contexts/AuthContext';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SignInFormData, SignUpFormData } from '../types/auth';

const { width, height } = Dimensions.get('window');

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

const validateUsername = (username: string): boolean => {
  return username.length >= 3;
};

export default function AuthScreen() {
  // États pour le mode d'authentification
  const [isLogin, setIsLogin] = React.useState(true);
  
  // États pour les formulaires
  const [formData, setFormData] = React.useState<SignInFormData & SignUpFormData>({
    email: '',
    password: '',
    username: '',
  });
  
  // États pour le UI
  const [loading, setLoading] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState({
    email: false,
    password: false,
    username: false,
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = React.useState(false);
  
  // Animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  
  // Accès au contexte d'authentification
  const { signIn, signUp, resetPassword } = useAuthContext();
  
  // Effet pour l'animation d'entrée
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // Animation lors du changement de mode
  React.useEffect(() => {
    // Réinitialiser les erreurs du formulaire
    setFormErrors({
      email: false,
      password: false,
      username: false,
    });
    
    // Animation de transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  }, [isLogin, forgotPasswordMode]);
  
  // Mise à jour des valeurs du formulaire
  const updateFormField = (field: keyof (SignInFormData & SignUpFormData), value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Validation instantanée
    if (field === 'email') {
      setFormErrors((prev) => ({ ...prev, email: value !== '' && !validateEmail(value) }));
    } else if (field === 'password') {
      setFormErrors((prev) => ({ ...prev, password: value !== '' && !validatePassword(value) }));
    } else if (field === 'username') {
      setFormErrors((prev) => ({ ...prev, username: value !== '' && !validateUsername(value) }));
    }
  };
  
  // Validation complète du formulaire
  const validateForm = (): boolean => {
    let isValid = true;
    const errors = { ...formErrors };
    
    // Vérifier l'email
    if (!validateEmail(formData.email)) {
      errors.email = true;
      isValid = false;
    }
    
    // En mode mot de passe oublié, on ne vérifie que l'email
    if (forgotPasswordMode) {
      setFormErrors(errors);
      return isValid;
    }
    
    // Vérifier le mot de passe
    if (!validatePassword(formData.password)) {
      errors.password = true;
      isValid = false;
    }
    
    // Vérifier le nom d'utilisateur en mode inscription
    if (!isLogin && !validateUsername(formData.username)) {
      errors.username = true;
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Gestion de la soumission du formulaire
  const handleSubmit = async () => {
    Keyboard.dismiss();
    
    if (!validateForm()) {
      Alert.alert(
        'Formulaire incomplet', 
        'Veuillez vérifier les informations saisies.'
      );
      return;
    }
    
    setLoading(true);
    
    try {
      if (forgotPasswordMode) {
        // Traitement de la demande de réinitialisation de mot de passe
        const { success, error } = await resetPassword(formData.email);
        
        if (success) {
          Alert.alert(
            'Email envoyé',
            'Si cette adresse est associée à un compte, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.'
          );
          // Revenir au mode de connexion
          setForgotPasswordMode(false);
        } else if (error) {
          Alert.alert('Erreur', error);
        }
      } else if (isLogin) {
        // Traitement de la connexion
        const { success, error } = await signIn(formData.email, formData.password);
        
        if (!success && error) {
          Alert.alert('Erreur de connexion', error);
        }
      } else {
        // Traitement de l'inscription
        const { success, error } = await signUp(formData.email, formData.password, formData.username);
        
        if (!success && error) {
          Alert.alert('Erreur d\'inscription', error);
        } else if (success) {
          Alert.alert(
            'Inscription réussie', 
            'Votre compte a été créé avec succès! Vérifiez votre email pour confirmer votre compte.'
          );
        }
      }
    } catch (error) {
      Alert.alert('Erreur inattendue', 'Une erreur est survenue lors de la tentative');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Basculer entre les modes connexion et inscription
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setForgotPasswordMode(false);
  };
  
  // Basculer vers le mode de réinitialisation de mot de passe
  const toggleForgotPassword = () => {
    setForgotPasswordMode(!forgotPasswordMode);
  };
  
  // Construire le titre du formulaire selon le mode
  const getFormTitle = () => {
    if (forgotPasswordMode) return 'Mot de passe oublié';
    return isLogin ? 'Connexion' : 'Inscription';
  };
  
  // Construire le sous-titre selon le mode
  const getFormSubtitle = () => {
    if (forgotPasswordMode) {
      return 'Entrez votre adresse email pour recevoir un lien de réinitialisation';
    }
    return isLogin 
      ? 'Connectez-vous pour accéder à votre carnet de voyage culinaire' 
      : 'Créez un compte pour commencer votre aventure culinaire';
  };
  
  // Construire le texte du bouton selon le mode
  const getSubmitButtonText = () => {
    if (forgotPasswordMode) return 'Envoyer le lien';
    return isLogin ? 'Se connecter' : 'S\'inscrire';
  };
  
  // Construire le texte du lien de bascule selon le mode
  const getToggleText = () => {
    if (forgotPasswordMode) {
      return 'Retour à la connexion';
    }
    return isLogin 
      ? 'Pas encore de compte ? S\'inscrire' 
      : 'Déjà un compte ? Se connecter';
  };
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Image 
          source={require('../../assets/auth-background.jpg')}
          style={styles.backgroundImage} 
          blurRadius={3}
        />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.logoText}>Cuisine Voyage</Text>
            <Text style={styles.logoSubtitle}>Découvrez le monde à travers ses saveurs</Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.authCardContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <BlurView intensity={20} tint="light" style={styles.authCard}>
              <Text style={styles.title}>{getFormTitle()}</Text>
              <Text style={styles.subtitle}>{getFormSubtitle()}</Text>
              
              {/* Champ nom d'utilisateur (uniquement en mode inscription) */}
              {!isLogin && !forgotPasswordMode && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nom d'utilisateur</Text>
                  <View style={[
                    styles.inputWrapper, 
                    formErrors.username && styles.inputError
                  ]}>
                    <Ionicons name="person-outline" size={18} color={theme.colors.textLight} style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input}
                      value={formData.username}
                      onChangeText={(text) => updateFormField('username', text)}
                      placeholder="Votre nom d'utilisateur"
                      autoCapitalize="none"
                      placeholderTextColor={theme.colors.textLight}
                    />
                    {formErrors.username && (
                      <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
                    )}
                  </View>
                  {formErrors.username && (
                    <Text style={styles.errorText}>
                      Le nom d'utilisateur doit contenir au moins 3 caractères
                    </Text>
                  )}
                </View>
              )}
              
              {/* Champ email (pour tous les modes) */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={[
                  styles.inputWrapper, 
                  formErrors.email && styles.inputError
                ]}>
                  <Ionicons name="mail-outline" size={18} color={theme.colors.textLight} style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => updateFormField('email', text)}
                    placeholder="votre@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={theme.colors.textLight}
                  />
                  {formErrors.email && (
                    <Ionicons name="alert-circle" size={18} color={theme.colors.error} />
                  )}
                </View>
                {formErrors.email && (
                  <Text style={styles.errorText}>
                    Veuillez entrer une adresse email valide
                  </Text>
                )}
              </View>
              
              {/* Champ mot de passe (sauf en mode mot de passe oublié) */}
              {!forgotPasswordMode && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <View style={[
                    styles.inputWrapper, 
                    formErrors.password && styles.inputError
                  ]}>
                    <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textLight} style={styles.inputIcon} />
                    <TextInput 
                      style={styles.input}
                      value={formData.password}
                      onChangeText={(text) => updateFormField('password', text)}
                      placeholder="Votre mot de passe"
                      secureTextEntry={!showPassword}
                      placeholderTextColor={theme.colors.textLight}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.passwordToggle}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={18} 
                        color={theme.colors.textLight} 
                      />
                    </TouchableOpacity>
                  </View>
                  {formErrors.password && (
                    <Text style={styles.errorText}>
                      Le mot de passe doit contenir au moins 6 caractères
                    </Text>
                  )}
                </View>
              )}
              
              {/* Lien "Mot de passe oublié" (seulement en mode connexion) */}
              {isLogin && !forgotPasswordMode && (
                <TouchableOpacity 
                  style={styles.forgotPasswordLink}
                  onPress={toggleForgotPassword}
                >
                  <Text style={styles.forgotPasswordText}>
                    Mot de passe oublié ?
                  </Text>
                </TouchableOpacity>
              )}
              
              {/* Bouton de soumission */}
              <TouchableOpacity
                style={styles.submitButtonWrapper}
                onPress={handleSubmit}
                disabled={loading}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButton}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {getSubmitButtonText()}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Lien pour basculer entre les modes */}
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={forgotPasswordMode ? toggleForgotPassword : toggleAuthMode}
              >
                <Text style={styles.toggleButtonText}>
                  {getToggleText()}
                </Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  logoSubtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  authCardContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  authCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(211, 197, 184, 0.5)',
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    padding: theme.spacing.md,
  },
  passwordToggle: {
    padding: 10,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  submitButtonWrapper: {
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  submitButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
