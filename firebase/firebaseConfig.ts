import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

const firebaseConfig = {
  apiKey: "AIzaSyC3asIejQ5bP-29GhIZIO4CnlAZO0wETqQ",
  authDomain: "sacred-armor-452904-c0.firebaseapp.com",
  projectId: "sacred-armor-452904-c0",
  storageBucket: "sacred-armor-452904-c0.firebasestorage.app",
  messagingSenderId: "461776259687",
  appId: "1:461776259687:web:558026e90baef5a63522c2",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

let authInstance
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  })
} catch (error) {
  authInstance = getAuth(app)
}

const auth = authInstance

export { app, auth }
