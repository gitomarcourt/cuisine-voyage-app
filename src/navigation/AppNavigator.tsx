import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, StyleSheet, Platform, Dimensions, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// Écrans
import HomeScreen from '../screens/HomeScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
// import ExploreScreen from '../screens/ExploreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AllRecipesScreen from '../screens/AllRecipesScreen';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import StoryModeScreen from '../screens/StoryModeScreen';
import WorldMapScreen from '../screens/WorldMapScreen';

// Contextes
import { useAuthContext } from '../contexts/AuthContext';
import { theme } from '../styles/theme';

// Définition d'un composant de remplacement temporaire pour Explorer
function TemporaryExploreScreen() {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: theme.colors.background
    }}>
      <Text style={{ 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: theme.colors.text,
        marginBottom: 10
      }}>
        Explorer
      </Text>
      <Text style={{ 
        fontSize: 16, 
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginHorizontal: 40,
        lineHeight: 24
      }}>
        Fonctionnalité en développement. L'écran d'exploration vous permettra bientôt de découvrir des recettes par région, ingrédients et tendances culinaires.
      </Text>
    </View>
  );
}

// Définition des types de navigation
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  Onboarding: undefined;
  RecipeDetail: { id: number; title: string };
  AllRecipes: undefined;
  StoryMode: { id: number; title: string };
  WorldMap: undefined;
};

type MainTabParamList = {
  Accueil: undefined;
  Explorer: undefined;
  Favoris: undefined;
  Profil: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Composant personnalisé pour l'élément du TabBar
function TabBarItem({ 
  isFocused, 
  options, 
  onPress, 
  onLongPress, 
  label, 
  icon 
}: { 
  isFocused: boolean, 
  options: any, 
  onPress: () => void, 
  onLongPress: () => void, 
  label: string, 
  icon: React.ReactNode 
}) {
  // Version simplifiée sans Reanimated
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={{ 
        alignItems: 'center',
        transform: [{ scale: isFocused ? 1 : 0.92 }]
      }}>
        <View style={{ marginBottom: 4 }}>
          {icon}
        </View>
        
        <View 
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: theme.borderRadius.full,
            backgroundColor: isFocused ? `${theme.colors.primary}15` : 'transparent',
          }}
        >
          <Text 
            style={{ 
              fontSize: 12, 
              fontWeight: isFocused ? '700' : '500',
              color: isFocused ? theme.colors.primary : theme.colors.textMuted
            }}
          >
            {label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const hasHomeIndicator = insets.bottom > 0;
  const { width: screenWidth } = Dimensions.get('window');
  const isIOS = Platform.OS === 'ios';
  
  // Calculer la hauteur de la barre de navigation en fonction de l'appareil
  const getTabBarHeight = () => {
    if (hasHomeIndicator) {
      return 85; // iPhone avec indicateur home
    } else if (isIOS) {
      return 72; // iPhone sans indicateur home
    } else {
      return 65; // Android
    }
  };
  
  // Calculer le padding du bas pour la barre de navigation
  const getTabBarBottomPadding = () => {
    if (hasHomeIndicator) {
      return insets.bottom; // Utiliser directement la valeur des insets pour les appareils avec indicateur
    } else if (isIOS) {
      return 10; // Padding minimal pour iOS sans indicateur
    } else {
      return 10; // Padding minimal pour Android
    }
  };
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          height: getTabBarHeight(),
          paddingBottom: getTabBarBottomPadding(),
          backgroundColor: 'white',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 10,
          position: 'absolute',
        }
      })}
      tabBar={props => {
        return (
          <View style={{ 
            flexDirection: 'row', 
            height: getTabBarHeight(),
            paddingBottom: getTabBarBottomPadding(),
            backgroundColor: 'white',
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 10,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}>
            {props.state.routes.map((route, index) => {
              const { options } = props.descriptors[route.key];
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.name;

              const isFocused = props.state.index === index;

              const onPress = () => {
                const event = props.navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  props.navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                props.navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                });
              };

              // Déterminer l'icône en fonction de la route
              let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'help-outline';
              
              if (route.name === 'Accueil') {
                iconName = isFocused ? 'home' : 'home-outline';
              } else if (route.name === 'Explorer') {
                iconName = isFocused ? 'compass' : 'compass-outline';
              } else if (route.name === 'Favoris') {
                iconName = isFocused ? 'heart' : 'heart-outline';
              } else if (route.name === 'Profil') {
                iconName = isFocused ? 'person' : 'person-outline';
              }

              const icon = (
                <Ionicons
                  name={iconName}
                  size={isFocused ? 24 : 22}
                  color={isFocused ? theme.colors.primary : theme.colors.textMuted}
                />
              );

              return (
                <TabBarItem
                  key={route.key}
                  isFocused={isFocused}
                  options={options}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  label={route.name}
                  icon={icon}
                />
              );
            })}
          </View>
        );
      }}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Explorer" component={TemporaryExploreScreen} />
      <Tab.Screen name="Favoris" component={FavoritesScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
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

  // Déterminer l'écran initial
  // Si l'utilisateur n'est pas connecté, montrer l'onboarding
  // Si l'utilisateur est connecté et a complété l'onboarding, montrer l'écran principal
  const initialRouteName = session 
    ? (hasCompletedOnboarding ? 'Main' : 'Onboarding')
    : 'Onboarding';

  return (
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
      initialRouteName={initialRouteName}
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
        options={{ headerShown: false }}
      />
      
      {/* Écran du mode histoire */}
      <Stack.Screen 
        name="StoryMode" 
        component={StoryModeScreen} 
        options={{ headerShown: false }}
      />
      
      {/* Carte du monde culinaire */}
      <Stack.Screen 
        name="WorldMap" 
        component={WorldMapScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
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
