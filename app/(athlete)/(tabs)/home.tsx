import { Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images"; 
import { StatusBar } from "expo-status-bar";
import GoToCards from "../../components/GoToCards";
import { useState } from "react";
import { useRouter } from "expo-router"; 
import UpcomingCard from "@/app/components/UpcomingCard";
import ProfileHeader from "@/app/components/ProfileHeader";
import QRCodeModal from "@/app/components/QRCodeModal";
import  {mockMatches}  from "../screens/matchesData";
import dayjs from "dayjs";

export default function AthleteHome() {
  const router = useRouter(); // ✅ Initialize router
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch ] = useState(null);

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
    { label: "Schedule", route: "/calendar", image: images.schedules },
    { label: "Events", route: "/(athlete)/screens/events", image: images.event },
    { label: "Membership", route: "/(athlete)/(tabs)/membership", image: images.memberships },
    { label: "Store", route: "/(athlete)/screens/store/store", image: images.stores },
  ];
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
        <StatusBar translucent backgroundColor="transparent" style="light" />
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>

        {/* QR Code Button */}
        <QRCodeModal />

        {/* Header Section */}
        <View className="w-full px-5 mt-20">
          <ProfileHeader 
            firstName="Sam"
            lastName="Smith"
            role="RISE"
            number="34"
            profileImage={images.headshot}
            logo={images.canada}/>
        </View>

        {/* Upcoming Game Section */}
        {upcomingEvent && <UpcomingCard event={upcomingEvent} />}
        

        {/* Navigation Buttons Section */}
        <GoToCards options={navigationOptions} handleNavigate={(route) => router.push(route)} />
        </ScrollView>
    </SafeAreaView>
  );
}
