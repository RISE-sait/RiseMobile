import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import NotificationService from '@/app/services/notificationService';

const NotificationManager = () => {
  const user = useSelector((state: RootState) => state.user.data);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const notificationService = NotificationService.getInstance();

        // Initialize notifications if user is logged in
        if (user?.token) {
          const pushToken = await notificationService.initialize(user.token);

          if (pushToken) {
          } else {
            console.warn('⚠️ Push notifications initialization failed');
          }
        }
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, [user?.token]); // Re-initialize when user token changes

  // Clean up push token on logout
  useEffect(() => {
    if (!user?.token) {
      const notificationService = NotificationService.getInstance();
      notificationService.clearPushToken();
    }
  }, [user?.token]);

  return null; // This component doesn't render anything
};

export default NotificationManager;