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
import matchesReducer from "./slices/gamesSlice"
import teamsReducer from "./slices/teamsSlice" // Add teams reducer

// Combine all reducers
const rootReducer = combineReducers({
  user: userReducer,
  events: eventsReducer,
  games: gamesReducer,
  practices: practicesReducer,
  courses: coursesReducer,
  matches: matchesReducer,
  teams: teamsReducer, // Add teams to the root reducer
})

// Configure persistence
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["user", "events", "games", "practices", "courses", "matches", "teams"], // Add teams to whitelist
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
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
