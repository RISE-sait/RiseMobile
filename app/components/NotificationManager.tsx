import { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { AppState, AppStateStatus } from 'react-native';
import Constants from 'expo-constants';
import type { RootState } from '@/store';
import NotificationService from '@/app/services/notificationService';
import { useAuth } from '@/utils/auth';

const NotificationManager = () => {
  const user = useSelector((state: RootState) => state.user.data);
  const isStandalone = Constants.appOwnership === 'standalone';
  const { getValidToken } = useAuth();
  const appState = useRef(AppState.currentState);
  const hasInitialized = useRef(false);

  // Memoize the token getter to avoid recreating on every render
  const tokenGetter = useCallback(async () => {
    return await getValidToken();
  }, [getValidToken]);

  // Initialize notifications on login
  useEffect(() => {
    if (!isStandalone) {
      if (__DEV__) {
        console.log('[NotificationManager] Skipping setup in non-standalone environment')
      }
      return;
    }

    const initializeNotifications = async () => {
      try {
        const notificationService = NotificationService.getInstance();

        // Set up the token getter for fresh tokens
        notificationService.setTokenGetter(tokenGetter);

        // Initialize notifications if user is logged in
        if (user?.token) {
          const token = await notificationService.initialize(user.token);
          hasInitialized.current = true;
          if (__DEV__) {
            if (token) {
              console.log('[NotificationManager] Initialization successful');
            } else {
              console.warn('[NotificationManager] Initialization completed but no token obtained');
            }
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('[NotificationManager] Initialization error:', error);
        }
      }
    };

    initializeNotifications();
  }, [user?.token, isStandalone, tokenGetter]);

  // Re-check registration when app comes to foreground
  useEffect(() => {
    if (!isStandalone || !user?.token) return;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // App came to foreground from background/inactive
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        try {
          const notificationService = NotificationService.getInstance();

          // Ensure token getter is set
          notificationService.setTokenGetter(tokenGetter);

          // If not registered, try to register again
          if (!notificationService.isDeviceRegistered()) {
            // Re-initialize to get push token if needed, then register
            if (!notificationService.getPushToken()) {
              await notificationService.initialize(user.token);
            } else {
              const registered = await notificationService.ensureRegistered();
              if (__DEV__) {
                console.log('[NotificationManager] Foreground registration check:', registered ? 'success' : 'failed');
              }
            }
          }
        } catch (error) {
          if (__DEV__) {
            console.warn('[NotificationManager] Foreground registration error:', error);
          }
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user?.token, isStandalone, tokenGetter]);

  // Clean up push token on logout
  useEffect(() => {
    if (!isStandalone) return;

    if (!user?.token) {
      const cleanup = async () => {
        const notificationService = NotificationService.getInstance();
        await notificationService.clearPushToken();
        hasInitialized.current = false;
      };
      cleanup();
    }
  }, [user?.token, isStandalone]);

  return null; // This component doesn't render anything
};

export default NotificationManager;
