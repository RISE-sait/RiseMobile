import { Stack } from "expo-router";

export default function AthleteLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* ✅ Main Tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* ✅ Athlete-specific screens - flattened structure to prevent route group nesting */}
      {/* Only declare screens that exist in app/(athlete)/screens/ directory */}
      {/* IMPORTANT: Removed presentation: "modal" to allow detail pages to properly display */}
      {/* Modal presentation was causing Events page to stay on top even when navigating to details */}
      <Stack.Screen name="screens/events" options={{ headerShown: false }} />
      <Stack.Screen name="screens/membership/index" options={{ headerShown: false }} />
      <Stack.Screen name="screens/booking-options/Courts" options={{ headerShown: false }} />
      <Stack.Screen name="screens/booking-options/CourtsideKutz" options={{ headerShown: false }} />

      {/* ✅ Detail pages - now part of athlete stack for proper navigation */}
      <Stack.Screen name="screens/event-details/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="screens/match-details/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="screens/practice-details/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
