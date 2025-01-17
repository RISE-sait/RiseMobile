import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import images from "@/constants/images"; // Import centralized images
import ProfileHeader from "../components/ProfileHeader"; // Reusing the ProfileHeader component
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage for storing user data

const AthleteHomeScreen = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900 px-6">
      {/* Status Bar */}
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Profile Header */}
      <ProfileHeader
        firstName="John"
        lastName="Doe"
        role="Athlete - Soccer"
        number="10"
        profileImage={images.headshot} // Replace with the athlete's headshot
        logo={images.canada} // Replace with an appropriate logo
      />

      {/* Upcoming Match Button */}
      <TouchableOpacity
        onPress={() => console.log("Upcoming Matches pressed")}
        className="bg-gray-800 mt-8 py-4 rounded-lg shadow-lg"
      >
        <Text className="text-center text-white font-bold text-xl">
          View Upcoming Matches
        </Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-600 mt-4 py-4 rounded-lg shadow-lg"
      >
        <Text className="text-center text-white font-bold text-xl">Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AthleteHomeScreen;
