import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useAuthContext } from '../contexts/AuthContext';
import { theme } from '../styles/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SignInFormData, SignUpFormData } from '../types/auth';
import Svg, { Path, Defs, Stop, Circle, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

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
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  
  // Récupérer les insets de la zone de sécurité
  const insets = useSafeAreaInsets();
  
  // Animation de rotation lente pour l'illustration
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  
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
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
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
    if (forgotPasswordMode) return 'Entrez votre email pour réinitialiser';
    if (isLogin) return 'Accédez à votre voyage culinaire';
    return 'Rejoignez notre aventure gastronomique';
  };
  
  // Déterminer le texte du bouton de soumission
  const getSubmitButtonText = () => {
    if (forgotPasswordMode) return 'Envoyer le lien';
    return isLogin ? 'Se connecter' : 'S\'inscrire';
  };
  
  // Texte pour basculer entre les modes
  const getToggleText = () => {
    if (forgotPasswordMode) return 'Retour à la connexion';
    return isLogin ? 'Créer un compte' : 'Se connecter';
  };
  
  // Rotation pour l'illustration
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  // Rendu de l'illustration
  const renderAuthIllustration = () => {
    let iconName: string = isLogin ? 'account-key' : 'account-plus';
    if (forgotPasswordMode) iconName = 'email-send';
    
    return (
      <Animated.View
        style={[
          styles.illustrationContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { rotate: rotate }
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.accent]}
          style={styles.iconBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name={iconName as any} size={60} color="white" />
        </LinearGradient>
        
        <Svg height="100%" width="100%" style={styles.decorativeSvg} viewBox="0 0 200 200">
          <Defs>
            <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={theme.colors.primary} stopOpacity="0.3" />
              <Stop offset="1" stopColor={theme.colors.accent} stopOpacity="0.3" />
            </SvgLinearGradient>
          </Defs>
          <Circle cx="100" cy="100" r="80" fill="url(#grad)" />
          <Circle cx="70" cy="70" r="10" fill="white" opacity="0.2" />
          <Circle cx="130" cy="130" r="15" fill="white" opacity="0.2" />
          <Path
            d="M30,100 Q100,30 170,100 Q100,170 30,100"
            stroke={theme.colors.accent}
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            opacity="0.6"
          />
        </Svg>
      </Animated.View>
    );
  };
  
  const navigation = useNavigation();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#FFFFFF', '#F8F5F1']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      <View style={[styles.header, { marginTop: insets.top || 20 }]}>
        <Text style={styles.appName}>Savorista</Text>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.titleUnderline}
        />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.content, !isLogin && { paddingTop: 50 }]}>
            {!isLogin && !forgotPasswordMode ? null : (
              <View style={styles.illustrationWrapper}>
                {renderAuthIllustration()}
              </View>
            )}
            
            <Animated.View 
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <Text style={styles.formTitle}>{getFormTitle()}</Text>
              <Text style={styles.formSubtitle}>{getFormSubtitle()}</Text>
              
              {!isLogin && !forgotPasswordMode && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Nom d'utilisateur</Text>
                  <View style={[
                    styles.textInputContainer,
                    formErrors.username && styles.inputError
                  ]}>
                    <Ionicons 
                      name="person-outline" 
                      size={20} 
                      color={formErrors.username ? theme.colors.error : theme.colors.textMuted}
                      style={styles.inputIcon} 
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Votre nom d'utilisateur"
                      placeholderTextColor={theme.colors.placeholder}
                      value={formData.username}
                      onChangeText={(text) => updateFormField('username', text)}
                      autoCapitalize="none"
                    />
                  </View>
                  {formErrors.username && (
                    <Text style={styles.errorText}>
                      Le nom d'utilisateur doit contenir au moins 3 caractères
                    </Text>
                  )}
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[
                  styles.textInputContainer,
                  formErrors.email && styles.inputError
                ]}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={formErrors.email ? theme.colors.error : theme.colors.textMuted}
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Votre adresse email"
                    placeholderTextColor={theme.colors.placeholder}
                    value={formData.email}
                    onChangeText={(text) => updateFormField('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {formErrors.email && (
                  <Text style={styles.errorText}>
                    Veuillez entrer une adresse email valide
                  </Text>
                )}
              </View>
              
              {!forgotPasswordMode && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Mot de passe</Text>
                  <View style={[
                    styles.textInputContainer,
                    formErrors.password && styles.inputError
                  ]}>
                    <Ionicons 
                      name="lock-closed-outline" 
                      size={20} 
                      color={formErrors.password ? theme.colors.error : theme.colors.textMuted}
                      style={styles.inputIcon} 
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Votre mot de passe"
                      placeholderTextColor={theme.colors.placeholder}
                      value={formData.password}
                      onChangeText={(text) => updateFormField('password', text)}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                      style={styles.showPasswordButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons 
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                        size={20} 
                        color={theme.colors.textMuted} 
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
              
              {isLogin && !forgotPasswordMode && (
                <TouchableOpacity 
                  style={styles.forgotPasswordButton}
                  onPress={toggleForgotPassword}
                >
                  <Text style={styles.forgotPasswordText}>
                    Mot de passe oublié ?
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {getSubmitButtonText()}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.toggleModeButton}
                onPress={forgotPasswordMode ? toggleForgotPassword : toggleAuthMode}
              >
                <Text style={styles.toggleModeText}>
                  {getToggleText()}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  titleUnderline: {
    height: 3,
    width: 30,
    borderRadius: 2,
  },
  illustrationWrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  illustrationContainer: {
    width: width * 0.5,
    height: width * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  decorativeSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.sm,
    ...theme.shadows.medium,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: theme.spacing.sm,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'white',
    ...theme.shadows.small,
  },
  inputIcon: {
    padding: theme.spacing.sm,
  },
  textInput: {
    flex: 1,
    height: 45,
    color: theme.colors.text,
    fontSize: 15,
  },
  showPasswordButton: {
    padding: theme.spacing.sm,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 11,
    marginTop: theme.spacing.xs / 2,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.sm,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 13,
  },
  submitButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginTop: theme.spacing.sm,
    ...theme.shadows.small,
  },
  gradientButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  toggleModeButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  toggleModeText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
