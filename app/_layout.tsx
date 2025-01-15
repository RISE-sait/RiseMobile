import { Stack } from "expo-router";
import "./globals.css"

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(athlete)" options={{ headerShown: false }} />
      <Stack.Screen name="(instructor)" options={{ headerShown: false }} />
      <Stack.Screen name="(coach)" options={{ headerShown: false }} />
    </Stack>
  );
}
