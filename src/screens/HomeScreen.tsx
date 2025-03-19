import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import RecipeCard from '../components/RecipeCard';
import { HomeScreenNavigationProp } from '../types/navigation';
import { theme } from '../styles/theme';
import { useRecipes } from '../hooks/useRecipes';
import { Recipe } from '../types/models';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { recipes, loading, error } = useRecipes();
  
  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
        style={styles.heroBackground}
      >
        <BlurView intensity={40} tint="dark" style={styles.heroBlurOverlay}>
          <View style={styles.heroContent}>
            <Text style={styles.title}>CulinaryJourney</Text>
            <Text style={styles.subtitle}>Cuisinez, Voyagez, Ressentez</Text>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={() => console.log('Explorer le monde')}
            >
              <Text style={styles.buttonText}>Explorer le monde</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </ImageBackground>
      
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Une expérience culinaire unique</Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>📖</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Histoires immersives</Text>
              <Text style={styles.featureDescription}>Chaque recette raconte une histoire unique et captivante</Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🎵</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Ambiance sonore</Text>
              <Text style={styles.featureDescription}>Des playlists spécifiques pour chaque culture culinaire</Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🍷</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Accords mets-vins</Text>
              <Text style={styles.featureDescription}>Découvrez les vins parfaits pour accompagner vos créations</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Recettes à découvrir</Text>
        
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loaderText}>Chargement des recettes...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Une erreur est survenue lors du chargement des recettes.</Text>
            <TouchableOpacity style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.recipesContainer}>
            {recipes.length > 0 ? (
              recipes.map((recipe: Recipe) => (
                <RecipeCard
                  key={recipe.id}
                  title={recipe.title}
                  country={recipe.country}
                  description={recipe.description}
                  imageSource={{ uri: recipe.image_url || 'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
                  cookingTime={recipe.cooking_time}
                  difficulty={recipe.difficulty}
                  isPremium={recipe.is_premium}
                  onPress={() => navigation.navigate('RecipeDetail', { id: recipe.id, title: recipe.title })}
                />
              ))
            ) : (
              <Text style={styles.noRecipesText}>Aucune recette disponible pour le moment.</Text>
            )}
          </View>
        )}
        
        <TouchableOpacity style={styles.exploreButton}>
          <Text style={styles.exploreButtonText}>Voir plus de recettes</Text>
        </TouchableOpacity>
        
        <View style={styles.testimonialSection}>
          <BlurView intensity={60} tint="light" style={styles.testimonialBlurContainer}>
            <Text style={styles.testimonialTitle}>Ce que disent nos voyageurs culinaires</Text>
            
            <View style={styles.testimonialCard}>
              <Text style={styles.testimonialText}>
                "Une expérience incroyable ! J'ai préparé un curry thaïlandais tout en écoutant les sons des marchés de Bangkok."
              </Text>
              <Text style={styles.testimonialAuthor}>Marie L.</Text>
            </View>
            
            <View style={[styles.testimonialCard, styles.secondTestimonial]}>
              <Text style={styles.testimonialText}>
                "Les accords mets-vins sont parfaits. J'ai découvert des vins que je n'aurais jamais essayés autrement !"
              </Text>
              <Text style={styles.testimonialAuthor}>Thomas D.</Text>
            </View>
          </BlurView>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  heroBackground: {
    height: 450,
  },
  heroBlurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    width: '100%',
  },
  title: {
    ...theme.typography.heading,
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subtitle: {
    ...theme.typography.accent,
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.heading,
    fontSize: 26,
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: theme.spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.accent + '20', // 20% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    ...theme.typography.heading,
    fontSize: 18,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  featureDescription: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  recipesContainer: {
    marginBottom: theme.spacing.lg,
  },
  exploreButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.medium,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testimonialSection: {
    marginVertical: theme.spacing.lg,
    overflow: 'hidden',
    borderRadius: theme.borderRadius.lg,
  },
  testimonialBlurContainer: {
    padding: theme.spacing.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.primary + '10', // 10% opacity
  },
  testimonialTitle: {
    ...theme.typography.heading,
    fontSize: 22,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  testimonialCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  testimonialText: {
    ...theme.typography.accent,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    ...theme.typography.heading,
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loaderText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textMuted,
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    color: theme.colors.textMuted,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noRecipesText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 16,
    fontStyle: 'italic',
    padding: theme.spacing.lg,
  },
  secondTestimonial: {
    marginTop: theme.spacing.md,
  },
});
