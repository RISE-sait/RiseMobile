import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import images from "@/constants/images";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PlayerStatsCard from "@/components/profile/PlayerStatsCard";
import AccountSection from "@/components/profile/AccountSection";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  jerseyNumber?: string;
  profileImage?: string;
  countryCode: string;
  token: string;
  overallRating?: number;
  pointsPerGame?: number;
  assistsPerGame?: number;
};

const AthleteProfileScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log("📢 Loaded user from AsyncStorage:", parsedUser);

        setUser({
          ...parsedUser,
          firstName: parsedUser.firstName || parsedUser.first_name || "",
          lastName: parsedUser.lastName || parsedUser.last_name || "",
          countryCode: parsedUser.countryCode || parsedUser.country_code || "US", // Ensure correct key
        });
      } else {
        console.log("⚠️ No user found in AsyncStorage.");
      }
    } catch (error) {
      console.error("❌ Error loading user:", error);
    }
  };

  loadUser();
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
        
        <ProfileHeader
          firstName={user.firstName}
          lastName={user.lastName}
          role={user.role}
          number={user?.jerseyNumber ? user.jerseyNumber.toString() : "0"} // ✅ Ensures it's a string
          profileImage={user.profileImage ? { uri: user.profileImage } : images.headshot}
          countryCode={user?.countryCode } // ✅ Ensure countryCode is always defined
          teamLogo={images.teamLogo}
        />

        {/* Player Stats */}
        <View className="mt-6">
        <PlayerStatsCard 
        overallRating={user?.overallRating ?? 0}
        pointsPerGame={user?.pointsPerGame ?? 0}
        assistsPerGame={user?.assistsPerGame ?? 0}
/>

        </View>

        {/* My Account Section */}
        <AccountSection 
          title="My Account"
          items={[
            { icon: "pen-to-square", text: "Edit Profile", onPress: () => router.push("/screens/edit-profile") },
            { icon: "bell", text: "Notifications", onPress: () => router.push("/screens/comingSoon") },
            { icon: "arrow-right-from-bracket", text: "Logout", iconColor: "#EF4444", textColor: "#EF4444", onPress: handleLogout },
          ]}
        />

        {/* Support Section */}
        <AccountSection 
          title="Support"
          items={[
            { icon: "question-circle", text: "Help Center", onPress: () => router.push("/screens/profile-options/helpCenter") },
            { icon: "envelope", text: "Contact Us", onPress: () => router.push("/screens/profile-options/contactUs") },
          ]}
        />
        
      </ScrollView>
    </SafeAreaView>
  );
};

export default AthleteProfileScreen;
