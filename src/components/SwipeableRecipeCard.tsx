import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  Dimensions, 
  Animated, 
  PanResponder,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.53;

interface SwipeableRecipeCardProps {
  recipe: {
    id: number;
    title: string;
    description: string;
    image_url: string;
    cooking_time: number;
    difficulty: string;
    country: string;
    ingredients: Array<{
      name: string;
      quantity: string;
      unit: string;
    }>;
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isFirst: boolean;
}

export default function SwipeableRecipeCard({ 
  recipe, 
  onSwipeLeft, 
  onSwipeRight,
  isFirst
}: SwipeableRecipeCardProps) {
  const position = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeLeft();
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -width, y: 0 },
      duration: 250,
      useNativeDriver: false
    }).start(() => {
      onSwipeLeft();
    });
  };

  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: width, y: 0 },
      duration: 250,
      useNativeDriver: false
    }).start(() => {
      onSwipeRight();
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: false
    }).start();
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-width, 0, width],
      outputRange: ['-10deg', '0deg', '10deg']
    });

    return {
      transform: [
        { translateX: position.x },
        { rotate }
      ]
    };
  };

  if (!isFirst) {
    return null;
  }

  return (
    <View style={styles.cardContainer}>
      <Animated.View
        style={[styles.card, getCardStyle()]}
        {...panResponder.panHandlers}
      >
        <Image
          source={{ uri: recipe.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <BlurView intensity={80} tint="light" style={styles.countryBadge}>
                <Ionicons name="location" size={14} color={theme.colors.primary} />
                <Text style={styles.countryText}>{recipe.country}</Text>
              </BlurView>
              <View style={styles.metaContainer}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color="white" />
                  <Text style={styles.metaText}>{recipe.cooking_time} min</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="speedometer-outline" size={16} color="white" />
                  <Text style={styles.metaText}>{recipe.difficulty}</Text>
                </View>
              </View>
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.title}>{recipe.title}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {recipe.description}
              </Text>
            </View>

            <View style={styles.ingredientsContainer}>
              <View style={styles.ingredientsHeader}>
                <Ionicons name="restaurant-outline" size={16} color="white" />
                <Text style={styles.ingredientsTitle}>Ingrédients principaux</Text>
              </View>
              <View style={styles.ingredientsList}>
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                    <Text key={index} style={styles.ingredientText}>
                      • {ingredient.quantity} {ingredient.unit} {ingredient.name}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.noIngredientsText}>Chargement des ingrédients...</Text>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    gap: 4,
  },
  countryText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  metaText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
  titleContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  ingredientsContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 10,
    borderRadius: 12,
  },
  ingredientsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  ingredientsList: {
    gap: 4,
  },
  ingredientText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 2,
  },
  noIngredientsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
}); 