import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Animated,
  Share,
  StatusBar,
  Pressable,
  PanResponder
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { supabase } from '../lib/supabase';

interface ShoppingListItem {
  id?: number;
  name: string;
  quantity: string;
  unit: string;
  is_checked: boolean;
}

interface CategoryGroup {
  id?: number;
  category: string;
  items: ShoppingListItem[];
}

interface ShoppingListData {
  ingredients: CategoryGroup[];
  total_recipes: number;
  servings: number;
}

type AnimatedValuesType = {
  [key: string]: Animated.Value;
};

export default function ShoppingListDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { shoppingList, shoppingListId, recipeIds, listName } = route.params;

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Animation pour la progression
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Animation pour les items
  const animatedValues = useRef<AnimatedValuesType>({}).current;
  const swipeAnimValues = useRef<AnimatedValuesType>({}).current;

  // Mettre à jour l'animation de progression
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Initialiser l'état des cases à cocher
  useEffect(() => {
    const initialCheckedState: Record<string, boolean> = {};
    shoppingList.ingredients.forEach((categoryGroup: CategoryGroup) => {
      categoryGroup.items.forEach((item: ShoppingListItem) => {
        const itemKey = `${categoryGroup.category}-${item.name}`;
        initialCheckedState[itemKey] = item.is_checked;
      });
    });
    setCheckedItems(initialCheckedState);
  }, [shoppingList]);
  
  // Calculer le progrès total (pourcentage d'items cochés)
  useEffect(() => {
    const totalItems = Object.keys(checkedItems).length;
    if (totalItems === 0) return;
    
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    setProgress(checkedCount / totalItems);
  }, [checkedItems]);

  // Gérer le changement d'état des cases à cocher avec animation améliorée
  const toggleItemCheck = async (categoryId: number, itemId: number, categoryName: string, itemName: string) => {
    const itemKey = `${categoryName}-${itemName}`;
    const newCheckedState = !checkedItems[itemKey];
    
    // Créer une animation si elle n'existe pas encore
    if (!animatedValues[itemKey]) {
      animatedValues[itemKey] = new Animated.Value(newCheckedState ? 1 : 0);
    }
    
    // Animer le changement avec séquence
    Animated.sequence([
      // D'abord, réduire la taille
      Animated.timing(animatedValues[itemKey], {
        toValue: newCheckedState ? 0.9 : 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      // Puis revenir à la taille normale avec l'opacité changée
      Animated.timing(animatedValues[itemKey], {
        toValue: newCheckedState ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Mettre à jour l'état local
    setCheckedItems(prev => ({
      ...prev,
      [itemKey]: newCheckedState
    }));
    
    // Mettre à jour dans la base de données
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .update({ is_checked: newCheckedState })
        .eq('id', itemId);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      // Restaurer l'état précédent en cas d'erreur
      setCheckedItems(prev => ({
        ...prev,
        [itemKey]: !newCheckedState
      }));
    }
  };

  // Créer un gestionnaire de balayage pour chaque élément
  const createPanResponder = (
    categoryId: number, 
    itemId: number, 
    categoryName: string, 
    itemName: string
  ) => {
    const itemKey = `${categoryName}-${itemName}`;
    
    // Créer l'animation de balayage si elle n'existe pas
    if (!swipeAnimValues[itemKey]) {
      swipeAnimValues[itemKey] = new Animated.Value(0);
    }
    
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gestureState) => {
        // Limiter le déplacement à gauche seulement (-100 à 0)
        const dx = Math.min(0, Math.max(-100, gestureState.dx));
        swipeAnimValues[itemKey].setValue(dx);
      },
      onPanResponderRelease: (event, gestureState) => {
        // Si balayé suffisamment, considérer comme un "check/uncheck"
        if (gestureState.dx < -50) {
          // Animer à la position de "fin de balayage" puis revenir
          Animated.sequence([
            Animated.timing(swipeAnimValues[itemKey], {
              toValue: -100,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(swipeAnimValues[itemKey], {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Après l'animation, basculer le statut
            toggleItemCheck(categoryId, itemId, categoryName, itemName);
          });
        } else {
          // Revenir à la position initiale
          Animated.spring(swipeAnimValues[itemKey], {
            toValue: 0,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      },
    });
  };

  // Afficher les détails des recettes
  const viewRecipes = () => {
    if (recipeIds.length === 0) {
      Alert.alert('Information', 'Aucune recette associée à cette liste.');
      return;
    }
    
    navigation.navigate('RecipesList', {
      recipeIds,
      listName
    });
  };

  // Partager la liste
  const shareList = async () => {
    try {
      // Formatter le contenu de la liste à partager
      let content = `🛒 Liste de courses: ${listName}\n`;
      content += `👨‍🍳 ${shoppingList.total_recipes} recettes • 👥 ${shoppingList.servings} personnes\n\n`;
      
      shoppingList.ingredients.forEach((category: CategoryGroup) => {
        content += `\n▪️ ${category.category.toUpperCase()}\n`;
        category.items.forEach((item: ShoppingListItem) => {
          const checkMark = checkedItems[`${category.category}-${item.name}`] ? "✅ " : "◻️ ";
          content += `${checkMark}${item.name} - ${item.quantity} ${item.unit || ""}\n`;
        });
      });
      
      await Share.share({
        message: content,
        title: `Liste de courses: ${listName}`
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      Alert.alert('Erreur', 'Impossible de partager la liste');
    }
  };

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
          <Text style={styles.headerTitle}>{listName}</Text>
          <Text style={styles.headerSubtitle}>
            {shoppingList.total_recipes} recettes • {shoppingList.servings} personnes
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={shareList}
        >
          <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Barre de progression */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <Animated.View 
            style={[
              styles.progressBar,
              { width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                }) 
              }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(progress * 100)}% complété
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={styles.recipesButton}
          onPress={viewRecipes}
        >
          <Ionicons name="restaurant-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.recipesButtonText}>Voir les recettes ({recipeIds.length})</Text>
        </TouchableOpacity>

        {shoppingList.ingredients.map((categoryGroup: CategoryGroup, categoryIndex: number) => {
          // Trier les éléments par statut (non cochés en premier, cochés ensuite)
          const sortedItems = categoryGroup.items
            .slice()
            .sort((a, b) => {
              const aKey = `${categoryGroup.category}-${a.name}`;
              const bKey = `${categoryGroup.category}-${b.name}`;
              const aChecked = checkedItems[aKey] || false;
              const bChecked = checkedItems[bKey] || false;
              
              if (aChecked === bChecked) return 0;
              return aChecked ? 1 : -1;
            });
          
          return (
            <View key={categoryIndex} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{categoryGroup.category}</Text>
                <View style={styles.categoryIcon}>
                  {getCategoryIcon(categoryGroup.category)}
                </View>
              </View>
              
              {sortedItems.map((item: ShoppingListItem, itemIndex: number) => {
                const itemKey = `${categoryGroup.category}-${item.name}`;
                const isChecked = checkedItems[itemKey] || false;
                
                // Créer des animations si elles n'existent pas encore
                if (!animatedValues[itemKey]) {
                  animatedValues[itemKey] = new Animated.Value(isChecked ? 1 : 0);
                }
                
                if (!swipeAnimValues[itemKey]) {
                  swipeAnimValues[itemKey] = new Animated.Value(0);
                }
                
                // Créer le panResponder pour ce composant
                const panResponder = createPanResponder(
                  categoryGroup.id || 0, 
                  item.id || 0, 
                  categoryGroup.category, 
                  item.name
                );
                
                // Valeurs d'animation
                const scale = animatedValues[itemKey].interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.97]
                });
                
                const opacity = animatedValues[itemKey].interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.6]
                });
                
                // Indiquer visuellement le balayage
                const swipeHint = swipeAnimValues[itemKey].interpolate({
                  inputRange: [-100, 0],
                  outputRange: [1, 0],
                  extrapolate: 'clamp'
                });
                
                return (
                  <Animated.View 
                    key={itemIndex}
                    style={[
                      {
                        transform: [
                          { scale },
                          { translateX: swipeAnimValues[itemKey] }
                        ],
                        opacity
                      }
                    ]}
                    {...panResponder.panHandlers}
                  >
                    <Animated.View
                      style={[
                        styles.swipeBackground,
                        {
                          opacity: swipeHint,
                          backgroundColor: isChecked 
                            ? 'rgba(255, 59, 48, 0.1)' // Rouge pour décocher
                            : 'rgba(52, 199, 89, 0.1)' // Vert pour cocher
                        }
                      ]}
                    >
                      <Ionicons 
                        name={isChecked ? "close-circle" : "checkmark-circle"} 
                        size={24} 
                        color={isChecked ? theme.colors.error : theme.colors.success} 
                      />
                    </Animated.View>
                    
                    <Pressable
                      style={[
                        styles.ingredientItem,
                        isChecked && styles.ingredientItemChecked
                      ]}
                      onPress={() => categoryGroup.id && item.id && 
                        toggleItemCheck(categoryGroup.id, item.id, categoryGroup.category, item.name)}
                      android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
                    >
                      <View style={styles.checkboxContainer}>
                        <Animated.View 
                          style={[
                            styles.checkboxOuter,
                            isChecked && styles.checkboxOuterChecked,
                            {
                              borderColor: animatedValues[itemKey].interpolate({
                                inputRange: [0, 1],
                                outputRange: ['rgba(0,0,0,0.2)', theme.colors.primary]
                              })
                            }
                          ]}
                        >
                          {isChecked && (
                            <Ionicons name="checkmark" size={14} color="white" />
                          )}
                        </Animated.View>
                      </View>
                      
                      <View style={styles.ingredientInfo}>
                        <Text 
                          style={[
                            styles.ingredientName,
                            isChecked && styles.checkedText
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <Text 
                          style={[
                            styles.ingredientQuantity,
                            isChecked && styles.checkedText
                          ]}
                        >
                          {item.quantity} {item.unit}
                        </Text>
                      </View>
                      
                      <View style={styles.swipeIndicator}>
                        <Ionicons 
                          name="chevron-back" 
                          size={16} 
                          color="rgba(0,0,0,0.3)" 
                        />
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          );
        })}
        
        {/* Espace en bas pour éviter que le dernier élément soit caché */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Fonction pour obtenir l'icône correspondant à la catégorie
function getCategoryIcon(category: string) {
  let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'nutrition';
  
  switch(category.toLowerCase()) {
    case 'légumes':
    case 'légume':
    case 'vegetables':
      iconName = 'leaf';
      break;
    case 'fruits':
    case 'fruit':
      iconName = 'nutrition';
      break;
    case 'viandes':
    case 'viande':
    case 'meat':
      iconName = 'restaurant';
      break;
    case 'poissons':
    case 'poisson':
    case 'fish':
      iconName = 'fish';
      break;
    case 'produits laitiers':
    case 'laitages':
    case 'dairy':
      iconName = 'water';
      break;
    case 'épicerie':
    case 'epicerie':
    case 'groceries':
      iconName = 'basket';
      break;
    case 'condiments':
    case 'épices':
    case 'spices':
      iconName = 'flask';
      break;
    case 'boissons':
    case 'drinks':
      iconName = 'wine';
      break;
    default:
      iconName = 'nutrition';
  }
  
  return <Ionicons name={iconName} size={18} color={theme.colors.primary} />;
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    marginRight: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
    minWidth: 80,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  recipesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: 12,
    padding: 14,
    margin: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recipesButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  categorySection: {
    paddingTop: 16,
    paddingBottom: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.primary,
    flex: 1,
  },
  categoryIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginVertical: 3,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ingredientItemChecked: {
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkboxOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxOuterChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  ingredientQuantity: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  swipeBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeIndicator: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 