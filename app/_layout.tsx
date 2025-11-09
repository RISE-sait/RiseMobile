import { useEffect, useCallback } from "react"
import { refreshBackendJwt } from "@/utils/api"
import { Stack } from "expo-router"
import "./globals.css"
import { useFonts } from "expo-font"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { View, ActivityIndicator } from "react-native"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { store, persistor } from "@/store"
import { initializeStorageCleanup } from "@/utils/storageCleanup"
import NotificationManager from "@/app/components/NotificationManager"
import * as SplashScreen from "expo-splash-screen"

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Bebas-Neue": require("../assets/fonts/BebasNeue-Regular.ttf"),
    "Oswald-Bold": require("../assets/fonts/Oswald-Bold.ttf"),
    "Oswald-Light": require("../assets/fonts/Oswald-Light.ttf"),
    "Oswald-ExtraLight": require("../assets/fonts/Oswald-ExtraLight.ttf"),
    "Oswald-Regular": require("../assets/fonts/Oswald-Regular.ttf"),
    "Oswald-Medium": require("../assets/fonts/Oswald-Medium.ttf"),
    "Oswald-SemiBold": require("../assets/fonts/Oswald-SemiBold.ttf"),
    "Outfit-Black": require("../assets/fonts/Outfit-Black.ttf"),
    "Outfit-Light": require("../assets/fonts/Outfit-Light.ttf"),
    "Outfit-ExtraLight": require("../assets/fonts/Outfit-ExtraLight.ttf"),
    "Outfit-Regular": require("../assets/fonts/Outfit-Regular.ttf"),
    "Outfit-Medium": require("../assets/fonts/Outfit-Medium.ttf"),
    "Outfit-SemiBold": require("../assets/fonts/Outfit-SemiBold.ttf"),
    "Outfit-Bold": require("../assets/fonts/Outfit-Bold.ttf"),
    "Outfit-ExtraBold": require("../assets/fonts/Outfit-ExtraBold.ttf"),
    "Outfit-Thin": require("../assets/fonts/Outfit-Thin.ttf"),
    "ProtestStrike-Regular": require("../assets/fonts/ProtestStrike-Regular.ttf"),
  })

  // ✅ Delay storage cleanup until after Redux Persist rehydration completes
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let hasRun = false;

    const unsubscribe = persistor.subscribe(() => {
      const state = persistor.getState()
      if (state.bootstrapped && !hasRun) {
        hasRun = true;
        // Wait 2 seconds after rehydration before running cleanup
        timeoutId = setTimeout(() => {
          initializeStorageCleanup();
        }, 2000);
        unsubscribe(); // Only run once
      }
    });

    // Check if already bootstrapped when subscription is created
    const state = persistor.getState();
    if (state.bootstrapped && !hasRun) {
      hasRun = true;
      timeoutId = setTimeout(() => {
        initializeStorageCleanup();
      }, 2000);
      unsubscribe();
    }

    return () => {
      unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <StatusBar style="auto" />
          <NotificationManager />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="(athlete)" options={{ headerShown: false }} />
            <Stack.Screen name="(coach)" options={{ headerShown: false }} />
            <Stack.Screen name="screens" options={{ headerShown: false }} />
          </Stack>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  )
}

