import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme, ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Écrans
import HomeScreen from '../screens/HomeScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AllRecipesScreen from '../screens/AllRecipesScreen';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// Contextes
import { useAuthContext } from '../contexts/AuthContext';
import { theme } from '../styles/theme';

// Définition des types de navigation
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  Onboarding: undefined;
  RecipeDetail: { recipeId: number };
  AllRecipes: undefined;
};

type MainTabParamList = {
  Accueil: undefined;
  Explorer: undefined;
  Favoris: undefined;
  Profil: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'help-outline';

          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explorer') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Favoris') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarStyle: {
          paddingVertical: 5,
          height: 60,
          backgroundColor: 'white',
          borderTopColor: '#E8E8E8',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Explorer" component={ExploreScreen} />
      <Tab.Screen name="Favoris" component={FavoritesScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { session, loading } = useAuthContext();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Vérifier si l'utilisateur a déjà complété l'onboarding
  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const value = await AsyncStorage.getItem('hasCompletedOnboarding');
        setHasCompletedOnboarding(value === 'true');
      } catch (error) {
        console.error('Erreur lors de la vérification du statut d\'onboarding:', error);
      } finally {
        setIsInitializing(false);
      }
    }

    checkOnboardingStatus();
  }, []);

  // Afficher un loader pendant l'initialisation
  if (loading || isInitializing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'white' },
          headerStyle: {
            backgroundColor: 'white',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerTintColor: theme.colors.text,
        }}
        initialRouteName={
          hasCompletedOnboarding === false 
            ? 'Onboarding' 
            : session ? 'Main' : 'Auth'
        }
      >
        {/* Écran d'onboarding */}
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen} 
          options={{ headerShown: false }}
        />
        
        {/* Écran d'authentification */}
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{ headerShown: false }}
        />
        
        {/* Écrans principaux */}
        <Stack.Screen name="Main" component={MainTabs} />
        
        {/* Écrans détaillés */}
        <Stack.Screen 
          name="RecipeDetail" 
          component={RecipeDetailScreen} 
          options={{ 
            headerShown: true,
            headerTitle: '',
            headerTransparent: true,
            headerBackTitle: ' ',
          }}
        />
        
        <Stack.Screen 
          name="AllRecipes" 
          component={AllRecipesScreen} 
          options={{ 
            headerShown: true,
            headerTitle: 'Toutes les recettes',
            headerBackTitle: 'Retour',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
