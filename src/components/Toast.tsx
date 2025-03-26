import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  Dimensions,
  ImageSourcePropType 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  type?: ToastType;
  message: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  type = 'info',
  message,
  description,
  duration = 3000,
  onClose,
  action
}) => {
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = React.useState(visible);
  
  const hideTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const iconConfig = {
    success: { name: 'checkmark-circle', color: '#4CAF50' },
    error: { name: 'close-circle', color: '#F44336' },
    info: { name: 'information-circle', color: '#2196F3' },
    warning: { name: 'warning', color: '#FF9800' }
  };
  
  const icon = iconConfig[type];

  React.useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
      if (duration && duration > 0 && !action) {
        if (hideTimeout.current) {
          clearTimeout(hideTimeout.current);
        }
        
        hideTimeout.current = setTimeout(() => {
          handleClose();
        }, duration);
      }
    } else {
      handleClose();
    }
    
    return () => {
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, [visible]);
  
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    });
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity
        }
      ]}
    >
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <View style={styles.content}>
          <Ionicons name={icon.name as any} size={24} color={icon.color} style={styles.icon} />
          
          <View style={styles.textContainer}>
            <Text style={styles.message}>{message}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
          </View>
          
          {action ? (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleClose}
              hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
            >
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </Animated.View>
  );
};

// Composant de contexte pour gérer les toasts dans toute l'application
interface ToastContextProps {
  showToast: (params: Omit<ToastProps, 'visible'>) => void;
  hideToast: () => void;
}

const ToastContext = React.createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = React.useState<ToastProps & { visible: boolean }>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = (params: Omit<ToastProps, 'visible'>) => {
    setToast({ ...params, visible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        description={toast.description}
        duration={toast.duration}
        onClose={hideToast}
        action={toast.action}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
    ...theme.shadows.medium,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  blurContainer: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  content: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(211, 197, 184, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  actionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    marginLeft: theme.spacing.sm,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  }
}); 