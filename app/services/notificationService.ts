import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/utils/api';

// Diagnostic logging - File loaded (temporarily removed __DEV__ check for release debugging)
console.log('========================================');
console.log('[NotificationService] FILE LOADED');
console.log('========================================');

// Storage keys for persistence
const STORAGE_KEYS = {
  REGISTRATION_STATUS: 'notification_registration_status',
  LAST_REGISTERED_TOKEN: 'notification_last_registered_token',
  RETRY_COUNT: 'notification_retry_count',
  LAST_REGISTRATION_TIME: 'notification_last_registration_time',
  PERMISSION_STATUS: 'notification_permission_status',
};

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 2000; // 2 seconds

// Health check configuration
const REGISTRATION_VALIDITY_MS = 24 * 60 * 60 * 1000; // 24 hours
const HEALTH_CHECK_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours (reduced wake-ups)

// Registration result interface
interface RegistrationResult {
  success: boolean;
  status?: number;
  message?: string;
}

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
  } catch {
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
  private lastRegistrationTime: number = 0;
  private permissionStatus: string = 'undetermined';
  private isPhysicalDevice: boolean = true;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private healthCheckInProgress: boolean = false;

  // Track notification listeners to prevent duplicates
  private notificationReceivedSubscription: any = null;
  private notificationResponseSubscription: any = null;

  private constructor() {
    // Load registration status from storage on init
    this.loadRegistrationStatus();
  }

  /**
   * Load registration status from AsyncStorage
   */
  private async loadRegistrationStatus(): Promise<void> {
    try {
      const [status, lastTime, permStatus] = await AsyncStorage.multiGet([
        STORAGE_KEYS.REGISTRATION_STATUS,
        STORAGE_KEYS.LAST_REGISTRATION_TIME,
        STORAGE_KEYS.PERMISSION_STATUS,
      ]);

      this.isRegistered = status[1] === 'true';
      this.lastRegistrationTime = lastTime[1] ? parseInt(lastTime[1], 10) : 0;
      this.permissionStatus = permStatus[1] || 'undetermined';

      console.log('[NotificationService] Loaded status from storage:', {
        isRegistered: this.isRegistered,
        lastRegistrationTime: new Date(this.lastRegistrationTime).toISOString(),
        permissionStatus: this.permissionStatus,
      });
    } catch (error) {
      console.warn('[NotificationService] Failed to load registration status:', error);
      this.isRegistered = false;
      this.lastRegistrationTime = 0;
    }
  }

  /**
   * Save registration status to AsyncStorage
   */
  private async saveRegistrationStatus(registered: boolean, timestamp?: number): Promise<void> {
    try {
      const now = timestamp || Date.now();
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.REGISTRATION_STATUS, registered ? 'true' : 'false'],
        [STORAGE_KEYS.LAST_REGISTRATION_TIME, now.toString()],
      ]);
      this.isRegistered = registered;
      this.lastRegistrationTime = now;

      console.log('[NotificationService] Saved registration status:', {
        registered,
        timestamp: new Date(now).toISOString(),
      });
    } catch (error) {
      console.warn('[NotificationService] Failed to save registration status:', error);
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
      console.log('[NotificationService] Initialize called');
      console.log('[NotificationService] Platform:', Platform.OS);
      console.log('[NotificationService] isExpoGo:', isExpoGo);
      console.log('[NotificationService] Device.isDevice:', Device.isDevice);
      console.log('[NotificationService] userToken exists:', !!userToken);

      // Check if running in Expo Go on Android (not supported in SDK 53+)
      if (isExpoGo && Platform.OS === 'android') {
        console.log('[NotificationService] Skipping: Expo Go on Android not supported');
        this.isPhysicalDevice = false;
        return null;
      }

      // Check if we're on a physical device
      if (!Device.isDevice) {
        console.log('[NotificationService] Skipping: Not a physical device');
        this.isPhysicalDevice = false;
        await AsyncStorage.setItem(STORAGE_KEYS.PERMISSION_STATUS, 'not_device');
        return null;
      }

      this.isPhysicalDevice = true;

      // Get existing permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      console.log('[NotificationService] Existing permission status:', existingStatus);

      // Request permission if not already granted
      if (existingStatus !== 'granted') {
        console.log('[NotificationService] Requesting permissions...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('[NotificationService] Permission request result:', finalStatus);
      }

      // Save permission status
      this.permissionStatus = finalStatus;
      await AsyncStorage.setItem(STORAGE_KEYS.PERMISSION_STATUS, finalStatus);

      if (finalStatus !== 'granted') {
        console.warn('[NotificationService] Permission denied by user');
        return null;
      }

      console.log('[NotificationService] Permission granted, getting push token...');

      // Get the Expo push token
      const expoPushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID || Constants.expoConfig?.extra?.eas?.projectId
      });

      this.expoPushToken = expoPushTokenData.data;

      console.log('[NotificationService] ExpoPushToken:', this.expoPushToken);

      // Diagnostic: Android platform additionally gets DevicePushToken (FCM direct token)
      if (Platform.OS === 'android') {
        try {
          const deviceToken = await Notifications.getDevicePushTokenAsync();
          console.log('[NotificationService] DevicePushToken (FCM):', deviceToken?.data);
          if (!deviceToken?.data) {
            console.warn('[NotificationService] DevicePushToken is null - FCM configuration may have issues');
          }
        } catch (e) {
          console.warn('[NotificationService] DevicePushToken failed:', e);
        }
      }

      // Register the device with your backend if user token is provided
      if (userToken && this.expoPushToken) {
        await this.registerDevice(userToken);
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      // Start health check timer
      this.startHealthCheckTimer();

      console.log('[NotificationService] Initialization completed successfully');

      return this.expoPushToken;
    } catch (error) {
      console.warn('[NotificationService] Failed to get push token:', error);
      return null;
    }
  }

  /**
   * Register device with backend (with retry logic and detailed error reporting)
   */
  async registerDevice(userToken?: string): Promise<RegistrationResult> {
    try {
      if (!this.expoPushToken) {
        console.warn('[NotificationService] No expo push token available');
        return { success: false, message: 'No expo push token' };
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
        console.warn('[NotificationService] No auth token available');
        return { success: false, message: 'No auth token' };
      }

      const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
      console.log('[NotificationService] Attempting device registration, deviceType:', deviceType);

      // Retry with exponential backoff
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          console.log(`[NotificationService] Registration attempt ${attempt + 1}/${MAX_RETRIES}`);

          // Get fresh token on retry attempts (in case original expired)
          if (attempt > 0 && this.tokenGetter) {
            const refreshedToken = await this.getFreshToken();
            if (refreshedToken) {
              tokenToUse = refreshedToken;
              console.log('[NotificationService] Refreshed auth token for retry');
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
            // Success - save registration status with timestamp
            await this.saveRegistrationStatus(true);
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_REGISTERED_TOKEN, this.expoPushToken);
            console.log('[NotificationService] Device registered successfully with backend');
            return { success: true, status: response.status };
          }

          // Log error details
          const statusText = response.statusText || 'Unknown error';
          let errorMessage = `HTTP ${response.status}: ${statusText}`;

          try {
            const errorBody = await response.text();
            if (errorBody) {
              errorMessage += ` - ${errorBody.substring(0, 200)}`;
            }
          } catch {
            // Failed to read error body
          }

          console.warn(`[NotificationService] Registration failed with status ${response.status}:`, errorMessage);

          // If 401 Unauthorized, log specific message
          if (response.status === 401) {
            console.warn('[NotificationService] Auth token expired or invalid - need to refresh');
            if (attempt < MAX_RETRIES - 1) {
              const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
              console.log(`[NotificationService] Retrying in ${delay}ms...`);
              await this.sleep(delay);
              continue;
            }
            return { success: false, status: 401, message: 'Auth token expired' };
          }

          // Other error, retry with backoff
          if (attempt < MAX_RETRIES - 1) {
            const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
            console.log(`[NotificationService] Retrying in ${delay}ms...`);
            await this.sleep(delay);
          } else {
            return { success: false, status: response.status, message: errorMessage };
          }
        } catch (networkError: any) {
          // Network error, retry with backoff
          const errorMsg = networkError?.message || 'Network error';
          console.warn(`[NotificationService] Network error on attempt ${attempt + 1}:`, errorMsg);

          if (attempt < MAX_RETRIES - 1) {
            const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
            console.log(`[NotificationService] Retrying in ${delay}ms...`);
            await this.sleep(delay);
          } else {
            return { success: false, message: `Network error: ${errorMsg}` };
          }
        }
      }

      // All retries failed
      console.warn('[NotificationService] Failed to register device after', MAX_RETRIES, 'attempts');
      return { success: false, message: 'Max retries exceeded' };
    } catch (error: any) {
      const errorMsg = error?.message || 'Unknown error';
      console.warn('[NotificationService] Registration error:', errorMsg);
      return { success: false, message: errorMsg };
    }
  }

  /**
   * Check if registration is still valid based on timestamp
   */
  private isRegistrationValid(): boolean {
    if (!this.isRegistered || !this.lastRegistrationTime) {
      return false;
    }

    const now = Date.now();
    const timeSinceRegistration = now - this.lastRegistrationTime;

    return timeSinceRegistration < REGISTRATION_VALIDITY_MS;
  }

  /**
   * Health check: verify and re-register if needed
   * Call this periodically or on app foreground
   */
  async verifyAndReRegister(): Promise<RegistrationResult> {
    // Prevent concurrent health checks
    if (this.healthCheckInProgress) {
      console.log('[NotificationService] Health check skipped: already in progress');
      return { success: true, message: 'Already running' };
    }

    this.healthCheckInProgress = true;

    try {
      console.log('[NotificationService] Health check: verifying registration');

      // Skip if not physical device or permission not granted
      if (!this.isPhysicalDevice || this.permissionStatus !== 'granted') {
        console.log('[NotificationService] Health check skipped: device or permission issue');
        return { success: false, message: 'Device or permission not available' };
      }

      // Skip if no token
      if (!this.expoPushToken) {
        console.log('[NotificationService] Health check skipped: no expo push token');
        return { success: false, message: 'No expo push token' };
      }

      // Check if registration is still valid
      const isValid = this.isRegistrationValid();
      const timeSinceRegistration = Date.now() - this.lastRegistrationTime;
      const hoursAgo = Math.floor(timeSinceRegistration / (1000 * 60 * 60));

      console.log('[NotificationService] Registration status:', {
        isRegistered: this.isRegistered,
        isValid,
        lastRegistration: this.lastRegistrationTime ? new Date(this.lastRegistrationTime).toISOString() : 'never',
        hoursAgo,
      });

      // Verify stored token matches current token
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.LAST_REGISTERED_TOKEN);
      if (storedToken !== this.expoPushToken) {
        console.log('[NotificationService] Token mismatch detected, re-registering');
        return await this.registerDevice();
      }

      // Re-register if expired or never registered
      if (!isValid) {
        console.log(`[NotificationService] Registration expired (${hoursAgo}h ago), re-registering`);
        return await this.registerDevice();
      }

      console.log('[NotificationService] Registration is valid');
      return { success: true, message: 'Registration valid' };
    } finally {
      this.healthCheckInProgress = false;
    }
  }

  /**
   * Start periodic health check timer
   */
  private startHealthCheckTimer(): void {
    // Clear existing timer
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    const intervalHours = HEALTH_CHECK_INTERVAL_MS / (1000 * 60 * 60);
    console.log(`[NotificationService] Starting health check timer (interval: ${intervalHours} hours)`);

    // Run health check periodically
    this.healthCheckTimer = setInterval(async () => {
      console.log('[NotificationService] Periodic health check triggered');
      await this.verifyAndReRegister();
    }, HEALTH_CHECK_INTERVAL_MS);
  }

  /**
   * Stop health check timer
   */
  private stopHealthCheckTimer(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
      console.log('[NotificationService] Health check timer stopped');
    }
  }

  /**
   * Ensure device is registered - call this on app foreground
   * Returns true if already registered or successfully registered
   */
  async ensureRegistered(): Promise<boolean> {
    const result = await this.verifyAndReRegister();
    return result.success;
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
    } catch {
      return false;
    }
  }

  /**
   * Set up notification listeners (ensures only registered once)
   */
  private setupNotificationListeners(): void {
    // Remove existing listeners if any
    if (this.notificationReceivedSubscription) {
      this.notificationReceivedSubscription.remove();
      console.log('[NotificationService] Removed existing notification received listener');
    }
    if (this.notificationResponseSubscription) {
      this.notificationResponseSubscription.remove();
      console.log('[NotificationService] Removed existing notification response listener');
    }

    // Handle notification received while app is foregrounded
    this.notificationReceivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('========================================');
      console.log('[NotificationService] FOREGROUND notification received');
      console.log('[NotificationService] Title:', notification.request.content.title);
      console.log('[NotificationService] Body:', notification.request.content.body);
      console.log('[NotificationService] Data:', notification.request.content.data);
      console.log('[NotificationService] Trigger:', notification.request.trigger);
      console.log('========================================');
      // You can add custom handling here (e.g., update UI, show custom alert)
    });

    // Handle notification tapped/opened
    this.notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('========================================');
      console.log('[NotificationService] BACKGROUND/CLOSED notification response');
      console.log('[NotificationService] ActionIdentifier:', response.actionIdentifier);
      console.log('[NotificationService] Title:', response.notification.request.content.title);
      console.log('[NotificationService] Body:', response.notification.request.content.body);
      console.log('[NotificationService] Data:', response.notification.request.content.data);
      console.log('========================================');

      const data = response.notification.request.content.data;

      // Handle different notification types
      if (data?.type === 'practice_booked' || data?.type === 'game_booked') {
        // Navigate to specific screen based on notification data
        this.handleTeamNotification(data);
      }
    });

    console.log('[NotificationService] Notification listeners registered');
  }

  /**
   * Clean up notification listeners
   */
  private cleanupNotificationListeners(): void {
    if (this.notificationReceivedSubscription) {
      this.notificationReceivedSubscription.remove();
      this.notificationReceivedSubscription = null;
      console.log('[NotificationService] Cleaned up notification received listener');
    }
    if (this.notificationResponseSubscription) {
      this.notificationResponseSubscription.remove();
      this.notificationResponseSubscription = null;
      console.log('[NotificationService] Cleaned up notification response listener');
    }
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
    console.log('[NotificationService] Clearing push token and cleaning up');

    this.expoPushToken = null;
    this.isRegistered = false;
    this.tokenGetter = null;
    this.lastRegistrationTime = 0;

    // Clean up listeners and timers
    this.cleanupNotificationListeners();
    this.stopHealthCheckTimer();

    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.REGISTRATION_STATUS,
        STORAGE_KEYS.LAST_REGISTERED_TOKEN,
        STORAGE_KEYS.RETRY_COUNT,
        STORAGE_KEYS.LAST_REGISTRATION_TIME,
        STORAGE_KEYS.PERMISSION_STATUS,
      ]);
      console.log('[NotificationService] Storage cleared successfully');
    } catch (error) {
      console.warn('[NotificationService] Failed to clear storage:', error);
    }
  }
}

export default NotificationService;
