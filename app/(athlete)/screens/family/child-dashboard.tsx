import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { Child } from "@/types/family";

const ChildDashboard = () => {
  const router = useRouter();
  const { childId, childName } = useLocalSearchParams<{ childId: string; childName: string }>();
  const children = useSelector((state: RootState) => state.family.children);
  const [child, setChild] = useState<Child | null>(null);

  useEffect(() => {
    const found = children.find((c) => c.id === childId);
    if (found) {
      setChild(found);
    }
  }, [childId, children]);

  if (!child) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center">
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <ActivityIndicator size="large" color="#FCA311" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <FontAwesome6 name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-Outfit-SemiBold flex-1">
          {childName || `${child.first_name} ${child.last_name}`}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-5"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Child Profile Card */}
        <View className="bg-[#1A1A1A] p-5 rounded-2xl mb-4">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-[#FCA311] items-center justify-center mr-4">
              <Text className="text-black text-2xl font-Outfit-Bold">
                {child.first_name?.charAt(0)?.toUpperCase()}
                {child.last_name?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-Outfit-SemiBold">
                {child.first_name} {child.last_name}
              </Text>
              <Text className="text-gray-400 text-sm font-Outfit-Regular mt-1">
                DOB: {child.dob || "N/A"}
              </Text>
              {child.country_code && (
                <Text className="text-gray-400 text-sm font-Outfit-Regular">
                  Country: {child.country_code}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Calendar Section - Placeholder */}
        <View className="bg-[#1A1A1A] p-5 rounded-2xl mb-4">
          <View className="flex-row items-center mb-3">
            <FontAwesome6 name="calendar" size={16} color="#FCA311" />
            <Text className="text-white text-lg font-Outfit-SemiBold ml-2">Calendar</Text>
          </View>
          <View className="py-6 items-center">
            <FontAwesome6 name="calendar-days" size={32} color="#333" />
            <Text className="text-gray-500 text-sm font-Outfit-Regular mt-2">
              Child's calendar events will appear here
            </Text>
          </View>
        </View>

        {/* Events Section - Placeholder */}
        <View className="bg-[#1A1A1A] p-5 rounded-2xl mb-4">
          <View className="flex-row items-center mb-3">
            <FontAwesome6 name="trophy" size={16} color="#FCA311" />
            <Text className="text-white text-lg font-Outfit-SemiBold ml-2">Events & Matches</Text>
          </View>
          <View className="py-6 items-center">
            <FontAwesome6 name="basketball" size={32} color="#333" />
            <Text className="text-gray-500 text-sm font-Outfit-Regular mt-2">
              Child's events and matches will appear here
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChildDashboard;
