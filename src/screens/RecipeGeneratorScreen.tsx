import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Image,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../styles/theme';
import { useAuthContext } from '../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { registerForPushNotificationsAsync, sendLocalNotification } from '../lib/notifications';

// Variables d'environnement
const API_URL = 'https://api.sortium.fr';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'mabpih-peqsak-temmA2';

type RecipeGeneratorScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RecipeGenerator'
>;

type DishType = 'plat_italien' | 'plat_francais' | 'plat_asiatique' | 'plat_indien' | 'plat_mexicain' | 'dessert' | 'entree' | 'plat_principal';

export default function RecipeGeneratorScreen() {
  const navigation = useNavigation<RecipeGeneratorScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { session } = useAuthContext();
  const { showConfirmDialog } = useConfirmDialog();
  const { showToast } = useToast();
  
  // État pour la génération
  const [recipeName, setRecipeName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipeId, setRecipeId] = useState<number | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const popupScale = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;
  
  // Type de plat fixé à 'plat_principal'
  const dishType: DishType = 'plat_principal';
  
  // Contraintes diététiques
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isDairyFree, setIsDairyFree] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [excludedIngredients, setExcludedIngredients] = useState('');
  const [maxCalories, setMaxCalories] = useState('');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  const [isPersonnalisationExpanded, setIsPersonnalisationExpanded] = useState(false);
  const personalisationHeight = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();

    // Demander les permissions pour les notifications au chargement du composant
    const registerForPushNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      setExpoPushToken(token);
    };
    registerForPushNotifications();
  }, []);
  
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Fonction pour basculer l'état du collapsible
  const togglePersonnalisation = () => {
    setIsPersonnalisationExpanded(!isPersonnalisationExpanded);
    Animated.timing(personalisationHeight, {
      toValue: isPersonnalisationExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
  // Fonction pour animer le pop-up
  const animatePopup = (show: boolean) => {
    Animated.parallel([
      Animated.spring(popupScale, {
        toValue: show ? 1 : 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 100,
      }),
      Animated.timing(popupOpacity, {
        toValue: show ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Fonction pour gérer la confirmation
  const handleConfirmation = () => {
    setShowConfirmation(true);
    animatePopup(true);
    
    // Rediriger vers la page d'accueil après 2 secondes
    setTimeout(() => {
      animatePopup(false);
      setTimeout(() => {
        setShowConfirmation(false);
        navigation.navigate('Main');
      }, 200);
    }, 2000);
  };
  
  // Génération complète de la recette en une seule étape
  const generateCompleteRecipe = async () => {
    if (!recipeName.trim()) {
      showToast({
        type: 'error',
        message: 'Erreur',
        description: 'Veuillez saisir le nom d\'une recette.',
        duration: 3000
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Afficher le pop-up de confirmation
      handleConfirmation();

      // Préparation des préférences diététiques
      const dietaryRestrictions = [];
      if (isVegetarian) dietaryRestrictions.push('vegetarien');
      if (isVegan) dietaryRestrictions.push('vegan');
      if (isGlutenFree) dietaryRestrictions.push('sans_gluten');
      if (isDairyFree) dietaryRestrictions.push('sans_lactose');
      
      // Préparation des allergies
      const allergiesList = allergies
        .split(',')
        .map(item => item.trim())
        .filter(item => item);
      
      // Préparation des ingrédients exclus
      const excludedList = excludedIngredients
        .split(',')
        .map(item => item.trim())
        .filter(item => item);
      
      const response = await fetch(`${API_URL}/api/v1/recipes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY,
        },
        body: JSON.stringify({
          recipe_name: recipeName,
          dish_type: dishType,
          dietary_restrictions: dietaryRestrictions,
          allergies: allergiesList,
          excluded_ingredients: excludedList,
          max_calories: maxCalories ? parseInt(maxCalories, 10) : null,
          push_token: expoPushToken,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.recipe_id) {
        setRecipeId(data.recipe_id);
        
        // Envoyer une notification locale
        await sendLocalNotification(
          'Recette générée !',
          `Votre recette "${recipeName}" est prête à être consultée.`
        );
        
        showConfirmDialog({
          title: 'Succès',
          message: 'Votre recette est prête!',
          confirmText: 'Voir la recette',
          cancelText: 'OK',
          icon: 'checkmark-circle',
          confirmType: 'success',
          onConfirm: () => {
            if (data.recipe_id) {
              navigation.navigate('RecipeDetail', {
                id: data.recipe_id,
                title: recipeName,
              });
            }
          }
        });
      } else {
        throw new Error(data.message || 'Erreur lors de la génération de la recette');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showToast({
        type: 'error',
        message: 'Erreur',
        description: 'Impossible de générer la recette. Veuillez réessayer plus tard.',
        duration: 3000
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Switch Component pour les préférences diététiques
  const PreferenceSwitch = ({ 
    label, 
    value, 
    onValueChange,
    icon
  }: { 
    label: string; 
    value: boolean; 
    onValueChange: (value: boolean) => void;
    icon: React.ReactNode;
  }) => (
    <TouchableOpacity 
      style={[styles.switchContainer, value && styles.activeSwitchContainer]} 
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
    >
      <View style={styles.switchLabelContainer}>
        {icon}
        <Text style={[styles.switchLabel, value && styles.activeSwitchLabel]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
        ios_backgroundColor="#E0E0E0"
        style={styles.switch}
      />
    </TouchableOpacity>
  );
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar style="dark" />
      
      {/* Header avec dégradé et effet blur */}
      <BlurView intensity={30} tint="light" style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
          style={[styles.header, { paddingTop: insets.top || 40 }]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Création de recette</Text>
          <View style={styles.headerRight} />
        </LinearGradient>
      </BlurView>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Nom de la recette */}
        <Animated.View 
          style={[
            styles.section, 
            { opacity: fadeAnim, transform: [{ translateY }] }
          ]}
        >
          <View style={styles.sectionTitleContainer}>
            <MaterialIcons name="restaurant-menu" size={22} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>NOMMEZ VOTRE PLAT</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Entrez le nom du plat que vous souhaitez créer
          </Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="fast-food-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={recipeName}
              onChangeText={setRecipeName}
              placeholder="Ex: Poulet au curry, Tiramisu..."
              placeholderTextColor={theme.colors.textMuted}
              maxLength={50}
            />
            {recipeName ? (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => setRecipeName('')}
              >
                <Feather name="x-circle" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </Animated.View>
        
        {/* Préférences et contraintes - Section collapsible */}
        <Animated.View 
          style={[
            styles.section, 
            { opacity: fadeAnim, transform: [{ translateY }] }
          ]}
        >
          <TouchableOpacity 
            style={styles.collapsibleHeader}
            onPress={togglePersonnalisation}
            activeOpacity={0.7}
          >
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name="settings" size={22} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>PERSONNALISATION</Text>
            </View>
            <MaterialIcons 
              name={isPersonnalisationExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={28} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
          
          <Animated.View 
            style={[
              styles.collapsibleContent,
              {
                opacity: personalisationHeight,
                height: personalisationHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1000] // Hauteur maximale estimée
                }),
                overflow: 'hidden'
              }
            ]}
          >
            <Text style={styles.sectionDescription}>
              Ajoutez vos préférences alimentaires et restrictions
            </Text>
            
            <View style={styles.optionTitleContainer}>
              <FontAwesome5 name="leaf" size={16} color={theme.colors.primary} />
              <Text style={styles.optionSectionTitle}>Préférences diététiques</Text>
            </View>
            <View style={styles.optionsGrid}>
              <PreferenceSwitch
                label="Végétarien"
                value={isVegetarian}
                onValueChange={setIsVegetarian}
                icon={<FontAwesome5 name="carrot" size={16} color={isVegetarian ? "#fff" : "#4CAF50"} style={styles.optionIcon} />}
              />
              <PreferenceSwitch
                label="Végan"
                value={isVegan}
                onValueChange={setIsVegan}
                icon={<FontAwesome5 name="seedling" size={16} color={isVegan ? "#fff" : "#4CAF50"} style={styles.optionIcon} />}
              />
              <PreferenceSwitch
                label="Sans gluten"
                value={isGlutenFree}
                onValueChange={setIsGlutenFree}
                icon={<MaterialCommunityIcons name="barley-off" size={16} color={isGlutenFree ? "#fff" : "#FF9800"} style={styles.optionIcon} />}
              />
              <PreferenceSwitch
                label="Sans lactose"
                value={isDairyFree}
                onValueChange={setIsDairyFree}
                icon={<FontAwesome5 name="cheese" size={16} color={isDairyFree ? "#fff" : "#FF9800"} style={styles.optionIcon} />}
              />
            </View>
            
            <View style={styles.optionTitleContainer}>
              <FontAwesome5 name="exclamation-circle" size={16} color={theme.colors.primary} />
              <Text style={styles.optionSectionTitle}>Allergies</Text>
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons name="warning" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={allergies}
                onChangeText={setAllergies}
                placeholder="Allergies (séparées par des virgules)"
                placeholderTextColor={theme.colors.textMuted}
                multiline
              />
              {allergies ? (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setAllergies('')}
                >
                  <Feather name="x-circle" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>
            
            <View style={styles.optionTitleContainer}>
              <Ionicons name="close-circle" size={16} color={theme.colors.primary} />
              <Text style={styles.optionSectionTitle}>Ingrédients à exclure</Text>
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons name="not-interested" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={excludedIngredients}
                onChangeText={setExcludedIngredients}
                placeholder="Ingrédients à exclure (séparés par des virgules)"
                placeholderTextColor={theme.colors.textMuted}
                multiline
              />
              {excludedIngredients ? (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setExcludedIngredients('')}
                >
                  <Feather name="x-circle" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>
            
            <View style={styles.optionTitleContainer}>
              <FontAwesome5 name="fire" size={16} color={theme.colors.primary} />
              <Text style={styles.optionSectionTitle}>Calories maximales (kcal)</Text>
            </View>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="fire" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={maxCalories}
                onChangeText={(text) => setMaxCalories(text.replace(/[^0-9]/g, ''))}
                placeholder="Ex: 600"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="number-pad"
              />
              {maxCalories ? (
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={() => setMaxCalories('')}
                >
                  <Feather name="x-circle" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>
          </Animated.View>
          
          <Animated.View 
            style={{
              transform: [{ scale: buttonScale }]
            }}
          >
            <TouchableOpacity
              style={[
                styles.generateButton,
                (!recipeName.trim() || isGenerating) && styles.disabledButton,
              ]}
              onPress={() => {
                if (!isGenerating && recipeName.trim()) {
                  animateButton();
                  generateCompleteRecipe();
                }
              }}
              disabled={!recipeName.trim() || isGenerating}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateButtonGradient}
              >
                {isGenerating ? (
                  <View style={styles.generatingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.generatingText}>
                      Génération en cours...
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.generateButtonText}>
                      Générer ma recette
                    </Text>
                    <MaterialIcons name="restaurant" size={24} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          
          {recipeId && (
            <TouchableOpacity
              style={styles.viewRecipeButton}
              onPress={() => {
                if (recipeId !== null) {
                  navigation.navigate('RecipeDetail', { id: recipeId, title: recipeName });
                }
              }}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.8)', 'rgba(248,248,248,0.9)']}
                style={styles.viewRecipeButtonGradient}
              >
                <Text style={styles.viewRecipeButtonText}>
                  Voir ma recette générée
                </Text>
                <View style={styles.arrowIconContainer}>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>

      {/* Pop-up de confirmation */}
      {showConfirmation && (
        <View style={styles.popupOverlay}>
          <Animated.View 
            style={[
              styles.popupContainer,
              {
                opacity: popupOpacity,
                transform: [{ scale: popupScale }]
              }
            ]}
          >
            <BlurView intensity={80} tint="light" style={styles.popupBlur}>
              <View style={styles.popupContent}>
                <View style={styles.popupIconContainer}>
                  <MaterialIcons name="restaurant-menu" size={40} color={theme.colors.primary} />
                </View>
                <Text style={styles.popupTitle}>Génération en cours</Text>
                <Text style={styles.popupText}>
                  Votre recette est en train d'être générée !{'\n'}
                  Vous recevrez une notification lorsqu'elle sera prête.
                </Text>
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
              </View>
            </BlurView>
          </Animated.View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 90 : 80,
  },
  scrollViewContent: {
    paddingBottom: 60,
  },
  section: {
    padding: 24,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  sectionDescription: {
    fontSize: 15,
    color: theme.colors.textMuted,
    marginBottom: 22,
    lineHeight: 22,
    paddingLeft: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248,248,248,0.8)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text,
  },
  clearButton: {
    paddingHorizontal: 12,
  },
  optionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 22,
  },
  optionSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 10,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    marginHorizontal: -6,
  },
  switchContainer: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(248,248,248,0.7)',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeSwitchContainer: {
    backgroundColor: theme.colors.primary,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activeSwitchLabel: {
    color: '#fff',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  generateButton: {
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 28,
    marginBottom: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  viewRecipeButton: {
    overflow: 'hidden',
    borderRadius: 30,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewRecipeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  viewRecipeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: 12,
  },
  arrowIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  generatingText: {
    color: '#fff',
    marginLeft: 12,
    fontWeight: '600',
    fontSize: 16,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  collapsibleContent: {
    marginTop: 10,
  },
  popupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  popupContainer: {
    width: '80%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.95)',
    ...theme.shadows.large,
  },
  popupBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  popupContent: {
    padding: 24,
    alignItems: 'center',
  },
  popupIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...theme.shadows.medium,
  },
  popupTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  popupText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '500',
  },
  loadingContainer: {
    marginTop: 8,
  },
}); 