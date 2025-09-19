import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  checkBiometricCapability,
  performBiometricLogin,
  getBiometricDisplayName,
  saveBiometricCredentials,
  isBiometricLoginEnabled,
  type BiometricCapability,
  type BiometricCredentials,
} from '@/utils/biometricAuth';

interface BiometricLoginProps {
  onBiometricLogin: (credentials: BiometricCredentials) => Promise<void>;
  onEnableBiometric?: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  lastLoginEmail?: string;
}

const BiometricLogin: React.FC<BiometricLoginProps> = ({
  onBiometricLogin,
  onEnableBiometric,
  isLoading,
  lastLoginEmail,
}) => {
  const [biometricCapability, setBiometricCapability] = useState<BiometricCapability>({
    isAvailable: false,
    biometricType: 'none',
    supportedTypes: [],
  });
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isCheckingBiometric, setIsCheckingBiometric] = useState(false);

  useEffect(() => {
    initializeBiometric();
  }, []);

  const initializeBiometric = async () => {
    try {
      const capability = await checkBiometricCapability();
      setBiometricCapability(capability);

      if (capability.isAvailable) {
        const enabled = await isBiometricLoginEnabled();
        setIsBiometricEnabled(enabled);
      }
    } catch (error) {
      console.error('Error initializing biometric:', error);
    }
  };

  const handleBiometricLogin = async () => {
    if (isLoading || isCheckingBiometric) return;

    try {
      setIsCheckingBiometric(true);

      // Trigger haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const credentials = await performBiometricLogin();

      if (credentials) {
        await onBiometricLogin(credentials);

        // Success haptic feedback
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        // Error haptic feedback
        if (Platform.OS === 'ios') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      Alert.alert(
        'Authentication Failed',
        'Unable to authenticate with biometrics. Please try again or use your password.',
        [{ text: 'OK', style: 'default' }]
      );

      // Error haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsCheckingBiometric(false);
    }
  };

  const handleEnableBiometric = () => {
    if (!lastLoginEmail || !onEnableBiometric) return;

    Alert.alert(
      'Enable Biometric Login',
      `Would you like to enable ${getBiometricDisplayName(biometricCapability.biometricType)} login for faster access?`,
      [
        {
          text: 'Not Now',
          style: 'cancel',
        },
        {
          text: 'Enable',
          style: 'default',
          onPress: async () => {
            // This would be called after successful password login
            // The login screen would need to handle saving the credentials
            if (onEnableBiometric) {
              await onEnableBiometric(lastLoginEmail, ''); // Password would be passed from login
            }
          },
        },
      ]
    );
  };

  const getBiometricIcon = () => {
    switch (biometricCapability.biometricType) {
      case 'face':
        return 'scan-outline';
      case 'fingerprint':
        return 'finger-print-outline';
      case 'iris':
        return 'eye-outline';
      default:
        return 'lock-closed-outline';
    }
  };

  // Don't render if biometric is not available
  if (!biometricCapability.isAvailable) {
    return null;
  }

  // Show enable biometric option if not enabled and we have a last login email
  if (!isBiometricEnabled && lastLoginEmail && onEnableBiometric) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.enableButton}
          onPress={handleEnableBiometric}
          disabled={isLoading}
        >
          <Ionicons
            name={getBiometricIcon()}
            size={20}
            color="#FFD700"
            style={styles.icon}
          />
          <Text style={styles.enableText}>
            Enable {getBiometricDisplayName(biometricCapability.biometricType)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show biometric login button if enabled
  if (isBiometricEnabled) {
    return (
      <View style={styles.container}>
        <Text style={styles.loginWithText}>
          Or sign in with {getBiometricDisplayName(biometricCapability.biometricType)}
        </Text>

        <TouchableOpacity
          style={[
            styles.biometricButton,
            (isLoading || isCheckingBiometric) && styles.disabledButton
          ]}
          onPress={handleBiometricLogin}
          disabled={isLoading || isCheckingBiometric}
        >
          <Ionicons
            name={getBiometricIcon()}
            size={32}
            color="#FFD700"
          />
        </TouchableOpacity>

        <Text style={styles.tapText}>
          Tap to authenticate
        </Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  loginWithText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  biometricButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 2,
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  tapText: {
    color: '#AAAAAA',
    fontSize: 12,
    textAlign: 'center',
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 25,
    marginTop: 10,
  },
  enableText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  icon: {
    marginRight: 4,
  },
});

export default BiometricLogin;