import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Image, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';
import { theme } from '../styles/theme';
import { BlurView } from 'expo-blur';

import HomeScreen from '../screens/HomeScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
// Vérifier si le WorldMapScreen existe ou est déjà importé dans le projet
import WorldMapScreen from '../screens/WorldMapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import TestSupabaseScreen from '../screens/TestSupabaseScreen';
import StoryModeScreen from '../screens/StoryModeScreen';
import { RecipeGeneratorScreen } from '../screens/RecipeGeneratorScreen';
// Autres imports de screens

// Définition du type pour les paramètres de navigation
export type RootStackParamList = {
  Home: undefined;
  RecipeDetail: { id: number, title: string };
  WorldMap: undefined;
  Profile: undefined;
  Auth: undefined;
  TestSupabase: undefined;
  StoryMode: { id: number, title: string };
  RecipeGenerator: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { session } = useAuthContext();
  
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(211, 197, 184, 0.3)',
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: theme.colors.text,
        },
        headerTintColor: theme.colors.primary,
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="RecipeDetail" 
        component={RecipeDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.title || 'Détail de la recette',
          headerBackTitleVisible: false,
        })}
      />
      <Stack.Screen 
        name="WorldMap" 
        component={WorldMapScreen} 
        options={{ 
          title: 'Explorer le monde',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Mon profil' }}
      />
      <Stack.Screen 
        name="Auth" 
        component={AuthScreen} 
        options={{ 
          title: 'Connexion',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="TestSupabase" 
        component={TestSupabaseScreen} 
        options={{ title: 'Test Supabase' }}
      />
      <Stack.Screen 
        name="StoryMode" 
        component={StoryModeScreen} 
        options={{ 
          headerShown: false, // Cacher l'en-tête pour une expérience plus immersive
          // La propriété 'presentation' n'est pas disponible dans cette version
        }}
      />
      <Stack.Screen 
        name="RecipeGenerator" 
        component={RecipeGeneratorScreen} 
        options={{ 
          title: 'Créer une recette',
          presentation: 'modal',
        }}
      />
      {/* Autres écrans */}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginRight: 12,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  blurButton: {
    padding: 8,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
});
