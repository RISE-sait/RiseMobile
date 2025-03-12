import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import images from "@/constants/images";
import playersData from "../data/players"; // Mock data file

const { width } = Dimensions.get("window");

const PlayerDetails: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Get player data based on ID
  const player = playersData.find((p) => p.id === params.id);

  // No player found handling
  if (!player) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center">
        <Text className="text-white text-lg">Player not found.</Text>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B]">
      <StatusBar translucent style="light" />

      <Animated.View style={{ opacity: fadeAnim }} className="px-5 pt-4">
        {/* Header Section */}
        <View className="flex-row justify-between items-center pb-3 border-b border-gray-800">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-3xl font-bold">{player.firstName} {player.lastName}</Text>
          <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
            <FontAwesome6 name="star" size={24} color="#FCA311" />
          </TouchableOpacity>
        </View>

        {/* Player Image & Info */}
        <View className="items-center mt-6">
          <Image
            source={player.image ? { uri: player.image } : images.headshot}
            className="w-40 h-40 rounded-full border-4 border-gold-100"
          />
          <Text className="text-white text-2xl font-bold mt-3">{player.position}</Text>
          <Text className="text-gray-400 text-lg">{player.height} ft</Text>
        </View>

        {/* Player Stats */}
        <View className="mt-6 bg-[#1A1A1A] p-5 rounded-lg">
          <Text className="text-gold-100 text-lg font-bold">Player Stats</Text>
          <View className="flex-row justify-between mt-3">
            <View className="items-center">
              <Text className="text-white text-xl font-bold">{player.ppg}</Text>
              <Text className="text-gray-400">PPG</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-bold">{player.apg}</Text>
              <Text className="text-gray-400">APG</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-bold">{player.rpg}</Text>
              <Text className="text-gray-400">RPG</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-bold">{player.fg}%</Text>
              <Text className="text-gray-400">FG%</Text>
            </View>
          </View>
        </View>

        {/* Career Highlights */}
        <View className="mt-6 bg-[#1A1A1A] p-5 rounded-lg">
          <Text className="text-gold-100 text-lg font-bold">Career Highlights</Text>
          {player.highlights.length > 0 ? (
            player.highlights.map((highlight, index) => (
              <Text key={index} className="text-white text-base mt-2">
                🏆 {highlight}
              </Text>
            ))
          ) : (
            <Text className="text-gray-400 mt-2">No career highlights available.</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View className="mt-6 flex-row justify-around">
          <TouchableOpacity
            onPress={() => console.log("View Games")}
            className="bg-[#FCA311] px-6 py-3 rounded-lg"
          >
            <Text className="text-black text-lg font-bold">View Games</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => console.log("Follow Player")}
            className="border border-gold-100 px-6 py-3 rounded-lg"
          >
            <Text className="text-gold-100 text-lg font-bold">Follow</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default PlayerDetails;
