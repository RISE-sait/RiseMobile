import { Stack } from "expo-router";
import { CartProvider } from "../(athlete)/screens/store/cartContext";

export default function AppLayout() {
  return (
    <CartProvider>
    <Stack screenOptions={{ headerShown: false }}>
      {/* ✅ Main Tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* ✅ Screens inside "screens/" */}
      <Stack.Screen name="screens" options={{ headerShown: false }} />
    </Stack>
    </CartProvider>
  );
}
