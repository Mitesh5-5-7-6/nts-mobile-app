import analytics from '@react-native-firebase/analytics';
import { AnalyticsEventName, ScreenName } from './events';
import { logger } from '../monitoring/logger';

class AnalyticsService {
  /**
   * Tracks a predefined business event.
   */
  async trackEvent(eventName: AnalyticsEventName, params?: Record<string, any>) {
    try {
      await analytics().logEvent(eventName, params);
      logger.debug(`Analytics Event Tracked: ${eventName}`, params);
    } catch (error) {
      logger.error(`Failed to track event ${eventName}`, error);
    }
  }

  /**
   * Tracks a custom action not covered by predefined business events.
   */
  async trackAction(actionName: string, params?: Record<string, any>) {
    try {
      // Firebase event names can only contain alphanumeric characters and underscores
      const safeName = actionName.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 40);
      await analytics().logEvent(safeName, params);
      logger.debug(`Analytics Action Tracked: ${safeName}`, params);
    } catch (error) {
      logger.error(`Failed to track action ${actionName}`, error);
    }
  }

  /**
   * Tracks screen views. Usually hooked into navigation state changes.
   */
  async trackScreen(screenName: ScreenName | string, screenClass?: string) {
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
      logger.debug(`Analytics Screen Tracked: ${screenName}`);
    } catch (error) {
      logger.error(`Failed to track screen ${screenName}`, error);
    }
  }

  /**
   * Tracks non-fatal errors for analytics dashboarding.
   */
  async trackError(errorName: string, errorMessage: string, params?: Record<string, any>) {
    try {
      await analytics().logEvent('app_error', {
        error_name: errorName,
        error_message: errorMessage,
        ...params,
      });
      logger.debug(`Analytics Error Tracked: ${errorName}`);
    } catch (error) {
      logger.error(`Failed to track error ${errorName}`, error);
    }
  }

  /**
   * Sets the user ID for analytics.
   */
  async setUserId(userId: string) {
    try {
      await analytics().setUserId(userId);
      logger.debug(`Analytics UserId Set: ${userId}`);
    } catch (error) {
      logger.error(`Failed to set analytics user ID`, error);
    }
  }

  /**
   * Sets user properties (e.g., subscription type, account role).
   */
  async setUserProperties(properties: Record<string, string>) {
    try {
      // Firebase requires properties to be strings
      await analytics().setUserProperties(properties);
      logger.debug(`Analytics User Properties Set`, properties);
    } catch (error) {
      logger.error(`Failed to set analytics user properties`, error);
    }
  }
}

export const analyticsService = new AnalyticsService();
