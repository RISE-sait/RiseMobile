import { Stack } from "expo-router";
import "./globals.css"
import { useFonts } from "expo-font";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Bebas-Neue": require("../assets/fonts/BebasNeue-Regular.ttf"),
    "Oswald-Bold": require("../assets/fonts/Oswald-Bold.ttf"),
    "Oswald-Light": require("../assets/fonts/Oswald-Light.ttf"),
    "Oswald-ExtraLight": require("../assets/fonts/Oswald-ExtraLight.ttf"),
    "Oswald-Regular": require("../assets/fonts/Oswald-Regular.ttf"),
    "Oswald-Medium": require("../assets/fonts/Oswald-Medium.ttf"),
    "Oswald-SemiBold": require("../assets/fonts/Oswald-SemiBold.ttf"),
    "Outfit-Black": require("../assets/fonts/Outfit-Black.ttf"),
    "Outfit-Light": require("../assets/fonts/Outfit-Light.ttf"),
    "Outfit-ExtraLight": require("../assets/fonts/Outfit-ExtraLight.ttf"),
    "Outfit-Regular": require("../assets/fonts/Outfit-Regular.ttf"),
    "Outfit-Medium": require("../assets/fonts/Outfit-Medium.ttf"),
    "Outfit-SemiBold": require("../assets/fonts/Outfit-SemiBold.ttf"),
    "Outfit-Bold": require("../assets/fonts/Outfit-Bold.ttf"),
    "Outfit-ExtraBold": require("../assets/fonts/Outfit-ExtraBold.ttf"),
    "Outfit-Thin": require("../assets/fonts/Outfit-Thin.ttf"),
    "ProtestStrike-Regular": require("../assets/fonts/ProtestStrike-Regular.ttf"),
  })
  return (
    
    <Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="(auth)" />
  <Stack.Screen name="(athlete)" />
  <Stack.Screen name="(instructor)" />
  <Stack.Screen name="(coach)" />
</Stack>

  );
}
