import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import { RecipeGenerationSteps } from '../components/RecipeGenerationSteps';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface Step {
  step: number;
  status: 'loading' | 'completed' | 'error';
  message: string;
}

export const RecipeGeneratorScreen = () => {
  const [recipeName, setRecipeName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);

  const steps: Step[] = [
    { step: 1, status: 'loading', message: 'Recherche de la recette...' },
    { step: 2, status: 'loading', message: 'Ajout des ingrédients...' },
    { step: 3, status: 'loading', message: 'Ajout des instructions...' },
    { step: 4, status: 'loading', message: 'Finalisation...' },
  ];

  const handleGenerateRecipe = async () => {
    if (!recipeName.trim()) {
      setError('Veuillez entrer le nom d\'une recette');
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      // Simulation des étapes
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep({ ...steps[i] });
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
      setCurrentStep(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.title}>Ajouter une recette</Text>
        <Text style={styles.subtitle}>Quel plat souhaitez-vous découvrir ?</Text>
      </LinearGradient>

      <View style={styles.content}>
        <BlurView intensity={10} tint="light" style={styles.card}>
          <TextInput
            label="Nom de la recette"
            value={recipeName}
            onChangeText={setRecipeName}
            mode="outlined"
            style={styles.input}
            outlineColor={theme.colors.primary}
            activeOutlineColor={theme.colors.accent}
            error={!!error}
          />
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          <Button
            mode="contained"
            onPress={handleGenerateRecipe}
            loading={isLoading}
            disabled={isLoading || !recipeName.trim()}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Générer la recette
          </Button>
        </BlurView>

        <RecipeGenerationSteps
          currentStep={currentStep}
          steps={steps}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    padding: 24,
    paddingTop: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    padding: 16,
    marginTop: -24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 8,
    fontSize: 12,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
}); 