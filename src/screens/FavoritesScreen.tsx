import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { theme } from '../styles/theme';
import { Recipe } from '../types/models';

export default function FavoritesScreen() {
  // Données simulées à remplacer par des données réelles
  const emptyFavorites = true;
  const favoriteRecipes: Recipe[] = [];
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes favoris</Text>
        <Text style={styles.subtitle}>
          Retrouvez toutes vos recettes préférées
        </Text>
      </View>
      
      <View style={styles.content}>
        {emptyFavorites ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Aucun favori</Text>
            <Text style={styles.emptyDescription}>
              Vous n'avez pas encore ajouté de recettes à vos favoris.
              Explorez notre collection et ajoutez vos découvertes préférées.
            </Text>
          </View>
        ) : (
          <FlatList
            data={favoriteRecipes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View>
                <Text>{item.title}</Text>
              </View>
            )}
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
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl * 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyDescription: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  }
}); 