import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../contexts/AuthContext';

interface ShoppingList {
  id: number;
  name: string;
  total_recipes: number;
  servings: number;
  created_at: string;
}

export default function SavedShoppingListsScreen() {
  const navigation = useNavigation<any>();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuthContext();

  useEffect(() => {
    fetchSavedLists();
  }, []);

  const fetchSavedLists = async () => {
    setIsLoading(true);
    try {
      if (!session?.user?.id) {
        Alert.alert('Erreur', 'Vous devez être connecté pour accéder à vos listes de courses');
        navigation.goBack();
        return;
      }

      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setLists(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des listes:', error);
      Alert.alert('Erreur', 'Impossible de charger vos listes de courses');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteList = async (listId: number) => {
    try {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId);

      if (error) {
        throw error;
      }

      // Mettre à jour la liste après suppression
      setLists(lists.filter(list => list.id !== listId));
      Alert.alert('Succès', 'Liste supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer la liste');
    }
  };

  const confirmDelete = (listId: number) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cette liste ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteList(listId) }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderItem = ({ item }: { item: ShoppingList }) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={async () => {
        setIsLoading(true);
        try {
          // Récupérer les détails de la liste
          const { data: listData, error: listError } = await supabase
            .from('shopping_lists')
            .select('id, name, total_recipes, servings, recipe_ids')
            .eq('id', item.id)
            .single();

          if (listError) throw listError;

          // Récupérer les ingrédients de la liste
          const { data: ingredientsData, error: ingredientsError } = await supabase
            .from('shopping_list_items')
            .select('id, name, quantity, unit, category, is_checked')
            .eq('shopping_list_id', item.id);

          if (ingredientsError) throw ingredientsError;

          // Organiser les données par catégorie
          const groupedIngredients = ingredientsData.reduce((acc: any[], ingredient: any) => {
            // Trouver la catégorie existante ou en créer une nouvelle
            const existingCategory = acc.find(group => group.category === ingredient.category);
            
            if (existingCategory) {
              existingCategory.items.push({
                id: ingredient.id,
                name: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
                is_checked: ingredient.is_checked
              });
            } else {
              acc.push({
                id: acc.length + 1,
                category: ingredient.category,
                items: [{
                  id: ingredient.id,
                  name: ingredient.name,
                  quantity: ingredient.quantity,
                  unit: ingredient.unit,
                  is_checked: ingredient.is_checked
                }]
              });
            }
            
            return acc;
          }, []);

          // Préparer les données formatées pour l'écran de détail
          const formattedShoppingList = {
            ingredients: groupedIngredients,
            total_recipes: listData.total_recipes,
            servings: listData.servings
          };

          // Convertir la chaîne recipe_ids en tableau de nombres
          const recipeIds = listData.recipe_ids ? JSON.parse(listData.recipe_ids) : [];

          // Naviguer vers l'écran de détail
          navigation.navigate('ShoppingListDetail', {
            shoppingList: formattedShoppingList,
            shoppingListId: item.id,
            recipeIds: recipeIds,
            listName: listData.name
          });
        } catch (error) {
          console.error('Erreur lors de la récupération des détails de la liste:', error);
          Alert.alert('Erreur', 'Impossible de récupérer les détails de la liste.');
        } finally {
          setIsLoading(false);
        }
      }}
    >
      <View style={styles.listIconContainer}>
        <Ionicons name="cart" size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.listItemContent}>
        <Text style={styles.listName}>{item.name}</Text>
        <View style={styles.listInfoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="restaurant" size={14} color={theme.colors.textMuted} />
            <Text style={styles.listInfo}>{item.total_recipes} recettes</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="people" size={14} color={theme.colors.textMuted} />
            <Text style={styles.listInfo}>{item.servings} pers.</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={14} color={theme.colors.textMuted} />
            <Text style={styles.listInfo}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => confirmDelete(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Chargement des listes...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Mes listes de courses</Text>
      </View>

      {/* Content */}
      {lists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="cart-outline" size={80} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Aucune liste sauvegardée</Text>
          <Text style={styles.emptyText}>
            Vos listes de courses sauvegardées apparaîtront ici
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.navigate('Main', { screen: 'Recettes' })}
          >
            <Text style={styles.createButtonText}>Créer une liste</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={lists}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
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
  listContainer: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  listItemContent: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 6,
  },
  listInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 2,
  },
  listInfo: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 