import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Constants from 'expo-constants';
import type { RootState } from '@/store';
import NotificationService from '@/app/services/notificationService';

const NotificationManager = () => {
  const user = useSelector((state: RootState) => state.user.data);
  const isStandalone = Constants.appOwnership === 'standalone';

  // ✅ Always call hooks before any conditional returns (React hooks rules)
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

        // Initialize notifications if user is logged in
        if (user?.token) {
          await notificationService.initialize(user.token);
        }
      } catch (error) {
        // Notification initialization failed silently
      }
    };

    initializeNotifications();
  }, [user?.token, isStandalone]); // Re-initialize when user token changes

  // Clean up push token on logout
  useEffect(() => {
    if (!isStandalone) return;

    if (!user?.token) {
      const notificationService = NotificationService.getInstance();
      notificationService.clearPushToken();
    }
  }, [user?.token, isStandalone]);

  return null; // This component doesn't render anything
};

export default NotificationManager;
