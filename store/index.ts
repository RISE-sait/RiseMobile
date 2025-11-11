import { configureStore } from "@reduxjs/toolkit"
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { combineReducers } from "redux"

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
})

// Configure persistence - ONLY persist essential user data to prevent storage overflow
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["user"], // Only persist user data - everything else should be fetched fresh
  // Blacklist large data that changes frequently
  blacklist: ["events", "games", "practices", "courses", "teams", "membership", "schedule", "courts"],
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

// Create persistor
export const persistor = persistStore(store)

// Export types
export type AppDispatch = typeof store.dispatch
