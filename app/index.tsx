import { View, Text, ActivityIndicator } from "react-native"
import { Redirect } from "expo-router"
import { useAuth } from "@/utils/auth"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"

export default function Index() {
  const { user, isLoading, isAuthLoaded } = useAuth()

  // Hide splash screen once auth is loaded
  useEffect(() => {
    if (isAuthLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isAuthLoaded]);

  // Show nothing (keep splash screen) while loading
  if (isLoading || !isAuthLoaded) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />
  }


  if (user.role === "athlete") {
    return <Redirect href="/(athlete)/(tabs)/home" />
  } else if (user.role === "coach") {
    return <Redirect href="/(coach)/(tabs)/coachHome" />
  }

  // Fallback, should ideally never be reached
  return <Redirect href="/(auth)/login" />
}


