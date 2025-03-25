import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface Step {
  step: number;
  status: 'loading' | 'completed' | 'error';
  message: string;
}

interface Props {
  currentStep: Step | null;
  steps: Step[];
}

export const RecipeGenerationSteps: React.FC<Props> = ({ currentStep, steps }) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (currentStep) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentStep?.step]);

  if (!currentStep) return null;

  const progress = currentStep.step / steps.length;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.progressContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { width: `${progress * 100}%` }]}
        />
        <View style={[styles.progressBackground, { width: `${(1 - progress) * 100}%` }]} />
      </View>
      <Text style={styles.message}>
        {currentStep.message}
      </Text>
      <Text style={styles.stepCount}>
        Étape {currentStep.step}/{steps.length}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    width: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  progressBackground: {
    height: '100%',
    backgroundColor: '#E9ECEF',
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  stepCount: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
}); 