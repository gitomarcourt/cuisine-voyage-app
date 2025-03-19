// Définition des types pour la typographie
type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

export const theme = {
  colors: {
    primary: '#8B5A2B',       // Marron chocolat
    primaryLight: '#FF8C61',
    primaryDark: '#E85826',
    secondary: '#D2B48C',     // Tan/Beige
    secondaryLight: '#40B5A7',
    secondaryDark: '#1E7D73',
    accent: '#A0522D',        // Sienna (marron rougeâtre)
    accentLight: '#FFDD87',
    accentDark: '#E5A929',
    background: '#FAF3E0',    // Crème très légère
    card: '#FFF8E7',          // Crème plus claire
    text: '#3A271B',          // Marron foncé pour le texte
    textLight: '#6B4932',     // Marron moyen pour texte secondaire
    textMuted: '#9C8579',
    success: '#2E8B57',       // Vert foncé
    error: '#F94144',
    warning: '#CD853F',       // Peru (orangé-marron)
    info: '#277DA1',
    placeholder: '#D3C5B8',   // Beige grisâtre
    overlay: 'rgba(58, 39, 27, 0.7)', // Overlay marron semi-transparent
    white: '#FFFFFF',
    black: '#000000',
    danger: '#B22222',        // Rouge foncé
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
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  typography: {
    heading: {
      fontFamily: 'System',
      fontWeight: 'bold' as FontWeight,
    },
    subheading: {
      fontFamily: 'System',
      fontWeight: '600' as FontWeight,
    },
    body: {
      fontFamily: 'System',
      fontWeight: 'normal' as FontWeight,
    },
    accent: {
      fontFamily: 'sans-serif', // Pour une police manuscrite ou décorative
      fontStyle: 'italic' as const,
    },
  },
}; 