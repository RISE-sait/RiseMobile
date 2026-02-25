import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { Child } from "@/types/family";
import { useAuth } from "@/utils/auth";
import { adminRemoveLink } from "@/utils/api/family";

const InfoCard = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]/50">
    <View className="flex-row items-center mb-2">
      <FontAwesome6 name={icon} size={12} color="#FCA311" />
      <Text className="text-gray-400 text-xs font-Outfit-SemiBold ml-2 uppercase tracking-wide">
        {label}
      </Text>
    </View>
    <Text className="text-white-100 text-base font-Outfit-Medium">
      {value || "Not available"}
    </Text>
  </View>
);

const ChildDashboard = () => {
  const router = useRouter();
  const { getValidToken } = useAuth();
  const { childId, childName } = useLocalSearchParams<{ childId: string; childName: string }>();
  const children = useSelector((state: RootState) => state.family.children);
  const [child, setChild] = useState<Child | null>(null);
  const [unlinking, setUnlinking] = useState(false);

  useEffect(() => {
    const found = children.find((c) => c.id === childId);
    if (found) {
      setChild(found);
    }
  }, [childId, children]);

  const handleUnlink = () => {
    Alert.alert(
      "Unlink Child",
      `Are you sure you want to unlink ${child?.first_name} ${child?.last_name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlink",
          style: "destructive",
          onPress: async () => {
            if (!child) return;

            setUnlinking(true);
            try {
              const token = await getValidToken();
              if (!token) {
                Alert.alert("Error", "Authentication failed. Please try again.");
                return;
              }

              await adminRemoveLink(token, child.id);
              Alert.alert("Success", "Child unlinked successfully");
              router.back();
            } catch (error: any) {
              console.error("Failed to unlink child:", error);
              Alert.alert("Error", "Failed to unlink child. Please try again.");
            } finally {
              setUnlinking(false);
            }
          },
        },
      ]
    );
  };

  if (!child) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center">
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <ActivityIndicator size="small" color="#FCA311" />
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const getCountryFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View className="flex-row items-center px-5 py-3 mb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 py-2"
          activeOpacity={0.6}
        >
          <FontAwesome6 name="arrow-left" size={18} color="#FFF" />
        </TouchableOpacity>
        <Text className="text-white-100 text-lg font-Outfit-SemiBold">Child Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* Profile Header */}
        <View className="items-center mb-6">
          {child.photo_url ? (
            <Image
              source={{ uri: child.photo_url }}
              className="w-24 h-24 rounded-full mb-3"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-[#FCA311] items-center justify-center mb-3">
              <Text className="text-black text-3xl font-Outfit-Bold">
                {child.first_name?.charAt(0)?.toUpperCase()}
                {child.last_name?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="text-white-100 text-2xl font-Outfit-Bold">
            {child.first_name} {child.last_name}
          </Text>
          <Text className="text-gray-400 text-sm font-Outfit-Regular mt-1">
            Athlete
          </Text>
        </View>

        {/* Information Section */}
        <View className="mb-6">
          <Text className="text-white-100 text-base font-Outfit-SemiBold mb-3">
            Personal Information
          </Text>
          <View className="gap-3">
            <InfoCard
              icon="cake-candles"
              label="Date of Birth"
              value={formatDate(child.dob)}
            />
            <InfoCard
              icon="earth-americas"
              label="Country"
              value={child.country_code ? `${getCountryFlag(child.country_code)} ${child.country_code}` : "Not available"}
            />
          </View>
        </View>

        {/* Team Section - Placeholder for now */}
        <View className="mb-6">
          <Text className="text-white-100 text-base font-Outfit-SemiBold mb-3">
            Team Information
          </Text>
          <View className="bg-[#1A1A1A] rounded-xl p-5 border border-[#2A2A2A]/50">
            <View className="items-center py-4">
              <View className="w-12 h-12 rounded-full bg-[#2A2A2A] items-center justify-center mb-3">
                <FontAwesome6 name="users" size={20} color="#666" />
              </View>
              <Text className="text-gray-400 text-sm font-Outfit-Regular text-center">
                No team assigned
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-white-100 text-base font-Outfit-SemiBold mb-3">
            Quick Actions
          </Text>
          <TouchableOpacity
            className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A]/50 flex-row items-center justify-between"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#FCA311]/10 items-center justify-center mr-3">
                <FontAwesome6 name="calendar-check" size={14} color="#FCA311" />
              </View>
              <Text className="text-white-100 text-sm font-Outfit-Medium">
                View Sessions
              </Text>
            </View>
            <FontAwesome6 name="chevron-right" size={12} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View className="mb-4">
          <Text className="text-white-100 text-base font-Outfit-SemiBold mb-3">
            Account Actions
          </Text>
          <TouchableOpacity
            onPress={handleUnlink}
            disabled={unlinking}
            className="bg-red-500/10 rounded-xl p-4 border border-red-500/30 flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            {unlinking ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <FontAwesome6 name="link-slash" size={14} color="#EF4444" />
                <Text className="text-red-400 text-sm font-Outfit-SemiBold ml-2">
                  Unlink Child
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChildDashboard;
