import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router"; // Import the useRouter hook
import images from "@/constants/images"; // Import centralized images
import ProfileHeader from "../components/ProfileHeader"; // Reuse the ProfileHeader component
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage for storing user data

const CoachProfile = () => {
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
        role="Coach - Basketball"
        number="23"
        profileImage={images.coachHeadshot} // Replace with the coach's headshot
        logo={images.teamLogo} // Replace with the team logo
      />

      {/* Manage Account Button */}
      <TouchableOpacity
        onPress={() => console.log("Manage Account pressed")}
        className="bg-gray-800 mt-8 py-4 rounded-lg shadow-lg"
      >
        <Text className="text-center text-white font-bold text-xl">
          Manage Account
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

export default CoachProfile;
