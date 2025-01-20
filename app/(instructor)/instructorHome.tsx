import React, { useState } from "react";
import { Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images"; 
import { StatusBar } from "expo-status-bar";
import GoToCards from "../components/GoToCards";
import UpcomingCard from "../components/UpcomingCard";
import SlideUpModal from "../components/SlideUpModal";
import ProfileHeader from "../components/ProfileHeader";
import QRCodeButton from "../components/QRCodeButton";

export default function InstructorHomeScreen() {
  const handleNavigate = (route) => {
    console.log(`Navigating to ${route}`);
  };

  const navigationOptions = [
    { label: "Class List", route: "/classList" },
    { label: "Course List", route: "/courseList" },
    { label: "Attendance", route: "/attendance" },
    { label: "Grades", route: "/grades" },
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
          <Text className="text-gray-800 text-lg font-bold">QR Code Modal</Text>
          <Text className="text-gray-600 mt-2">
            This is where you can display information or actions related to the QR code.
          </Text>
        </SlideUpModal>

        {/* Header Section */}
        <View className="w-full px-6 mt-20">
          <ProfileHeader
        firstName="Sam"
        lastName="Smith"
        role="Instructor - Basketball"
        number="34"
        profileImage={images.instructorHeadshot}
        logo={images.schoolLogo}
      />
        </View>

        {/* Upcoming Card Section */}
        <UpcomingCard
          title="UPCOMING CLASS"
          subtitle="CS101- Intro To Coaching"
          image={images.classImage}
        />

        {/* Navigation Buttons Section */}
        <GoToCards options={navigationOptions} handleNavigate={handleNavigate} />
        <View className="h-20">
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}