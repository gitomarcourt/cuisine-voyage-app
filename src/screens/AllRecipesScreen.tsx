import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  RefreshControl,
  TextInput,
  ScrollView,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../styles/theme';
import { useRecipes } from '../hooks/useRecipes';
import RecipeCard from '../components/RecipeCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type AllRecipesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AllRecipes'>;
type AllRecipesScreenRouteProp = RouteProp<RootStackParamList, 'AllRecipes'>;

// Type pour le renderItem de FlatList
interface RenderItemProps {
  item: any;
  index: number;
}

// Type pour les difficultés
type Difficulty = 'Facile' | 'Moyen' | 'Difficile' | 'Tous';

export default function AllRecipesScreen() {
  const navigation = useNavigation<AllRecipesScreenNavigationProp>();
  const route = useRoute<AllRecipesScreenRouteProp>();
  const { recipes, loading, error, refreshRecipes } = useRecipes();
  const [refreshing, setRefreshing] = React.useState(false);
  const insets = useSafeAreaInsets();
  
  // Récupérer les paramètres de catégorie s'ils existent
  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName;
  
  // États pour les filtres
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<Difficulty>('Tous');
  const [onlyPremium, setOnlyPremium] = React.useState(false);
  const [filtersVisible, setFiltersVisible] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<number | undefined>(categoryId);
  
  // Mettre à jour le filtre de catégorie quand les paramètres changent
  React.useEffect(() => {
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);
  
  // Animation pour le rafraîchissement
  const loadingAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (loading || refreshing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(loadingAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      loadingAnim.setValue(0);
    }
  }, [loading, refreshing]);

  // Filtrer les recettes
  const filteredRecipes = React.useMemo(() => {
    if (!recipes) return [];
    
    return recipes.filter(recipe => {
      // Filtre par catégorie si spécifiée
      const matchesCategory = selectedCategory ? recipe.category_id === selectedCategory : true;
      
      // Filtre par recherche
      const matchesSearch = 
        !searchQuery || 
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        recipe.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtre par difficulté
      const matchesDifficulty = 
        selectedDifficulty === 'Tous' || 
        recipe.difficulty === selectedDifficulty;
      
      // Filtre par premium
      const matchesPremium = !onlyPremium || recipe.is_premium;
      
      return matchesCategory && matchesSearch && matchesDifficulty && matchesPremium;
    });
  }, [recipes, selectedCategory, searchQuery, selectedDifficulty, onlyPremium]);

  // Fonction pour gérer le rafraîchissement
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshRecipes();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshRecipes]);

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
  };

  const togglePremiumFilter = () => {
    setOnlyPremium(!onlyPremium);
  };

  const toggleFiltersVisibility = () => {
    setFiltersVisible(!filtersVisible);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDifficulty('Tous');
    setOnlyPremium(false);
    setSelectedCategory(undefined);
  };

  const renderRecipeItem = ({ item, index }: RenderItemProps) => (
    <View style={styles.recipeCardContainer}>
      <RecipeCard
        title={item.title}
        country={item.country}
        description={item.description}
        imageSource={{ uri: item.image_url }}
        cookingTime={item.cooking_time}
        difficulty={item.difficulty}
        isPremium={item.is_premium}
        onPress={() => navigation.navigate('RecipeDetail', { 
          id: item.id,
          title: item.title
        })}
      />
    </View>
  );

  const difficultyOptions: Difficulty[] = ['Tous', 'Facile', 'Moyen', 'Difficile'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={theme.colors.background} barStyle="dark-content" />
      
      {/* En-tête */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : StatusBar.currentHeight || 10 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {categoryName ? `Cuisine ${categoryName}` : 'Toutes les recettes'}
        </Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={toggleFiltersVisibility}
        >
          <Ionicons name="options-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une recette..."
            placeholderTextColor={theme.colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
        
        {selectedCategory && categoryName && !filtersVisible && (
          <View style={styles.activeCategoryBadge}>
            <Text style={styles.activeCategoryText}>
              {categoryName}
            </Text>
            <TouchableOpacity 
              onPress={() => setSelectedCategory(undefined)}
              style={styles.activeCategoryClose}
            >
              <Ionicons name="close-circle" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {/* Filtres */}
      {filtersVisible && (
        <View style={styles.filtersContainer}>
          {categoryName && (
            <View style={styles.categoryFilterInfo}>
              <Text style={styles.categoryFilterText}>
                Affichage des recettes de la catégorie "{categoryName}"
              </Text>
              <TouchableOpacity 
                style={styles.categoryFilterClear}
                onPress={() => setSelectedCategory(undefined)}
              >
                <Ionicons name="close-circle" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Difficulté</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterOptions}>
              {difficultyOptions.map((difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.filterOption,
                    selectedDifficulty === difficulty && styles.filterOptionSelected
                  ]}
                  onPress={() => handleDifficultySelect(difficulty)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedDifficulty === difficulty && styles.filterOptionTextSelected
                    ]}
                  >
                    {difficulty}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Options</Text>
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  onlyPremium && styles.toggleOptionSelected
                ]}
                onPress={togglePremiumFilter}
              >
                <Ionicons 
                  name={onlyPremium ? "star" : "star-outline"} 
                  size={18} 
                  color={onlyPremium ? 'white' : theme.colors.text} 
                  style={styles.toggleIcon}
                />
                <Text
                  style={[
                    styles.toggleOptionText,
                    onlyPremium && styles.toggleOptionTextSelected
                  ]}
                >
                  Recettes premium
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={toggleFiltersVisibility}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.applyButtonGradient}
              >
                <Text style={styles.applyButtonText}>Appliquer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Contenu principal */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <Animated.View
            style={{
              opacity: loadingAnim,
              transform: [{ scale: loadingAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }]
            }}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </Animated.View>
          <Text style={styles.loadingText}>Chargement des recettes...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={theme.colors.primary} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={onRefresh}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : filteredRecipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={60} color={theme.colors.textLight} />
          <Text style={styles.emptyText}>
            {recipes.length === 0 
              ? "Aucune recette disponible pour le moment"
              : "Aucune recette ne correspond à vos critères"}
          </Text>
          {recipes.length > 0 && (
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearFiltersButtonText}>Effacer les filtres</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.recipesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
              progressBackgroundColor="#ffffff"
              progressViewOffset={40}
            />
          }
          ListHeaderComponent={() => (
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {filteredRecipes.length} {filteredRecipes.length > 1 ? 'recettes trouvées' : 'recette trouvée'}
              </Text>
              {(searchQuery !== '' || selectedDifficulty !== 'Tous' || onlyPremium) && (
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={styles.clearFiltersText}>Effacer les filtres</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
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
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(211, 197, 184, 0.3)',
  },
  backButton: {
    padding: 8,
  },
  filterButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(211, 197, 184, 0.2)',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(211, 197, 184, 0.2)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    padding: 0,
  },
  filtersContainer: {
    backgroundColor: 'rgba(211, 197, 184, 0.1)',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(211, 197, 184, 0.3)',
  },
  filterSection: {
    marginBottom: theme.spacing.md,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  filterOptions: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.xs,
  },
  filterOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    backgroundColor: 'rgba(211, 197, 184, 0.2)',
  },
  filterOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  filterOptionText: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    color: 'white',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    backgroundColor: 'rgba(211, 197, 184, 0.2)',
  },
  toggleOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  toggleIcon: {
    marginRight: theme.spacing.xs,
  },
  toggleOptionText: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  toggleOptionTextSelected: {
    color: 'white',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  clearButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.textLight,
  },
  clearButtonText: {
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  applyButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  recipesList: {
    padding: theme.spacing.md,
  },
  recipeCardContainer: {
    marginBottom: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
    height: 120,
    marginVertical: 10,
    backgroundColor: 'rgba(211, 197, 184, 0.05)',
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
  },
  loadingText: {
    marginTop: 5,
    color: theme.colors.textLight,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    color: theme.colors.danger,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textLight,
    fontSize: 16,
    textAlign: 'center',
  },
  clearFiltersButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  clearFiltersButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  resultsText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  clearFiltersText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  categoryFilterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(211, 197, 184, 0.2)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  categoryFilterText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryFilterClear: {
    padding: 4,
  },
  activeCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  activeCategoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  activeCategoryClose: {
    padding: 2,
  },
}); 