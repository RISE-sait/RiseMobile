import React, { useEffect, useState } from "react";
import { Text, View, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import images from "@/constants/images"; 
import GoToCards from "../../components/GoToCards";
import UpcomingCard from "@/app/components/UpcomingCard";
import ProfileHeader from "@/app/components/ProfileHeader";
import QRCodeModal from "@/app/components/QRCodeModal";
import { mockMatches } from "../screens/matchesData";
import dayjs from "dayjs";

// Define User Type
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
};

export default function AthleteHome() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Get today's date
  const today = dayjs().format("YYYY-MM-DD");

  // Filter upcoming matches/practices **only in the future**
  const upcomingEvent = mockMatches
    .filter((match) => ["match", "practice"].includes(match.type) && dayjs(match.date).isAfter(today))
    .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix())[0];

  const navigationOptions = [
    { label: "Schedule", route: "/calendar", image: images.schedules },
    { label: "Events", route: "/screens/events", image: images.event },
    { label: "Membership", route: "/screens/membership", image: images.memberships },
    { label: "Store", route: "/screens/store/store", image: images.stores },
  ];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center">
        <ActivityIndicator size="large" color="#FFD700" />
        <Text className="text-white text-center mt-4">Loading user data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>

        {/* QR Code Button */}
        <QRCodeModal />

        {/* Header Section - Only render when user exists */}
        <View className="w-full px-5 mt-20">
          {user ? (
            <ProfileHeader 
              firstName={user.firstName}
              lastName={user.lastName}
              role={user.role}
              number={user?.jerseyNumber ? user.jerseyNumber.toString() : "0"} // Ensure it's a string
              profileImage={user.profileImage ? { uri: user.profileImage } : images.headshot}
              countryCode={user?.countryCode} // Ensure countryCode is always defined
              teamLogo={images.teamLogo}
            />
          ) : (
            <Text className="text-white text-center">User data not available</Text>
          )}
        </View>

        {/* Upcoming Game Section */}
        {upcomingEvent && <UpcomingCard event={upcomingEvent} />}

        {/* Navigation Buttons Section */}
        <GoToCards options={navigationOptions} handleNavigate={(route) => router.push(route)} />
        
      </ScrollView>
    </SafeAreaView>
  );
}
