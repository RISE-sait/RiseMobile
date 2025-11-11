import { Redirect } from "expo-router"
import { useAuth } from "@/utils/auth"
import { useEffect, useState } from "react"

export default function Index() {
  const { user, isLoading, isAuthLoaded } = useAuth()
  const [showFallback, setShowFallback] = useState(false)

  // ✅ Log state changes for debugging
  useEffect(() => {
    console.log("📱 [Index] State:", { hasUser: !!user, isLoading, isAuthLoaded })
  }, [user, isLoading, isAuthLoaded])

  // ✅ Safety timeout: Force redirect after 4 seconds to prevent infinite loading
  useEffect(() => {
    console.log("⏰ [Index] Setting up safety timeout (4s)")
    const timeoutId = setTimeout(() => {
      if (isLoading || !isAuthLoaded) {
        console.warn("⚠️ [Index] Safety timeout reached - forcing redirect")
        setShowFallback(true)
      }
    }, 4000) // ⚡ 4 second absolute maximum (2s rehydration + 1.5s auth + 0.5s buffer)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally empty - timeout should only run once on mount

  // ✅ Force redirect if timeout reached
  if (showFallback) {
    console.warn("🚨 [Index] Fallback redirect triggered")
    if (user) {
      if (user.role === "athlete") {
        return <Redirect href="/(athlete)/(tabs)/home" />
      } else if (user.role === "coach") {
        return <Redirect href="/(coach)/(tabs)/coachHome" />
      }
    }
    return <Redirect href="/(auth)/login" />
  }

  // Show nothing (keep splash screen) while loading
  if (isLoading || !isAuthLoaded) {
    console.log("⏳ [Index] Still loading...")
    return null
  }

  console.log("✅ [Index] Auth loaded, determining redirect", { hasUser: !!user, role: user?.role })

  if (!user) {
    return <Redirect href="/(auth)/login" />
  }

  if (user.role === "athlete") {
    return <Redirect href="/(athlete)/(tabs)/home" />
  } else if (user.role === "coach") {
    return <Redirect href="/(coach)/(tabs)/coachHome" />
  }

  // Fallback
  return <Redirect href="/(auth)/login" />
}


