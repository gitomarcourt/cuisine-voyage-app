import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { Recipe } from '../types/models';
import { useFavorites } from '../hooks/useFavorites';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const recipeCardWidth = width / 2 - 24; // 2 colonnes avec marge

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { favorites, isLoading, loadFavorites } = useFavorites();
  
  useEffect(() => {
    // Recharger les favoris lorsque l'écran est affiché
    const unsubscribe = navigation.addListener('focus', () => {
      loadFavorites();
    });

    return unsubscribe;
  }, [navigation, loadFavorites]);

  const renderRecipeCard = ({ item }: { item: Recipe }) => {
    return (
      <TouchableOpacity 
        style={styles.recipeCard}
        onPress={() => navigation.navigate('RecipeDetail', { id: item.id, title: item.title })}
      >
        <Image
          source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=1374&auto=format&fit=crop' }}
          style={styles.recipeImage}
          resizeMode="cover"
        />
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.recipeDetails}>
            <Text style={styles.recipeRegion}>{item.country}</Text>
            <View style={styles.cookingTime}>
              <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
              <Text style={styles.cookingTimeText}>{item.cooking_time} min</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top || 40 }]}>
        <Text style={styles.title}>Mes favoris</Text>
        <Text style={styles.subtitle}>
          Retrouvez toutes vos recettes préférées
        </Text>
      </View>
      
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Chargement de vos favoris...</Text>
          </View>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={60} color={theme.colors.textMuted} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>Aucun favori</Text>
            <Text style={styles.emptyDescription}>
              Vous n'avez pas encore ajouté de recettes à vos favoris.
              Explorez notre collection et ajoutez vos découvertes préférées.
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Accueil')}
            >
              <Text style={styles.exploreButtonText}>Explorer les recettes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRecipeCard}
            numColumns={2}
            contentContainerStyle={styles.recipeGrid}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  content: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recipeGrid: {
    padding: 12,
    paddingBottom: 32,
  },
  recipeCard: {
    width: recipeCardWidth,
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    height: 40,
  },
  recipeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeRegion: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  cookingTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cookingTimeText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
}); 