import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Token spécifique pour les notifications
const EXPO_PUSH_TOKEN = 'HOsyBpHEPlSFaS0vRxwM7P';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Demander les permissions et obtenir le token
export async function registerForPushNotificationsAsync() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
  return EXPO_PUSH_TOKEN;
}

// Envoyer une notification locale
export async function sendLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: true,
    },
    trigger: null,
  });
}

// Envoyer une notification différée
export async function scheduleNotification(title: string, body: string, seconds: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: true,
    },
    trigger: null, // Notification immédiate
  });
} 