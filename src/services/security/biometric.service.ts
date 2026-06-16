import * as LocalAuthentication from 'expo-local-authentication';

export class BiometricService {
  /**
   * Checks if biometric hardware is available and enrolled.
   */
  static async isBiometricAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  }

  /**
   * Prompts the user for biometric authentication.
   */
  static async authenticate(promptMessage: string = 'Unlock TiffinTrack'): Promise<boolean> {
    const isAvailable = await this.isBiometricAvailable();
    if (!isAvailable) {
      // If hardware isn't available or no biometrics enrolled, we might want to fallback to true 
      // or handle it differently based on strict security requirements. 
      // Assuming if they enable it, they must have it enrolled. If they lose enrollment, we fail open or closed?
      // Typically, fail closed (false) if strict, but if not available, returning false might lock them out.
      // Returning false for now to enforce biometric if enabled.
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use Passcode',
      disableDeviceFallback: false, // allows device PIN if biometric fails
    });

    return result.success;
  }
}
