import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView, View, Text, ScrollView, TouchableOpacity,
  Dimensions, Animated, ImageBackground, Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome6 } from "@expo/vector-icons";
import dayjs from "dayjs";
import { mockMatches, MatchDetails } from "../matchesData";

const { width } = Dimensions.get("window");

const statusStyles = {
  Upcoming: { label: "Upcoming", color: "#FFD369" },
  Finished: { label: "Final", color: "#4ade80" },
  Live: { label: "Live", color: "#EF4444" },
};

const MatchDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [match, setMatch] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundMatch = mockMatches.find((match) => match.id === id);

    if (foundMatch) {
      setMatch(foundMatch);
    } else {
      console.warn("Match not found!");
    }
    setLoading(false);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [id]);

  if (loading || !match) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <StatusBar style="light" />
        <Text className="text-gray-400">Loading match details...</Text>
      </SafeAreaView>
    );
  }

  const { color, label } = statusStyles[match.status];

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <StatusBar style="light" />
      <ScrollView>
        <ImageBackground
          source={{ uri: match.bgImage }}
          resizeMode="cover"
          className="h-[300px] w-full"
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.6)", "transparent"]}
            className="absolute top-0 bottom-0 left-0 right-0"
          />
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-4 bg-black/40 rounded-full p-2"
          >
            <FontAwesome6 name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </ImageBackground>

        <Animated.View style={{ opacity: fadeAnim }} className="-mt-12 bg-[#1A1A1A] rounded-t-3xl px-6 py-8">
          <View className="flex-row justify-between items-center">
            <Text className="text-white-100 text-3xl font-bold tracking-widest">
              {match.league}
            </Text>
            <View className="flex-row items-center gap-2">
              <FontAwesome6 name="circle-dot" size={14} color={color} />
              <Text className="font-semibold text-base uppercase" style={{ color }}>
                {label}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between my-6">
            <View className="items-center flex-1">
              <Image source={{ uri: match.homeLogo }} className="w-20 h-20" resizeMode="contain" />
              <Text className="text-white-100 text-lg font-semibold mt-2 text-center">
                {match.homeTeam}
              </Text>
            </View>

            <Text className="text-white-100 text-4xl font-extrabold">
              {match.homeScore} - {match.awayScore}
            </Text>

            <View className="items-center flex-1">
              <Image source={{ uri: match.awayLogo }} className="w-20 h-20" resizeMode="contain" />
              <Text className="text-white-100 text-lg font-semibold mt-2 text-center">
                {match.awayTeam}
              </Text>
            </View>
          </View>

          <View className="border-t border-gray-700 my-4" />

          <View className="flex-row items-center gap-3 mb-4">
            <FontAwesome6 name="calendar-days" size={18} color="#FCA311" />
            <Text className="text-gray-300 text-base">
              {dayjs(match.date).format("dddd, MMMM D, YYYY - h:mm A")}
            </Text>
          </View>

          <View className="flex-row items-center gap-3 mb-4">
            <FontAwesome6 name="location-dot" size={18} color="#FCA311" />
            <Text className="text-gray-300 text-base">{match.location}</Text>
          </View>

          <Text className="text-white-100 text-lg font-semibold mb-2">Match Highlights</Text>
          <Text className="text-gray-300 text-base leading-6">
            {match.description}
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MatchDetailsScreen;
