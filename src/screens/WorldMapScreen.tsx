import * as React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../styles/theme';

export default function WorldMapScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=1333&auto=format&fit=crop' }}
        style={styles.background}
      >
        <BlurView intensity={40} tint="dark" style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.title}>Carte du monde culinaire</Text>
            <Text style={styles.subtitle}>Explorez les cuisines du monde entier et découvrez de nouvelles saveurs</Text>
            
            {/* Ici, vous pourriez ajouter une vraie carte interactive */}
            <View style={styles.mapPlaceholder}>
              <Text style={styles.placeholderText}>Carte interactive à venir</Text>
            </View>
          </View>
        </BlurView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  background: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...theme.typography.heading,
    fontSize: 28,
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  mapPlaceholder: {
    width: '90%',
    height: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  placeholderText: {
    ...theme.typography.body,
    fontSize: 16,
    color: 'white',
  },
}); 