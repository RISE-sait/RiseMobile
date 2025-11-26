import { Redirect } from "expo-router"
import { useAuth } from "@/utils/auth"
import { useEffect, useState } from "react"

export default function Index() {
  const { user, isLoading, isAuthLoaded } = useAuth()
  const [showFallback, setShowFallback] = useState(false)

  // Safety timeout: Force redirect after 4 seconds to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading || !isAuthLoaded) {
        setShowFallback(true)
      }
    }, 4000)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally empty - timeout should only run once on mount

  // Force redirect if timeout reached
  if (showFallback) {
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
    return null
  }

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


