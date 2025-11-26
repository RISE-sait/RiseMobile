import React, { useState, useEffect } from "react";
import { Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import images from "@/constants/images";
import ProfileHeader from "@/components/profile/ProfileHeader";
import UpcomingCard from "@/components/events/UpcomingCard";
import GoToCards, { type NavigationOption } from "../../../components/GoToCards";
import { useAppSelector } from "@/store/hooks";
import { useUpcomingEvent } from "@/hooks/useUpcomingEvent";
import useScreenFocusLogger from "@/hooks/useScreenFocusLogger";



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
  useScreenFocusLogger("CoachHome");
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
            setUser(parsedUser);
          }
        }
      } catch (error) {
        // Error loading user data silently handled
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [reduxUser]);
  

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };




  const navigationOptions: NavigationOption[] = [
    {
      label: "Team Roster",
      route: "/(coach)/screens/selectTeamForRoster",
      icon: "users",
      description: "Manage players & assignments",
      colors: ["#134E5E", "#71B280"] as [string, string],
    },
    {
      label: "Training Schedule",
      route: "/(coach)/(tabs)/coachCalendar",
      icon: "calendar-check",
      description: "Plan upcoming practices",
      colors: ["#42275A", "#734B6D"] as [string, string],
    },
    {
      label: "Match History",
      route: "/(coach)/screens/matchHistory",
      icon: "trophy",
      description: "Review results & stats",
      colors: ["#E65C00", "#F9D423"] as [string, string],
    },
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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        

        {/* Header Section - Load user data dynamically */}
        <View className="w-full px-5 mt-20">
          {user ? (
            user.profileImage ? (
              <ProfileHeader 
                firstName={user.firstName}
                lastName={user.lastName}
                role={user.role}
                profileImage={{ uri: user.profileImage }}
                countryCode={user?.countryCode || "US"} // ✅ Ensure countryCode is always defined
                teamLogo={images.teamLogo}
              />
            ) : (
              <View className="bg-[#111111] border border-[#222222] rounded-2xl p-4">
                <Text className="text-white-100 font-Oswald-Bold text-lg">Add your profile photo</Text>
                <Text className="text-[#cccccc] text-sm mt-2">
                  Upload a picture to personalize your account and help your athletes recognize you.
                </Text>
                <TouchableOpacity
                  className="mt-3 px-4 py-2 rounded-lg bg-[#FFD700]"
                  onPress={() => router.push("/screens/edit-profile")}
                  activeOpacity={0.85}
                >
                  <Text className="text-black font-semibold text-sm">Upload photo</Text>
                </TouchableOpacity>
              </View>
            )
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
