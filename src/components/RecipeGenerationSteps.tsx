import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const [progressAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (currentStep) {
      fadeAnim.setValue(0);
      progressAnim.setValue(0);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: currentStep.step / steps.length,
          duration: 800,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [currentStep?.step]);

  if (!currentStep) return null;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.stepInfo}>
        <MaterialCommunityIcons 
          name="chef-hat" 
          size={24} 
          color="rgba(255,255,255,0.9)" 
        />
        <Text style={styles.message}>
          {currentStep.message}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBackground]}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
              },
            ]}
          >
            <LinearGradient
              colors={[theme.colors.accent, theme.colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            />
          </Animated.View>
        </Animated.View>
        <Text style={styles.stepCount}>
          Étape {currentStep.step}/{steps.length}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  stepInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 16,
    borderRadius: 12,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  gradient: {
    flex: 1,
  },
  message: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  stepCount: {
    marginTop: 12,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
}); 