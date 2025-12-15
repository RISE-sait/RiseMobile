import { Stack } from "expo-router";

export default function CoachLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* ✅ Main Tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* ✅ Coach-specific modal screens - flattened structure to prevent route group nesting */}
      {/* Only declare screens that exist in app/(coach)/screens/ directory */}
      <Stack.Screen name="screens/createMatch" options={{ presentation: "modal" }} />
      <Stack.Screen name="screens/matchHistory" options={{ presentation: "modal" }} />
      <Stack.Screen name="screens/selectTeamForRoster" options={{ presentation: "modal" }} />
      <Stack.Screen name="screens/teamRoster" options={{ presentation: "card" }} />
      <Stack.Screen name="screens/coach-booking/practiceBooking" options={{ presentation: "modal" }} />
      <Stack.Screen name="screens/profile-options/contactUs" options={{ presentation: "modal" }} />

      {/* ⚠️ Detail pages are NOT registered here - they use the shared screens stack from root layout */}
      {/* Navigation to /screens/event-details/[id] will use app/screens/event-details/[id].tsx */}
      {/* This prevents route duplication and ensures single source of truth */}
    </Stack>
  );
}
