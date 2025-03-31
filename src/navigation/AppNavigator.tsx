import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, StyleSheet, Platform, Dimensions, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

// Écrans
import HomeScreen from '../screens/HomeScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AllRecipesScreen from '../screens/AllRecipesScreen';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import StoryModeScreen from '../screens/StoryModeScreen';
import WorldMapScreen from '../screens/WorldMapScreen';
import RecipeGeneratorScreen from '../screens/RecipeGeneratorScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import ShoppingListDetailScreen from '../screens/ShoppingListDetailScreen';
import SavedShoppingListsScreen from '../screens/SavedShoppingListsScreen';
import RecipesListScreen from '../screens/RecipesListScreen';

// Composants
import RecipeCreationBottomSheet from '../components/RecipeCreationBottomSheet';

// Contextes
import { useAuthContext } from '../contexts/AuthContext';
import { theme } from '../styles/theme';

// Définition d'un composant de remplacement temporaire pour Explorer
// function TemporaryExploreScreen() {
//   return (
//     <View style={{ 
//       flex: 1, 
//       justifyContent: 'center', 
//       alignItems: 'center', 
//       backgroundColor: theme.colors.background
//     }}>
//       <Text style={{ 
//         fontSize: 28, 
//         fontWeight: 'bold', 
//         color: theme.colors.text,
//         marginBottom: 10
//       }}>
//         Explorer
//       </Text>
//       <Text style={{ 
//         fontSize: 16, 
//         color: theme.colors.textMuted,
//         textAlign: 'center',
//         marginHorizontal: 40,
//         lineHeight: 24
//       }}>
//         Fonctionnalité en développement. L'écran d'exploration vous permettra bientôt de découvrir des recettes par région, ingrédients et tendances culinaires.
//       </Text>
//     </View>
//   );
// }

// Définition des types de navigation
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  RecipeDetails: { id: number };
  RecipeDetail: { id: number, title?: string };
  StoryMode: undefined;
  WorldMap: undefined;
  RecipeGenerator: undefined;
  AllRecipes: undefined;
  ShoppingList: {
    shoppingList: {
      ingredients: Array<{
        category: string;
        items: Array<{
          name: string;
          quantity: string;
          unit: string;
          category?: string;
        }>
      }>;
      total_recipes: number;
      servings: number;
    };
    recipeIds: number[];
  };
  ShoppingListDetail: {
    shoppingList: {
      ingredients: Array<{
        id?: number;
        category: string;
        items: Array<{
          id?: number;
          name: string;
          quantity: string;
          unit: string;
          is_checked: boolean;
        }>
      }>;
      total_recipes: number;
      servings: number;
    };
    shoppingListId: number;
    recipeIds: number[];
    listName: string;
  };
  SavedShoppingLists: undefined;
  RecipesList: {
    recipeIds: number[];
    listName: string;
  };
};

type MainTabParamList = {
  Accueil: undefined;
  Recettes: undefined;
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
  const navigation = useNavigation<any>();
  const [showRecipeCreationSheet, setShowRecipeCreationSheet] = useState(false);
  
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
  
  const handleRecipeSubmit = (recipeName: string, options: any) => {
    // Naviguer vers l'écran de génération de recette avec les données pré-remplies
    navigation.navigate('RecipeGenerator', {
      recipeName,
      options
    });
  };
  
  return (
    <>
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
              {/* Première moitié des boutons */}
              {props.state.routes.slice(0, 2).map((route, index) => {
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
                } else if (route.name === 'Recettes') {
                  iconName = isFocused ? 'restaurant' : 'restaurant-outline';
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
                    options={options}
                    isFocused={isFocused}
                    label={label.toString()}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    icon={icon}
                  />
                );
              })}
              
              {/* Bouton central pour ajouter une recette - avec bottom sheet */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => setShowRecipeCreationSheet(true)}
                activeOpacity={0.8}
              >
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: 'white',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 5,
                  bottom: hasHomeIndicator ? 22 : 15,
                }}>
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.accent]}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="add" size={30} color="white" />
                  </LinearGradient>
                </View>
                <Text style={{
                  fontSize: 10,
                  fontWeight: '500',
                  color: theme.colors.textMuted,
                  marginTop: hasHomeIndicator ? -10 : -5,
                }}>
                  Créer
                </Text>
              </TouchableOpacity>
              
              {/* Seconde moitié des boutons */}
              {props.state.routes.slice(2, 4).map((route, index) => {
                const actualIndex = index + 2;
                const { options } = props.descriptors[route.key];
                const label =
                  options.tabBarLabel !== undefined
                    ? options.tabBarLabel
                    : options.title !== undefined
                    ? options.title
                    : route.name;

                const isFocused = props.state.index === actualIndex;

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
                } else if (route.name === 'Recettes') {
                  iconName = isFocused ? 'restaurant' : 'restaurant-outline';
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
                    options={options}
                    isFocused={isFocused}
                    label={label.toString()}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    icon={icon}
                  />
                );
              })}
            </View>
          );
        }}
      >
        <Tab.Screen name="Accueil" component={HomeScreen} />
        <Tab.Screen name="Recettes" component={ExploreScreen} />
        <Tab.Screen name="Favoris" component={FavoritesScreen} />
        <Tab.Screen name="Profil" component={ProfileScreen} />
      </Tab.Navigator>
      
      {/* Bottom Sheet pour la création de recette */}
      <RecipeCreationBottomSheet
        visible={showRecipeCreationSheet}
        onClose={() => setShowRecipeCreationSheet(false)}
        onSubmit={handleRecipeSubmit}
      />
    </>
  );
}

export function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const authContext = useAuthContext();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  async function checkOnboardingStatus() {
    try {
      const value = await AsyncStorage.getItem('@onboarding_complete');
      setIsOnboardingComplete(value === 'true');
    } catch (error) {
      console.log('Erreur lors de la vérification du statut d\'onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading || authContext.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!authContext.session ? (
        // Routes non authentifiées
        <>
          {!isOnboardingComplete ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : null}
          <Stack.Screen name="Auth" component={AuthScreen} />
        </>
      ) : (
        // Routes authentifiées
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="RecipeDetails" component={RecipeDetailScreen} />
          <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
          <Stack.Screen name="StoryMode" component={StoryModeScreen} />
          <Stack.Screen name="WorldMap" component={WorldMapScreen} />
          <Stack.Screen name="RecipeGenerator" component={RecipeGeneratorScreen} />
          <Stack.Screen name="AllRecipes" component={AllRecipesScreen} />
          <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
          <Stack.Screen name="ShoppingListDetail" component={ShoppingListDetailScreen} />
          <Stack.Screen name="SavedShoppingLists" component={SavedShoppingListsScreen} />
          <Stack.Screen name="RecipesList" component={RecipesListScreen} />
        </>
      )}
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
