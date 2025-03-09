import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6 } from "@expo/vector-icons";
import dayjs from "dayjs";

import CalendarCard from "@/app/components/CalendarCard";
import BackButton from "@/app/components/BackButton";

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM",
];

const services = [
  { name: "Fade", icon: "cut" },
  { name: "Line Up", icon: "border-style" },
  { name: "Zero Fade", icon: "border-none" },
  { name: "Hot Shave", icon: "fire" },
  { name: "Beard Trim", icon: "scissors" },
  { name: "Buzz Cut", icon: "user-tie" },
];

const BarberBookingScreen = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const handleConfirmBooking = () => {
    setModalVisible(false);
    alert(`✅ Booking Confirmed: ${selectedService} on ${selectedDate} at ${selectedTime}`);
  };

  const toggleModal = (show: boolean) => {
    if (show) {
      setModalVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B] px-5">
      
      {/* 🔹 Header */}
      <View className="flex-row items-center justify-between my-4">
        <BackButton />
        <Text className="text-white-100 text-3xl font-extrabold tracking-wide">
          Book a Haircut
        </Text>
        <View className="w-10" />
      </View>

      {/* 🔹 Calendar Selection */}
      <View className="mt-4">
        <CalendarCard selectedDate={selectedDate} onDayPress={(day) => setSelectedDate(day.dateString)} events={{}} />
      </View>

      {/* 🔹 Time Slot Selection (Now Horizontal Scroll) */}
      <Text className="text-gray-400 text-sm uppercase mt-6 mb-2">Select Time</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
        {timeSlots.map((time, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedTime(time)}
            className={`px-6 py-3 rounded-full ${
              selectedTime === time ? "bg-gold-100 shadow-md shadow-black" : "bg-[#222]"
            }`}
          >
            <Text className={`text-lg font-semibold ${selectedTime === time ? "text-black" : "text-white-100"}`}>
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 🔹 Service Selection */}
      <Text className="text-gray-400 text-sm uppercase mt-6 mb-2">Select Service</Text>
      <ScrollView showsVerticalScrollIndicator={false} className="space-y-3">
        {services.map((service, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedService(service.name)}
            className={`flex-row items-center justify-between p-4 rounded-xl ${
              selectedService === service.name ? "bg-gold-100 shadow-md shadow-black" : "bg-[#222]"
            }`}
          >
            <View className="flex-row items-center space-x-3">
              <FontAwesome6 name={service.icon as any} size={22} color={selectedService === service.name ? "black" : "#F0F0F0"} />
              <Text className={`text-lg font-semibold ${selectedService === service.name ? "text-black" : "text-white-100"}`}>
                {service.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 🔹 Confirm Booking Button */}
      {selectedTime && selectedService && (
        <TouchableOpacity
          onPress={() => toggleModal(true)}
          className="bg-gold-100 py-4 rounded-2xl items-center mt-6 shadow-lg shadow-black/40"
        >
          <Text className="text-black text-lg font-extrabold uppercase tracking-wider">Confirm Booking</Text>
        </TouchableOpacity>
      )}

      {/* 🔹 Booking Confirmation Modal */}
      <Modal transparent visible={isModalVisible} animationType="fade">
        <View className="flex-1 bg-black/70 justify-center items-center">
          <Animated.View
            style={{ opacity: fadeAnim }}
            className="bg-[#1A1A1A] p-6 rounded-2xl w-4/5 shadow-lg shadow-black-100"
          >
            {/* 🔹 Modal Header */}
            <View className="flex-row justify-between items-center">
              <Text className="text-white-100 text-xl font-bold">Confirm Appointment</Text>
              <TouchableOpacity onPress={() => toggleModal(false)}>
                <FontAwesome6 name="times-circle" size={24} color="gray" />
              </TouchableOpacity>
            </View>

            {/* 🔹 Appointment Details */}
            <View className="mt-4">
              <Text className="text-gray-300 text-lg text-center">You are booking:</Text>
              <Text className="text-gold-100 text-2xl font-bold text-center">{selectedService}</Text>
              <Text className="text-gray-300 text-lg text-center mt-2">On:</Text>
              <Text className="text-gold-100 text-2xl font-bold text-center">{dayjs(selectedDate).format("MMMM D, YYYY")}</Text>
              <Text className="text-gold-100 text-2xl font-bold text-center mt-2">{selectedTime}</Text>
            </View>

            {/* 🔹 Confirm & Cancel Buttons */}
            <View className="mt-6 space-y-3">
              <TouchableOpacity
                onPress={handleConfirmBooking}
                className="bg-gold-100 py-3 rounded-xl items-center shadow-md shadow-black"
              >
                <Text className="text-black text-lg font-bold uppercase">Confirm Booking</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => toggleModal(false)}
                className="border border-gray-600 py-3 rounded-xl items-center"
              >
                <Text className="text-gray-400 text-lg font-bold uppercase">Cancel</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </View>
      </Modal>
      
    </SafeAreaView>
  );
};

export default BarberBookingScreen;
