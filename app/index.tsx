import { Redirect } from "expo-router"
import { useAuth } from "@/utils/auth"
import { useEffect, useState } from "react"

// Helper function to check if user is an admin role
const isAdminRole = (role: string): boolean => {
  const normalizedRole = role?.toLowerCase()?.trim() || ""
  const adminRoles = ["admin", "superadmin", "super_admin", "it", "receptionist"]
  return adminRoles.includes(normalizedRole)
}

// Helper function to normalize role comparison
const normalizeRole = (role: string): string => {
  return role?.toLowerCase()?.trim() || ""
}

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
      const role = normalizeRole(user.role)
      if (role === "athlete") {
        return <Redirect href="/(athlete)/(tabs)/home" />
      } else if (role === "coach") {
        return <Redirect href="/(coach)/(tabs)/coachHome" />
      } else if (isAdminRole(user.role)) {
        return <Redirect href="/(admin)/(tabs)/dashboard" />
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

  const userRole = normalizeRole(user.role)
  if (userRole === "athlete") {
    return <Redirect href="/(athlete)/(tabs)/home" />
  } else if (userRole === "coach") {
    return <Redirect href="/(coach)/(tabs)/coachHome" />
  } else if (isAdminRole(user.role)) {
    return <Redirect href="/(admin)/(tabs)/dashboard" />
  }

  // Fallback
  return <Redirect href="/(auth)/login" />
}


