import { Stack } from "expo-router";

export default function AthleteLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* ✅ Main Tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* ✅ Athlete-specific modal screens - flattened structure to prevent route group nesting */}
      {/* Only declare screens that exist in app/(athlete)/screens/ directory */}
      <Stack.Screen name="screens/events" options={{ presentation: "modal" }} />
      <Stack.Screen name="screens/membership" options={{ presentation: "modal" }} />
      <Stack.Screen name="screens/booking-options/Courts" options={{ presentation: "modal" }} />
      <Stack.Screen name="screens/booking-options/CourtsideKutz" options={{ presentation: "modal" }} />

      {/* ✅ Shared event/match/practice detail screens */}
      <Stack.Screen name="screens/event-details/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="screens/match-details/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="screens/practice-details/[id]" options={{ headerShown: false }} />

      {/* ✅ Other shared screens in app/screens/ are handled by app/screens/_layout.tsx */}
      {/* Removed: store/*, profile-screen/*, and other shared screens - accessed via /screens/ routes */}
    </Stack>
  );
}
