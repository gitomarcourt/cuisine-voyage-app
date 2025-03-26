import React, { useState, useLayoutEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ImageBackground, KeyboardAvoidingView, Platform, Keyboard, Animated } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import { RecipeGenerationSteps } from '../components/RecipeGenerationSteps';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

const API_URL = 'https://api.sortium.fr/generate-recipe';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

const { width, height } = Dimensions.get('window');

interface Step {
  step: number;
  status: 'loading' | 'completed' | 'error';
  message: string;
}

export const RecipeGeneratorScreen = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [recipeName, setRecipeName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const steps: Step[] = [
    { step: 1, status: 'loading', message: 'Recherche de la recette...' },
    { step: 2, status: 'loading', message: 'Génération des informations de base...' },
    { step: 3, status: 'loading', message: 'Ajout des ingrédients...' },
    { step: 4, status: 'loading', message: 'Ajout des instructions de préparation...' },
    { step: 5, status: 'loading', message: 'Création de l\'histoire immersive...' },
    { step: 6, status: 'loading', message: 'Recherche de l\'accord de vin parfait...' },
    { step: 7, status: 'loading', message: 'Création de la playlist d\'ambiance...' },
    { step: 8, status: 'loading', message: 'Finalisation...' }
  ];

  // Fonction pour faire défiler vers les étapes
  const scrollToSteps = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Animation de fade-in
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  // Animation de fade-out
  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const handleGenerateRecipe = async () => {
    if (!recipeName.trim()) {
      setError('Veuillez entrer le nom d\'une recette');
      return;
    }

    // Masquer le clavier
    Keyboard.dismiss();
    
    setError(null);
    setIsLoading(true);
    setIsGenerating(true);
    fadeIn();
    
    try {
      // Simulation des étapes
      const simulateSteps = async () => {
        const stepsToShow: Step[] = steps.map(step => ({...step}));

        // Délais variables pour chaque étape pour une expérience plus naturelle
        const delays = [2200, 3000, 2000, 2500, 3000, 2200, 2500, 3000];

        for (let i = 0; i < stepsToShow.length; i++) {
          setCurrentStep(stepsToShow[i]);
          scrollToSteps();
          await new Promise(resolve => setTimeout(resolve, delays[i]));
        }
        
        // Marquer la dernière étape comme complétée
        setCurrentStep({
          ...stepsToShow[stepsToShow.length - 1],
          status: 'completed',
          message: 'Recette générée et sauvegardée avec succès !'
        });
        
        return delays;
      };

      // Lancer la simulation des étapes et récupérer les délais
      const stepsPromise = simulateSteps();

      // Appel à l'API en mode JSON simplifié
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY || '',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ recipeName: recipeName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la recette');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Une erreur est survenue');
      }

      // Attendre que la simulation des étapes soit terminée
      // Temps total basé sur un calcul approximatif (somme des délais + marge)
      const totalSimulationTime = 21000;
      
      setTimeout(() => {
        // Afficher un message de succès pendant 3 secondes
        setTimeout(() => {
          fadeOut();
          setTimeout(() => {
            setCurrentStep(null);
            setIsGenerating(false);
            setIsLoading(false);
            // Réinitialiser le champ de texte
            setRecipeName('');
          }, 600); // Temps pour le fade-out
        }, 3000);
      }, totalSimulationTime); // Temps total de la simulation

    } catch (err) {
      fadeOut();
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsLoading(false);
      setCurrentStep({
        step: 0,
        status: 'error',
        message: err instanceof Error ? err.message : 'Une erreur est survenue'
      });
      setTimeout(() => {
        setCurrentStep(null);
        setIsGenerating(false);
      }, 4000);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? -64 : 0}
    >
      <StatusBar style="light" />
      <ImageBackground
        source={require('assets/images/food-background.jpg')}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <IconButton
              icon="arrow-left"
              iconColor="#fff"
              size={24}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.contentContainer,
              isGenerating && styles.contentContainerGenerating
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <BlurView intensity={60} tint="dark" style={styles.card}>
              <View style={styles.inputWrapper}>
                <TextInput
                  label="Quel plat souhaitez-vous découvrir ?"
                  value={recipeName}
                  onChangeText={setRecipeName}
                  mode="outlined"
                  style={styles.input}
                  outlineColor="rgba(255,255,255,0.5)"
                  activeOutlineColor={theme.colors.accent}
                  textColor="#ffffff"
                  placeholderTextColor="rgba(255,255,255,0.8)"
                  error={!!error}
                  disabled={isLoading}
                  theme={{
                    colors: {
                      background: 'transparent',
                      placeholder: 'rgba(255,255,255,0.8)',
                      text: '#ffffff',
                      onSurfaceVariant: '#ffffff',
                    },
                  }}
                />
                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}
                <Button
                  mode="contained"
                  onPress={handleGenerateRecipe}
                  loading={isLoading}
                  disabled={isLoading || !recipeName.trim()}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  buttonColor={theme.colors.accent}
                  textColor="#000000"
                >
                  {isLoading ? 'Génération...' : 'Découvrir la recette'}
                </Button>
              </View>

              <Animated.View 
                style={[
                  styles.stepsContainer,
                  { opacity: fadeAnim }
                ]}
              >
                {currentStep && (
                  <RecipeGenerationSteps
                    currentStep={currentStep}
                    steps={steps}
                  />
                )}
              </Animated.View>
            </BlurView>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingTop: Platform.OS === 'ios' ? 48 : 32,
    paddingHorizontal: 8,
  },
  backButton: {
    marginBottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 88 : 72,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  contentContainerGenerating: {
    justifyContent: 'flex-start',
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    alignSelf: 'center',
    marginBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  inputWrapper: {
    padding: 20,
  },
  input: {
    fontSize: 16,
    backgroundColor: 'transparent',
    marginBottom: 8,
    height: Platform.OS === 'ios' ? 56 : 64,
  },
  errorText: {
    color: theme.colors.error,
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  buttonContent: {
    paddingVertical: 8,
    height: 52,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#000000',
  },
  stepsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
}); 