import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { BiometricService } from '../services/security/biometric.service';
import {
  getIsBiometricEnabled,
  getBiometricTimeoutMinutes,
  getLastBackgroundTime,
  setLastBackgroundTime,
  clearLastBackgroundTime,
} from '../storage/biometric.storage';

export const useSessionLock = () => {
  const [isLocked, setIsLocked] = useState(false);
  const appState = useRef(AppState.currentState);

  const handleAppForeground = async () => {
    const isBiometricEnabled = getIsBiometricEnabled();
    if (!isBiometricEnabled) {
      return;
    }

    const lastBackgroundTime = getLastBackgroundTime();
    if (!lastBackgroundTime) {
      // If no background time is recorded, we don't lock.
      // This happens on fresh start if we didn't explicitly set it.
      // We will handle fresh start locking in the app entry point.
      return;
    }

    const timeoutMinutes = getBiometricTimeoutMinutes();
    const now = Date.now();
    const timePassedMs = now - lastBackgroundTime;
    const timeoutMs = timeoutMinutes * 60 * 1000;

    if (timePassedMs >= timeoutMs) {
      setIsLocked(true);
      const success = await BiometricService.authenticate('Unlock TiffinTrack');
      if (success) {
        setIsLocked(false);
        clearLastBackgroundTime();
      } else {
        // Stay locked. The UI should render a lock screen with a button to retry
      }
    } else {
      clearLastBackgroundTime();
    }
  };

  const handleAppBackground = () => {
    setLastBackgroundTime(Date.now());
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        handleAppForeground();
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        handleAppBackground();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const retryUnlock = async () => {
    const success = await BiometricService.authenticate('Unlock TiffinTrack');
    if (success) {
      setIsLocked(false);
      clearLastBackgroundTime();
    }
  };

  return {
    isLocked,
    retryUnlock,
  };
};
