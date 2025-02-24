import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="events" options={{ presentation: "modal" }} />
      <Stack.Screen name="membership" options={{ presentation: "modal" }} />
      <Stack.Screen name="store" options={{ presentation: "modal" }} />
      <Stack.Screen name="store/product-details/[id]" options={{ presentation: "modal" }} />
      <Stack.Screen name="store/checkout" options={{ presentation: "modal" }} />
      <Stack.Screen name="event-details/[id]" options={{ presentation: "fullScreenModal" }} />
      <Stack.Screen name="store/cart" options={{ presentation: "modal" }} />
      <Stack.Screen name="match-details/[id]" options={{ presentation: "modal" }} />
          </Stack>
  );
}
