import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '@/store';
import { clearEvents } from '@/store/slices/eventsSlice';
import { StorageCleanup } from './storageCleanup';

// Emergency cleanup function for when SQLite gets full
export const performEmergencyCleanup = async () => {
  try {
    console.log('🚨 EMERGENCY CLEANUP: SQLite storage full detected');

    // 1. Clear Redux state (in memory)
    console.log('🧹 Clearing Redux state...');
    store.dispatch(clearEvents());

    // 2. Clear AsyncStorage cache (except user auth)
    console.log('🧹 Clearing AsyncStorage cache...');
    await StorageCleanup.emergencyCleanup();

    // 3. Force garbage collection if available
    if (global.gc) {
      console.log('🧹 Running garbage collection...');
      global.gc();
    }

    // 4. Wait a moment for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ Emergency cleanup completed');
    return true;

  } catch (error) {
    console.error('❌ Emergency cleanup failed:', error);
    return false;
  }
};

// Function to handle SQLite errors specifically
export const handleSQLiteError = async (error: any) => {
  const errorMessage = error?.message || error?.toString() || '';

  // Check if it's a SQLite full error
  if (errorMessage.includes('SQLITE_FULL') ||
      errorMessage.includes('database or disk is full') ||
      errorMessage.includes('code 13')) {

    console.warn('🚨 SQLite FULL error detected, running emergency cleanup');

    const success = await performEmergencyCleanup();

    if (success) {
      console.log('✅ Emergency cleanup successful, retrying operation');
      return true; // Indicates the error was handled
    } else {
      console.error('❌ Emergency cleanup failed');
      return false;
    }
  }

  // Not a SQLite full error, don't handle
  return false;
};

// Wrapper for AsyncStorage operations with auto-cleanup
export const safeAsyncStorageSet = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (error: any) {
    const handled = await handleSQLiteError(error);

    if (handled) {
      // Retry after cleanup
      try {
        await AsyncStorage.setItem(key, value);
        return true;
      } catch (retryError) {
        console.error('❌ Retry failed after cleanup:', retryError);
        throw retryError;
      }
    } else {
      throw error;
    }
  }
};

// Wrapper for AsyncStorage multiSet with auto-cleanup
export const safeAsyncStorageMultiSet = async (keyValuePairs: [string, string][]) => {
  try {
    await AsyncStorage.multiSet(keyValuePairs);
    return true;
  } catch (error: any) {
    const handled = await handleSQLiteError(error);

    if (handled) {
      // Retry after cleanup
      try {
        await AsyncStorage.multiSet(keyValuePairs);
        return true;
      } catch (retryError) {
        console.error('❌ Retry failed after cleanup:', retryError);
        throw retryError;
      }
    } else {
      throw error;
    }
  }
};