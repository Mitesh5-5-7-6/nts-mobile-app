import { router } from 'expo-router';
import { logger } from '../monitoring/logger';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export const handleNotificationOpen = (message: FirebaseMessagingTypes.RemoteMessage) => {
  logger.info('Notification opened:', message);
  
  const data = message.data;
  if (!data) return;

  // Extract navigation target from data payload
  const { type, targetId } = data;

  switch (type) {
    case 'PAYMENT_RECEIVED':
    case 'PENDING_PAYMENT_REMINDER':
      if (targetId) {
        // Deep link to specific payment or customer screen
        // Example: router.push(`/payments/${targetId}`);
        logger.debug('Routing to payment:', targetId);
      } else {
        router.push('/(tabs)/payments');
      }
      break;

    case 'EXPENSE_ADDED':
      if (targetId) {
        // Example: router.push(`/expenses/${targetId}`);
        logger.debug('Routing to expense:', targetId);
      } else {
        router.push('/(tabs)/expenses');
      }
      break;

    case 'DAILY_SUMMARY':
    case 'MONTH_CLOSING_REMINDER':
    case 'YEAR_CLOSING_REMINDER':
      router.push('/(tabs)/reports');
      break;

    case 'LOW_BALANCE_ALERT':
      // Route to dashboard or specific customer depending on logic
      router.push('/(tabs)/dashboard');
      break;

    case 'SYSTEM_UPDATE':
      // Show an alert or route to settings
      logger.info('System update notification received');
      break;

    default:
      logger.warn('Unknown notification type:', type);
      break;
  }
};
