import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export default function WorldMapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explorer le monde</Text>
      <Text style={styles.subtitle}>Carte interactive des cuisines du monde (à venir)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  title: {
    ...theme.typography.heading,
    fontSize: 24,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
}); 