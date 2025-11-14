import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

const STORAGE_CLEANUP_LAST_RUN_KEY = "__storageCleanupLastRun"
const STORAGE_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours

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

  // Get current storage usage info with detailed breakdown
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

      // Log detailed breakdown in dev mode
      if (__DEV__) {
        console.log('📊 [Storage] Detailed breakdown:');
        Object.entries(itemSizes)
          .sort(([, a], [, b]) => b - a) // Sort by size descending
          .forEach(([key, size]) => {
            console.log(`  ${key}: ${formatBytes(size)}`);

            // For persist:root, try to parse and show nested sizes
            if (key === 'persist:root' && size > 500 * 1024) { // If persist:root > 500KB
              try {
                const items = allItems.find(([k]) => k === 'persist:root');
                if (items && items[1]) {
                  const parsed = JSON.parse(items[1]);
                  console.log('    🔍 persist:root breakdown:');
                  Object.entries(parsed).forEach(([subKey, subValue]) => {
                    const subSize = subValue ? new Blob([JSON.stringify(subValue)]).size : 0;
                    if (subSize > 10 * 1024) { // Only show if > 10KB
                      console.log(`      ${subKey}: ${formatBytes(subSize)}`);
                    }
                  });
                }
              } catch (e) {
                console.warn('    ⚠️ Could not parse persist:root for breakdown');
              }
            }
          });
      }

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

  // Smart cleanup of persist:root content
  static async cleanupPersistRoot() {
    try {
      const persistRootData = await AsyncStorage.getItem('persist:root');
      if (!persistRootData) {
        console.log('[Emergency] No persist:root found');
        return false;
      }

      const parsed = JSON.parse(persistRootData);
      let modified = false;

      // Blacklisted keys that should NOT be in persist:root
      const blacklistedKeys = ['events', 'practices', 'courses', 'teams', 'schedule', 'courts'];

      blacklistedKeys.forEach(key => {
        if (parsed[key]) {
          console.warn(`⚠️ [Emergency] Found blacklisted data in persist:root: ${key}`);
          delete parsed[key];
          modified = true;
        }
      });

      // Clean up whitelisted but oversized keys
      if (parsed.games) {
        try {
          const gamesData = JSON.parse(parsed.games);
          if (gamesData.items && Array.isArray(gamesData.items)) {
            const originalLength = gamesData.items.length;
            if (originalLength > 20) {
              console.warn(`⚠️ [Emergency] games.items has ${originalLength} items, limiting to 20`);
              gamesData.items = gamesData.items.slice(0, 20);
              parsed.games = JSON.stringify(gamesData);
              modified = true;
            }
          }
        } catch (e) {
          console.warn('⚠️ [Emergency] Could not parse games data');
        }
      }

      if (modified) {
        await AsyncStorage.setItem('persist:root', JSON.stringify(parsed));
        console.log('✅ [Emergency] Cleaned up persist:root content');
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ [Emergency] Failed to cleanup persist:root:', error);
      return false;
    }
  }

  // Emergency cleanup when storage is nearly full
  static async emergencyCleanup() {
    try {
      console.log('🚨 [Emergency Cleanup] Starting aggressive cleanup...');

      // Get storage info before cleanup
      const infoBefore = await this.getStorageInfo();
      if (infoBefore) {
        console.log(`📊 [Emergency] Before: ${infoBefore.formattedSize}, ${infoBefore.totalKeys} keys`);

        // Check if persist:root is abnormally large (>500KB)
        const persistRootSize = infoBefore.itemSizes['persist:root'] || 0;
        if (persistRootSize > 500 * 1024) {
          console.warn(`⚠️ [Emergency] persist:root is abnormally large: ${formatBytes(persistRootSize)}`);
          console.warn(`⚠️ [Emergency] Attempting smart cleanup of persist:root content`);

          // Try smart cleanup first (preserves user data while removing blacklisted data)
          const cleaned = await this.cleanupPersistRoot();

          if (!cleaned) {
            console.warn(`⚠️ [Emergency] Smart cleanup didn't help, will force purge persist:root`);
            try {
              // Last resort: Force remove persist:root to trigger Redux Persist to recreate it
              await AsyncStorage.removeItem('persist:root');
              console.log('✅ [Emergency] Purged persist:root - will be recreated with transforms');
            } catch (purgeError) {
              console.error('❌ [Emergency] Failed to purge persist:root:', purgeError);
            }
          }
        }
      }

      // Clear everything except essential auth data
      const result = await this.clearCache();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Get storage info after cleanup
      const infoAfter = await this.getStorageInfo();
      if (infoAfter) {
        console.log(`📊 [Emergency] After: ${infoAfter.formattedSize}, ${infoAfter.totalKeys} keys`);
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

      // More aggressive limits to prevent SQLITE_FULL errors on devices
      // Android AsyncStorage SQLite database has ~6MB limit by default
      const MAX_KEYS = 50; // Reduced from 100
      const MAX_SIZE = 4 * 1024 * 1024; // 4MB limit (was 10MB)

      const isHealthy = info.totalKeys < MAX_KEYS && info.totalSize < MAX_SIZE;

      if (!isHealthy) {
        console.warn(`⚠️ Storage health check failed: ${info.totalKeys} keys (max ${MAX_KEYS}), ${info.formattedSize} (max 4MB)`);
      }

      return isHealthy;

    } catch (error) {
      console.error('❌ Storage health check failed:', error);
      return false;
    }
  }

  // Nuclear option: Complete database reset
  static async nuclearReset() {
    try {
      console.error('☢️ [NUCLEAR] Initiating complete AsyncStorage reset...');
      console.error('☢️ [NUCLEAR] User will need to log in again');

      // Save Firebase auth token before clearing
      let firebaseAuthKey = null;
      let firebaseAuthValue = null;
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        firebaseAuthKey = allKeys.find(key => key.includes('firebase:authUser:'));
        if (firebaseAuthKey) {
          firebaseAuthValue = await AsyncStorage.getItem(firebaseAuthKey);
        }
      } catch (e) {
        console.warn('⚠️ [NUCLEAR] Could not preserve Firebase auth');
      }

      // COMPLETE WIPE - This will rebuild the SQLite database file
      await AsyncStorage.clear();
      console.log('✅ [NUCLEAR] AsyncStorage cleared completely');

      // Wait for database file system to update (critical!)
      console.log('⏳ [NUCLEAR] Waiting for database file to rebuild...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds

      // Restore Firebase auth if possible
      if (firebaseAuthKey && firebaseAuthValue) {
        try {
          await AsyncStorage.setItem(firebaseAuthKey, firebaseAuthValue);
          console.log('✅ [NUCLEAR] Firebase auth restored');
        } catch (e) {
          console.warn('⚠️ [NUCLEAR] Could not restore Firebase auth:', e);
        }
      }

      // Verify database is actually writable with a test write
      try {
        const testKey = '__nuclear_reset_test__';
        const testValue = JSON.stringify({ timestamp: Date.now(), test: true });
        await AsyncStorage.setItem(testKey, testValue);
        await AsyncStorage.removeItem(testKey);
        console.log('✅ [NUCLEAR] Database write verification successful');
      } catch (verifyError) {
        console.error('❌ [NUCLEAR] Database write verification failed:', verifyError);
        console.error('❌ [NUCLEAR] Database may not be ready yet, but continuing...');
        // Don't fail the nuclear reset, just warn
      }

      // Force garbage collection
      if (global.gc) {
        global.gc();
      }

      console.log('✅ [NUCLEAR] Reset complete - database should be ready');
      return true;
    } catch (error) {
      console.error('❌ [NUCLEAR] Reset failed:', error);
      return false;
    }
  }

  // Handle SQLITE_FULL error recovery with escalating strategies
  static async handleSQLiteFull() {
    try {
      console.warn('🚨 [StorageCleanup] SQLITE_FULL detected, starting emergency cleanup...');

      // Get info before cleanup
      const infoBefore = await this.getStorageInfo();
      if (infoBefore) {
        console.log(`📊 Before cleanup: ${infoBefore.totalKeys} keys, ${infoBefore.formattedSize}`);
      }

      // Emergency cleanup
      const result = await this.emergencyCleanup();
      console.log(`🧹 Removed ${result.removed} items`);

      // Get info after cleanup
      const infoAfter = await this.getStorageInfo();
      if (infoAfter) {
        console.log(`📊 After cleanup: ${infoAfter.totalKeys} keys, ${infoAfter.formattedSize}`);

        // Check if database is corrupted/fragmented
        // If we have very little data (<10KB) but still getting SQLITE_FULL,
        // the database file itself is the problem
        if (infoAfter.totalSize < 10 * 1024) {
          console.error('☢️ [StorageCleanup] Database appears corrupted/fragmented');
          console.error('☢️ [StorageCleanup] Only ' + infoAfter.formattedSize + ' data but still FULL');
          console.error('☢️ [StorageCleanup] Initiating nuclear reset...');

          await this.nuclearReset();
          return true;
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to handle SQLITE_FULL:', error);

      // Last resort: nuclear reset
      console.error('☢️ [StorageCleanup] Emergency cleanup failed, trying nuclear reset...');
      try {
        await this.nuclearReset();
        return true;
      } catch (nuclearError) {
        console.error('❌ [StorageCleanup] Nuclear reset also failed:', nuclearError);
        return false;
      }
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

// Auto-cleanup on app start - now runs in all environments to prevent SQLITE_FULL
export const initializeStorageCleanup = async () => {
  try {
    console.log("🔍 [StorageCleanup] Starting storage health check...");

    // Add delay to ensure app is fully initialized
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if we need to run (daily check)
    const lastRun = await AsyncStorage.getItem(STORAGE_CLEANUP_LAST_RUN_KEY)
    const now = Date.now()
    const shouldRunScheduled = !lastRun || (now - Number(lastRun)) >= STORAGE_CLEANUP_INTERVAL_MS

    // Always check health first
    const isHealthy = await StorageCleanup.checkStorageHealth();
    console.log("📊 [StorageCleanup] Storage health:", isHealthy ? "✅ healthy" : "⚠️ needs cleanup");

    // Run cleanup if unhealthy OR scheduled
    if (!isHealthy || shouldRunScheduled) {
      if (!isHealthy) {
        console.log("🧹 [StorageCleanup] Running cleanup due to health check failure");
      } else {
        console.log("🧹 [StorageCleanup] Running scheduled daily cleanup");
      }

      const result = await StorageCleanup.clearCache();
      console.log("✅ [StorageCleanup] Cleanup completed:", result);

      await AsyncStorage.setItem(STORAGE_CLEANUP_LAST_RUN_KEY, String(now))
    } else {
      console.log("⏭️ [StorageCleanup] Skipping - storage healthy and recently checked");
    }

  } catch (error: any) {
    console.error('❌ [StorageCleanup] Storage initialization failed:', error);

    // If SQLITE_FULL error, try emergency cleanup
    if (error?.message?.includes('SQLITE_FULL') || error?.code === 13) {
      console.warn('🚨 [StorageCleanup] Detected SQLITE_FULL, attempting emergency cleanup...');
      try {
        await StorageCleanup.handleSQLiteFull();
      } catch (emergencyError) {
        console.error('❌ [StorageCleanup] Emergency cleanup also failed:', emergencyError);
      }
    }

    // Don't throw - this would prevent app startup
  }
};
