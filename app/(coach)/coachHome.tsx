import React, { useState } from "react";
import { Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import { StatusBar } from "expo-status-bar";
import GoToCards from "../components/GoToCards";
import SlideUpModal from "../components/SlideUpModal";
import QRCodeButton from "../components/QRCodeButton";

export default function CoachHomeScreen() {
  const handleNavigate = (route) => {
    console.log(`Navigating to ${route}`);
  };

  const navigationOptions = [
    { label: "Team Roster", route: "/teamRoster" },
    { label: "Training Schedule", route: "/trainingSchedule" },
    { label: "Match History", route: "/matchHistory" },
    { label: "Player Stats", route: "/playerStats" },
  ];
  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };


  return (
    <SafeAreaView className="bg-gray-800 flex-1">
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
          <View className="bg-[#B59422] h-60 rounded-3xl overflow-hidden relative flex px-4 items-center">
            <View className="absolute top-4 left-4 flex flex-row items-center">
              <Image
                source={images.teamLogo} // Replace with your team logo
                className="w-10 h-10 mt-2"
                style={{ resizeMode: "contain" }}
              />
            </View>
            {/* Number with Opacity (Placed Behind the Image) */}
            <Text
              className="text-white-100 font-bold text-[170px] absolute right-4 bottom-2 opacity-25"
              style={{ zIndex: 1 }}
            >
              23
            </Text>

            {/* Headshot Image */}
            <Image
              source={images.coachHeadshot} // Replace with the coach's image
              className="absolute w-52 h-52 right-4 bottom-0"
              style={{ resizeMode: "cover", borderRadius: 10, zIndex: 2 }}
            />

            {/* Name and Team Info */}
            <View className="absolute bottom-4 left-4">
              {/* First Name */}
              <Text className="text-white-100 font-Oswald-SemiBold text-4xl uppercase">John</Text>
              {/* Last Name */}
              <Text className="text-white-100 font-Oswald-SemiBold text-4xl uppercase">Doe</Text>
              {/* Role */}
              <Text className="text-black-100 font-Outfit-Bold text-base mb-1">Basketball Coach</Text>
            </View>
          </View>
        </View>

        {/* Upcoming Game Section */}
        <View className="w-full px-10 mt-10">
          <Text className="text-white-100 font-Oswald-Bold text-2xl">UPCOMING GAME</Text>
          <View className="bg-[#444444] h-28 rounded-xl overflow-hidden mt-3 flex justify-center items-center">
            <Image
              source={images.matchImage} // Replace with your placeholder image
              className="w-full h-full absolute"
              style={{ resizeMode: "cover", opacity: 0.6 }}
            />
            <Text className="text-white-100 font-Outfit-Bold text-xl">
              Youth League - Team A vs Team B
            </Text>
          </View>
        </View>

        {/* Navigation Buttons Section */}
        <GoToCards options={navigationOptions} handleNavigate={handleNavigate} />

      </ScrollView>
    </SafeAreaView>
  );
}
