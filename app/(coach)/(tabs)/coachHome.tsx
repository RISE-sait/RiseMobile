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
  const reduxUser = useAppSelector((state) => state.user.data);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const matches = useAppSelector((state) => state.games.items) || [];
  const practices = useAppSelector((state) => state.practices.items) || [];


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

// Replace this section in your CoachHomeScreen component:



const today = dayjs(); // Keep as dayjs object, don't format to string
// Add this debugging section right after your useEffect that fetches the user:

useEffect(() => {
  // Debug Redux data
  console.log("🔍 DEBUG: Redux matches count:", matches.length);
  console.log("🔍 DEBUG: Redux practices count:", practices.length);
  console.log("🔍 DEBUG: Full matches array:", JSON.stringify(matches, null, 2));
  console.log("🔍 DEBUG: Full practices array:", JSON.stringify(practices, null, 2));
  
  // Check if arrays exist but have different structure
  if (matches.length > 0) {
    console.log("🔍 DEBUG: First match structure:", Object.keys(matches[0]));
    console.log("🔍 DEBUG: First match data:", matches[0]);
  }
  
  if (practices.length > 0) {
    console.log("🔍 DEBUG: First practice structure:", Object.keys(practices[0]));
    console.log("🔍 DEBUG: First practice data:", practices[0]);
  }
}, [matches, practices]);

// Also debug the mapping process:
const allEvents = [
  ...matches.map((match, index) => {
    console.log(`🔍 DEBUG: Mapping match ${index}:`, match);
    return { ...match, type: "match" };
  }),
  ...practices.map((practice, index) => {
    console.log(`🔍 DEBUG: Mapping practice ${index}:`, practice);
    return { ...practice, type: "practice" };
  }),
];

console.log("🔍 DEBUG: All events after mapping:", allEvents.length);
console.log("🔍 DEBUG: All events data:", JSON.stringify(allEvents, null, 2));

// P2-1: Optimized event prioritization for coaches
const getUpcomingEvent = () => {
  const upcomingEvents = allEvents.filter((event) => {
    const eventDate = dayjs(event.date);
    const isToday = eventDate.isSame(today, 'day');
    const isFuture = eventDate.isAfter(today, 'day');
    
    console.log(`Event ${event.id}: date=${event.date}, isToday=${isToday}, isFuture=${isFuture}, today=${today.format("YYYY-MM-DD")}`);
    
    return isToday || isFuture;
  });

  console.log("🎯 P2-1 Coach: All upcoming events:", upcomingEvents.length);

  // Prioritize Tryouts and Games according to PRD requirements
  const prioritizeEvents = (events) => {
    // First priority: Tryouts and Games/Matches  
    const highPriorityEvents = events.filter((event) => {
      const eventType = event.type?.toLowerCase() || "";
      const eventTitle = event.title?.toLowerCase() || event.name?.toLowerCase() || "";
      
      // Check for tryouts in type or title
      const isTryout = eventType.includes("tryout") || eventTitle.includes("tryout");
      // Check for games/matches in type
      const isGame = eventType === "match" || eventType === "game" || eventType.includes("game");
      
      console.log(`Coach Event ${event.id}: type="${eventType}", title="${eventTitle}", isTryout=${isTryout}, isGame=${isGame}`);
      
      return isTryout || isGame;
    });

    console.log("🏆 P2-1 Coach: High priority events (Tryouts/Games):", highPriorityEvents.length);

    if (highPriorityEvents.length > 0) {
      return highPriorityEvents.sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());
    }

    // Fallback: return all upcoming events sorted by date if no high priority events
    console.log("📅 P2-1 Coach: Using fallback - all upcoming events");
    return events.sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());
  };

  const prioritizedEvents = prioritizeEvents(upcomingEvents);
  const selectedEvent = prioritizedEvents[0] || null;
  
  console.log("✅ P2-1 Coach: Selected event:", selectedEvent?.title || selectedEvent?.name || "none", "type:", selectedEvent?.type || "none");
  
  return selectedEvent;
};

const upcomingEvent = getUpcomingEvent();

const mapToUpcomingCardFormat = (event: any) => ({
  id: event.id,
  date: event.date || dayjs().format("YYYY-MM-DD"),
  homeTeam: event.homeTeam || "Home Team",
  awayTeam: event.awayTeam || "Away Team",
  status: "Upcoming" as "Upcoming",
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
                    ? user.jerseyNumber.toString()
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
        

        {/* Upcoming Game Section - Always render, component handles fallback */}
        <UpcomingCard event={upcomingEvent ? mapToUpcomingCardFormat(upcomingEvent) : null} />

        {/* Navigation Buttons Section */}
        <GoToCards options={navigationOptions} handleNavigate={(route) => router.push(route as any)} />
        
      </ScrollView>
    </SafeAreaView>
  );
}
