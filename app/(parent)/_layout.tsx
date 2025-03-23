import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"

export default function ParentLayout() {
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
        <Stack.Screen name="screens/add-child" options={{ headerShown: false }} />
        <Stack.Screen name="screens/child-details/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="screens/child-schedule/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="screens/edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="screens/membership" options={{ headerShown: false }} />
        <Stack.Screen name="screens/store/store" options={{ headerShown: false }} />
      </Stack>
    </>
  )
}

