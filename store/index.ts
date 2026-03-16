import { configureStore } from "@reduxjs/toolkit"
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, createTransform } from "redux-persist"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { combineReducers } from "redux"
import dayjs from "dayjs"

// Import reducers
import userReducer from "./slices/userSlice"
import eventsReducer from "./slices/eventsSlice"
import gamesReducer from "./slices/gamesSlice"
import practicesReducer from "./slices/practicesSlice"
import coursesReducer from "./slices/coursesSlice"
import teamsReducer from "./slices/teamsSlice"
import membershipReducer from "./slices/membershipSlice"
import scheduleReducer from "./slices/scheduleSlice"
import courtsReducer from "./slices/courtsSlice"
import subsidyReducer from "./slices/subsidySlice"
import familyReducer from "./slices/familySlice"


// Define the root state type
export interface RootState {
  user: ReturnType<typeof userReducer>
  events: ReturnType<typeof eventsReducer>
  games: ReturnType<typeof gamesReducer>
  practices: ReturnType<typeof practicesReducer>
  courses: ReturnType<typeof coursesReducer>
  teams: ReturnType<typeof teamsReducer>
  membership: ReturnType<typeof membershipReducer>
  schedule: ReturnType<typeof scheduleReducer>
  courts: ReturnType<typeof courtsReducer>
  subsidy: ReturnType<typeof subsidyReducer>
  family: ReturnType<typeof familyReducer>
}

// Combine all reducers
const rootReducer = combineReducers({
  user: userReducer,
  events: eventsReducer,
  games: gamesReducer,
  practices: practicesReducer,
  courses: coursesReducer,
  teams: teamsReducer,
  membership: membershipReducer,
  schedule: scheduleReducer,
  courts: courtsReducer,
  subsidy: subsidyReducer,
  family: familyReducer,
})

// Transform to filter user data - prevent image bloat
const userTransform = createTransform(
  // Transform state on its way to being serialized and persisted
  (inboundState: any) => {
    if (!inboundState?.data) {
      return inboundState
    }

    const user = inboundState.data

    // Calculate sizes for debugging
    const originalSize = JSON.stringify(inboundState).length

    // Create cleaned user object - keep all fields but remove base64 images
    const cleanedUser = { ...user }

    // Remove base64-encoded images (they start with 'data:image/')
    if (cleanedUser.profileImage?.startsWith('data:')) {
      if (__DEV__) {
        console.log(`[Persist] Removing base64 profileImage (${(cleanedUser.profileImage.length / 1024).toFixed(2)} KB)`)
      }
      cleanedUser.profileImage = undefined
    }

    if (cleanedUser.teamLogo?.startsWith('data:')) {
      if (__DEV__) {
        console.log(`[Persist] Removing base64 teamLogo (${(cleanedUser.teamLogo.length / 1024).toFixed(2)} KB)`)
      }
      cleanedUser.teamLogo = undefined
    }

    if (cleanedUser.team?.logo?.startsWith('data:')) {
      if (__DEV__) {
        console.log(`[Persist] Removing base64 team.logo (${(cleanedUser.team.logo.length / 1024).toFixed(2)} KB)`)
      }
      cleanedUser.team = {
        ...cleanedUser.team,
        logo: undefined
      }
    }

    // Limit bio length to prevent bloat
    if (cleanedUser.bio && cleanedUser.bio.length > 1000) {
      if (__DEV__) {
        console.log(`[Persist] Truncating bio from ${cleanedUser.bio.length} to 1000 chars`)
      }
      cleanedUser.bio = cleanedUser.bio.substring(0, 1000)
    }

    // Remove any field that's unexpectedly large (>100KB)
    Object.keys(cleanedUser).forEach(key => {
      const value = cleanedUser[key]
      if (typeof value === 'string' && value.length > 100000) {
        const size = (value.length / 1024).toFixed(2)
        console.warn(`⚠️ [Persist] Removing large user field "${key}" (${size} KB)`)
        cleanedUser[key] = undefined
      }
    })

    const cleanedSize = JSON.stringify({ ...inboundState, data: cleanedUser }).length

    if (__DEV__ && originalSize !== cleanedSize) {
      console.log(`[Persist] User cleaned: ${(originalSize / 1024).toFixed(2)} KB → ${(cleanedSize / 1024).toFixed(2)} KB (saved ${((originalSize - cleanedSize) / 1024).toFixed(2)} KB)`)
    }

    return {
      ...inboundState,
      data: cleanedUser,
      error: null // Don't persist errors
    }
  },
  // Transform state being rehydrated
  (outboundState: any) => outboundState,
  { whitelist: ['user'] }
)

// Configure persistence - PRODUCTION CONFIG: Only persist user, everything else fetched from API
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["user"], // ONLY persist user data (auth + profile)
  // Blacklist everything else - fetch from API on demand
  blacklist: ["events", "practices", "courses", "teams", "schedule", "courts", "games", "membership", "subsidy", "family"],
  // Add transforms to filter user data (remove base64 images)
  transforms: [userTransform],
  // Add debug and timeout settings to prevent property update errors
  debug: __DEV__,
  timeout: 10000, // 10 second timeout for rehydration
  // Add write delay to prevent rapid successive writes that can cause property errors
  writeDelay: 500,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

// Create persistor with error handling
export const persistor = persistStore(store, null, () => {
  if (__DEV__) {
    console.log('[Redux Persist] Rehydration complete')
  }
})

// Add error listener for SQLITE_FULL recovery
if (typeof window !== 'undefined') {
  // Import storage cleanup dynamically to handle SQLITE_FULL errors
  import('../utils/storageCleanup').then(({ StorageCleanup }) => {
    // Monitor for storage errors
    const originalSetItem = AsyncStorage.setItem
    let recoveryAttempted = false // Prevent infinite recovery loops

    AsyncStorage.setItem = async (key: string, value: string) => {
      // Log persist:root writes to diagnose bloat
      if (__DEV__ && key === 'persist:root') {
        try {
          const parsed = JSON.parse(value)
          const sizes: Record<string, number> = {}
          Object.keys(parsed).forEach(k => {
            const size = parsed[k] ? JSON.stringify(parsed[k]).length : 0
            sizes[k] = size
          })
          console.log('📝 [Redux Persist] Writing persist:root:', {
            totalSize: `${(value.length / 1024).toFixed(2)} KB`,
            breakdown: Object.entries(sizes)
              .sort(([, a], [, b]) => b - a)
              .map(([k, size]) => `${k}: ${(size / 1024).toFixed(2)} KB`)
              .slice(0, 5) // Top 5 largest
          })
        } catch (e) {
          // Parsing failed, just log size
          console.log(`📝 [Redux Persist] Writing ${key}: ${(value.length / 1024).toFixed(2)} KB`)
        }
      }

      try {
        return await originalSetItem(key, value)
      } catch (error: any) {
        // Check for SQLITE_FULL error
        if ((error?.message?.includes('SQLITE_FULL') || error?.code === 13) && !recoveryAttempted) {
          console.error('🚨 [Redux Persist] SQLITE_FULL detected during persist, triggering emergency cleanup...')
          recoveryAttempted = true // Mark that we've tried recovery

          try {
            await StorageCleanup.handleSQLiteFull()

            // Wait longer for database to fully rebuild after nuclear reset
            console.log('⏳ [Redux Persist] Waiting for database to stabilize...')
            await new Promise(resolve => setTimeout(resolve, 3000))

            // Retry the operation after cleanup
            try {
              console.log(`🔄 [Redux Persist] Retrying write to key: ${key} (${(value?.length || 0) / 1024} KB)`)
              const result = await originalSetItem(key, value)
              console.log('✅ [Redux Persist] Retry successful!')
              recoveryAttempted = false // Reset on success
              return result
            } catch (retryError: any) {
              console.error('❌ [Redux Persist] Retry after cleanup still failed')
              console.error('❌ [Redux Persist] Error details:', {
                message: retryError?.message,
                code: retryError?.code,
                key: key,
                valueSize: `${(value?.length || 0) / 1024} KB`
              })
              console.error('❌ [Redux Persist] App will continue but persistence may be broken')

              // Don't throw - let app continue running
              // Redux Persist will work in-memory only
              recoveryAttempted = false // Reset for next time
              return undefined as any
            }
          } catch (cleanupError) {
            console.error('❌ [Redux Persist] Emergency cleanup failed:', cleanupError)
            recoveryAttempted = false // Reset for next time

            // Don't throw - let app continue running
            return undefined as any
          }
        }

        // For non-SQLITE_FULL errors or if recovery already attempted, just log and continue
        if (error?.message?.includes('SQLITE_FULL') || error?.code === 13) {
          console.error('⚠️ [Redux Persist] SQLITE_FULL but recovery already attempted, skipping persistence')
          return undefined as any // Don't throw - let app continue
        }

        throw error // Re-throw non-storage errors
      }
    }
  }).catch(err => {
    console.error('❌ [Redux Persist] Failed to setup error recovery:', err)
  })
}

// Export types
export type AppDispatch = typeof store.dispatch
