import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

const TermsOfServiceScreen = () => {
  const router = useRouter();

  const openTermsOfService = async () => {
    const url = "https://www.risesportscomplex.com/terms";

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to open the terms of service. Please visit our website directly.");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to open the terms of service. Please try again later.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-[#2A2A2A]">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <FontAwesome5 name="arrow-left" size={20} color="#F0F0F0" />
        </TouchableOpacity>
        <Text className="text-[#F0F0F0] text-xl font-semibold">Terms of Service</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-6">
        {/* Introduction */}
        <View className="mb-8">
          <Text className="text-[#F0F0F0] text-lg font-semibold mb-4">
            Terms & Conditions
          </Text>
          <Text className="text-[#CCCCCC] text-base leading-6 mb-4">
            Welcome to RISE Sports Complex! These terms of service govern your use of our mobile application and all related services.
          </Text>
          <Text className="text-[#CCCCCC] text-base leading-6">
            By using our app, you agree to comply with and be bound by these terms and conditions.
          </Text>
        </View>

        {/* Key Areas Covered */}
        <View className="mb-8">
          <Text className="text-[#F0F0F0] text-lg font-semibold mb-4">
            What's Covered
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-start">
              <FontAwesome5 name="mobile-alt" size={16} color="#FFD700" className="mt-1 mr-3" />
              <Text className="text-[#CCCCCC] text-base flex-1">Mobile app usage and account responsibilities</Text>
            </View>
            <View className="flex-row items-start">
              <FontAwesome5 name="calendar-check" size={16} color="#FFD700" className="mt-1 mr-3" />
              <Text className="text-[#CCCCCC] text-base flex-1">Event registration and booking policies</Text>
            </View>
            <View className="flex-row items-start">
              <FontAwesome5 name="credit-card" size={16} color="#FFD700" className="mt-1 mr-3" />
              <Text className="text-[#CCCCCC] text-base flex-1">Payment terms and refund policies</Text>
            </View>
            <View className="flex-row items-start">
              <FontAwesome5 name="star" size={16} color="#FFD700" className="mt-1 mr-3" />
              <Text className="text-[#CCCCCC] text-base flex-1">Credits system and membership benefits</Text>
            </View>
            <View className="flex-row items-start">
              <FontAwesome5 name="shield-alt" size={16} color="#FFD700" className="mt-1 mr-3" />
              <Text className="text-[#CCCCCC] text-base flex-1">User conduct and facility rules</Text>
            </View>
            <View className="flex-row items-start">
              <FontAwesome5 name="ban" size={16} color="#FFD700" className="mt-1 mr-3" />
              <Text className="text-[#CCCCCC] text-base flex-1">Cancellation and modification policies</Text>
            </View>
          </View>
        </View>

        {/* Important Notice */}
        <View className="mb-8 bg-[#2A1A00] border-l-4 border-[#FFD700] p-4 rounded-r-lg">
          <View className="flex-row items-start">
            <FontAwesome5 name="exclamation-triangle" size={16} color="#FFD700" className="mt-1 mr-3" />
            <View className="flex-1">
              <Text className="text-[#FFD700] font-semibold text-base mb-2">Important Notice</Text>
              <Text className="text-[#CCCCCC] text-sm leading-5">
                Please read our complete terms of service carefully. These terms include important information about liability, dispute resolution, and your rights as a user.
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View className="mb-8">
          <Text className="text-[#F0F0F0] text-lg font-semibold mb-4">
            Questions About These Terms?
          </Text>
          <Text className="text-[#CCCCCC] text-base leading-6 mb-4">
            If you have any questions about our terms of service or need clarification on any policies, our team is here to help.
          </Text>
          <Text className="text-[#CCCCCC] text-base">
            Email: info@risesportscomplex.com
          </Text>
        </View>

        {/* Call to Action Button */}
        <TouchableOpacity
          onPress={openTermsOfService}
          className="bg-[#FFD700] rounded-lg py-4 px-6 items-center mb-6"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <FontAwesome5 name="external-link-alt" size={18} color="#000" className="mr-3" />
            <Text className="text-black font-semibold text-lg">
              View Full Terms of Service
            </Text>
          </View>
        </TouchableOpacity>

        {/* Disclaimer */}
        <View className="bg-[#1A1A1A] rounded-lg p-4 mb-6">
          <Text className="text-[#AAAAAA] text-sm text-center leading-5">
            By continuing to use the RISE Sports Complex mobile app, you acknowledge that you have read, understood, and agree to be bound by these terms of service.
            Last updated: January 2025
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsOfServiceScreen;