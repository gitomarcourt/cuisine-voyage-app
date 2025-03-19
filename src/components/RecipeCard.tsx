import * as React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const cardWidth = width - (theme.spacing.lg * 2);

interface RecipeCardProps {
  title: string;
  country: string;
  description: string;
  imageSource: any;
  cookingTime: number;
  difficulty: string;
  isPremium?: boolean;
  onPress: () => void;
}

export default function RecipeCard({ 
  title, 
  country, 
  description, 
  imageSource, 
  cookingTime, 
  difficulty, 
  isPremium = false,
  onPress
}: RecipeCardProps) {
  return (
    <TouchableOpacity 
      style={[styles.cardContainer, isPremium && styles.premiumCardContainer]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        <Image 
          source={typeof imageSource === 'object' && imageSource.uri ? 
            imageSource : 
            { uri: 'https://dummyimage.com/400x300/cccccc/ffffff&text=Image+non+disponible' }} 
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          resizeMode="cover"
        />
        
        {/* Overlay dégradé au-dessus de l'image */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Contenu principal */}
        <View style={styles.contentContainer}>
          <BlurView intensity={60} tint="dark" style={styles.contentBlur}>
            <View style={styles.content}>
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
              <Text style={styles.description} numberOfLines={2}>{description}</Text>
              
              <View style={styles.metaContainer}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Temps</Text>
                  <Text style={styles.metaValue}>{cookingTime} min</Text>
                </View>
                
                <View style={styles.metaSeparator} />
                
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Difficulté</Text>
                  <Text style={styles.metaValue}>{difficulty}</Text>
                </View>
              </View>
            </View>
          </BlurView>
        </View>
        
        {/* Badge pays */}
        <View style={styles.countryContainer}>
          <BlurView intensity={80} tint="light" style={styles.countryBadge}>
            <Text style={styles.countryText}>{country}</Text>
          </BlurView>
        </View>
        
        {/* Badge premium */}
        {isPremium && (
          <View style={styles.premiumContainer}>
            <BlurView intensity={90} tint="dark" style={styles.premiumBadge}>
              <Text style={styles.premiumText}>Premium</Text>
            </BlurView>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    height: 300,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  premiumCardContainer: {
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  card: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 1,
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    overflow: 'hidden',
  },
  contentBlur: {
    overflow: 'hidden',
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(58, 39, 27, 0.4)',
  },
  content: {
    padding: theme.spacing.md,
  },
  title: {
    ...theme.typography.heading,
    fontSize: 22,
    marginBottom: theme.spacing.xs,
    color: 'white',
  },
  description: {
    ...theme.typography.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: theme.spacing.md,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flex: 1,
  },
  metaSeparator: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: theme.spacing.sm,
  },
  metaLabel: {
    ...theme.typography.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  metaValue: {
    ...theme.typography.heading,
    fontSize: 14,
    color: 'white',
  },
  countryContainer: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    zIndex: 3,
    overflow: 'hidden',
    borderRadius: theme.borderRadius.full,
  },
  countryBadge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(250, 243, 224, 0.8)',
  },
  countryText: {
    ...theme.typography.body,
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  premiumContainer: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 3,
    overflow: 'hidden',
    borderRadius: theme.borderRadius.full,
  },
  premiumBadge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(160, 82, 45, 0.8)',
  },
  premiumText: {
    ...theme.typography.heading,
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
});
