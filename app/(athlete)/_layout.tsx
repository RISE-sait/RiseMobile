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
      <Stack.Screen name="screens/my-events" options={{ headerShown: false }} />
      <Stack.Screen name="screens/membership/index" options={{ headerShown: false }} />
      <Stack.Screen name="screens/booking-options/Courts" options={{ headerShown: false }} />
      <Stack.Screen name="screens/booking-options/CourtsideKutz" options={{ headerShown: false }} />

      {/* Family screens (parent-child linkage) */}
      <Stack.Screen name="screens/family/child-dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="screens/family/link-request" options={{ headerShown: false }} />
      <Stack.Screen name="screens/family/pending-requests" options={{ headerShown: false }} />

      {/* ⚠️ Detail pages are NOT registered here - they use the shared screens stack from root layout */}
      {/* Navigation to /screens/event-details/[id] will use app/screens/event-details/[id].tsx */}
      {/* This prevents route duplication and ensures single source of truth */}
    </Stack>
  );
}
