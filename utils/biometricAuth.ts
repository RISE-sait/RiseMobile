import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

// Keys for secure storage
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export interface BiometricCredentials {
  email: string;
  password: string;
}

export interface BiometricCapability {
  isAvailable: boolean;
  biometricType: 'fingerprint' | 'face' | 'iris' | 'none';
  supportedTypes: LocalAuthentication.AuthenticationType[];
}

/**
 * Check if biometric authentication is available on the device
 */
export const checkBiometricCapability = async (): Promise<BiometricCapability> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return {
        isAvailable: false,
        biometricType: 'none',
        supportedTypes: [],
      };
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      return {
        isAvailable: false,
        biometricType: 'none',
        supportedTypes: [],
      };
    }

    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    // Determine primary biometric type
    let biometricType: 'fingerprint' | 'face' | 'iris' | 'none' = 'none';
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = 'face';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = 'fingerprint';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometricType = 'iris';
    }

    return {
      isAvailable: true,
      biometricType,
      supportedTypes,
    };
  } catch (error) {
    console.error('Error checking biometric capability:', error);
    return {
      isAvailable: false,
      biometricType: 'none',
      supportedTypes: [],
    };
  }
};

/**
 * Get display name for biometric type
 */
export const getBiometricDisplayName = (biometricType: 'fingerprint' | 'face' | 'iris' | 'none'): string => {
  switch (biometricType) {
    case 'face':
      return 'Face ID';
    case 'fingerprint':
      return 'Fingerprint';
    case 'iris':
      return 'Iris';
    default:
      return 'Biometric';
  }
};

/**
 * Authenticate using biometrics
 */
export const authenticateWithBiometrics = async (biometricType: 'fingerprint' | 'face' | 'iris' | 'none'): Promise<boolean> => {
  try {
    const displayName = getBiometricDisplayName(biometricType);

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Authenticate with ${displayName}`,
      cancelLabel: 'Cancel',
      fallbackLabel: 'Use Password',
      disableDeviceFallback: false,
    });

    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
};

/**
 * Save user credentials securely for biometric login
 */
export const saveBiometricCredentials = async (credentials: BiometricCredentials): Promise<boolean> => {
  try {
    await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(credentials));
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
    return true;
  } catch (error) {
    console.error('Error saving biometric credentials:', error);
    return false;
  }
};

/**
 * Get saved biometric credentials
 */
export const getBiometricCredentials = async (): Promise<BiometricCredentials | null> => {
  try {
    const credentialsJson = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    if (!credentialsJson) {
      return null;
    }
    return JSON.parse(credentialsJson);
  } catch (error) {
    console.error('Error getting biometric credentials:', error);
    return null;
  }
};

/**
 * Check if biometric login is enabled for the user
 */
export const isBiometricLoginEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking biometric login status:', error);
    return false;
  }
};

/**
 * Disable biometric login and clear stored credentials
 */
export const disableBiometricLogin = async (): Promise<boolean> => {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    return true;
  } catch (error) {
    console.error('Error disabling biometric login:', error);
    return false;
  }
};

/**
 * Complete biometric login flow - authenticate and return credentials
 */
export const performBiometricLogin = async (): Promise<BiometricCredentials | null> => {
  try {
    // Check if biometric login is enabled
    const isEnabled = await isBiometricLoginEnabled();
    if (!isEnabled) {
      return null;
    }

    // Check device capability
    const capability = await checkBiometricCapability();
    if (!capability.isAvailable) {
      return null;
    }

    // Authenticate with biometrics
    const authSuccess = await authenticateWithBiometrics(capability.biometricType);
    if (!authSuccess) {
      return null;
    }

    // Return saved credentials
    return await getBiometricCredentials();
  } catch (error) {
    console.error('Error performing biometric login:', error);
    return null;
  }
};