import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ImageBackground, ActivityIndicator, Linking, Alert, StatusBar } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RecipeDetailScreenRouteProp } from '../types/navigation';
import { theme } from '../styles/theme';
import { useRecipes, RecipeDetails } from '../hooks/useRecipes';
import { useFavorites } from '../hooks/useFavorites';
import { Ingredient, Step } from '../types/models';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function RecipeDetailScreen() {
  const route = useRoute<RecipeDetailScreenRouteProp>();
  const navigation = useNavigation<any>();
  const { id, title } = route.params;
  const { getRecipeDetails } = useRecipes();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { session } = useAuthContext();
  const insets = useSafeAreaInsets();
  const [recipeDetails, setRecipeDetails] = React.useState<RecipeDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'ingredients' | 'preparation'>('ingredients');
  const [favoriteLoading, setFavoriteLoading] = React.useState(false);

  // Définir les styles à l'intérieur du composant pour avoir accès à insets
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      paddingBottom: theme.spacing.xl * 2,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingTop: insets.top,
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.textMuted,
      marginTop: theme.spacing.md,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingTop: insets.top,
      paddingHorizontal: theme.spacing.lg,
    },
    errorText: {
      fontSize: 16,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    retryButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
    },
    retryButtonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    heroContainer: {
      height: 320,
      width: '100%',
      position: 'relative',
    },
    heroImage: {
      height: '100%',
      width: '100%',
      position: 'absolute',
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 1,
    },
    backButton: {
      position: 'absolute',
      left: theme.spacing.md,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    favoriteButton: {
      position: 'absolute',
      right: theme.spacing.md,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    heroContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 2,
      padding: theme.spacing.lg,
    },
    countryTagContainer: {
      alignSelf: 'flex-start', 
      marginBottom: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
    },
    countryTag: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
    },
    countryText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 12,
    },
    recipeTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: 'white',
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 5,
    },
    contentSection: {
      padding: theme.spacing.lg,
    },
    description: {
      fontSize: 16,
      lineHeight: 24,
      color: theme.colors.text,
      fontStyle: 'italic',
    },
    infoCardsContainer: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
    },
    infoCards: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.primary + '10', // 10% opacity
    },
    infoCard: {
      flex: 1,
      alignItems: 'center',
    },
    infoValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    infoLabel: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    storyModeButton: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...theme.shadows.medium,
    },
    storyModeBlur: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.secondary + '80', // 50% opacity
    },
    storyModeIcon: {
      fontSize: 20,
      marginRight: theme.spacing.sm,
    },
    storyModeText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    tabsContainer: {
      flexDirection: 'row',
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.card,
      padding: 4,
      ...theme.shadows.small,
    },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.full,
    },
    activeTab: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      fontWeight: 'bold',
      color: theme.colors.textMuted,
    },
    activeTabText: {
      color: 'white',
    },
    tabContent: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    ingredientsContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.small,
    },
    ingredientItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    ingredientDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
      marginRight: theme.spacing.sm,
    },
    ingredient: {
      fontSize: 16,
      color: theme.colors.text,
    },
    stepsContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.small,
    },
    step: {
      flexDirection: 'row',
      marginBottom: theme.spacing.lg,
    },
    stepNumberContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
      marginTop: 3,
      ...theme.shadows.small,
    },
    stepNumber: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    stepDescription: {
      fontSize: 16,
      color: theme.colors.textMuted,
      lineHeight: 22,
    },
    sectionHeader: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    wineSection: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    wineCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.primary + '10', // 10% opacity
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...theme.shadows.medium,
    },
    wineImage: {
      width: 100,
      height: 180,
    },
    wineInfo: {
      flex: 1,
      padding: theme.spacing.md,
    },
    wineName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    wineOrigin: {
      fontSize: 14,
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
    },
    wineDescription: {
      fontSize: 14,
      color: theme.colors.textMuted,
      lineHeight: 20,
      marginBottom: theme.spacing.md,
    },
    wineButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
      alignSelf: 'flex-start',
    },
    wineButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
    },
    musicSection: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    playlistBackground: {
      height: 180,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...theme.shadows.medium,
    },
    playlistBackgroundImage: {
      borderRadius: theme.borderRadius.lg,
    },
    playlistCard: {
      flex: 1,
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    playlistTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: theme.spacing.sm,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 5,
    },
    playlistDescription: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: theme.spacing.md,
      lineHeight: 20,
    },
    playlistButton: {
      backgroundColor: '#1DB954', // Couleur Spotify
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
      alignSelf: 'flex-start',
      ...theme.shadows.small,
    },
    playlistButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
    },
    bottomSpace: {
      height: theme.spacing.xl,
    },
  });

  React.useEffect(() => {
    async function loadRecipeDetails() {
      setLoading(true);
      const details = await getRecipeDetails(id);
      setRecipeDetails(details);
      setLoading(false);
    }

    loadRecipeDetails();
  }, [id]);

  // Gestion des favoris
  const handleToggleFavorite = async () => {
    if (!session) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour ajouter des recettes à vos favoris.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Se connecter", onPress: () => navigation.navigate('Auth') }
        ]
      );
      return;
    }

    setFavoriteLoading(true);
    try {
      await toggleFavorite(id);
    } catch (error) {
      console.error("Erreur lors de la modification des favoris:", error);
      Alert.alert("Erreur", "Impossible de modifier les favoris. Veuillez réessayer.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Navigation vers l'expérience immersive
  const startStoryMode = () => {
    navigation.navigate('StoryMode', { id, title });
  };

  // Fonction pour ouvrir un lien Spotify
  const openSpotifyLink = async (spotifyLink: string) => {
    try {
      // Si le lien commence par "spotify:", c'est un URI Spotify (format spotify:playlist:123456)
      // Sinon, c'est probablement une URL web (format https://open.spotify.com/...)
      let url = spotifyLink;
      
      // Si c'est une URL web, on vérifie si elle commence par http
      if (!spotifyLink.startsWith('spotify:') && !spotifyLink.startsWith('http')) {
        // Si c'est un ID de playlist, on le convertit en URI Spotify
        if (spotifyLink.match(/^[a-zA-Z0-9]{22}$/)) {
          url = `spotify:playlist:${spotifyLink}`;
        } else {
          // Format URI complet (spotify:playlist:ID)
          url = spotifyLink;
        }
      }

      // Vérifier si l'application Spotify est installée
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        // Ouvrir l'application Spotify
        await Linking.openURL(url);
      } else {
        // Si l'application n'est pas installée, ouvrir dans le navigateur
        const webUrl = spotifyLink.startsWith('spotify:') 
          ? `https://open.spotify.com/${spotifyLink.replace('spotify:', '').replace(':', '/')}` 
          : spotifyLink;
          
        if (webUrl.startsWith('http')) {
          await Linking.openURL(webUrl);
        } else {
          await Linking.openURL(`https://open.spotify.com/playlist/${webUrl}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du lien Spotify:', error);
      Alert.alert(
        'Erreur',
        'Impossible d\'ouvrir Spotify. Veuillez vérifier que l\'application est installée ou que vous avez une connexion internet.'
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Chargement de la recette...</Text>
      </View>
    );
  }

  if (!recipeDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Impossible de charger les détails de cette recette.
        </Text>
        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { recipe, ingredients, steps, winePairing, playlist } = recipeDetails;
  
  // Vérifier si on peut activer le mode immersif
  const hasStoryMode = recipe.story_intro && recipe.story_intro.length > 0;
  const isRecipeFavorite = isFavorite(id);

  return (
    <View style={styles.container}>
      {/* Statut transparent pour voir l'heure et la batterie */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: recipe.image_url || 'https://images.unsplash.com/photo-1512058564366-18510be2db19?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }} 
            style={styles.heroImage}
          />
          
          <View style={styles.heroOverlay} />
          
          {/* Back button */}
          <TouchableOpacity 
            style={[styles.backButton, { top: insets.top + 10 }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          {/* Favorite button */}
          <TouchableOpacity 
            style={[styles.favoriteButton, { top: insets.top + 10 }]}
            onPress={handleToggleFavorite}
            disabled={favoriteLoading}
          >
            {favoriteLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons 
                name={isRecipeFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isRecipeFavorite ? theme.colors.error : "#fff"} 
              />
            )}
          </TouchableOpacity>
          
          <View style={styles.heroContent}>
            <View style={styles.countryTagContainer}>
              <BlurView intensity={70} tint="dark" style={styles.countryTag}>
                <Text style={styles.countryText}>{recipe.country}</Text>
              </BlurView>
            </View>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
          </View>
        </View>
        
        {/* Description */}
        <View style={styles.contentSection}>
          <Text style={styles.description}>{recipe.description}</Text>
        </View>
        
        {/* Info Cards */}
        <View style={styles.infoCardsContainer}>
          <BlurView intensity={20} tint="light" style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Text style={styles.infoValue}>{recipe.cooking_time}</Text>
              <Text style={styles.infoLabel}>minutes</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoValue}>{recipe.difficulty}</Text>
              <Text style={styles.infoLabel}>difficulté</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoValue}>{recipe.servings}</Text>
              <Text style={styles.infoLabel}>portions</Text>
            </View>
          </BlurView>
        </View>
        
        {/* Story Mode Button - Only show if story content is available */}
        {hasStoryMode && (
          <TouchableOpacity style={styles.storyModeButton} onPress={startStoryMode}>
            <BlurView intensity={80} tint="dark" style={styles.storyModeBlur}>
              <Text style={styles.storyModeIcon}>✨</Text>
              <Text style={styles.storyModeText}>Commencer l'expérience immersive</Text>
            </BlurView>
          </TouchableOpacity>
        )}
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'ingredients' && styles.activeTab]}
            onPress={() => setActiveTab('ingredients')}
          >
            <Text style={[styles.tabText, activeTab === 'ingredients' && styles.activeTabText]}>
              Ingrédients
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'preparation' && styles.activeTab]}
            onPress={() => setActiveTab('preparation')}
          >
            <Text style={[styles.tabText, activeTab === 'preparation' && styles.activeTabText]}>
              Préparation
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'ingredients' ? (
            <View style={styles.ingredientsContainer}>
              {ingredients.map((ingredient: Ingredient, index: number) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientDot} />
                  <Text style={styles.ingredient}>
                    {ingredient.quantity ? `${ingredient.quantity} ${ingredient.unit || ''} ` : ''}
                    {ingredient.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.stepsContainer}>
              {steps.map((step: Step, index: number) => (
                <View key={index} style={styles.step}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>{step.order_number}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDescription}>{step.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
        
        {/* Wine Pairing Section */}
        {winePairing && (
          <View style={styles.wineSection}>
            <Text style={styles.sectionHeader}>Accord Mets-Vin</Text>
            <BlurView intensity={40} tint="light" style={styles.wineCard}>
              <Image 
                source={{ uri: winePairing.image_url || 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80' }}
                style={styles.wineImage}
              />
              <View style={styles.wineInfo}>
                <Text style={styles.wineName}>{winePairing.name}</Text>
                <Text style={styles.wineOrigin}>{winePairing.region}</Text>
                <Text style={styles.wineDescription}>{winePairing.description}</Text>
                {winePairing.purchase_link && (
                  <TouchableOpacity style={styles.wineButton}>
                    <Text style={styles.wineButtonText}>Voir ce vin</Text>
                  </TouchableOpacity>
                )}
              </View>
            </BlurView>
          </View>
        )}
        
        {/* Music Playlist Section */}
        {playlist && (
          <View style={styles.musicSection}>
            <Text style={styles.sectionHeader}>Ambiance Musicale</Text>
            <ImageBackground
              source={{ uri: playlist.image_url || 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
              style={styles.playlistBackground}
              imageStyle={styles.playlistBackgroundImage}
            >
              <BlurView intensity={80} tint="dark" style={styles.playlistCard}>
                <Text style={styles.playlistTitle}>{playlist.title}</Text>
                <Text style={styles.playlistDescription}>{playlist.description}</Text>
                {playlist.spotify_link && (
                  <TouchableOpacity 
                    style={styles.playlistButton}
                    onPress={() => openSpotifyLink(playlist.spotify_link || '')}
                  >
                    <Text style={styles.playlistButtonText}>Écouter sur Spotify</Text>
                  </TouchableOpacity>
                )}
              </BlurView>
            </ImageBackground>
          </View>
        )}
        
        {/* Breathing Space at Bottom */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
} 