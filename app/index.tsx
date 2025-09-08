import { View, Text, ActivityIndicator } from "react-native"
import { Redirect } from "expo-router"
import { useAuth } from "@/utils/auth"

export default function Index() {
  const { user, isLoading, isAuthLoaded } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  // Only navigate after auth is fully loaded
  if (!isAuthLoaded) {
    return <LoadingScreen message="Initializing app..." />
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />
  }

  // 🔑 Log JWT token for debugging whenever user is authenticated
  if (user.token) {
    console.log("🔑 JWT Token (for Swagger auth):", user.token)
  }

  if (user.role === "athlete") {
    return <Redirect href="/(athlete)/(tabs)/home" />
  } else if (user.role === "instructor") {
    return <Redirect href="/(instructor)/(tabs)/instructorHome" />
  } else if (user.role === "coach") {
    return <Redirect href="/(coach)/(tabs)/coachHome" />
  } else if (user.role === "parent") {
    return <Redirect href="/(parent)/(tabs)/home" />
  } else if (user.role === "barber") {
    return <Redirect href="/(barber)/(tabs)/home" />
  }

  // Fallback, should ideally never be reached
  return <Redirect href="/(auth)/login" />
}

function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <View className="flex-1 justify-center items-center bg-black">
      <ActivityIndicator size="large" color="#FCA311" />
      <Text className="text-white-100 text-lg mt-2">{message}</Text>
    </View>
  )
}

