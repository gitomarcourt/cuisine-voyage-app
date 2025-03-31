import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Switch,
  SafeAreaView,
  PanResponder
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const SHEET_HEIGHT = height * 0.75;

interface RecipeCreationBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (recipeName: string, options: RecipeOptions) => void;
}

interface RecipeOptions {
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  allergies: string;
  excludedIngredients: string;
}

export default function RecipeCreationBottomSheet({
  visible,
  onClose,
  onSubmit
}: RecipeCreationBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [recipeName, setRecipeName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPersonnalisationExpanded, setIsPersonnalisationExpanded] = useState(false);
  
  // Options de la recette
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isDairyFree, setIsDairyFree] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [excludedIngredients, setExcludedIngredients] = useState('');
  
  // Animations
  const sheetAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  
  // Animation de l'expansion des options
  const personnalisationHeight = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      openSheet();
    } else {
      closeSheet();
    }
  }, [visible]);
  
  const resetForm = () => {
    setRecipeName('');
    setIsVegetarian(false);
    setIsVegan(false);
    setIsGlutenFree(false);
    setIsDairyFree(false);
    setAllergies('');
    setExcludedIngredients('');
    setIsPersonnalisationExpanded(false);
  };
  
  const openSheet = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(sheetAnim, {
        toValue: 0,
        tension: 70,
        friction: 12,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(sheetAnim, {
        toValue: SHEET_HEIGHT,
        tension: 70,
        friction: 12,
        useNativeDriver: true,
      })
    ]).start(() => {
      resetForm();
      onClose();
    });
  };
  
  const handleSubmit = () => {
    if (!recipeName.trim()) return;
    
    setIsGenerating(true);
    
    const options: RecipeOptions = {
      isVegetarian,
      isVegan,
      isGlutenFree,
      isDairyFree,
      allergies,
      excludedIngredients
    };
    
    // Simuler un petit délai pour montrer le chargement
    setTimeout(() => {
      onSubmit(recipeName, options);
      setIsGenerating(false);
      closeSheet();
    }, 500);
  };
  
  const togglePersonnalisation = () => {
    const finalValue = isPersonnalisationExpanded ? 0 : 350;
    
    setIsPersonnalisationExpanded(!isPersonnalisationExpanded);
    
    Animated.timing(personnalisationHeight, {
      toValue: finalValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
  // Configuration du PanResponder pour le geste de glissement
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dy: dragY }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          closeSheet();
        } else {
          Animated.spring(dragY, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const animatedSheetStyle = {
    transform: [
      {
        translateY: Animated.add(sheetAnim, dragY)
      }
    ]
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: backdropOpacity }
        ]}
      >
        <TouchableOpacity 
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={closeSheet}
        />
      </Animated.View>
      
      <Animated.View style={[styles.sheet, animatedSheetStyle]}>
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          <SafeAreaView style={styles.contentContainer}>
            {/* Barre de drag */}
            <View 
              {...panResponder.panHandlers}
              style={styles.dragHandleContainer}
            >
              <View style={styles.dragHandle} />
            </View>
            
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Créer une recette</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeSheet}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ flex: 1 }}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Nom de la recette */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleContainer}>
                    <MaterialIcons name="restaurant-menu" size={22} color={theme.colors.primary} />
                    <Text style={styles.sectionTitle}>QUELLE RECETTE VOULEZ-VOUS CRÉER ?</Text>
                  </View>
                  <Text style={styles.sectionDescription}>
                    Entrez le nom du plat que vous souhaitez créer
                  </Text>
                  
                  <View style={styles.inputContainer}>
                    <Ionicons name="fast-food-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={recipeName}
                      onChangeText={setRecipeName}
                      placeholder="Ex: Poulet au curry, Tiramisu..."
                      placeholderTextColor={theme.colors.textMuted}
                      maxLength={50}
                    />
                    {recipeName ? (
                      <TouchableOpacity 
                        style={styles.clearButton}
                        onPress={() => setRecipeName('')}
                      >
                        <Feather name="x-circle" size={16} color={theme.colors.textMuted} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
                
                {/* Préférences et contraintes - Section collapsible */}
                <View style={styles.section}>
                  <TouchableOpacity 
                    style={styles.collapsibleHeader}
                    onPress={togglePersonnalisation}
                    activeOpacity={0.7}
                  >
                    <View style={styles.sectionTitleContainer}>
                      <Ionicons name="options-outline" size={22} color={theme.colors.primary} />
                      <Text style={styles.sectionTitle}>PERSONNALISATION</Text>
                    </View>
                    <Ionicons 
                      name={isPersonnalisationExpanded ? "chevron-up" : "chevron-down"} 
                      size={22} 
                      color={theme.colors.primary} 
                    />
                  </TouchableOpacity>
                  
                  <Animated.View style={{ height: personnalisationHeight, overflow: 'hidden' }}>
                    <View style={styles.collapsibleContent}>
                      {/* Contraintes diététiques */}
                      <View style={styles.optionTitleContainer}>
                        <Ionicons name="leaf-outline" size={18} color={theme.colors.text} />
                        <Text style={styles.optionSectionTitle}>Contraintes diététiques</Text>
                      </View>
                      
                      <View style={styles.optionsGrid}>
                        <View 
                          style={[
                            styles.switchContainer,
                            isVegetarian && styles.activeSwitchContainer
                          ]}
                        >
                          <View style={styles.switchLabelContainer}>
                            <Ionicons 
                              name="leaf" 
                              size={16} 
                              color={isVegetarian ? "#fff" : theme.colors.primary} 
                              style={styles.optionIcon} 
                            />
                            <Text 
                              style={[
                                styles.switchLabel,
                                isVegetarian && styles.activeSwitchLabel
                              ]}
                            >
                              Végétarien
                            </Text>
                          </View>
                          <Switch
                            value={isVegetarian}
                            onValueChange={setIsVegetarian}
                            thumbColor={isVegetarian ? theme.colors.primary : "#f4f3f4"}
                            trackColor={{ 
                              false: "#E0E0E0", 
                              true: `${theme.colors.primary}50` 
                            }}
                            style={styles.switch}
                          />
                        </View>
                        
                        <View 
                          style={[
                            styles.switchContainer,
                            isVegan && styles.activeSwitchContainer
                          ]}
                        >
                          <View style={styles.switchLabelContainer}>
                            <Ionicons 
                              name="leaf" 
                              size={16} 
                              color={isVegan ? "#fff" : theme.colors.primary} 
                              style={styles.optionIcon} 
                            />
                            <Text 
                              style={[
                                styles.switchLabel,
                                isVegan && styles.activeSwitchLabel
                              ]}
                            >
                              Végan
                            </Text>
                          </View>
                          <Switch
                            value={isVegan}
                            onValueChange={setIsVegan}
                            thumbColor={isVegan ? theme.colors.primary : "#f4f3f4"}
                            trackColor={{ 
                              false: "#E0E0E0", 
                              true: `${theme.colors.primary}50` 
                            }}
                            style={styles.switch}
                          />
                        </View>
                        
                        <View 
                          style={[
                            styles.switchContainer,
                            isGlutenFree && styles.activeSwitchContainer
                          ]}
                        >
                          <View style={styles.switchLabelContainer}>
                            <Ionicons 
                              name="nutrition-outline" 
                              size={16} 
                              color={isGlutenFree ? "#fff" : theme.colors.primary} 
                              style={styles.optionIcon} 
                            />
                            <Text 
                              style={[
                                styles.switchLabel,
                                isGlutenFree && styles.activeSwitchLabel
                              ]}
                            >
                              Sans gluten
                            </Text>
                          </View>
                          <Switch
                            value={isGlutenFree}
                            onValueChange={setIsGlutenFree}
                            thumbColor={isGlutenFree ? theme.colors.primary : "#f4f3f4"}
                            trackColor={{ 
                              false: "#E0E0E0", 
                              true: `${theme.colors.primary}50` 
                            }}
                            style={styles.switch}
                          />
                        </View>
                        
                        <View 
                          style={[
                            styles.switchContainer,
                            isDairyFree && styles.activeSwitchContainer
                          ]}
                        >
                          <View style={styles.switchLabelContainer}>
                            <Ionicons 
                              name="water-outline" 
                              size={16} 
                              color={isDairyFree ? "#fff" : theme.colors.primary} 
                              style={styles.optionIcon} 
                            />
                            <Text 
                              style={[
                                styles.switchLabel,
                                isDairyFree && styles.activeSwitchLabel
                              ]}
                            >
                              Sans lactose
                            </Text>
                          </View>
                          <Switch
                            value={isDairyFree}
                            onValueChange={setIsDairyFree}
                            thumbColor={isDairyFree ? theme.colors.primary : "#f4f3f4"}
                            trackColor={{ 
                              false: "#E0E0E0", 
                              true: `${theme.colors.primary}50` 
                            }}
                            style={styles.switch}
                          />
                        </View>
                      </View>
                      
                      <View style={styles.optionTitleContainer}>
                        <Ionicons name="alert-circle-outline" size={18} color={theme.colors.text} />
                        <Text style={styles.optionSectionTitle}>Allergies et restrictions</Text>
                      </View>
                      
                      <View style={styles.inputContainer}>
                        <Ionicons name="medkit-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          value={allergies}
                          onChangeText={setAllergies}
                          placeholder="Arachides, fruits de mer..."
                          placeholderTextColor={theme.colors.textMuted}
                        />
                        {allergies ? (
                          <TouchableOpacity 
                            style={styles.clearButton}
                            onPress={() => setAllergies('')}
                          >
                            <Feather name="x-circle" size={16} color={theme.colors.textMuted} />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                      
                      <View style={styles.optionTitleContainer}>
                        <Ionicons name="close-circle-outline" size={18} color={theme.colors.text} />
                        <Text style={styles.optionSectionTitle}>Ingrédients à exclure</Text>
                      </View>
                      
                      <View style={styles.inputContainer}>
                        <Ionicons name="remove-circle-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          value={excludedIngredients}
                          onChangeText={setExcludedIngredients}
                          placeholder="Coriandre, aubergine..."
                          placeholderTextColor={theme.colors.textMuted}
                        />
                        {excludedIngredients ? (
                          <TouchableOpacity 
                            style={styles.clearButton}
                            onPress={() => setExcludedIngredients('')}
                          >
                            <Feather name="x-circle" size={16} color={theme.colors.textMuted} />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  </Animated.View>
                </View>
                
                {/* Bouton de génération */}
                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    (!recipeName.trim() || isGenerating) && styles.disabledButton,
                  ]}
                  onPress={handleSubmit}
                  disabled={!recipeName.trim() || isGenerating}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.generateButtonGradient}
                  >
                    {isGenerating ? (
                      <View style={styles.generatingContainer}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.generatingText}>
                          Génération en cours...
                        </Text>
                      </View>
                    ) : (
                      <>
                        <Text style={styles.generateButtonText}>
                          Générer ma recette
                        </Text>
                        <MaterialIcons name="restaurant" size={24} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  dragHandleContainer: {
    width: '100%',
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 248, 248, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  inputIcon: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  clearButton: {
    paddingHorizontal: 12,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collapsibleContent: {
    marginTop: 16,
  },
  optionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  optionSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  switchContainer: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(248, 248, 248, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  activeSwitchContainer: {
    backgroundColor: theme.colors.primary,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 6,
  },
  switchLabel: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500',
  },
  activeSwitchLabel: {
    color: '#fff',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  generatingText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
}); 