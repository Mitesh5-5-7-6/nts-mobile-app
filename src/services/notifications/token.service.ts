import messaging from '@react-native-firebase/messaging';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { apiClient } from '../api/client';
import { logger } from '../monitoring/logger';

class TokenService {
  /**
   * Generates FCM token and sends it to the backend.
   * Should be called on first login or when token refreshes.
   */
  async registerDevice(userId: string) {
    try {
      // Get the device token
      const fcmToken = await messaging().getToken();
      if (!fcmToken) {
        logger.warn('Failed to get FCM token during device registration');
        return;
      }

      const deviceId = Platform.OS === 'android' ? Application.getAndroidId() : (await Application.getIosIdForVendorAsync());

      const payload = {
        deviceId: deviceId || 'unknown',
        fcmToken,
        platform: Platform.OS,
        appVersion: Application.nativeApplicationVersion || 'unknown',
      };

      logger.debug('Registering device token', { payload, userId });

      // Send token to backend
      await apiClient.post('/notifications/register-device', payload);

      logger.info('Device successfully registered for push notifications');
    } catch (error) {
      logger.error('Failed to register device for push notifications', error);
    }
  }

  /**
   * Listen for FCM token refreshes
   */
  setupTokenRefreshListener(userId: string) {
    return messaging().onTokenRefresh(async (fcmToken) => {
      logger.info('FCM Token Refreshed, updating backend...');
      try {
        const deviceId = Platform.OS === 'android' ? Application.getAndroidId() : (await Application.getIosIdForVendorAsync());

        const payload = {
          deviceId: deviceId || 'unknown',
          fcmToken,
          platform: Platform.OS,
          appVersion: Application.nativeApplicationVersion || 'unknown',
        };

        await apiClient.post('/notifications/register-device', payload);
      } catch (error) {
        logger.error('Failed to sync refreshed FCM token to backend', error);
      }
    });
  }
}

export const tokenService = new TokenService();
