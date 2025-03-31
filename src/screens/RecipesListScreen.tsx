import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Image
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

interface Recipe {
  id: number;
  title: string;
  country: string;
  image_url: string;
  cooking_time: number;
  difficulty: string;
}

interface RecipesListScreenRouteParams {
  recipeIds: number[];
  listName: string;
}

export default function RecipesListScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { recipeIds, listName } = route.params as RecipesListScreenRouteParams;
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleRecipes, setVisibleRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(0);
  const recipesPerPage = 5; // Nombre de recettes à charger par page
  
  useEffect(() => {
    fetchRecipes();
  }, []);
  
  // Charger les recettes par groupe pour améliorer les performances
  useEffect(() => {
    if (recipes.length > 0) {
      // Calculer l'index de début et de fin pour la page actuelle
      const startIndex = 0;
      const endIndex = Math.min((page + 1) * recipesPerPage, recipes.length);
      setVisibleRecipes(recipes.slice(startIndex, endIndex));
    }
  }, [recipes, page]);
  
  const fetchRecipes = async () => {
    if (!recipeIds || recipeIds.length === 0) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Optimisation: charger uniquement les champs nécessaires
      // et utiliser .in() pour une seule requête efficace
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, country, image_url, cooking_time, difficulty')
        .in('id', recipeIds)
        .limit(100); // Limite raisonnable
      
      if (error) throw error;
      
      // Chargement progressif pour améliorer les performances
      setTimeout(() => {
        setRecipes(data || []);
        setIsLoading(false);
      }, 200);
    } catch (error) {
      console.error('Erreur lors du chargement des recettes:', error);
      setIsLoading(false);
    }
  };
  
  // Fonction pour charger plus de recettes lors du défilement
  const handleLoadMore = () => {
    if ((page + 1) * recipesPerPage < recipes.length) {
      setPage(prevPage => prevPage + 1);
    }
  };
  
  // Fonction pour le rendu du chargement au bas de la liste
  const renderFooter = () => {
    if (isLoading) return null;
    
    if (visibleRecipes.length < recipes.length) {
      return (
        <TouchableOpacity 
          style={styles.loadMoreButton}
          onPress={handleLoadMore}
        >
          <Text style={styles.loadMoreText}>Voir plus de recettes</Text>
        </TouchableOpacity>
      );
    }
    
    return null;
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'facile':
        return theme.colors.success;
      case 'moyen':
        return theme.colors.warning;
      case 'difficile':
        return theme.colors.error;
      default:
        return theme.colors.textMuted;
    }
  };
  
  const formatCookingTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}min` 
      : `${hours}h`;
  };
  
  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => navigation.navigate('RecipeDetails', { id: item.id })}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
        style={styles.recipeImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.recipeOverlay}
      />
      <View style={styles.recipeContent}>
        <View style={styles.recipeHeader}>
          <View style={styles.recipeBadge}>
            <Text style={styles.recipeBadgeText}>{item.country}</Text>
          </View>
          <View style={[
            styles.difficultyBadge, 
            { backgroundColor: getDifficultyColor(item.difficulty) }
          ]}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <View style={styles.recipeInfo}>
          <View style={styles.recipeInfoItem}>
            <Ionicons name="time-outline" size={14} color="white" />
            <Text style={styles.recipeInfoText}>
              {formatCookingTime(item.cooking_time)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Recettes</Text>
          <Text style={styles.headerSubtitle}>
            Liste de courses : {listName}
          </Text>
        </View>
      </View>
      
      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Chargement des recettes...</Text>
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="restaurant-outline" 
            size={60} 
            color={`${theme.colors.primary}50`} 
          />
          <Text style={styles.emptyTitle}>Aucune recette</Text>
          <Text style={styles.emptyText}>
            Cette liste de courses n'est associée à aucune recette.
          </Text>
        </View>
      ) : (
        <FlatList
          data={visibleRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.recipeList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: theme.colors.text,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginHorizontal: 32,
  },
  recipeList: {
    padding: 16,
  },
  recipeCard: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  recipeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  recipeContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recipeBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recipeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  recipeTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  recipeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  recipeInfoText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginVertical: 16,
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: 12,
  },
  loadMoreText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
}); 