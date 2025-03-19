export const theme = {
  colors: {
    primary: '#FF6B35', // Orange chaud
    primaryLight: '#FF8C61',
    primaryDark: '#E85826',
    secondary: '#2A9D8F', // Turquoise profond
    secondaryLight: '#40B5A7',
    secondaryDark: '#1E7D73',
    accent: '#F9C74F', // Jaune doré
    accentLight: '#FFDD87',
    accentDark: '#E5A929',
    background: '#FFF9F2', // Fond crème chaud
    card: '#FFFFFF',
    text: '#432818', // Brun chocolat
    textLight: '#795548',
    textMuted: '#9C8579',
    success: '#43AA8B',
    error: '#F94144',
    warning: '#F8961E',
    info: '#277DA1',
    overlay: 'rgba(67, 40, 24, 0.5)', // Pour les overlays et blurs
    border: '#dfe6e9', // Ajout de la propriété border
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 28,
    full: 9999,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  typography: {
    heading: {
      fontFamily: 'serif', // Vous pourrez remplacer par une police personnalisée
      fontWeight: 'bold' as const,
    },
    body: {
      fontFamily: 'sans-serif', // Vous pourrez remplacer par une police personnalisée
    },
    accent: {
      fontFamily: 'sans-serif', // Pour une police manuscrite ou décorative
      fontStyle: 'italic' as const,
    },
  },
}; 