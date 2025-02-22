import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define the structure of the membership data
interface MembershipData {
  membershipType: string;
  status: string;
  nextPaymentDate: string;
  renewalCost: string;
}

// Mock API URL (Replace with your actual backend endpoint)
const API_URL = "https://your-backend.com/api/membership";

const MembershipScreen: React.FC = () => {
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch membership data from API
  const fetchMembershipData = async () => {
    setLoading(true);
    setError(null);
  
    try {
      // Retrieve authentication token (assumed stored in AsyncStorage)
      const token = await AsyncStorage.getItem("authToken");
  
      console.log("Retrieved Token:", token); // 🔍 Debugging
  
      if (!token) {
        throw new Error("User not authenticated. No token found.");
      }
  
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch membership details. Status: ${response.status}`);
      }
  
      const data: MembershipData = await response.json();
      setMembership(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };
  

  // Fetch membership details on screen load
  useEffect(() => {
    fetchMembershipData();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-900 px-4 pt-5">
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Header */}
      <View className="py-5">
        <Text className="text-center text-3xl font-bold text-white">🏆 Membership Status</Text>
      </View>

      {/* Loading State */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FFD700" />
          <Text className="text-gray-400 mt-3">Loading membership details...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 font-bold">{error}</Text>
          <TouchableOpacity
            className="mt-6 bg-red-500 py-3 px-6 rounded-lg"
            onPress={fetchMembershipData}
          >
            <Text className="text-white font-bold text-lg text-center">
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="bg-gray-800 p-5 rounded-xl shadow-md">
          {/* Membership Type */}
          <Text className="text-white text-xl font-bold text-center">
            {membership?.membershipType} Membership
          </Text>

          {/* Status Badge */}
          <View
            style={{
              marginTop: 12,
              padding: 8,
              borderRadius: 8,
              width: 120,
              alignItems: "center",
              backgroundColor: membership?.status === "Active" ? "#32CD32" : "#FF4500",
            }}
          >
            <Text className="text-white font-semibold">
              {membership?.status}
            </Text>
          </View>

          {/* Next Payment Due */}
          <Text className="text-gray-400 text-md mt-5">
            🔔 Next Payment Due: {membership?.nextPaymentDate}
          </Text>
          <Text className="text-gray-400 text-md mt-2">
            💰 Renewal Cost: {membership?.renewalCost}
          </Text>

          {/* Upgrade Membership Button */}
          <TouchableOpacity
            className="mt-6 bg-yellow-500 py-3 px-6 rounded-lg"
            onPress={() => Alert.alert("Upgrade Membership", "Feature coming soon!")}
          >
            <Text className="text-black font-bold text-lg text-center">
              Upgrade Membership
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MembershipScreen;
