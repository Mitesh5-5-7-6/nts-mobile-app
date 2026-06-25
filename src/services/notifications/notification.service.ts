import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { logger } from '../monitoring/logger';
import { handleNotificationOpen } from './handlers';

class NotificationService {
  /**
   * Initializes notification channels and handlers
   */
  async initialize() {
    // @react-native-firebase/messaging is a native-only SDK. On web there is no
    // native Firebase app, so calling messaging() throws
    // "No Firebase App '[DEFAULT]' has been created". Push notifications are not
    // supported on web in this app, so skip initialization entirely.
    if (Platform.OS === 'web') {
      logger.debug('Push notifications are not supported on web; skipping init');
      return;
    }

    try {
      // Request permissions
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        logger.warn('Push notification permissions not granted');
        return;
      }

      // Configure Expo Notifications for local presentation of FCM messages in foreground
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      this.setupHandlers();
      logger.info('Push notification service initialized');
    } catch (error) {
      logger.error('Failed to initialize push notifications', error);
    }
  }

  private setupHandlers() {
    // 1. Foreground message handler
    messaging().onMessage(async remoteMessage => {
      logger.debug('Received foreground message', remoteMessage);
      // Let Expo Notifications show it, or handle custom in-app UI
    });

    // 2. Background / Killed state message handler is typically registered outside of component tree 
    // Usually in index.js, but we set it up here if called early enough
    // messaging().setBackgroundMessageHandler(async remoteMessage => {
    //   logger.debug('Message handled in the background!', remoteMessage);
    // });

    // 3. User taps on notification (App is in background)
    messaging().onNotificationOpenedApp(remoteMessage => {
      logger.debug('Notification caused app to open from background state', remoteMessage);
      handleNotificationOpen(remoteMessage);
    });

    // 4. User taps on notification (App was completely killed)
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        logger.debug('Notification caused app to open from quit state', remoteMessage);
        handleNotificationOpen(remoteMessage);
      }
    });
  }
}

export const notificationService = new NotificationService();
