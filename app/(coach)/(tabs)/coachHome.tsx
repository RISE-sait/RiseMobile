import React, { useState, useEffect } from "react";
import { Text, View, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import images from "@/constants/images";
import ProfileHeader from "@/app/components/ProfileHeader";
import UpcomingCard from "@/app/components/UpcomingCard";
import QRCodeModal from "@/app/components/QRCodeModal";
import GoToCards from "../../components/GoToCards";
import dayjs from "dayjs";
import { mockMatches } from '@/app/(athlete)/screens/matchesData';

export default function CoachHomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log("📢 Loaded user from AsyncStorage:", parsedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("❌ Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  // Get today's date
  const today = dayjs().format("YYYY-MM-DD");

  // Filter upcoming matches/practices **only in the future**
  const upcomingEvent = mockMatches
    .filter((match) => ["match", "practice"].includes(match.type) && dayjs(match.date).isAfter(today))
    .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix())[0];

  const handleMatchPress = (match) => {
    setSelectedMatch(match);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMatch(null);
  };

  const navigationOptions = [
    { label: "Team Roster", route: "/screens/teamRoster", image: images.teamRoster },
    { label: "Training Schedule", route: "/coachCalendar", image: images.schedules },
    { label: "Match History", route: "/screens/matchHistory", image: images.matches },
    { label: "Player Stats", route: "/screens/playerStats", image: images.playerStats },
  ];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center">
        <ActivityIndicator size="large" color="#FFD700" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        
        {/* QR Code Button */}
        <QRCodeModal />

        {/* Header Section - Load user data dynamically */}
        <View className="w-full px-5 mt-20">
          {user ? (
            <ProfileHeader 
              firstName={user.firstName}
              lastName={user.lastName}
              role={user.role}
              number={user?.jerseyNumber ? user.jerseyNumber.toString() : "0"} // ✅ Ensures it's a string
              profileImage={user.profileImage ? { uri: user.profileImage } : images.coachHeadshot}
              countryCode={user?.countryCode || "US"} // ✅ Ensure countryCode is always defined
              teamLogo={images.logo}
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
