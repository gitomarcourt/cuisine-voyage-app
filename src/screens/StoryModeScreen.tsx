import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, 
  Animated, PanResponder, Dimensions, 
  ActivityIndicator, SafeAreaView, Platform, ImageBackground
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { useRecipes } from '../hooks/useRecipes';
import { Step } from '../types/models';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

export default function StoryModeScreen() {
  const route = useRoute<any>();
  const { id, title } = route.params;
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { getRecipeDetails } = useRecipes();
  
  // Story state
  const [storySteps, setStorySteps] = useState<Step[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [storyIntro, setStoryIntro] = useState('');
  const [showInstruction, setShowInstruction] = useState(false);
  const [swipeBlocked, setSwipeBlocked] = useState(false);
  
  // Combiner les étapes et l'intro
  const allSteps = useRef<(Step | { isIntro: boolean; title: string; content: string })[]>([]).current;
  
  // Références pour les animations et le panResponder
  const cardRef = useRef<View>(null);
  const positionRef = useRef(new Animated.ValueXY()).current;
  const opacityRef = useRef(new Animated.Value(1)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Reset les positions et reconstruire le panResponder quand currentIndex change
  useEffect(() => {
    positionRef.setValue({ x: 0, y: 0 });
    opacityRef.setValue(1);
  }, [currentIndex]);
  
  // Charge les détails de la recette
  useEffect(() => {
    async function loadStoryDetails() {
      setIsLoading(true);
      try {
        console.log('Chargement des détails de la recette ID:', id);
        const details = await getRecipeDetails(id);
        if (details) {
          console.log('Détails reçus:', details.recipe.title);
          console.log('Story intro présent?', !!details.recipe.story_intro);
          console.log('Nombre d\'étapes:', details.steps?.length || 0);
          console.log('Étapes avec story_content:', details.steps?.filter(step => !!step.story_content).length || 0);
          
          const intro = details.recipe.story_intro || '';
          const steps = details.steps || [];
          
          // Vider les allSteps d'abord pour éviter les doublons
          allSteps.length = 0;
          
          // Ajouter l'introduction directement si elle existe
          if (intro) {
            allSteps.push({ 
              isIntro: true, 
              title: "L'histoire commence...", 
              content: intro 
            });
          }
          
          // Ajouter toutes les étapes avec story_content
          steps.forEach(step => {
            if (step.story_content) {
              allSteps.push(step);
            }
          });
          
          console.log('allSteps après mise à jour directe:', allSteps.length);
          
          // Mettre à jour les états après
          setStorySteps(steps);
          setStoryIntro(intro);
        } else {
          console.log('Aucun détail reçu pour la recette');
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'histoire', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadStoryDetails();
  }, [id]);
  
  // Animations et PanResponder
  const rotate = positionRef.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-7deg', '0deg', '7deg'],
    extrapolate: 'clamp',
  });
  
  const rotateAndTranslate = {
    transform: [
      { rotate },
      ...positionRef.getTranslateTransform(),
    ],
  };
  
  const swipeLeftOpacity = positionRef.x.interpolate({
    inputRange: [-width / 4, 0, width / 4],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });
  
  const swipeRightOpacity = positionRef.x.interpolate({
    inputRange: [-width / 4, 0, width / 4],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });
  
  // Recréer le panResponder à chaque rendu pour qu'il utilise les valeurs à jour de currentIndex
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !isAnimating,
    onMoveShouldSetPanResponder: () => !isAnimating,
    onPanResponderGrant: () => {
      // Rien à faire au début du geste
    },
    onPanResponderMove: (_, gestureState) => {
      if (isAnimating) return;
      positionRef.setValue({ x: gestureState.dx, y: 0 });
    },
    onPanResponderRelease: (_, gestureState) => {
      if (isAnimating) return;
      
      // Si le swipe est suffisamment important
      if (gestureState.dx > SWIPE_THRESHOLD && currentIndex > 0) {
        handleSwipe('left');
      } else if (gestureState.dx < -SWIPE_THRESHOLD && currentIndex < allSteps.length - 1) {
        handleSwipe('right');
      } else {
        // Retour à la position initiale
        Animated.spring(positionRef, {
          toValue: { x: 0, y: 0 },
          friction: 5,
          useNativeDriver: true,
        }).start();
      }
    },
    onPanResponderTerminate: () => {
      // Si le geste est interrompu, retour à la position initiale
      Animated.spring(positionRef, {
        toValue: { x: 0, y: 0 },
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  });
  
  // Fonction de déblocage d'urgence
  const resetSwipeState = () => {
    // Réinitialise complètement l'état des animations
    positionRef.setValue({ x: 0, y: 0 });
    opacityRef.setValue(1);
    setIsAnimating(false);
    setSwipeBlocked(false);
    console.log("État de swipe réinitialisé");
  };

  // Surveille si l'animation reste bloquée
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isAnimating) {
      // Si l'animation reste active plus de 2 secondes, on force une réinitialisation
      timeoutId = setTimeout(() => {
        console.log("Animation bloquée détectée, réinitialisation forcée");
        resetSwipeState();
      }, 2000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isAnimating]);

  // Double-clic sur la carte pour débloquer
  const handleCardPress = () => {
    if (swipeBlocked || isAnimating) {
      resetSwipeState();
    }
  };
  
  const handleSwipe = (direction: 'left' | 'right') => {
    if (isAnimating || swipeBlocked) {
      console.log("Tentative de swipe ignorée - animation en cours ou swipe bloqué");
      return;
    }
    
    console.log(`Swipe ${direction} initié, de l'étape ${currentIndex} vers ${direction === 'right' ? currentIndex + 1 : currentIndex - 1}`);
    
    setIsAnimating(true);
    setSwipeBlocked(true);
    const isNext = direction === 'right';
    const newIndex = isNext ? currentIndex + 1 : currentIndex - 1;
    
    // Animation simplifiée pour plus de robustesse
    // Fade out
    Animated.timing(opacityRef, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Mise à jour de l'index
      setCurrentIndex(newIndex);
      positionRef.setValue({ x: 0, y: 0 });
      
      // Fade in
      setTimeout(() => {
        Animated.timing(opacityRef, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowInstruction(false);
          setIsAnimating(false);
          setSwipeBlocked(false);
        });
      }, 50);
    });
  };
  
  const goToNextStep = () => {
    if (currentIndex >= allSteps.length - 1 || isAnimating || swipeBlocked) return;
    console.log("Bouton suivant pressé, navigation à l'étape:", currentIndex + 1);
    
    // Réinitialiser l'état au cas où
    resetSwipeState();
    
    // Court délai pour s'assurer que l'état est propre
    setTimeout(() => {
      handleSwipe('right');
    }, 50);
  };
  
  const goToPrevStep = () => {
    if (currentIndex <= 0 || isAnimating || swipeBlocked) return;
    console.log("Bouton précédent pressé, navigation à l'étape:", currentIndex - 1);
    
    // Réinitialiser l'état au cas où
    resetSwipeState();
    
    // Court délai pour s'assurer que l'état est propre
    setTimeout(() => {
      handleSwipe('left');
    }, 50);
  };
  
  // Toggle instructions
  const toggleInstructions = () => {
    setShowInstruction(prev => !prev);
  };
  
  // En cas de changement d'index, enregistre un message
  useEffect(() => {
    console.log(`Index mis à jour: ${currentIndex}`);
  }, [currentIndex]);
  
  // Affiche un message dans la console si les étapes sont chargées
  useEffect(() => {
    if (allSteps.length > 0) {
      console.log(`${allSteps.length} étapes disponibles pour cette histoire`);
    }
  }, [allSteps.length]);
  
  const renderCards = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Préparation de votre voyage culinaire...</Text>
        </View>
      );
    }
    
    if (allSteps.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Aucune histoire disponible pour cette recette</Text>
        </View>
      );
    }
    
    if (currentIndex >= allSteps.length) {
      // Fin de l'histoire
      return (
        <View style={styles.endContainer}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.accent]}
            style={styles.endGradient}
          >
            <FontAwesome5 name="book" size={50} color={theme.colors.card} style={styles.endIcon} />
            <Text style={styles.endTitle}>Fin de l'histoire</Text>
            <Text style={styles.endText}>
              Votre voyage culinaire est maintenant complet. Il est temps de mettre en pratique cette belle histoire.
            </Text>
            <TouchableOpacity 
              style={styles.endButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.endButtonText}>Retour à la recette</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      );
    }
    
    // Récupère l'étape actuelle
    const currentStep = allSteps[currentIndex];
    
    // Détermine si c'est l'intro ou une étape normale
    const isIntro = 'isIntro' in currentStep;
    
    // Récupère le contenu à afficher
    const currentTitle = isIntro ? (currentStep as any).title : currentStep.title;
    const currentContent = isIntro ? (currentStep as any).content : currentStep.story_content;
    const recipeInstruction = !isIntro ? currentStep.description : '';
    
    return (
      <View style={styles.cardsContainer}>
        {/* Indicateur de swipe vers la gauche */}
        <Animated.View
          style={[
            styles.swipeIndicator,
            styles.swipeLeftIndicator,
            { opacity: swipeLeftOpacity },
          ]}
        >
          <View style={styles.swipeIndicatorInner}>
            <Ionicons name="arrow-back" size={30} color={theme.colors.card} />
            <Text style={styles.swipeIndicatorText}>Précédent</Text>
          </View>
        </Animated.View>

        {/* Indicateur de swipe vers la droite */}
        <Animated.View
          style={[
            styles.swipeIndicator, 
            styles.swipeRightIndicator,
            { opacity: swipeRightOpacity },
          ]}
        >
          <View style={styles.swipeIndicatorInner}>
            <Ionicons name="arrow-forward" size={30} color={theme.colors.card} />
            <Text style={styles.swipeIndicatorText}>Suivant</Text>
          </View>
        </Animated.View>
        
        {/* Carte principale */}
        <Animated.View 
          ref={cardRef}
          style={[
            styles.cardContainer, 
            rotateAndTranslate,
            { opacity: opacityRef }
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={handleCardPress}
            style={{ flex: 1 }}
          >
            <ImageBackground
              source={require('../../assets/card-texture.jpg')}
              style={styles.cardBackground}
              imageStyle={styles.cardBackgroundImage}
            >
              <LinearGradient
                colors={[
                  `${theme.colors.primary}E0`,
                  `${theme.colors.accent}E0`
                ]}
                style={styles.cardGradient}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardChapter}>
                      {isIntro ? 'Prologue' : `Chapitre ${currentIndex}`}
                    </Text>
                    <Text style={styles.cardTitle}>{currentTitle}</Text>
                  </View>
                  
                  <Text style={styles.cardText}>{currentContent}</Text>
                  
                  {/* Instructions (si ce n'est pas l'intro et si le bouton est activé) */}
                  {!isIntro && recipeInstruction && showInstruction && (
                    <View style={styles.instructionsContainer}>
                      <BlurView intensity={20} tint="light" style={styles.instructionsBlur}>
                        <Text style={styles.instructionsTitle}>Instructions</Text>
                        <Text style={styles.instructionsText}>{recipeInstruction}</Text>
                      </BlurView>
                    </View>
                  )}
                  
                  {/* Boutons de navigation */}
                  <View style={styles.navigationButtons}>
                    <TouchableOpacity 
                      style={[
                        styles.navButton, 
                        styles.navButtonPrev,
                        currentIndex <= 0 && styles.navButtonDisabled
                      ]} 
                      onPress={goToPrevStep}
                      disabled={currentIndex <= 0}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="arrow-back" size={22} color={currentIndex <= 0 ? 'rgba(255, 255, 255, 0.4)' : theme.colors.card} />
                    </TouchableOpacity>
                    
                    {/* Bouton d'instructions (uniquement pour les étapes normales) */}
                    {!isIntro && recipeInstruction && (
                      <TouchableOpacity 
                        style={[styles.instructionsButton, showInstruction && styles.instructionsButtonActive]} 
                        onPress={toggleInstructions}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name={showInstruction ? "eye-off" : "eye"} 
                          size={20} 
                          color={theme.colors.card} 
                        />
                        <Text style={styles.instructionsButtonText}>
                          {showInstruction ? "Cacher" : "Voir"}
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                      style={[
                        styles.navButton, 
                        styles.navButtonNext,
                        currentIndex >= allSteps.length - 1 && styles.navButtonDisabled
                      ]} 
                      onPress={goToNextStep}
                      disabled={currentIndex >= allSteps.length - 1}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="arrow-forward" size={22} color={currentIndex >= allSteps.length - 1 ? 'rgba(255, 255, 255, 0.4)' : theme.colors.card} />
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header avec fond flou */}
      <BlurView intensity={50} tint="light" style={[styles.header, { paddingTop: insets.top > 0 ? 0 : 10 }]}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{title}</Text>
        
        <View style={styles.headerSpace} />
      </BlurView>
      
      {/* Progression */}
      <View style={styles.progressContainer}>
        {allSteps.length > 0 && Array.from({ length: allSteps.length }).map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.progressDot, 
              index === currentIndex && styles.progressDotActive,
              index < currentIndex && styles.progressDotCompleted
            ]} 
          />
        ))}
      </View>
      
      {renderCards()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 90, 43, 0.2)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.small
  },
  headerTitle: {
    fontSize: 18,
    color: theme.colors.primary,
    textAlign: 'center',
    ...theme.typography.heading
  },
  headerSpace: {
    width: 36,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(139, 90, 43, 0.3)',
    marginHorizontal: 3,
  },
  progressDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  progressDotCompleted: {
    backgroundColor: theme.colors.secondary,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  cardBackground: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardBackgroundImage: {
    opacity: 0.2,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardChapter: {
    fontSize: 14,
    color: theme.colors.card,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    ...theme.typography.subheading,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardTitle: {
    fontSize: 26,
    color: theme.colors.card,
    marginBottom: 20,
    ...theme.typography.heading,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardText: {
    fontSize: 18,
    flex: 1,
    lineHeight: 28,
    color: theme.colors.card,
    marginBottom: 20,
    ...theme.typography.body,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    zIndex: 1000,
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  swipeLeftIndicator: {
    left: 15,
  },
  swipeRightIndicator: {
    right: 15,
  },
  swipeIndicatorInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeIndicatorText: {
    color: theme.colors.card,
    fontSize: 14,
    marginTop: 8,
    ...theme.typography.body,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  instructionsContainer: {
    marginBottom: 20,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  instructionsBlur: {
    padding: 15,
    borderRadius: theme.borderRadius.md,
  },
  instructionsTitle: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    ...theme.typography.subheading,
  },
  instructionsText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    ...theme.typography.body,
  },
  instructionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    flex: 1,
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  instructionsButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  instructionsButtonText: {
    color: theme.colors.card,
    fontSize: 14,
    marginLeft: 8,
    ...theme.typography.body,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingTop: 10,
  },
  navButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 22.5,
    ...theme.shadows.small,
  },
  navButtonPrev: {
    marginRight: 10,
  },
  navButtonNext: {
    marginLeft: 10,
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  navButtonText: {
    color: theme.colors.card,
    fontSize: 15,
    marginHorizontal: 5,
    ...theme.typography.body,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textMuted,
    marginTop: 15,
    fontSize: 16,
    ...theme.typography.body,
  },
  endContainer: {
    flex: 1,
    width: width * 0.9,
    alignSelf: 'center',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginVertical: 20,
    ...theme.shadows.medium,
  },
  endGradient: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endIcon: {
    marginBottom: 20,
  },
  endTitle: {
    fontSize: 28,
    color: theme.colors.card,
    marginBottom: 20,
    ...theme.typography.heading,
    textAlign: 'center',
  },
  endText: {
    fontSize: 18,
    lineHeight: 28,
    color: theme.colors.card,
    marginBottom: 30,
    textAlign: 'center',
    ...theme.typography.body,
  },
  endButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.small,
  },
  endButtonText: {
    color: theme.colors.card,
    fontSize: 16,
    ...theme.typography.subheading,
  },
}); 