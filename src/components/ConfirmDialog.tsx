import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmType?: 'primary' | 'success' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  icon?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmType = 'primary',
  onConfirm,
  onCancel,
  icon
}) => {
  const insets = useSafeAreaInsets();
  const scale = React.useRef(new Animated.Value(0.9)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;
  
  const confirmButtonColors = {
    primary: theme.colors.primary,
    success: '#4CAF50',
    danger: '#F44336'
  };

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { paddingBottom: insets.bottom }]}
      >
        <TouchableWithoutFeedback onPress={onCancel}>
          <Animated.View style={[
            styles.overlay,
            { opacity }
          ]}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.dialogContainer,
                  {
                    transform: [{ scale }]
                  }
                ]}
              >
                <BlurView intensity={40} tint="light" style={styles.blurContainer}>
                  <View style={styles.header}>
                    {icon && (
                      <View style={styles.iconContainer}>
                        <Ionicons name={icon as any} size={28} color={theme.colors.primary} />
                      </View>
                    )}
                    <Text style={styles.title}>{title}</Text>
                  </View>
                  
                  <View style={styles.content}>
                    <Text style={styles.message}>{message}</Text>
                  </View>
                  
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={onCancel}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelButtonText}>{cancelText}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.confirmButton,
                        { backgroundColor: confirmButtonColors[confirmType] }
                      ]}
                      onPress={onConfirm}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.confirmButtonText}>{confirmText}</Text>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Contexte pour gérer les dialogues de confirmation
interface ConfirmDialogContextProps {
  showConfirmDialog: (params: Omit<ConfirmDialogProps, 'visible' | 'onConfirm' | 'onCancel'> & {
    onConfirm: () => void;
    onCancel?: () => void;
  }) => void;
  hideConfirmDialog: () => void;
}

const ConfirmDialogContext = React.createContext<ConfirmDialogContextProps | undefined>(undefined);

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogProps, setDialogProps] = React.useState<ConfirmDialogProps>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showConfirmDialog = (params: Omit<ConfirmDialogProps, 'visible' | 'onConfirm' | 'onCancel'> & {
    onConfirm: () => void;
    onCancel?: () => void;
  }) => {
    const onCancelFn = params.onCancel || (() => {});
    
    setDialogProps({
      ...params,
      visible: true,
      onConfirm: () => {
        params.onConfirm();
        hideConfirmDialog();
      },
      onCancel: () => {
        onCancelFn();
        hideConfirmDialog();
      }
    });
  };

  const hideConfirmDialog = () => {
    setDialogProps(prev => ({ ...prev, visible: false }));
  };

  return (
    <ConfirmDialogContext.Provider value={{ showConfirmDialog, hideConfirmDialog }}>
      {children}
      <ConfirmDialog
        {...dialogProps}
      />
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirmDialog = () => {
  const context = React.useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialogContainer: {
    width: width - 64,
    maxWidth: 400,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.large,
  },
  blurContainer: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(211, 197, 184, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  message: {
    fontSize: 16,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(211, 197, 184, 0.3)',
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(211, 197, 184, 0.3)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textLight,
  },
  confirmButton: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
}); 