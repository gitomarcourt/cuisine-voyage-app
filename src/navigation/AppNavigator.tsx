import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Image, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../contexts/AuthContext';
import { theme } from '../styles/theme';
import { BlurView } from 'expo-blur';

import HomeScreen from '../screens/HomeScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import WorldMapScreen from '../screens/WorldMapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import TestSupabaseScreen from '../screens/TestSupabaseScreen';
// Autres imports de screens

// Définition du type pour les paramètres de navigation
export type RootStackParamList = {
  Home: undefined;
  RecipeDetail: { id: number, title: string };
  WorldMap: undefined;
  Profile: undefined;
  Auth: undefined;
  TestSupabase: undefined;
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
          elevation: 0, // Pour Android
          shadowOpacity: 0, // Pour iOS
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
        options={({ navigation }) => ({
          title: 'Savorista',
          headerTitleStyle: {
            fontSize: 22,
            fontWeight: 'bold',
            color: theme.colors.primary,
          },
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity 
                style={[styles.headerButton, { marginRight: 8 }]}
                onPress={() => navigation.navigate('TestSupabase')}
              >
                <BlurView intensity={50} tint="light" style={styles.blurButton}>
                  <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Test</Text>
                </BlurView>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => {
                  if (session) {
                    navigation.navigate('Profile');
                  } else {
                    navigation.navigate('Auth');
                  }
                }}
              >
                <BlurView intensity={50} tint="light" style={styles.blurButton}>
                  {session ? (
                    <Image 
                      source={{ uri: 'https://dummyimage.com/100x100/cccccc/ffffff&text=User' }}
                      style={styles.profileImage} 
                    />
                  ) : (
                    <Ionicons name="person-circle-outline" size={24} color={theme.colors.primary} />
                  )}
                </BlurView>
              </TouchableOpacity>
            </View>
          ),
          headerShown: false, // Cacher l'en-tête pour HomeScreen car nous avons notre propre en-tête personnalisé
        })}
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
        options={{ title: 'Explorer le monde' }}
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
