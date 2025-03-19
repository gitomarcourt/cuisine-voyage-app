import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, Dimensions, ActivityIndicator, StatusBar, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import RecipeCard from '../components/RecipeCard';
import { theme } from '../styles/theme';
import { useRecipes } from '../hooks/useRecipes';
import { useCategories } from '../hooks/useCategories';
import { useInspirations } from '../hooks/useInspirations';
import { Recipe } from '../types/models';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

// Données de démonstration
const featuredRecipes = [
  {
    id: 1,
    title: 'Tiramisu Italien Authentique',
    country: 'Italie',
    description: 'Un dessert classique italien à base de biscuits imbibés de café et de crème au mascarpone.',
    imageSource: { uri: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=1470&auto=format&fit=crop' },
    cookingTime: 40,
    difficulty: 'Moyen',
    isPremium: true
  },
  {
    id: 2,
    title: 'Ramen Tonkotsu Japonais',
    country: 'Japon',
    description: 'Un bouillon riche et crémeux avec des nouilles faites maison et du porc braisé.',
    imageSource: { uri: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1480&auto=format&fit=crop' },
    cookingTime: 180,
    difficulty: 'Difficile',
    isPremium: false
  },
  {
    id: 3,
    title: 'Poulet Yassa Sénégalais',
    country: 'Sénégal',
    description: 'Poulet mariné au citron et aux oignons, un plat emblématique de la cuisine sénégalaise.',
    imageSource: { uri: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=1470&auto=format&fit=crop' },
    cookingTime: 90,
    difficulty: 'Moyen',
    isPremium: false
  },
];

const categories = [
  { id: 1, name: 'Asiatique', icon: 'noodles' as any },
  { id: 2, name: 'Méditerranéen', icon: 'food-drumstick' as any },
  { id: 3, name: 'Africain', icon: 'pot-steam' as any },
  { id: 4, name: 'Latino', icon: 'taco' as any },
  { id: 5, name: 'Européen', icon: 'pasta' as any },
];

// Données pour la section inspiration
const inspirations = [
  {
    id: 1,
    title: 'Cuisine de rue thaïlandaise',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1470&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Pâtisseries françaises',
    image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?q=80&w=1470&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Tapas espagnoles',
    image: 'https://images.unsplash.com/photo-1566740933430-b5e70b06d2d5?q=80&w=1470&auto=format&fit=crop',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { recipes, loading: loadingRecipes, error: recipesError } = useRecipes();
  const { categories, loading: loadingCategories, error: categoriesError } = useCategories();
  const { inspirations, loading: loadingInspirations, error: inspirationsError } = useInspirations();
  
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  // Récupérer les insets de la zone de sécurité
  const insets = useSafeAreaInsets();
  
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Animation de parallaxe pour l'en-tête
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });
  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });
  
  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* En-tête avec image d'arrière-plan */}
        <View style={styles.headerWrapper}>
          <View style={[
            styles.simpleHeader,
            { paddingTop: insets.top || StatusBar.currentHeight || 20 }
          ]}>
            <View style={styles.titleWrapper}>
              <Text style={styles.simpleAppName}>Savorista</Text>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.titleUnderline}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.simpleMapButton}
              onPress={() => navigation.navigate('WorldMap')}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Ionicons name="compass-outline" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.bannerContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?q=80&w=1470&auto=format&fit=crop' }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerText}>Voyagez par les saveurs</Text>
            </View>
          </View>
          
          <View style={styles.insightContainer}>
            <Text style={styles.insightText}>
              "La cuisine est le reflet de l'âme d'un pays"
            </Text>
          </View>
        </View>

        {/* Catégories culinaires */}
        <Animated.View 
          style={[styles.sectionContainer, {
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })}]
          }]}
        >
          <Text style={styles.sectionTitle}>Cuisines du monde</Text>
          
          {loadingCategories ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
          ) : categoriesError ? (
            <Text style={styles.errorText}>Impossible de charger les catégories</Text>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
              decelerationRate="fast"
              snapToInterval={width * 0.4}
              snapToAlignment="center"
            >
              {categories.map(category => (
                <TouchableOpacity 
                  key={category.id} 
                  style={styles.categoryItem}
                  onPress={() => {/* Navigation à implémenter */}}
                >
                  <BlurView intensity={30} tint="light" style={styles.categoryBlur}>
                    <MaterialCommunityIcons 
                      name={category.icon as any} 
                      size={28} 
                      color={theme.colors.primary} 
                    />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </BlurView>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* Recettes en vedette */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recettes en vedette</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {loadingRecipes ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Chargement des recettes...</Text>
            </View>
          ) : recipesError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={40} color={theme.colors.primary} />
              <Text style={styles.errorText}>Impossible de charger les recettes</Text>
            </View>
          ) : recipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune recette disponible pour le moment</Text>
            </View>
          ) : (
            <View style={styles.featuredContainer}>
              {recipes.slice(0, 3).map((recipe, index) => (
                <Animated.View 
                  key={recipe.id}
                  style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50 + (index * 20), 0]
                    })}]
                  }}
                >
                  <RecipeCard
                    title={recipe.title}
                    country={recipe.country}
                    description={recipe.description}
                    imageSource={{ uri: recipe.image_url }}
                    cookingTime={recipe.cooking_time}
                    difficulty={recipe.difficulty}
                    isPremium={recipe.is_premium}
                    onPress={() => navigation.navigate('RecipeDetail', { 
                      id: recipe.id,
                      title: recipe.title
                    })}
                  />
                </Animated.View>
              ))}
            </View>
          )}
        </View>
        
        {/* Inspirations culinaires */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Inspirations</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {loadingInspirations ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
          ) : inspirationsError ? (
            <Text style={styles.errorText}>Impossible de charger les inspirations</Text>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.inspirationsContainer}
              decelerationRate="fast"
              snapToInterval={width * 0.8}
              snapToAlignment="center"
            >
              {inspirations.map(item => (
                <TouchableOpacity key={item.id} style={styles.inspirationCard}>
                  <ImageBackground 
                    source={{ uri: item.image_url }}
                    style={styles.inspirationImage}
                    imageStyle={{ borderRadius: theme.borderRadius.lg }}
                  >
                    <BlurView intensity={30} tint="dark" style={styles.inspirationOverlay}>
                      <Text style={styles.inspirationTitle}>{item.title}</Text>
                      <View style={styles.inspirationButton}>
                        <Text style={styles.inspirationButtonText}>Explorer</Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFF" />
                      </View>
                    </BlurView>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
        
        {/* Bannière découverte */}
        <TouchableOpacity style={styles.discoveryBanner}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?q=80&w=1374&auto=format&fit=crop' }}
            style={styles.discoveryBackground}
            imageStyle={{ borderRadius: theme.borderRadius.lg }}
          >
            <LinearGradient
              colors={['rgba(139, 90, 43, 0.3)', 'rgba(139, 90, 43, 0.8)']}
              style={[StyleSheet.absoluteFill, { borderRadius: theme.borderRadius.lg }]}
            />
            <BlurView intensity={20} tint="dark" style={styles.discoveryOverlay}>
              <View style={styles.discoveryContent}>
                <Text style={styles.discoveryTitle}>Découvrez les saveurs du Japon</Text>
                <Text style={styles.discoverySubtitle}>7 recettes authentiques pour voyager depuis votre cuisine</Text>
                <View style={styles.discoveryButton}>
                  <Text style={styles.discoveryButtonText}>Explorer</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" />
                </View>
              </View>
            </BlurView>
          </ImageBackground>
        </TouchableOpacity>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerWrapper: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  simpleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  titleWrapper: {
    alignItems: 'flex-start',
  },
  simpleAppName: {
    fontSize: 26,
    fontWeight: 'bold' as const,
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: 'System',
  },
  titleUnderline: {
    height: 3,
    width: 50,
    borderRadius: 2,
  },
  simpleMapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    height: 180,
    marginTop: theme.spacing.sm,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(58, 39, 27, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold' as const,
    fontFamily: 'System',
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  insightContainer: {
    marginTop: theme.spacing.md,
    marginHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  insightText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: theme.colors.textLight,
    fontFamily: 'System',
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  sectionContainer: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 22,
    color: theme.colors.text,
    fontFamily: 'System',
    fontWeight: 'bold' as const,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600' as const,
    fontFamily: 'System',
  },
  categoriesContainer: {
    paddingVertical: theme.spacing.md,
  },
  categoryItem: {
    width: width * 0.35,
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  categoryBlur: {
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: theme.borderRadius.lg,
    minHeight: 100,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.colors.textLight,
    marginTop: 6,
    fontFamily: 'System',
  },
  featuredContainer: {
    alignItems: 'center',
  },
  inspirationsContainer: {
    paddingVertical: theme.spacing.md,
  },
  inspirationCard: {
    width: width * 0.75,
    height: 180,
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  inspirationImage: {
    width: '100%',
    height: '100%',
  },
  inspirationOverlay: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'flex-end',
  },
  inspirationTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: 'white',
    marginBottom: theme.spacing.sm,
    fontFamily: 'System',
  },
  inspirationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.full,
  },
  inspirationButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'white',
    marginRight: 4,
    fontFamily: 'System',
  },
  discoveryBanner: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    height: 160,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  discoveryBackground: {
    width: '100%',
    height: '100%',
  },
  discoveryImage: {
    borderRadius: theme.borderRadius.lg,
  },
  discoveryOverlay: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  discoveryContent: {
    width: '70%',
  },
  discoveryTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: 'white',
    marginBottom: 8,
    fontFamily: 'System',
  },
  discoverySubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    fontFamily: 'System',
    fontWeight: 'normal' as const,
  },
  discoveryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.full,
  },
  discoveryButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'white',
    marginRight: 4,
    fontFamily: 'System',
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textLight,
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: 'normal' as const,
  },
  errorContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: theme.spacing.md,
    color: theme.colors.danger,
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: 'normal' as const,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: theme.colors.textLight,
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: 'normal' as const,
    textAlign: 'center',
  },
});
