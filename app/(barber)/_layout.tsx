import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"

export default function BarberLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0C0B0B" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="screens/appointment-details/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="screens/edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="screens/service-management" options={{ headerShown: false }} />
        <Stack.Screen name="screens/earnings" options={{ headerShown: false }} />
      </Stack>
    </>
  )
}

