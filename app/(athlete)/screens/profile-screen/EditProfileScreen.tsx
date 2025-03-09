import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome6 } from "@expo/vector-icons";
import images from "@/constants/images";
import ProfileHeader from "@/app/components/ProfileHeader";

const EditProfileScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    jerseyNumber: "",
    position: "",
    email: "", // Locked field
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await fetch("https://yourapi.com/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };
    fetchUser();
  }, []);

  // Handle Input Changes
  const handleChange = (key, value) => {
    setUser((prev) => ({ ...prev, [key]: value }));
  };

  // Save Profile Updates
  const handleSaveProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("https://yourapi.com/user/update-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Profile updated successfully!");
        router.back(); // Navigate back to Profile screen
      } else {
        alert("Error updating profile: " + result.message);
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B] px-5">
        <ScrollView>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <ProfileHeader
            firstName={user.firstName}
            lastName={user.lastName}
            role={user.role}
            number={user.jerseyNumber}
            profileImage={user.profileImage ? { uri: user.profileImage } : images.headshot}
            logo={images.logo}
            />

      {/* 🔹 User Info Section */}
      <View className="bg-[#1D1C1E] px-6 py-5 rounded-3xl shadow-lg shadow-black-100 mt-4">
        
        {/* 🔸 Locked Email Field (Now Styled to Match Other Inputs) */}
        <View className="flex-row items-center bg-[#222] p-4 rounded-2xl mb-4 shadow-md shadow-black opacity-50">
          <FontAwesome6 name="envelope" size={20} color="#888" />
          <TextInput
            className="text-gray-500 flex-1 text-lg ml-3"
            value={user.email}
            editable={false} // Locked
          />
        </View>

        {/* 🔸 Editable Fields - Premium Card UI */}
        {[
          { icon: "user", key: "firstName", placeholder: "First Name", value: user.firstName },
          { icon: "user", key: "lastName", placeholder: "Last Name", value: user.lastName },
          { icon: "phone", key: "phoneNumber", placeholder: "Phone Number", value: user.phoneNumber, keyboardType: "phone-pad" },
          { icon: "shirt", key: "jerseyNumber", placeholder: "Jersey Number", value: user.jerseyNumber, keyboardType: "numeric" },
          { icon: "list", key: "position", placeholder: "Position", value: user.position },
        ].map((field, index) => (
          <View key={index} className="flex-row items-center bg-[#222] p-4 rounded-2xl mb-4 shadow-md shadow-black">
            <FontAwesome6 name={field.icon} size={20} color="#FCA311" />
            <TextInput
              className="text-white-100 flex-1 text-lg ml-3"
              value={field.value}
              onChangeText={(text) => handleChange(field.key, text)}
              placeholder={field.placeholder}
              placeholderTextColor="#888"
            />
          </View>
        ))}
      </View>

      {/* 🔹 Action Buttons */}
      <View className="mt-8 space-y-3">
        <TouchableOpacity onPress={handleSaveProfile} className="bg-gold-100 py-5 rounded-2xl items-center">
          <Text className="text-black-100 text-xl font-extrabold uppercase tracking-wider">Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} className="border border-gray-600 py-5 rounded-2xl items-center mt-5">
          <Text className="text-gray-400 text-xl font-extrabold uppercase tracking-wider">Cancel</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
