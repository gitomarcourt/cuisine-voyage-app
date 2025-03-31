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
  Modal,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Pressable
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import { RouteProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { AuthContextType } from '../types/auth';

type ShoppingListScreenRouteProp = RouteProp<RootStackParamList, 'ShoppingList'>;

type AnimatedValuesType = {
  [key: string]: Animated.Value;
};

export default function ShoppingListScreen() {
  const route = useRoute<ShoppingListScreenRouteProp>();
  const navigation = useNavigation<any>();
  const { shoppingList, recipeIds } = route.params;
  const auth = useAuthContext();
  const user = auth.userProfile;
  
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [listName, setListName] = useState('');
  const [progress, setProgress] = useState(0);
  
  // Animation pour la progression
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Animation pour les items cochés
  const animatedValues = useRef<AnimatedValuesType>({}).current;

  // Mettre à jour l'animation de progression
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Initialiser les états cochés à false
  useEffect(() => {
    const initialCheckedState: Record<string, boolean> = {};
    shoppingList.ingredients.forEach(categoryGroup => {
      categoryGroup.items.forEach(item => {
        const itemKey = `${categoryGroup.category}-${item.name}`;
        initialCheckedState[itemKey] = false;
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

  // Gérer le changement d'état des cases à cocher avec animation
  const toggleItemCheck = (categoryName: string, itemName: string) => {
    const itemKey = `${categoryName}-${itemName}`;
    const newCheckedState = !checkedItems[itemKey];
    
    // Créer une animation si elle n'existe pas encore
    if (!animatedValues[itemKey]) {
      animatedValues[itemKey] = new Animated.Value(0);
    }
    
    // Animer le changement
    Animated.timing(animatedValues[itemKey], {
      toValue: newCheckedState ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    // Mettre à jour l'état
    setCheckedItems(prev => ({
      ...prev,
      [itemKey]: newCheckedState
    }));
  };

  // Sauvegarder la liste de courses dans Supabase
  const saveShoppingList = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour sauvegarder une liste');
      return;
    }

    if (!listName.trim()) {
      Alert.alert('Erreur', 'Veuillez donner un nom à votre liste');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Créer l'entrée dans la table shopping_lists
      const { data: newList, error: listError } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: user.id,
          name: listName,
          total_recipes: shoppingList.total_recipes,
          servings: shoppingList.servings,
          recipe_ids: JSON.stringify(recipeIds)
        })
        .select('id')
        .single();

      if (listError) throw listError;

      // 2. Ajouter tous les ingrédients à la table shopping_list_items
      const itemsToInsert = shoppingList.ingredients.flatMap(categoryGroup => 
        categoryGroup.items.map(item => ({
          shopping_list_id: newList.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: categoryGroup.category,
          is_checked: false
        }))
      );

      const { error: itemsError } = await supabase
        .from('shopping_list_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      Alert.alert('Succès', 'Liste de courses sauvegardée avec succès');
      setModalVisible(false);
      
      // Rediriger vers l'écran des listes sauvegardées
      navigation.navigate('SavedShoppingLists');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la liste');
    } finally {
      setIsSaving(false);
    }
  };

  // Ajouter le modal pour nommer la liste
  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalBackdrop}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
        >
          <TouchableOpacity 
            style={styles.touchableArea}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View 
              style={styles.modalContent}
              onStartShouldSetResponder={() => true}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHandle} />
              
              <Text style={styles.modalTitle}>Nommer votre liste</Text>
              
              <TextInput
                style={styles.input}
                value={listName}
                onChangeText={setListName}
                placeholder="Ex: Courses du weekend"
                placeholderTextColor={theme.colors.textMuted}
                autoFocus={true}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveShoppingList}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.saveButtonText}>Sauvegarder</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderModal()}
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Liste de courses</Text>
          <Text style={styles.headerSubtitle}>
            {shoppingList.total_recipes} recettes • {shoppingList.servings} personnes
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.saveListButton}
          onPress={() => {
            setListName(`Liste du ${new Date().toLocaleDateString('fr-FR')}`);
            setModalVisible(true);
          }}
        >
          <Ionicons name="bookmark-outline" size={24} color={theme.colors.primary} />
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
      <ScrollView style={styles.content}>
        {shoppingList.ingredients.map((categoryGroup, categoryIndex) => {
          // Grouper les éléments (non cochés en premier, cochés à la fin)
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
              
              {sortedItems.map((item, itemIndex) => {
                const itemKey = `${categoryGroup.category}-${item.name}`;
                const isChecked = checkedItems[itemKey] || false;
                
                // Initialiser l'animation si nécessaire
                if (!animatedValues[itemKey]) {
                  animatedValues[itemKey] = new Animated.Value(isChecked ? 1 : 0);
                }
                
                // Valeurs animées
                const opacity = animatedValues[itemKey].interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.5]
                });
                
                const scale = animatedValues[itemKey].interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 0.98, 0.96]
                });
                
                return (
                  <Animated.View 
                    key={itemIndex}
                    style={[
                      { opacity, transform: [{ scale }] }
                    ]}
                  >
                    <Pressable 
                      style={[
                        styles.ingredientItem,
                        isChecked && styles.ingredientItemChecked
                      ]}
                      onPress={() => toggleItemCheck(categoryGroup.category, item.name)}
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
                      
                      {/* Indicateur de swipe */}
                      <View style={styles.swipeIndicator}>
                        <Ionicons 
                          name="chevron-forward" 
                          size={16} 
                          color={theme.colors.textMuted} 
                          style={{ opacity: 0.5 }}
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
  saveListButton: {
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 3,
    backgroundColor: 'white',
    borderRadius: 12,
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
    marginRight: 14,
  },
  checkboxOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  // Styles du modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%', 
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  touchableArea: {
    width: '100%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    fontSize: 16,
    color: theme.colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    marginRight: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  saveButton: {
    marginLeft: 8,
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  swipeIndicator: {
    paddingHorizontal: 4,
  },
}); 