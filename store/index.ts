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
})

// Configure persistence
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["user", "events", "games", "practices", "courses", "teams", "membership", "schedule"], // Only persist these slices
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
