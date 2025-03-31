import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions,
  Platform,
  Modal
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { supabase } from '../lib/supabase';
import SwipeableRecipeCard from '../components/SwipeableRecipeCard';

const { width, height } = Dimensions.get('window');
const NAVBAR_HEIGHT = 70; // Hauteur approximative de la navbar

interface Recipe {
  id: number;
  title: string;
  description: string;
  image_url: string;
  cooking_time: number;
  difficulty: string;
  country: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRecipes, setSelectedRecipes] = useState<number[]>([]);
  const [servings, setServings] = useState(4);
  const [isGeneratingList, setIsGeneratingList] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      // Récupérer d'abord les métadonnées des recettes (sans les ingrédients)
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select('id, title, description, image_url, cooking_time, difficulty, country')
        .order('created_at', { ascending: false })
        .limit(20); // Limiter à 20 recettes pour éviter un temps de chargement trop long
      
      if (recipesError) {
        throw recipesError;
      }
      
      // Si aucune recette n'est trouvée, ne pas essayer de charger les ingrédients
      if (!recipesData || recipesData.length === 0) {
        setRecipes([]);
        setIsLoading(false);
        return;
      }
      
      // Obtenir les IDs pour la requête d'ingrédients
      const recipeIds = recipesData.map(recipe => recipe.id);
      
      // Récupérer tous les ingrédients pour ces recettes en une seule requête
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('ingredients')
        .select('*')
        .in('recipe_id', recipeIds);
      
      if (ingredientsError) {
        throw ingredientsError;
      }
      
      // Organiser les ingrédients par recette
      const ingredientsByRecipe: Record<number, any[]> = {};
      ingredientsData?.forEach(ingredient => {
        if (!ingredientsByRecipe[ingredient.recipe_id]) {
          ingredientsByRecipe[ingredient.recipe_id] = [];
        }
        ingredientsByRecipe[ingredient.recipe_id].push(ingredient);
      });
      
      // Fusionner les données des recettes avec leurs ingrédients respectifs
      const completedRecipes = recipesData.map(recipe => ({
        ...recipe,
        ingredients: ingredientsByRecipe[recipe.id] || []
      }));
      
      setRecipes(completedRecipes);
      console.log(`Chargé ${completedRecipes.length} recettes`);
    } catch (error) {
      console.error("Erreur lors du chargement des recettes:", error);
      Alert.alert('Erreur', 'Impossible de charger les recettes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipeLeft = () => {
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  const handleSwipeRight = () => {
    if (currentIndex < recipes.length) {
      const currentRecipe = recipes[currentIndex];
      setSelectedRecipes(prev => [...prev, currentRecipe.id]);
    }
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  const handleGenerateShoppingList = async () => {
    if (selectedRecipes.length === 0) {
      Alert.alert('Attention', 'Veuillez sélectionner au moins une recette');
      return;
    }

    // Activer l'indicateur de chargement
    setIsGeneratingList(true);

    // Si la génération prend trop de temps, afficher un message après 15 secondes
    const timeoutId = setTimeout(() => {
      // Vérifier si l'opération est toujours en cours
      if (isGeneratingList) {
        Alert.alert(
          'Génération en cours',
          'La génération de votre liste prend plus de temps que prévu. Veuillez patienter, nous travaillons dessus.',
          [{ text: 'OK' }]
        );
      }
    }, 15000);

    try {
      // Utiliser l'API Sortium
      const apiUrl = 'https://api.sortium.fr/api/v1/shopping';
      
      console.log('Envoi des données:', JSON.stringify({
        recipe_ids: selectedRecipes,
        servings: servings
      }));
      
      // Créer un signal pour le timeout
      const controller = new AbortController();
      const timeoutPromise = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipe_ids: selectedRecipes,
          servings: servings
        }),
        signal: controller.signal
      });
      
      // Nettoyer le timeout de fetch
      clearTimeout(timeoutPromise);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur serveur: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Annuler le timeout d'alerte
      clearTimeout(timeoutId);
      
      // Désactiver l'indicateur de chargement avant la navigation
      setIsGeneratingList(false);
      
      // Passer aussi les IDs des recettes à l'écran de liste de courses
      navigation.navigate('ShoppingList', { 
        shoppingList: data,
        recipeIds: selectedRecipes
      });
    } catch (error: any) {
      // Annuler le timeout d'alerte
      clearTimeout(timeoutId);
      
      console.error('Error generating shopping list:', error);
      
      // Message d'erreur plus spécifique selon le type d'erreur
      let errorMessage = 'Impossible de générer la liste de courses. Veuillez réessayer.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'La requête a pris trop de temps. Vérifiez votre connexion et réessayez.';
      } else if (error.message && error.message.includes('serveur')) {
        errorMessage = `Erreur de serveur: ${error.message}`;
      }
      
      Alert.alert('Erreur', errorMessage);
      
      // Désactiver l'indicateur de chargement en cas d'erreur aussi
      setIsGeneratingList(false);
    }
  };

  const renderCard = () => {
    if (currentIndex >= recipes.length) {
      return (
        <View style={styles.noMoreCards}>
          <Ionicons name="checkmark-circle" size={60} color={theme.colors.primary} />
          <Text style={styles.noMoreCardsText}>
            Vous avez consulté toutes les {recipes.length} recettes disponibles !
          </Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => setCurrentIndex(0)}
          >
            <Text style={styles.resetButtonText}>Recommencer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <SwipeableRecipeCard
        key={recipes[currentIndex].id}
        recipe={recipes[currentIndex]}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        isFirst={true}
      />
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Chargement des recettes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Recettes</Text>
          <Text style={styles.headerSubtitle}>Swipez pour créer une liste de courses</Text>
        </View>
        <TouchableOpacity
          style={styles.savedListsButton}
          onPress={() => navigation.navigate('SavedShoppingLists')}
        >
          <Ionicons name="list" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Cards Stack */}
      <View style={styles.cardsContainer}>
        {renderCard()}
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.servingsContainer}>
          <TouchableOpacity 
            style={styles.servingsButton}
            onPress={() => setServings(Math.max(1, servings - 1))}
          >
            <Ionicons name="remove" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.servingsText}>{servings} personnes</Text>
          
          <TouchableOpacity 
            style={styles.servingsButton}
            onPress={() => setServings(servings + 1)}
          >
            <Ionicons name="add" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[
            styles.generateButton,
            selectedRecipes.length === 0 && styles.generateButtonDisabled
          ]}
          onPress={handleGenerateShoppingList}
          disabled={selectedRecipes.length === 0 || isGeneratingList}
        >
          {isGeneratingList ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="cart-outline" size={18} color="white" />
              <Text style={styles.generateButtonText}>
                Générer la liste de courses {selectedRecipes.length > 0 && `(${selectedRecipes.length})`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Modal de chargement */}
      <Modal
        visible={isGeneratingList}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.loadingModal}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingModalText}>
              Génération de votre liste de courses intélligente...
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    marginBottom: 10,
    backgroundColor: theme.colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    marginBottom: Platform.OS === 'ios' ? NAVBAR_HEIGHT + 10 : 10,
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  servingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingsText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginHorizontal: 16,
  },
  generateButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  generateButtonDisabled: {
    backgroundColor: theme.colors.textMuted,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  noMoreCards: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noMoreCardsText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginVertical: 16,
  },
  resetButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingModal: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingModalText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  savedListsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 