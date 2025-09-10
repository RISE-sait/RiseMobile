import React, { useState, useEffect } from "react";
import { Text, View, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import images from "@/constants/images";
import ProfileHeader from "@/components/profile/ProfileHeader";
import UpcomingCard from "@/components/events/UpcomingCard";
import QRCodeModal from "@/components/QRCodeModal";
import GoToCards from "../../../components/GoToCards";
import { useAppSelector } from "@/store/hooks";
import { useUpcomingEvent } from "@/hooks/useUpcomingEvent";



type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImage?: string;
  countryCode: string;
  token: string;
  teamLogo?: string;
  phoneNumber?: string;
  jerseyNumber?: string | number;  // Support both string and number
};



export default function CoachHomeScreen() {
  const router = useRouter();
  const reduxUser = useAppSelector((state) => state.user.data);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Use the new hook to get upcoming events from /secure/schedule
  const { upcomingEvent, loading: eventLoading, error: eventError } = useUpcomingEvent();


  useEffect(() => {
    const fetchUser = async () => {
      try {
        // If we have user in Redux, use that
        if (reduxUser) {
          setUser(reduxUser);
        } else {
          // Otherwise try to load from AsyncStorage (backward compatibility)
          const storedUser = await AsyncStorage.getItem("user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log("📢 Loaded user from AsyncStorage:", parsedUser);
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error("❌ Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [reduxUser]);
  

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };




  const navigationOptions = [
    { label: "Team Roster", route: "/screens/selectTeamForRoster", image: images.teamRoster },
    { label: "Training Schedule", route: "/coachCalendar", image: images.schedules },
    { label: "Match History", route: "/screens/matchHistory", image: images.matchHistory },
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
                number={
                  user?.role === "Player" && user.jerseyNumber
                    ? String(user.jerseyNumber)
                    : `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase()
                }
              profileImage={user.profileImage ? { uri: user.profileImage } : images.coachHeadshot}
              countryCode={user?.countryCode || "US"} // ✅ Ensure countryCode is always defined
              teamLogo={images.teamLogo}
            />
          ) : (
            <Text className="text-white text-center">User data not available</Text>
          )}
        </View>
        

        {/* Upcoming Event Section - Using new /secure/schedule API */}
        <UpcomingCard event={upcomingEvent} />

        {/* Navigation Buttons Section */}
        <GoToCards options={navigationOptions} handleNavigate={(route) => router.push(route as any)} />
        
      </ScrollView>
    </SafeAreaView>
  );
}
