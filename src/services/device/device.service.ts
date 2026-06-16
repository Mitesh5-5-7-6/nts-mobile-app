import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

class DeviceService {
  /**
   * Collects comprehensive device information
   */
  async getDeviceInfo() {
    return {
      deviceName: Device.deviceName || 'unknown',
      model: Device.modelName || 'unknown',
      osVersion: Device.osVersion || 'unknown',
      appVersion: Application.nativeApplicationVersion || 'unknown',
      buildNumber: Application.nativeBuildVersion || 'unknown',
      manufacturer: Device.manufacturer || 'unknown',
      uniqueDeviceId: await this.getUniqueId(),
      platform: Platform.OS,
      isTablet: await DeviceInfo.isTablet(),
      isEmulator: !Device.isDevice,
    };
  }

  /**
   * Safely fetches a unique device ID across platforms
   */
  async getUniqueId(): Promise<string> {
    try {
      if (Platform.OS === 'android') {
        return Application.getAndroidId() || await DeviceInfo.getUniqueId();
      } else {
        const iosId = await Application.getIosIdForVendorAsync();
        return iosId || await DeviceInfo.getUniqueId();
      }
    } catch (e) {
      return await DeviceInfo.getUniqueId();
    }
  }
}

export const deviceService = new DeviceService();
