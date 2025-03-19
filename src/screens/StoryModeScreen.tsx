import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, Animated, Dimensions, 
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
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Combiner les étapes et l'intro
  const allSteps = useRef<(Step | { isIntro: boolean; title: string; content: string })[]>([]).current;
  
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
  
  // Fonctions pour naviguer entre les étapes
  const goToNextStep = () => {
    if (currentIndex >= allSteps.length - 1) return;
    
    // Animation simple
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true
    }).start(() => {
      setCurrentIndex(prev => prev + 1);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
      
      setShowInstruction(false);
    });
  };
  
  const goToPrevStep = () => {
    if (currentIndex <= 0) return;
    
    // Animation simple
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true
    }).start(() => {
      setCurrentIndex(prev => prev - 1);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
      
      setShowInstruction(false);
    });
  };
  
  // Debug useEffect
  useEffect(() => {
    console.log('storyIntro:', storyIntro);
    console.log('storySteps:', storySteps.length);
    console.log('allSteps:', allSteps.length);
    console.log('currentIndex:', currentIndex);
  }, [storyIntro, storySteps, allSteps, currentIndex]);
  
  const toggleInstructions = () => {
    setShowInstruction(prev => !prev);
  };
  
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
      <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
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
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardChapter}>
                  {isIntro ? 'Prologue' : `Chapitre ${currentIndex}`}
                </Text>
                <Text style={styles.cardTitle}>{currentTitle}</Text>
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
                  {currentIndex > 0 ? (
                    <TouchableOpacity 
                      style={styles.navButton} 
                      onPress={goToPrevStep}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="arrow-back" size={22} color={theme.colors.card} />
                      <Text style={styles.navButtonText}>Précédent</Text>
                    </TouchableOpacity>
                  ) : <View style={{ width: 100 }} />}
                  
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
                        {showInstruction ? "Cacher" : "Voir instructions"}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {currentIndex < allSteps.length - 1 ? (
                    <TouchableOpacity 
                      style={styles.navButton} 
                      onPress={goToNextStep}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.navButtonText}>Suivant</Text>
                      <Ionicons name="arrow-forward" size={22} color={theme.colors.card} />
                    </TouchableOpacity>
                  ) : <View style={{ width: 100 }} />}
                </View>
              </View>
            </ScrollView>
          </LinearGradient>
        </ImageBackground>
      </Animated.View>
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
  cardContainer: {
    flex: 1,
    margin: 15,
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
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
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
    lineHeight: 28,
    color: theme.colors.card,
    marginBottom: 20,
    ...theme.typography.body,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
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
    alignSelf: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.small,
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