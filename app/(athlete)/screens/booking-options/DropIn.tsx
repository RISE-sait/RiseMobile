import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  ImageBackground,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6 } from "@expo/vector-icons";
import BackButton from "@/app/components/BackButton";

// Mock court data (Replace with API in future)
const courts = [
  { id: 1, name: "Main Court", location: "Arena 1", available: true, capacity: 10, hours: "9 AM - 10 PM", image: "https://images.unsplash.com/photo-1577416412292-747c6607f055?q=80&w=1170&auto=format&fit=crop" },
  { id: 2, name: "Court 2", location: "Arena 1", available: false, capacity: 8, hours: "10 AM - 9 PM", image: "https://images.unsplash.com/photo-1577416412292-747c6607f055?q=80&w=1170&auto=format&fit=crop" },
  { id: 3, name: "Court 3", location: "Arena 2", available: true, capacity: 12, hours: "8 AM - 11 PM", image: "https://images.unsplash.com/photo-1577416412292-747c6607f055?q=80&w=1170&auto=format&fit=crop" },
  { id: 4, name: "Court 4", location: "Arena 2", available: false, capacity: 6, hours: "7 AM - 8 PM", image: "https://images.unsplash.com/photo-1577416412292-747c6607f055?q=80&w=1170&auto=format&fit=crop" },
  { id: 5, name: "Training Court", location: "Gym 1", available: true, capacity: 15, hours: "6 AM - 12 AM", image: "https://images.unsplash.com/photo-1577416412292-747c6607f055?q=80&w=1170&auto=format&fit=crop" },
];

const DropInCourtsScreen = () => {
  const [showAvailable, setShowAvailable] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const filteredCourts = showAvailable
    ? courts.filter((court) => court.available)
    : courts;

  const handleToggleAvailability = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setShowAvailable(!showAvailable);
  };

  const handleCourtPress = (court) => {
    setSelectedCourt(court);
    setModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B] px-5">
      {/* 🔹 Header */}
      <View className="flex-row items-center justify-between my-4">
        <BackButton />
        <Text className="text-white-100 text-3xl font-extrabold tracking-wide">
          Drop-In Courts
        </Text>
        <View className="w-10" />
      </View>

      {/* 🔹 Availability Toggle */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          onPress={handleToggleAvailability}
          className="flex-row items-center justify-center bg-gold-100 py-3 rounded-xl mt-2 shadow-md shadow-black"
        >
          <FontAwesome6
            name={showAvailable ? "eye-slash" : "eye"}
            size={20}
            color="#0C0B0B"
          />
          <Text className="text-black text-lg font-bold uppercase tracking-wide ml-3">
            {showAvailable ? "Show All Courts" : "Show Available Courts"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 🔹 Courts Grid View */}
      <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
        <View className="flex-row flex-wrap justify-between">
          {filteredCourts.map((court) => (
            <TouchableOpacity
              key={court.id}
              activeOpacity={0.85}
              className="w-[48%] mb-4"
              onPress={() => handleCourtPress(court)}
            >
              <View className="relative rounded-xl overflow-hidden shadow-lg shadow-black/40">
                {/* Court Image with Overlay */}
                <ImageBackground 
                  source={{ uri: court.image }} 
                  resizeMode="cover" 
                  className="h-[160px] w-full"
                >
                  <View className="absolute inset-0 bg-black/50 rounded-xl" />

                  {/* Court Name & Location */}
                  <View className="absolute bottom-4 left-4">
                    <Text className="text-white-100 text-lg font-bold">
                      {court.name}
                    </Text>
                    <Text className="text-gray-300 text-sm">{court.location}</Text>
                  </View>

                  {/* 🔹 Old Availability Style */}
                  <View className="absolute top-4 right-4 flex-row items-center bg-[#222]/70 py-1 px-3 rounded-full">
                    <FontAwesome6
                      name={court.available ? "check-circle" : "times-circle"}
                      size={16}
                      color={court.available ? "#4ade80" : "#EF4444"}
                    />
                    <Text
                      className={`text-sm font-semibold ml-2 ${
                        court.available ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {court.available ? "Open" : "Closed"}
                    </Text>
                  </View>
                </ImageBackground>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 🔹 Court Details Modal */}
      <Modal transparent visible={isModalVisible} animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center">
          <View className="bg-[#1A1A1A] p-6 rounded-2xl w-4/5 shadow-lg shadow-black-100">
            
            {/* 🔹 Modal Header */}
            <View className="flex-row justify-between items-center">
              <Text className="text-white-100 text-xl font-bold">Court Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome6 name="times-circle" size={24} color="gray" />
              </TouchableOpacity>
            </View>

            {/* 🔹 Court Info */}
            {selectedCourt && (
              <View className="mt-4">
                <ImageBackground
                  source={{ uri: selectedCourt.image }}
                  resizeMode="cover"
                  className="h-[180px] w-full rounded-xl overflow-hidden"
                >
                  <View className="absolute inset-0 bg-black/50 rounded-xl" />
                </ImageBackground>

                <Text className="text-white-100 text-2xl font-bold mt-4">{selectedCourt.name}</Text>
                <Text className="text-gray-300 text-sm">{selectedCourt.location}</Text>

                <Text className="text-gray-400 text-sm mt-4">Opening Hours:</Text>
                <Text className="text-white-100 text-lg font-bold">{selectedCourt.hours}</Text>

                <Text className="text-gray-400 text-sm mt-2">Capacity:</Text>
                <Text className="text-white-100 text-lg font-bold">{selectedCourt.capacity} People</Text>
              </View>
            )}

            {/* 🔹 Close Button */}
            <TouchableOpacity onPress={() => setModalVisible(false)} className="mt-6 bg-red-500 py-4 rounded-xl items-center">
              <Text className="text-white-100 text-lg font-semibold uppercase">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DropInCourtsScreen;
