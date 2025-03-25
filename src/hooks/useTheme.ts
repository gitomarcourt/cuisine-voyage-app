import { useColorScheme } from 'react-native';

interface Colors {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  success: string;
}

const lightColors: Colors = {
  primary: '#FF6B6B',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#212529',
  border: '#DEE2E6',
  success: '#51CF66',
};

const darkColors: Colors = {
  primary: '#FF6B6B',
  background: '#212529',
  card: '#343A40',
  text: '#F8F9FA',
  border: '#495057',
  success: '#51CF66',
};

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
  };
}; 