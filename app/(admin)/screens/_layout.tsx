import { Stack } from "expo-router";

export default function AdminScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="checkin" options={{ headerShown: false }} />
      <Stack.Screen name="customer-details" options={{ headerShown: false }} />
      <Stack.Screen name="staff-details" options={{ headerShown: false }} />
      <Stack.Screen name="website-content" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="change-password" options={{ headerShown: false }} />
    </Stack>
  );
}
