import { View, Text, ActivityIndicator } from "react-native"
import { Redirect } from "expo-router"
import { useAuth } from "@/utils/auth"
import { useEffect, useState } from "react"

export default function Index() {
  const { user, isLoading, isAuthLoaded } = useAuth()
  const [forceLoadingComplete, setForceLoadingComplete] = useState(false)

  // 🚨 CRITICAL: Emergency timeout to prevent infinite loading (last resort fallback)
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      if (!isAuthLoaded) {
        console.warn("⚠️ Emergency timeout triggered after 3s - forcing app to continue")
        console.log("📊 Debug state:", { isLoading, isAuthLoaded, hasUser: !!user })
        setForceLoadingComplete(true)
      }
    }, 3000) // 3 seconds emergency fallback (reduced from 5s)

    return () => clearTimeout(emergencyTimeout)
  }, [isAuthLoaded, isLoading, user])

  // ✅ Splash screen is now managed only in _layout.tsx to prevent double hide() calls
  // Show nothing (keep splash screen) while loading - BUT with timeout protection
  if ((isLoading || !isAuthLoaded) && !forceLoadingComplete) {
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


