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
import dayjs from "dayjs";
import { useAppSelector } from "@/store/hooks";



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
  jerseyNumber?: number;};



export default function CoachHomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const matches = useAppSelector((state) => state.games.items) || [];
  const practices = useAppSelector((state) => state.practices.items) || [];


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
  // Map both matches and practices into a common format
    const allEvents = [
      ...matches.map((match) => ({ ...match, type: "match" })),
      ...practices.map((practice) => ({ ...practice, type: "practice" })),
];

const mapToUpcomingCardFormat = (event: any) => ({
  id: event.id,
  date: event.date || dayjs().format("YYYY-MM-DD"),
  homeTeam: event.homeTeam || "Home Team",
  awayTeam: event.awayTeam || "Away Team",
  status: "Upcoming" as "Upcoming", // ✅ Explicit literal
  location: event.location || "RISE Basketball Facility",
  description: event.description || event.title || "Upcoming Event",
  homeLogo:
    event.homeLogo ||
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1780&auto=format&fit=crop",
  awayLogo:
    event.awayLogo ||
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1780&auto=format&fit=crop",
  bgImage:
    event.bgImage ||
    "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
  type: event.type,
});



const upcomingEvent = allEvents
  .filter((event) => dayjs(event.date).isAfter(today))
  .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix())[0];



  const navigationOptions = [
    { label: "Team Roster", route: "/screens/teamRoster", image: images.teamRoster },
    { label: "Training Schedule", route: "/coachCalendar", image: images.schedules },
    { label: "Match History", route: "/screens/matchHistory", image: images.matchHistory },
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
              number={user?.role === "Player" && user.jerseyNumber ? user.jerseyNumber.toString() : "CJ"} // ✅ Only for players
              profileImage={user.profileImage ? { uri: user.profileImage } : images.coachHeadshot}
              countryCode={user?.countryCode || "US"} // ✅ Ensure countryCode is always defined
              teamLogo={images.teamLogo}
            />
          ) : (
            <Text className="text-white text-center">User data not available</Text>
          )}
        </View>

        {/* Upcoming Game Section */}
        {upcomingEvent && <UpcomingCard event={mapToUpcomingCardFormat(upcomingEvent)} />}



        {/* Navigation Buttons Section */}
        <GoToCards options={navigationOptions} handleNavigate={(route) => router.push(route as any)} />
        
      </ScrollView>
    </SafeAreaView>
  );
}
