import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import "./globals.css";
import { useFonts } from "expo-font";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SignUpScreen from "./(auth)/signup";

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
  });

  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [initialRoute, setInitialRoute] = useState("(auth)");

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        // Check if the user is already logged in
        const user = await AsyncStorage.getItem("user");
        if (user) {
          const parsedUser = JSON.parse(user);
          switch (parsedUser.role) {
            case "athlete":
              setInitialRoute("(athlete)/home");
              break;
            case "instructor":
              setInitialRoute("(instructor)/instructorHome");
              break;
            case "coach":
              setInitialRoute("(coach)/coachHome");
              break;
            default:
              setInitialRoute("(auth)");
          }
        } else {
          setInitialRoute("(auth)");
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        setInitialRoute("(auth)");
      } finally {
        setIsAuthLoaded(true);
      }
    };

    loadAuthState();
  }, []);

  // Show a loader until fonts and auth state are loaded
  if (!fontsLoaded || !isAuthLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#B59422" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Use the initial route determined by the auth state */}
      <Stack.Screen name={initialRoute} />
    </Stack>
  );
}
