import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/utils/api';

// Storage keys for persistence
const STORAGE_KEYS = {
  REGISTRATION_STATUS: 'notification_registration_status',
  LAST_REGISTERED_TOKEN: 'notification_last_registered_token',
  RETRY_COUNT: 'notification_retry_count',
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 2000; // 2 seconds

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
    // Failed to set notification handler
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
  private isRegistered: boolean = false;
  private tokenGetter: (() => Promise<string | null>) | null = null;

  private constructor() {
    // Load registration status from storage on init
    this.loadRegistrationStatus();
  }

  /**
   * Load registration status from AsyncStorage
   */
  private async loadRegistrationStatus(): Promise<void> {
    try {
      const status = await AsyncStorage.getItem(STORAGE_KEYS.REGISTRATION_STATUS);
      this.isRegistered = status === 'true';
    } catch {
      this.isRegistered = false;
    }
  }

  /**
   * Save registration status to AsyncStorage
   */
  private async saveRegistrationStatus(registered: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REGISTRATION_STATUS, registered ? 'true' : 'false');
      this.isRegistered = registered;
    } catch {
      // Storage failed, continue anyway
    }
  }

  /**
   * Set a token getter function for fresh tokens
   */
  setTokenGetter(getter: () => Promise<string | null>): void {
    this.tokenGetter = getter;
  }

  /**
   * Get a fresh auth token using the token getter
   */
  private async getFreshToken(): Promise<string | null> {
    if (this.tokenGetter) {
      return await this.tokenGetter();
    }
    return null;
  }

  /**
   * Check if device is already registered
   */
  isDeviceRegistered(): boolean {
    return this.isRegistered;
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

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
        return null;
      }

      // Check if we're on a physical device
      if (!Device.isDevice) {
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
      return null;
    }
  }

  /**
   * Register device with backend (with retry logic)
   */
  async registerDevice(userToken?: string): Promise<boolean> {
    try {
      if (!this.expoPushToken) {
        return false;
      }

      // Try to get a fresh token if available, otherwise use passed token
      let tokenToUse = userToken;
      if (this.tokenGetter) {
        const freshToken = await this.getFreshToken();
        if (freshToken) {
          tokenToUse = freshToken;
        }
      }

      if (!tokenToUse) {
        return false;
      }

      const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';

      // Retry with exponential backoff
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          // Get fresh token on retry attempts (in case original expired)
          if (attempt > 0 && this.tokenGetter) {
            const refreshedToken = await this.getFreshToken();
            if (refreshedToken) {
              tokenToUse = refreshedToken;
            }
          }

          const response = await fetch(`${API_URL}/secure/notifications/register`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenToUse}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              device_type: deviceType,
              expo_push_token: this.expoPushToken,
            }),
          });

          if (response.ok) {
            // Success - save registration status
            await this.saveRegistrationStatus(true);
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_REGISTERED_TOKEN, this.expoPushToken);
            return true;
          }

          // If 401 Unauthorized, try to get fresh token on next attempt
          if (response.status === 401 && attempt < MAX_RETRIES - 1) {
            const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
            await this.sleep(delay);
            continue;
          }

          // Other error, retry with backoff
          if (attempt < MAX_RETRIES - 1) {
            const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
            await this.sleep(delay);
          }
        } catch {
          // Network error, retry with backoff
          if (attempt < MAX_RETRIES - 1) {
            const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
            await this.sleep(delay);
          }
        }
      }

      // All retries failed
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Ensure device is registered - call this on app foreground
   * Returns true if already registered or successfully registered
   */
  async ensureRegistered(): Promise<boolean> {
    // If already registered, just return true
    if (this.isRegistered && this.expoPushToken) {
      // Verify the stored token matches current token
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.LAST_REGISTERED_TOKEN);
      if (storedToken === this.expoPushToken) {
        return true;
      }
    }

    // Not registered or token changed, try to register
    if (this.expoPushToken) {
      return await this.registerDevice();
    }

    return false;
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

      return response.ok;
    } catch (error) {
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
   * Clear stored push token and registration status (useful for logout)
   */
  async clearPushToken(): Promise<void> {
    this.expoPushToken = null;
    this.isRegistered = false;
    this.tokenGetter = null;
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.REGISTRATION_STATUS,
        STORAGE_KEYS.LAST_REGISTERED_TOKEN,
        STORAGE_KEYS.RETRY_COUNT,
      ]);
    } catch {
      // Storage clear failed, continue anyway
    }
  }
}

export default NotificationService;