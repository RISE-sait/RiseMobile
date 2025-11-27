import { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { AppState, AppStateStatus, Platform } from 'react-native';
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
  const coldStartHealthCheckDone = useRef(false);

  // Diagnostic logging - Environment check (print in release too)
  useEffect(() => {
    console.log('========================================');
    console.log('[NotificationManager] ENVIRONMENT CHECK');
    console.log('[NotificationManager] appOwnership:', Constants.appOwnership);
    console.log('[NotificationManager] isStandalone:', isStandalone);
    console.log('[NotificationManager] Platform:', Platform.OS);
    console.log('[NotificationManager] user?.token exists:', !!user?.token);
    console.log('========================================');
  }, [isStandalone, user?.token]);

  // Memoize the token getter to avoid recreating on every render
  const tokenGetter = useCallback(async () => {
    return await getValidToken();
  }, [getValidToken]);

  // Initialize notifications on login
  useEffect(() => {
    console.log('[NotificationManager] Init effect running');

    // Initialize in non-Expo Go environments (appOwnership !== 'expo') to avoid skipping dev client
    const shouldInit = Constants.appOwnership !== 'expo';
    if (!shouldInit) {
      console.log('[NotificationManager] Skipping setup in Expo Go environment');
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

          if (token) {
            console.log('[NotificationManager] Initialization successful');

            // Cold start health check after a delay
            if (!coldStartHealthCheckDone.current) {
              setTimeout(async () => {
                console.log('[NotificationManager] Running cold start health check');
                await notificationService.verifyAndReRegister();
                coldStartHealthCheckDone.current = true;
              }, 5000); // 5 seconds after initialization
            }
          } else {
            console.warn('[NotificationManager] Initialization completed but no token obtained');
          }
        }
      } catch (error) {
        console.warn('[NotificationManager] Initialization error:', error);
      }
    };

    initializeNotifications();
  }, [user?.token, isStandalone, tokenGetter]);

  // Re-check registration when app comes to foreground
  useEffect(() => {
    // Allow dev client to trigger foreground validation, only skip in Expo Go
    if (Constants.appOwnership === 'expo' || !user?.token) return;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // App came to foreground from background/inactive
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[NotificationManager] App came to foreground, running health check');
        try {
          const notificationService = NotificationService.getInstance();

          // Ensure token getter is set
          notificationService.setTokenGetter(tokenGetter);

          // Run health check which will re-register if needed
          const result = await notificationService.verifyAndReRegister();
          console.log('[NotificationManager] Foreground health check:', result.success ? 'success' : result.message);
        } catch (error) {
          console.warn('[NotificationManager] Foreground health check error:', error);
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
