import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { recipeGeneratorService, GenerationStatus } from '../services/recipeGenerator';

type GenerationStep = {
  id: number;
  title: string;
  icon: string;
  status: 'waiting' | 'loading' | 'completed' | 'error';
  progress: Animated.Value;
  message?: string;
};

export const RecipeGeneratorScreen = () => {
  const [recipeName, setRecipeName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const stepsRef = useRef<GenerationStep[]>([
    { id: 0, title: '🔄 Connexion', icon: 'connection', status: 'waiting', progress: new Animated.Value(0) },
    { id: 1, title: '🌍 Génération', icon: 'earth', status: 'waiting', progress: new Animated.Value(0) },
    { id: 2, title: '📝 Recette', icon: 'notebook', status: 'waiting', progress: new Animated.Value(0) },
    { id: 3, title: '🥕 Ingrédients', icon: 'format-list-bulleted', status: 'waiting', progress: new Animated.Value(0) },
    { id: 4, title: '👩‍🍳 Étapes', icon: 'chef-hat', status: 'waiting', progress: new Animated.Value(0) },
    { id: 5, title: '💾 Finalisation', icon: 'content-save', status: 'waiting', progress: new Animated.Value(0) },
  ]);

  const animateProgress = (index: number) => {
    Animated.timing(stepsRef.current[index].progress, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const updateStepStatus = (status: GenerationStatus) => {
    const step = stepsRef.current[status.step];
    if (step) {
      step.status = status.status;
      step.message = status.message;
      if (status.status === 'loading') {
        setCurrentStepIndex(status.step);
        animateProgress(status.step);
      } else if (status.status === 'error') {
        Alert.alert('Erreur', status.message);
      }
    }
  };

  const startGeneration = async () => {
    if (!recipeName.trim()) return;

    try {
      setIsGenerating(true);
      
      // Réinitialiser les étapes
      stepsRef.current.forEach(step => {
        step.status = 'waiting';
        step.progress.setValue(0);
        step.message = undefined;
      });

      // Lancer la génération
      const success = await recipeGeneratorService.generateRecipe(recipeName, updateStepStatus);
      
      if (success) {
        Alert.alert('Succès', 'La recette a été générée et sauvegardée avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la génération de la recette');
    } finally {
      setIsGenerating(false);
      setCurrentStepIndex(-1);
    }
  };

  const renderStep = (step: GenerationStep, index: number) => {
    const isActive = index === currentStepIndex;
    const isCompleted = step.status === 'completed';
    const isError = step.status === 'error';

    return (
      <View key={step.id} style={styles.stepContainer}>
        <LinearGradient
          colors={[
            isError ? '#FF6B6B' : isActive ? '#FF6B6B' : isCompleted ? '#51CF66' : '#868E96',
            isError ? '#FF8787' : isActive ? '#FF8787' : isCompleted ? '#69DB7C' : '#ADB5BD',
          ]}
          style={styles.stepIconContainer}
        >
          <MaterialCommunityIcons
            name={step.icon as any}
            size={24}
            color="white"
          />
        </LinearGradient>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          {step.message && (
            <Text style={[styles.stepMessage, isError && styles.errorMessage]}>
              {step.message}
            </Text>
          )}
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: step.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: isError ? '#FF6B6B' : '#51CF66',
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Générateur de Recettes</Text>
          <Text style={styles.subtitle}>
            Entrez le nom de votre plat et laissez la magie opérer ✨
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nom de votre recette..."
            value={recipeName}
            onChangeText={setRecipeName}
            editable={!isGenerating}
          />
          <Button
            mode="contained"
            onPress={startGeneration}
            disabled={isGenerating || !recipeName.trim()}
            style={styles.button}
          >
            {isGenerating ? 'Génération en cours...' : 'Générer la recette ✨'}
          </Button>
        </View>

        <View style={styles.stepsContainer}>
          {stepsRef.current.map((step, index) => renderStep(step, index))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  stepsContainer: {
    gap: 15,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  stepMessage: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  errorMessage: {
    color: '#FF6B6B',
  },
}); 