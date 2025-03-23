"use client"

import { useEffect, useState, useRef } from "react"
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  ImageBackground,
  Image,
  StyleSheet,
} from "react-native"
import { StatusBar } from "expo-status-bar"
import { useLocalSearchParams, useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { FontAwesome6 } from "@expo/vector-icons"
import dayjs from "dayjs"
import { mockMatches, type MatchDetails } from "@/app/(athlete)/screens/matchesData"
import { MotiView } from "moti"

const { width } = Dimensions.get("window")

const statusStyles = {
  Upcoming: { label: "Upcoming", color: "#FFD369", bgColor: "rgba(255, 211, 105, 0.15)" },
  Finished: { label: "Final", color: "#4ade80", bgColor: "rgba(74, 222, 128, 0.15)" },
  Live: { label: "Live", color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.15)" },
}

const MatchDetailsScreen = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const scrollY = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  const [match, setMatch] = useState<MatchDetails | null>(null)
  const [loading, setLoading] = useState(true)

  // Header animation values
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 150],
    outputRange: [0, 0.8, 1],
    extrapolate: "clamp",
  })

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [-100, 0],
    extrapolate: "clamp",
  })

  useEffect(() => {
    const foundMatch = mockMatches.find((match) => match.id === id)

    if (foundMatch) {
      setMatch(foundMatch)
    } else {
      console.warn("Match not found!")
    }
    setLoading(false)

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()
  }, [id])

  if (loading || !match) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <StatusBar style="light" />
        <FontAwesome6 name="spinner" size={24} color="#FCA311" className="animate-spin" />
        <Text className="text-white-100 mt-4">Loading match details...</Text>
      </SafeAreaView>
    )
  }

  const { color, label, bgColor } = statusStyles[match.status]

  return (
    <View className="flex-1 bg-[#121212]">
      <StatusBar style="light" />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="mr-4"
        >
          <FontAwesome6 name="arrow-left" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white-100 text-lg font-bold">
          {match.homeTeam} vs {match.awayTeam}
        </Text>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        <ImageBackground source={{ uri: match.bgImage }} resizeMode="cover" className="h-[300px] w-full">
          <LinearGradient
            colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.7)"]}
            locations={[0, 0.3, 0.6, 1]}
            className="absolute top-0 bottom-0 left-0 right-0"
          />
          <SafeAreaView>
            <TouchableOpacity
              onPress={() => router.back()}
              className="mt-12 ml-4 bg-black/40 rounded-full p-2 w-10 h-10 items-center justify-center"
            >
              <FontAwesome6 name="arrow-left" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </SafeAreaView>
        </ImageBackground>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 800 }}
          className="-mt-16 bg-[#1A1A1A] rounded-t-3xl px-6 pt-8 pb-12"
          style={styles.contentContainer}
        >
          {/* League and Status */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white-100 text-2xl font-bold">{match.league}</Text>
            <View className="flex-row items-center px-3 py-1.5 rounded-full" style={{ backgroundColor: bgColor }}>
              <FontAwesome6
                name={match.status === "Live" ? "circle-dot" : match.status === "Upcoming" ? "clock" : "flag-checkered"}
                size={12}
                color={color}
              />
              <Text className="font-semibold text-sm ml-2 uppercase" style={{ color }}>
                {label}
              </Text>
            </View>
          </View>

          {/* Teams and Score */}
          <View className="bg-[#252525] rounded-2xl p-5 mb-6">
            <View className="flex-row items-center justify-between">
              <View className="items-center flex-1">
                <Image source={{ uri: match.homeLogo }} className="w-20 h-20" resizeMode="contain" />
                <Text className="text-white-100 text-base font-semibold mt-2 text-center">{match.homeTeam}</Text>
              </View>

              <View className="items-center">
                <Text className="text-white-100 text-4xl font-extrabold">
                  {match.homeScore} - {match.awayScore}
                </Text>
                {match.status === "Live" && (
                  <View className="flex-row items-center mt-2 bg-[#EF4444]/20 px-3 py-1 rounded-full">
                    <FontAwesome6 name="circle-dot" size={8} color="#EF4444" />
                    <Text className="text-[#EF4444] text-xs font-medium ml-1">LIVE</Text>
                  </View>
                )}
              </View>

              <View className="items-center flex-1">
                <Image source={{ uri: match.awayLogo }} className="w-20 h-20" resizeMode="contain" />
                <Text className="text-white-100 text-base font-semibold mt-2 text-center">{match.awayTeam}</Text>
              </View>
            </View>
          </View>

          {/* Match Details */}
          <View className="bg-[#252525] rounded-2xl p-5 mb-6">
            <Text className="text-white-100 text-lg font-semibold mb-4">Match Details</Text>

            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 rounded-full bg-[#FCA311]/20 items-center justify-center">
                <FontAwesome6 name="calendar-days" size={16} color="#FCA311" />
              </View>
              <View>
                <Text className="text-gray-400 text-xs mb-1">Date & Time</Text>
                <Text className="text-white-100 text-base">{dayjs(match.date).format("dddd, MMMM D, YYYY")}</Text>
                <Text className="text-gray-300 text-sm">{dayjs(match.date).format("h:mm A")}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 rounded-full bg-[#FCA311]/20 items-center justify-center">
                <FontAwesome6 name="location-dot" size={16} color="#FCA311" />
              </View>
              <View>
                <Text className="text-gray-400 text-xs mb-1">Location</Text>
                <Text className="text-white-100 text-base">{match.location}</Text>
              </View>
            </View>
          </View>

          {/* Match Highlights */}
          <View className="bg-[#252525] rounded-2xl p-5">
            <Text className="text-white-100 text-lg font-semibold mb-3">Match Highlights</Text>
            <Text className="text-gray-300 text-base leading-6">{match.description}</Text>
          </View>

          {/* Actions */}
          <View className="flex-row mt-6 gap-4">
            <TouchableOpacity
              className="flex-1 bg-[#FCA311] rounded-xl py-3 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <FontAwesome6 name="video" size={16} color="#000" />
              <Text className="text-black font-semibold ml-2">Watch Highlights</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-[#252525] rounded-xl py-3 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <FontAwesome6 name="share" size={16} color="#FCA311" />
              <Text className="text-white-100 font-semibold ml-2">Share</Text>
            </TouchableOpacity>
          </View>
        </MotiView>
      </Animated.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: "#121212",
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
})

export default MatchDetailsScreen

