import { Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images"; 
import { StatusBar } from "expo-status-bar";
import GoToCards from "../../components/GoToCards";
import SlideUpModal from "../../components/SlideUpModal";
import QRCodeButton from "../../components/QRCodeButton";
import { useState } from "react";
import { useRouter } from "expo-router"; 

export default function AthleteHome() {
  const router = useRouter(); // ✅ Initialize router

  // Updated navigation function
  const handleNavigate = (route: string) => {
    router.push(route); // ✅ Now actually navigates!
  };
  const navigationOptions = [
    { label: "Schedule", route: "/calendar" },
    { label: "Events", route: "/(athlete)/screens/events" },
    { label: "Membership", route: "/(athlete)/(tabs)/membership" },
    { label: "Store", route: "/(athlete)/screens/store/store" },
  ];
  const [isModalVisible, setModalVisible] = useState(false);
    const toggleModal = () => {
      setModalVisible(!isModalVisible);
    };
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
        <StatusBar translucent backgroundColor="transparent" style="light" />
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>

        {/* QR Code Button */}
        <View className="absolute top-8 left-10 z-50">
          <QRCodeButton onPress={toggleModal} />
        </View>

        {/* Modal */}
        <SlideUpModal visible={isModalVisible} onClose={toggleModal}>          
        </SlideUpModal>

        {/* Header Section */}
        <View className="w-full px-10 mt-28">
        <View
            style={{
              backgroundColor: "#FCA311", // 🟡 Updated to Highlight Color
              height: 220,
              borderRadius: 20,
              overflow: "hidden",
              position: "relative",
              padding: 20,
            }}>
            <View className="absolute top-4 left-4 flex flex-row items-center">
              <Image
                source={images.canada} 
                className="w-10 h-10 mt-2"
                style={{ resizeMode: "contain" }}
              />
            </View>
            {/* Number with Opacity (Placed Behind the Image) */}
            <Text
              className="text-white font-bold text-[170px] absolute right-4 bottom-2 opacity-25"
              style={{ zIndex: 1 }}
            >
              34
            </Text>

            {/* Headshot Image */}
            <Image
              source={images.headshot} 
              className="absolute w-52 h-52 right-4 bottom-0"
              style={{ resizeMode: "cover", borderRadius: 10, zIndex: 2 }}
            />

            {/* Name and RISE Info */}
            <View className="absolute bottom-4 left-4">
              {/* RISE */}
              <Text style={{ color: "#1D1C1E", fontWeight: "700", fontSize: 16 }}>RISE</Text>
              <Text style={{ color: "#1D1C1E", fontWeight: "900", fontSize: 34 }}>SAM</Text>
              <Text style={{ color: "#1D1C1E", fontWeight: "900", fontSize: 34 }}>SMITH</Text>
            </View>
          </View>
        </View>

        {/* Upcoming Game Section */}
        <View className="w-full px-10 mt-10">
          <Text className="text-white-100 font-rubik-bold text-2xl">UPCOMING</Text>
          <View className="bg-[#444444] h-28 rounded-xl overflow-hidden mt-3 flex justify-center items-center">
            <Image
              source={images.matchImage} 
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                opacity: 0.5,
                resizeMode: "cover",
              }}
            />
            <Text 
            style={{
              color: "#F0F0F0",
              fontSize: 20,
              fontWeight: "800",
              textTransform: "uppercase",
            }}>
              RISE VS SURGE</Text>
          </View>
        </View>

        {/* Navigation Buttons Section */}
        <GoToCards options={navigationOptions} handleNavigate={handleNavigate} />
      </ScrollView>
    </SafeAreaView>
  );
}
