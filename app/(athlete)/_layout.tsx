import { Stack } from "expo-router";

export default function AthleteLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* ✅ Main Tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* ✅ Athlete-specific modal screens - flattened structure to prevent route group nesting */}
      {/* Only declare screens that exist in app/(athlete)/screens/ directory */}
      <Stack.Screen name="screens/events" options={{ presentation: "modal" }} />
      <Stack.Screen name="screens/membership/index" options={{ presentation: "modal" }} />
      <Stack.Screen name="screens/booking-options/Courts" options={{ presentation: "modal" }} />
      <Stack.Screen name="screens/booking-options/CourtsideKutz" options={{ presentation: "modal" }} />

      {/* ✅ Shared screens like event/match/practice details are accessed via /screens/ routes */}
      {/* These are registered in app/_layout.tsx as a "screens" Stack.Screen */}
      {/* and handled by app/screens/_layout.tsx for auto-discovery */}
    </Stack>
  );
}
