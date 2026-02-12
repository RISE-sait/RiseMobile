import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

const PrivacyPolicyScreen = () => {
  const router = useRouter();

  const openPrivacyPolicy = async () => {
    const url = "https://www.risesportscomplex.com/privacy";

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to open the privacy policy. Please visit our website directly.");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to open the privacy policy. Please try again later.");
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
        <Text className="text-[#F0F0F0] text-xl font-semibold">Privacy Policy</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-6">
        {/* Introduction */}
        <View className="mb-8">
          <Text className="text-[#F0F0F0] text-lg font-semibold mb-4">
            Your Privacy Matters
          </Text>
          <Text className="text-[#CCCCCC] text-base leading-6 mb-4">
            At RISE Sports Complex, we are committed to protecting your privacy and ensuring the security of your personal information.
          </Text>
          <Text className="text-[#CCCCCC] text-base leading-6">
            Our comprehensive privacy policy outlines how we collect, use, and protect your data when you use our mobile application and services.
          </Text>
        </View>

        {/* What's Covered */}
        <View className="mb-8">
          <Text className="text-[#F0F0F0] text-lg font-semibold mb-4">
            What's Covered
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-start">
              <FontAwesome5 name="shield-alt" size={16} color="#4ade80" className="mt-1 mr-3" />
              <Text className="text-[#CCCCCC] text-base flex-1">Data collection and usage practices</Text>
            </View>
            <View className="flex-row items-start">
              <FontAwesome5 name="user-shield" size={16} color="#4ade80" className="mt-1 mr-3" />
              <Text className="text-[#CCCCCC] text-base flex-1">How we protect your personal information</Text>
            </View>
            <View className="flex-row items-start">
              <FontAwesome5 name="cookie" size={16} color="#4ade80" className="mt-1 mr-3" />
              <Text className="text-[#CCCCCC] text-base flex-1">Cookie and tracking technology usage</Text>
            </View>
            <View className="flex-row items-start">
              <FontAwesome5 name="share-alt" size={16} color="#4ade80" className="mt-1 mr-3" />
              <Text className="text-[#CCCCCC] text-base flex-1">Information sharing and third-party services</Text>
            </View>
            <View className="flex-row items-start">
              <FontAwesome5 name="user-cog" size={16} color="#4ade80" className="mt-1 mr-3" />
              <Text className="text-[#CCCCCC] text-base flex-1">Your rights and choices regarding your data</Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View className="mb-8">
          <Text className="text-[#F0F0F0] text-lg font-semibold mb-4">
            Questions or Concerns?
          </Text>
          <Text className="text-[#CCCCCC] text-base leading-6 mb-4">
            If you have any questions about our privacy practices or need assistance with your account, please don't hesitate to contact us.
          </Text>
          <Text className="text-[#CCCCCC] text-base">
            Email: info@risesportscomplex.com
          </Text>
        </View>

        {/* Call to Action Button */}
        <TouchableOpacity
          onPress={openPrivacyPolicy}
          className="bg-[#FCA311] rounded-lg py-4 px-6 items-center mb-6"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <FontAwesome5 name="external-link-alt" size={18} color="#000" className="mr-3" />
            <Text className="text-black font-semibold text-lg">
              View Full Privacy Policy
            </Text>
          </View>
        </TouchableOpacity>

        {/* Disclaimer */}
        <View className="bg-[#1A1A1A] rounded-lg p-4 mb-6">
          <Text className="text-[#AAAAAA] text-sm text-center leading-5">
            By using the RISE Sports Complex mobile app, you agree to the terms outlined in our privacy policy.
            Last updated: January 2025
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;