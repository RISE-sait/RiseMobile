import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "./utils/auth";

export default function Index() {
  const { user, isLoading } = useAuth(); // Assume `isLoading` indicates auth status loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth loading if `isLoading` is not already provided
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  if (loading) {
    // Replace this with your splash screen or loader
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role === "athlete") {
    return <Redirect href="/(athlete)/home" />;
  } else if (user.role === "instructor") {
    return <Redirect href="/(instructor)/home" />;
  } else if (user.role === "coach") {
    return <Redirect href="/(coach)/home" />;
  }

  return null;
}

function LoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-black">
      <Text className="text-white text-lg">Loading...</Text>
    </View>
  );
}
