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

      {/* ✅ Shared screens like event/match/practice details are accessed via /screens/ routes */}
      {/* These are registered in app/_layout.tsx as a "screens" Stack.Screen */}
      {/* and handled by app/screens/_layout.tsx for auto-discovery */}
    </Stack>
  );
}
