import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import 'react-native-url-polyfill/auto';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ToastProvider } from './src/components/Toast';
import { ConfirmDialogProvider } from './src/components/ConfirmDialog';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthProvider>
          <ToastProvider>
            <ConfirmDialogProvider>
              <StatusBar style="dark" />
              <AppNavigator />
            </ConfirmDialogProvider>
          </ToastProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
