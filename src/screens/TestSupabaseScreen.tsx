import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { theme } from '../styles/theme';
import { supabase } from '../lib/supabase';

export default function TestSupabaseScreen() {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test simple pour récupérer la version de PostgreSQL
      const { data, error } = await supabase.rpc('version');
      
      if (error) throw error;
      
      setData(data);
      console.log('Connexion Supabase réussie:', data);
    } catch (err) {
      console.error('Erreur de connexion à Supabase:', err);
      setError(err instanceof Error ? err.message : 'Erreur de connexion à Supabase');
    } finally {
      setLoading(false);
    }
  };

  const testRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .limit(5);
      
      if (error) throw error;
      
      setData(data);
      console.log('Recettes récupérées:', data);
    } catch (err) {
      console.error('Erreur lors de la récupération des recettes:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des recettes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Test de connexion Supabase</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={testConnection}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Tester la connexion</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={testRecipes}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Tester les recettes</Text>
          </TouchableOpacity>
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        )}
        
        {data && (
          <View style={styles.resultContainer}>
            <Text style={styles.successText}>Test réussi!</Text>
            <Text style={styles.dataTitle}>Données reçues:</Text>
            <View style={styles.dataContainer}>
              <Text style={styles.dataText}>
                {typeof data === 'object' ? JSON.stringify(data, null, 2) : data}
              </Text>
            </View>
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Erreur:</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.heading,
    fontSize: 24,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  button: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
  },
  resultContainer: {
    backgroundColor: theme.colors.success + '20',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  successText: {
    color: theme.colors.success,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  dataContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  dataText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  errorContainer: {
    backgroundColor: theme.colors.error + '20',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
  },
}); 