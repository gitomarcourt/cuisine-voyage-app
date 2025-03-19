import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Dimensions, 
  ScrollView,
  Animated,
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

interface Region {
  id: number;
  name: string;
  country: string;
  coords: { latitude: number; longitude: number };
  recipeId: number;
  recipeTitle?: string;
  image?: string;
  description?: string;
  iconName?: string;
}

// Données initiales des régions avec coordonnées géographiques
const INITIAL_REGIONS: Region[] = [
  {
    id: 1,
    name: 'Provence',
    country: 'France',
    coords: { latitude: 43.5283, longitude: 5.4497 }, // Aix-en-Provence
    recipeId: 3,
    iconName: 'utensils'
  },
  {
    id: 2,
    name: 'Toscane',
    country: 'Italie',
    coords: { latitude: 43.7711, longitude: 11.2486 }, // Florence
    recipeId: 1,
    iconName: 'ice-cream'
  },
  {
    id: 3,
    name: 'Andalousie',
    country: 'Espagne',
    coords: { latitude: 37.3891, longitude: -5.9845 }, // Séville
    recipeId: 4,
    iconName: 'fish'
  },
  {
    id: 4,
    name: 'Marrakech',
    country: 'Maroc',
    coords: { latitude: 31.6295, longitude: -7.9811 }, // Marrakech
    recipeId: 2,
    iconName: 'mortar-pestle'
  },
  {
    id: 5,
    name: 'Dakar',
    country: 'Sénégal',
    coords: { latitude: 14.7167, longitude: -17.4677 }, // Dakar
    recipeId: 5,
    iconName: 'drumstick-bite'
  }
];

// Images de secours pour les recettes
const FALLBACK_IMAGES = {
  1: 'https://images.unsplash.com/photo-1471253387723-35c53c9f97ca', // Tiramisu
  2: 'https://images.unsplash.com/photo-1647974398528-9e186dfc96b6', // Tajine
  3: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85', // Ratatouille
  4: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a', // Paella
  5: 'https://images.unsplash.com/photo-1548340748-6d98e4ee1653'  // Poulet Yassa
};

// Style de carte personnalisé dans le thème de l'application
const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#e0ceb2"
      }
    ]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#fff9e9"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5d8c2"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e8d6bf"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9b18c"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
];

export default function WorldMapScreen() {
  const [regions, setRegions] = useState<Region[]>(INITIAL_REGIONS);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isRecipeReady, setIsRecipeReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const mapRef = useRef<MapView | null>(null);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      // Réinitialiser les animations
      fadeAnim.setValue(0);
      slideAnim.setValue(height);
      
      // Démarrer les animations d'entrée
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();

      // Simuler le chargement des détails de la recette
      setTimeout(() => {
        setIsRecipeReady(true);
      }, 800);
    }
  }, [modalVisible]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      console.log('Chargement des recettes depuis Supabase...');
      
      // Récupérer d'abord une recette pour voir les colonnes disponibles
      const { data: recipeColumns, error: columnsError } = await supabase
        .from('recipes')
        .select('*')
        .limit(1)
        .single();
      
      if (columnsError) {
        console.error('Erreur lors de la vérification des colonnes:', columnsError);
      } else {
        console.log('Colonnes disponibles dans la table recipes:', Object.keys(recipeColumns));
      }
      
      // Ensuite charger toutes les recettes avec les bonnes colonnes
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('*')
        .order('id');
      
      if (error) {
        console.error('Erreur lors du chargement des recettes:', error);
        return;
      }

      console.log('Recettes chargées:', recipes ? recipes.length : 0);
      
      if (recipes && recipes.length > 0) {
        // Créer un tableau temporaire
        const updatedRegions: Region[] = [];
        
        // Parcourir les régions initiales et ne garder que celles avec des recettes
        for (const region of INITIAL_REGIONS) {
          const matchingRecipe = recipes.find(recipe => recipe.id === region.recipeId);
          
          if (matchingRecipe) {
            console.log(`Recette trouvée pour ${region.name}:`, matchingRecipe);
            
            // Déterminer les bons noms de colonnes en fonction des données disponibles
            const imageUrl = matchingRecipe.image_url || matchingRecipe.image || null;
            
            // Ajouter la région avec sa recette
            updatedRegions.push({
              ...region,
              recipeTitle: matchingRecipe.title,
              description: matchingRecipe.description || 
                'Description à venir pour cette délicieuse recette traditionnelle. Explorez les saveurs uniques de cette région culinaire.',
              image: imageUrl || FALLBACK_IMAGES[region.recipeId as keyof typeof FALLBACK_IMAGES]
            });
          } else {
            console.log(`Aucune recette trouvée pour ${region.name}, ID: ${region.recipeId}`);
            // Ne pas ajouter les régions sans recette
          }
        }
        
        console.log(`${updatedRegions.length} régions avec recettes affichées sur la carte`);
        setRegions(updatedRegions);
      } else {
        // Si aucune recette n'est trouvée, afficher une liste vide
        setRegions([]);
      }
    } catch (error) {
      console.error('Exception lors du chargement des recettes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionPress = (region: Region) => {
    setSelectedRegion(region);
    setSelectedMarkerId(region.id);
    setModalVisible(true);
    setIsRecipeReady(false);
  };

  const navigateToRecipe = () => {
    if (selectedRegion) {
      setModalVisible(false);
      // Naviguer vers la page de détail de la recette
      setTimeout(() => {
        navigation.navigate('RecipeDetail', { 
          id: selectedRegion.recipeId,
          title: selectedRegion.recipeTitle
        });
      }, 300);
    }
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const flyToRegion = (region: Region) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: region.coords.latitude,
        longitude: region.coords.longitude,
        latitudeDelta: 10,
        longitudeDelta: 10
      }, 1500);

      // Sélectionner la région après un court délai
      setTimeout(() => {
        handleRegionPress(region);
      }, 1800);
    }
  };

  const initialRegion = {
    latitude: 30,
    longitude: 10,
    latitudeDelta: 70,
    longitudeDelta: 70
  };

  const renderMarker = (region: Region) => {
    const isSelected = selectedMarkerId === region.id;
    const markerSize = isSelected ? 60 : 50;
    const labelOpacity = isSelected ? 1 : 0.9;

    return (
      <View style={[styles.markerContainer, isSelected && styles.selectedMarkerContainer]}>
        <View 
          style={[
            styles.markerImageContainer, 
            isSelected && styles.selectedMarkerImageContainer,
            { width: markerSize, height: markerSize, borderRadius: markerSize / 2 }
          ]}
        >
          {region.image ? (
            <Image 
              source={{ uri: region.image }} 
              style={styles.markerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.markerIconContainer}>
              <FontAwesome5 
                name={region.iconName || 'utensils'} 
                size={isSelected ? 22 : 18} 
                color="#fff" 
              />
            </View>
          )}
        </View>
        <View style={[styles.markerLabelContainer, { opacity: labelOpacity }]}>
          <Text style={styles.markerLabel}>{region.name}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || 40 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.card} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carte du monde culinaire</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* Content */}
      <View style={styles.contentContainer}>
        <LinearGradient
          colors={['rgba(244, 231, 211, 0.8)', 'rgba(244, 231, 211, 0.4)']}
          style={styles.gradientOverlay}
        >
          <Text style={styles.subtitle}>
            Explorez les cuisines du monde entier et découvrez de nouvelles saveurs
          </Text>
        </LinearGradient>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Chargement de la carte...</Text>
          </View>
        ) : (
          <>
            {/* Carte interactive */}
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={initialRegion}
              customMapStyle={mapStyle}
              showsCompass={false}
              rotateEnabled={true}
              zoomEnabled={true}
              minZoomLevel={1}
            >
              {regions.map((region) => {
                // Utilisez une clé unique pour chaque marker qui inclut les coordonnées
                const markerKey = `marker-${region.id}-${region.coords.latitude}-${region.coords.longitude}`;
                return (
                  <Marker
                    key={markerKey}
                    coordinate={region.coords}
                    onPress={() => handleRegionPress(region)}
                    tracksViewChanges={Platform.OS !== 'android'}
                  >
                    {renderMarker(region)}
                  </Marker>
                );
              })}
            </MapView>

            {/* Légende */}
            <View style={styles.legendContainer}>
              <Text style={styles.legendTitle}>Régions culinaires</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {regions.map((region) => (
                  <TouchableOpacity
                    key={region.id}
                    style={styles.legendItem}
                    onPress={() => flyToRegion(region)}
                  >
                    <View style={styles.legendImageContainer}>
                      {region.image ? (
                        <Image 
                          source={{ uri: region.image }} 
                          style={styles.legendImage} 
                          resizeMode="cover"
                        />
                      ) : (
                        <LinearGradient
                          colors={[theme.colors.primary, theme.colors.accent]}
                          style={styles.legendIcon}
                        >
                          <FontAwesome5 
                            name={region.iconName || 'utensils'} 
                            size={14} 
                            color="#fff" 
                          />
                        </LinearGradient>
                      )}
                    </View>
                    <View>
                      <Text style={styles.legendName}>{region.name}</Text>
                      <Text style={styles.legendCountry}>{region.country}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.instructionBox}>
              <MaterialIcons name="touch-app" size={20} color={theme.colors.primary} />
              <Text style={styles.instructionText}>
                Touchez un marqueur sur la carte pour découvrir une recette
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Modal de présentation */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <BlurView intensity={90} tint="dark" style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {selectedRegion && (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeModal}
                  >
                    <Ionicons name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{selectedRegion.name}, {selectedRegion.country}</Text>
                  <View style={styles.modalHeaderRight} />
                </View>

                <View style={styles.recipeImageContainer}>
                  {selectedRegion.image ? (
                    <Image
                      source={{ uri: selectedRegion.image }}
                      style={styles.recipeImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.noImageContainer}>
                      <FontAwesome5 
                        name={selectedRegion.iconName || 'utensils'} 
                        size={40} 
                        color={theme.colors.primary} 
                      />
                    </View>
                  )}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.recipeImageOverlay}
                  >
                    <Text style={styles.recipeImageTitle}>
                      {selectedRegion.recipeTitle || 'Recette à découvrir'}
                    </Text>
                  </LinearGradient>
                </View>

                <ScrollView 
                  style={styles.modalBody}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.regionDescription}>
                    {selectedRegion.description || 'Chargement de la description...'}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      !isRecipeReady && styles.actionButtonDisabled
                    ]}
                    onPress={navigateToRecipe}
                    disabled={!isRecipeReady}
                  >
                    <LinearGradient
                      colors={isRecipeReady ? [theme.colors.primary, theme.colors.accent] : ['#CCCCCC', '#AAAAAA']}
                      style={styles.gradientButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isRecipeReady ? (
                        <Text style={styles.buttonText}>Découvrir la recette</Text>
                      ) : (
                        <View style={styles.buttonLoading}>
                          <ActivityIndicator size="small" color="#FFFFFF" />
                          <Text style={styles.buttonText}>Chargement...</Text>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </Animated.View>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: theme.colors.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: theme.colors.card,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  markerContainer: {
    alignItems: 'center',
    width: 80,
  },
  markerImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  markerIconContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerLabelContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  markerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  legendContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    margin: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 2,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
  },
  legendImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 8,
  },
  legendImage: {
    width: '100%',
    height: '100%',
  },
  legendIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  legendCountry: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  instructionBox: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 2,
  },
  instructionText: {
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.text,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  modalHeaderRight: {
    width: 40,
  },
  recipeImageContainer: {
    height: 220,
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  recipeImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  recipeImageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f5f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  regionDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
    marginBottom: 24,
  },
  actionButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  actionButtonDisabled: {
    opacity: 0.8,
  },
  gradientButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMarkerContainer: {
    zIndex: 999,
  },
  selectedMarkerImageContainer: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
}); 