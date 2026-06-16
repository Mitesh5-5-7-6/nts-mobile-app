import * as Application from 'expo-application';
import { router } from 'expo-router';
import { Alert, Linking, Platform } from 'react-native';
import { apiClient } from '../api/client';
import { logger } from '../monitoring/logger';

interface VersionResponse {
  latestVersion: string;
  minimumVersion: string;
  forceUpdate: boolean;
  updateUrl?: string;
}

class VersionService {
  /**
   * Checks the backend to see if a force update is required
   */
  async checkAppVersion() {
    try {
      const response = await apiClient.get<VersionResponse>('/mobile/version');
      const { forceUpdate, updateUrl } = response.data;

      if (forceUpdate) {
        logger.info('Force update required');
        this.handleForceUpdate(updateUrl);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to check app version', error);
      return false;
    }
  }

  /**
   * Blocks the application and prompts the user to update
   */
  private handleForceUpdate(updateUrl?: string) {
    // Navigate to a dedicated blocking "Update Required" screen
    // This assumes you have created an app/(system)/update.tsx route
    router.replace({
      pathname: '/(system)/update' as any,
      params: { url: updateUrl }
    });

    // Alternatively, just show a blocking alert (less ideal but works as fallback)
    Alert.alert(
      'Update Required',
      'A new version of TiffinTrack is available. Please update to continue using the app.',
      [
        {
          text: 'Update Now',
          onPress: () => {
            if (updateUrl) {
              Linking.openURL(updateUrl);
            } else {
              // Default store links
              const storeUrl = Platform.OS === 'ios'
                ? 'itms-apps://itunes.apple.com/app/idYOUR_APP_ID'
                : 'market://details?id=YOUR_PACKAGE_NAME';
              Linking.openURL(storeUrl);
            }
          },
        },
      ],
      { cancelable: false }
    );
  }

  /**
   * Returns current version metadata
   */
  getVersionMetadata() {
    return {
      version: Application.nativeApplicationVersion || '1.0.0',
      build: Application.nativeBuildVersion || '1',
      // Determine channel based on expo release channels or environment
      channel: __DEV__ ? 'development' : 'production',
    };
  }
}

export const versionService = new VersionService();
