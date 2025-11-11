import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { API_URL } from '@/utils/api';

// Check if we're running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Only configure notification handler if not in Expo Go on Android
// (Expo Go on Android doesn't support push notifications in SDK 53+)
if (!isExpoGo || Platform.OS !== 'android') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.warn('Failed to set notification handler:', error);
  }
}

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  type?: string;
  team_id?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize push notifications and register device
   */
  async initialize(userToken?: string): Promise<string | null> {
    try {
      // Check if running in Expo Go on Android (not supported in SDK 53+)
      if (isExpoGo && Platform.OS === 'android') {
        console.warn('⚠️ Push notifications are not supported in Expo Go on Android. Use a development build instead.');
        return null;
      }

      // Check if we're on a physical device
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return null;
      }

      // Get existing permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permission not granted');
        return null;
      }

      // Get the Expo push token
      const expoPushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID || undefined
      });

      this.expoPushToken = expoPushTokenData.data;

      // Register the device with your backend if user token is provided
      if (userToken && this.expoPushToken) {
        await this.registerDevice(userToken);
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      return this.expoPushToken;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return null;
    }
  }

  /**
   * Register device with backend
   */
  async registerDevice(userToken: string): Promise<boolean> {
    try {
      if (!this.expoPushToken) {
        console.warn('No Expo push token available');
        return false;
      }

      const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';

      const response = await fetch(`${API_URL}/secure/notifications/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_type: deviceType,
          expo_push_token: this.expoPushToken,
        }),
      });

      if (response.ok) {
        return true;
      } else {
        console.error('Failed to register device:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error registering device:', error);
      return false;
    }
  }

  /**
   * Send notification (typically called from backend, but included for completeness)
   */
  async sendNotification(
    userToken: string,
    notificationData: NotificationData
  ): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/secure/notifications/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      if (response.ok) {
        return true;
      } else {
        console.error('Failed to send notification:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Set up notification listeners
   */
  private setupNotificationListeners(): void {
    // Handle notification received while app is foregrounded
    Notifications.addNotificationReceivedListener((notification) => {
      // You can add custom handling here (e.g., update UI, show custom alert)
    });

    // Handle notification tapped/opened
    Notifications.addNotificationResponseReceivedListener((response) => {

      const data = response.notification.request.content.data;

      // Handle different notification types
      if (data?.type === 'practice_booked' || data?.type === 'game_booked') {
        // Navigate to specific screen based on notification data
        this.handleTeamNotification(data);
      }
    });
  }

  /**
   * Handle team-related notifications (practice/game bookings)
   */
  private handleTeamNotification(data: any): void {
    // You can add navigation logic here
    // For example, navigate to team calendar or specific event

    // Example: Navigate to calendar or team page
    // router.push(`/calendar?team_id=${data.team_id}`);
  }

  /**
   * Get current push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Clear stored push token (useful for logout)
   */
  clearPushToken(): void {
    this.expoPushToken = null;
  }
}

export default NotificationService;