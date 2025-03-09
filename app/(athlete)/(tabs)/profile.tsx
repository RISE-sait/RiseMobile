import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import images from "@/constants/images";
import ProfileHeader from "@/app/components/ProfileHeader";
import PlayerStatsCard from "@/app/components/PlayerStatsCard";
import AccountSection from "@/app/components/AccountSection";

const AthleteProfileScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/(auth)/login");
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] px-5 items-center justify-center">
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <Text className="text-[#F0F0F0] text-base">Loading Profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <ScrollView showsVerticalScrollIndicator={false} className="px-5" contentContainerStyle={{ paddingBottom: 80 }}>
        
        {/* Profile Header */}
        <ProfileHeader
          firstName={user.firstName}
          lastName={user.lastName}
          role={user.role}
          number={user.jerseyNumber}
          profileImage={user.profileImage ? { uri: user.profileImage } : images.headshot}
          logo={images.logo}
        />

        {/* Player Stats */}
        <View className="mt-6">
          <PlayerStatsCard
            overallRating={user.overallRating}
            pointsPerGame={user.pointsPerGame}
            assistsPerGame={user.assistsPerGame}
          />
        </View>

        {/* My Account Section */}
        <AccountSection 
          title="My Account"
          items={[
            { icon: "pen-to-square", text: "Edit Profile", onPress: () => router.push("/screens/profile-screen/EditProfileScreen") },
            { icon: "bell", text: "Notifications", onPress: () => router.push("/notifications") },
            { icon: "arrow-right-from-bracket", text: "Logout", iconColor: "#EF4444", textColor: "#EF4444", onPress: handleLogout },
          ]}
        />

        {/* Support Section */}
        <AccountSection 
          title="Support"
          items={[
            { icon: "question-circle", text: "Help Center", onPress: () => router.push("/help-center") },
            { icon: "envelope", text: "Contact Us", onPress: () => router.push("/contact-us") },
          ]}
        />
        
      </ScrollView>
    </SafeAreaView>
  );
};

export default AthleteProfileScreen;
