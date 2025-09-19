import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from "@/components/buttons/BackButton";
import { COLORS } from "@/constants/colors";
import {
  checkBiometricCapability,
  isBiometricLoginEnabled,
  disableBiometricLogin,
  getBiometricDisplayName,
  type BiometricCapability,
} from "@/utils/biometricAuth";

interface NotificationSettings {
  pushNotifications: boolean;
  eventReminders: boolean;
  practiceNotifications: boolean;
  teamUpdates: boolean;
  soundEnabled: boolean;
  biometricLogin: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  pushNotifications: true,
  eventReminders: true,
  practiceNotifications: true,
  teamUpdates: true,
  soundEnabled: true,
  biometricLogin: false,
};

const NotificationSettingsScreen: React.FC = () => {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [biometricCapability, setBiometricCapability] = useState<BiometricCapability>({
    isAvailable: false,
    biometricType: 'none',
    supportedTypes: [],
  });

  useEffect(() => {
    loadSettings();
    checkPermissions();
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const capability = await checkBiometricCapability();
      setBiometricCapability(capability);

      if (capability.isAvailable) {
        const isEnabled = await isBiometricLoginEnabled();
        setSettings(prev => ({ ...prev, biometricLogin: isEnabled }));
      }
    } catch (error) {
      console.error("Error checking biometric availability:", error);
    }
  };

  const checkPermissions = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    } catch (error) {
      console.error("Error checking notification permissions:", error);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const storedSettings = await AsyncStorage.getItem('notificationSettings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };


  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      setSaving(true);
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Error saving notification settings:", error);
      Alert.alert("Error", "Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = async (key: keyof NotificationSettings, value: boolean | string) => {
    if (key === 'biometricLogin') {
      await handleBiometricToggle(value as boolean);
      return;
    }

    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    try {
      setSaving(true);

      if (!enabled) {
        // Disable biometric login
        const success = await disableBiometricLogin();
        if (success) {
          setSettings(prev => ({ ...prev, biometricLogin: false }));
          Alert.alert(
            "Biometric Login Disabled",
            `${getBiometricDisplayName(biometricCapability.biometricType)} login has been disabled.`
          );
        } else {
          Alert.alert("Error", "Failed to disable biometric login. Please try again.");
        }
      } else {
        // Show instruction for enabling biometric login
        Alert.alert(
          "Enable Biometric Login",
          `To enable ${getBiometricDisplayName(biometricCapability.biometricType)} login, please log in with your password and select the option to enable biometric authentication.`,
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (error) {
      console.error("Error toggling biometric login:", error);
      Alert.alert("Error", "Failed to update biometric login setting.");
    } finally {
      setSaving(false);
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted') {
        handleSettingChange('pushNotifications', true);
        Alert.alert("Success", "Notification permissions granted!");
      } else {
        Alert.alert(
          "Permission Denied",
          "Please enable notifications in your device settings to receive updates."
        );
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      Alert.alert("Error", "Failed to request notification permissions.");
    }
  };


  const renderSettingRow = (
    title: string,
    description: string,
    key: keyof NotificationSettings,
    icon: string,
    disabled: boolean = false
  ) => {
    const value = settings[key] as boolean;

    return (
      <View style={styles.settingRow}>
        <View style={styles.settingIcon}>
          <Ionicons
            name={icon as any}
            size={24}
            color={disabled ? COLORS.textSecondary : COLORS.primary}
          />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, disabled && styles.disabledText]}>
            {title}
          </Text>
          <Text style={[styles.settingDescription, disabled && styles.disabledText]}>
            {description}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={(newValue) => handleSettingChange(key, newValue)}
          trackColor={{ false: '#767577', true: COLORS.primary }}
          thumbColor={value ? '#ffffff' : '#f4f3f4'}
          disabled={disabled || saving}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading notification settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Notifications & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Permission Status */}
        {permissionStatus !== 'granted' && (
          <View style={styles.permissionBanner}>
            <View style={styles.permissionContent}>
              <Ionicons name="notifications-off" size={24} color="#FFC107" />
              <View style={styles.permissionText}>
                <Text style={styles.permissionTitle}>Enable Notifications</Text>
                <Text style={styles.permissionDescription}>
                  Get important updates about events and practices
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.enableButton} onPress={requestPermissions}>
              <Text style={styles.enableButtonText}>Enable</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notification Settings */}
        <View style={styles.section}>
          {renderSettingRow(
            "Push Notifications",
            "Receive notifications on this device",
            "pushNotifications",
            "notifications",
            permissionStatus !== 'granted'
          )}
          {renderSettingRow(
            "Event Reminders",
            "Get notified before upcoming events",
            "eventReminders",
            "calendar",
            !settings.pushNotifications
          )}
          {renderSettingRow(
            "Practice Notifications",
            "Notifications for practice sessions",
            "practiceNotifications",
            "basketball",
            !settings.pushNotifications
          )}
          {renderSettingRow(
            "Team Updates",
            "Important announcements and updates",
            "teamUpdates",
            "people",
            !settings.pushNotifications
          )}
          {renderSettingRow(
            "Sound",
            "Play sound for notifications",
            "soundEnabled",
            "volume-high",
            !settings.pushNotifications
          )}
        </View>

        {/* Security Settings */}
        {biometricCapability.isAvailable && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Security</Text>
            </View>
            <View style={styles.section}>
              {renderSettingRow(
                `${getBiometricDisplayName(biometricCapability.biometricType)} Login`,
                `Use ${getBiometricDisplayName(biometricCapability.biometricType)} to sign in quickly and securely`,
                "biometricLogin",
                biometricCapability.biometricType === 'face' ? 'scan' : 'finger-print',
                false
              )}
            </View>
          </>
        )}
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  permissionBanner: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  permissionContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  permissionText: {
    marginLeft: 12,
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#856404',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#856404',
    marginTop: 2,
  },
  enableButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  enableButtonText: {
    color: COLORS.background,
    fontWeight: 'bold' as const,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    marginTop: 32,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  settingRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingIcon: {
    width: 40,
    alignItems: 'center' as const,
  },
  settingContent: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  disabledText: {
    opacity: 0.5,
  },
};

export default NotificationSettingsScreen;