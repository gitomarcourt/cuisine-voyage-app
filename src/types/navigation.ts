import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  RecipeDetail: { id: number; title: string };
};

// Pour utiliser le hook useNavigation avec le bon typage
export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type RecipeDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RecipeDetail'>;

// Pour utiliser le hook useRoute avec le bon typage
export type RecipeDetailScreenRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>; 