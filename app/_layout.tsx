import "../polyfills"
import { useEffect, useRef } from "react"
import { Stack } from "expo-router"
import "./globals.css"
import { useFonts } from "expo-font"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { store, persistor } from "@/store"
import { initializeStorageCleanup } from "@/utils/storageCleanup"
import { InteractionManager } from "react-native"
import NotificationManager from "@/app/components/NotificationManager"
import JsHeartbeat from "@/components/dev/JsHeartbeat"
import TouchLogger from "@/components/dev/TouchLogger"
import ErrorBoundary from "@/components/error/ErrorBoundary"
import AlertProvider from "@/components/feedback/AlertProvider"
import * as SplashScreen from "expo-splash-screen"

// Minimum time to show splash screen for better UX (in ms)
const MINIMUM_SPLASH_DISPLAY_TIME = 2000

// Hermes Promise Rejection Tracker - Prevent RedBox for unhandled promise rejections
// Converts unhandled rejections to warnings instead of fatal red screens
// Only applies in Hermes engine, gracefully ignored in other JS engines
if ((global as any).HermesInternal?.enablePromiseRejectionTracker) {
  (global as any).HermesInternal.enablePromiseRejectionTracker({
    allRejections: true,
    onUnhandled: () => {
      // Silently handle unhandled promise rejections
    },
    onHandled: () => {
      // Promise rejection was handled after being reported as unhandled
    },
  });
}

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

  // Track splash screen timing for minimum display duration
  const splashStartTime = useRef(Date.now())

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
          InteractionManager.runAfterInteractions(() => {
            initializeStorageCleanup();
          })
        }, 2000);
        unsubscribe(); // Only run once
      }
    });

    // Check if already bootstrapped when subscription is created
    const state = persistor.getState();
    if (state.bootstrapped && !hasRun) {
      hasRun = true;
      timeoutId = setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          initializeStorageCleanup();
        })
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

  // Handle splash screen hide with minimum display time
  useEffect(() => {
    if (fontsLoaded) {
      const hideSplash = async () => {
        // Calculate how long splash has been showing
        const elapsedTime = Date.now() - splashStartTime.current
        const remainingTime = MINIMUM_SPLASH_DISPLAY_TIME - elapsedTime

        // If minimum time hasn't elapsed, wait for remaining time
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime))
        }

        // Hide splash screen
        await SplashScreen.hideAsync().catch(() => {})
      }

      hideSplash()
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AlertProvider>
            <StatusBar style="auto" />
            <ErrorBoundary>
              <NotificationManager />
              {/* Disabled dev components to reduce console noise */}
              {/* {__DEV__ && <JsHeartbeat />} */}
              {/* {__DEV__ && <TouchLogger />} */}
            </ErrorBoundary>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)/forgot-password" options={{ headerShown: false }} />
              <Stack.Screen name="(athlete)" options={{ headerShown: false }} />
              <Stack.Screen name="(coach)" options={{ headerShown: false }} />
              <Stack.Screen name="(admin)" options={{ headerShown: false }} />

              {/* ✅ Shared screens stack - contains event/match/practice details and other shared screens */}
              <Stack.Screen name="screens" options={{ headerShown: false }} />

              {/* ✅ Modal Routes - Presented as transparent overlays */}
              <Stack.Screen
                name="modals/qr-code"
                options={{
                  presentation: "transparentModal",
                  animation: "fade",
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="modals/event-quick-view"
                options={{
                  presentation: "transparentModal",
                  animation: "fade",
                  headerShown: false,
                }}
              />
            </Stack>
          </AlertProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  )
}
