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
      <Stack.Screen name="screens/teamRoster" options={{ presentation: "modal" }} />
      <Stack.Screen name="screens/coach-booking/practiceBooking" options={{ presentation: "modal" }} />
      <Stack.Screen name="screens/profile-options/contactUs" options={{ presentation: "modal" }} />

      {/* ✅ Shared event/match/practice detail screens */}
      <Stack.Screen name="screens/event-details/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="screens/match-details/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="screens/practice-details/[id]" options={{ headerShown: false }} />

      {/* ✅ Other shared screens in app/screens/ are handled by app/screens/_layout.tsx */}
      {/* Removed: edit-profile, notificationSettings, helpCenter, legal/* - accessed via /screens/ routes */}
    </Stack>
  );
}
