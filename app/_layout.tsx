import { useEffect } from "react"
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

   // ✅ JWT refresh is now handled by useAuth hook on-demand
   // Removed global interval refresh to prevent conflicts with auth state management

   // Initialize storage cleanup on app start
   useEffect(() => {
     initializeStorageCleanup();
   }, []);

  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#B59422" />
      </View>
    )
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator size="large" color="#B59422" />} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
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

