import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage cleanup utility to prevent SQLite FULL errors
export class StorageCleanup {

  // Clear all old cached data (except user auth and Redux Persist keys)
  static async clearCache() {
    try {
      // Get all keys
      const allKeys = await AsyncStorage.getAllKeys();

      // ✅ Keys to preserve - corrected based on actual Redux Persist structure
      // Redux Persist with key="root" and whitelist=["user"] creates:
      // - persist:root (contains all whitelisted data including user)
      // Firebase Auth creates keys like:
      // - firebase:authUser:{appName}:{apiKey}:{authDomain}
      const preserveKeys = [
        'persist:root',        // Redux Persist root (contains user data inside)
        'firebase:authUser:',  // Firebase auth data (prefix match for all Firebase keys)
      ];

      // Find keys to remove (everything else)
      // Using includes() for prefix matching (safer than exact match for Firebase)
      const keysToRemove = allKeys.filter(key =>
        !preserveKeys.some(preserve => key.includes(preserve))
      );

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }

      return { removed: keysToRemove.length, total: allKeys.length };

    } catch (error) {
      console.error('❌ Storage cleanup failed:', error);
      // ✅ Don't throw - fail gracefully
      return { removed: 0, total: 0 };
    }
  }

  // Get current storage usage info
  static async getStorageInfo() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const allItems = await AsyncStorage.multiGet(allKeys);

      let totalSize = 0;
      const itemSizes: Record<string, number> = {};

      allItems.forEach(([key, value]) => {
        const size = value ? new Blob([value]).size : 0;
        itemSizes[key] = size;
        totalSize += size;
      });

      return {
        totalKeys: allKeys.length,
        totalSize: totalSize,
        itemSizes: itemSizes,
        formattedSize: formatBytes(totalSize)
      };

    } catch (error) {
      console.error('❌ Failed to get storage info:', error);
      return null;
    }
  }

  // Emergency cleanup when storage is nearly full
  static async emergencyCleanup() {
    try {

      // Clear everything except essential auth data
      const result = await this.clearCache();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      return result;

    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error);
      throw error;
    }
  }

  // Check if storage is getting full (preventive)
  static async checkStorageHealth() {
    try {
      const info = await this.getStorageInfo();
      if (!info) return false;

      // Alert if storage has too many items (potential issue)
      const isHealthy = info.totalKeys < 100 && info.totalSize < 10 * 1024 * 1024; // 10MB limit

      if (!isHealthy) {
        console.warn(`⚠️ Storage health check failed: ${info.totalKeys} keys, ${info.formattedSize}`);
      }

      return isHealthy;

    } catch (error) {
      console.error('❌ Storage health check failed:', error);
      return false;
    }
  }
}

// Helper function to format bytes
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Auto-cleanup on app start
export const initializeStorageCleanup = async () => {
  try {
    console.log("🔍 [StorageCleanup] Starting storage health check...");

    // Add delay to ensure app is fully initialized
    await new Promise(resolve => setTimeout(resolve, 500));

    const isHealthy = await StorageCleanup.checkStorageHealth();
    console.log("📊 [StorageCleanup] Storage health:", isHealthy ? "healthy" : "needs cleanup");

    if (!isHealthy) {
      console.log("🧹 [StorageCleanup] Starting cache cleanup...");
      const result = await StorageCleanup.clearCache();
      console.log("✅ [StorageCleanup] Cleanup completed:", result);
    } else {
      console.log("✅ [StorageCleanup] No cleanup needed");
    }

  } catch (error) {
    console.error('❌ [StorageCleanup] Storage initialization failed:', error);
    // Don't throw - this prevents app startup
  }
};