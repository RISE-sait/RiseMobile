"use client"

import type React from "react"
import { TouchableOpacity, View, Text, Image, Platform } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { FontAwesome6 } from "@expo/vector-icons"
import { useRouter } from "expo-router"

interface MatchProps {
  match: {
    id: string
    homeTeam: string
    awayTeam: string
    homeScore: number
    awayScore: number
    league: string
    status: "Upcoming" | "Finished" | "Live"
    homeLogo?: string
    awayLogo?: string
  }
}

const statusStyles = {
  Upcoming: { color: "#FFA500", label: "Upcoming", icon: "clock" },
  Finished: { color: "#22C55E", label: "Finished", icon: "check-circle" },
  Live: { color: "#EF4444", label: "Live", icon: "circle-dot" },
}

const MatchCard: React.FC<MatchProps> = ({ match }) => {
  const router = useRouter()
  const { color, label, icon } = statusStyles[match.status]

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/screens/match-details/${match.id}`)}
      className="mb-4"
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.03)"]}
        className="shadow-lg shadow-black overflow-hidden"
        style={[
          {
            padding: 20,
            borderRadius: 24,
          },
          Platform.select({
            ios: {
              paddingVertical: 20, // Slightly taller on iOS
              borderRadius: 30,
              marginTop: 5, // More rounded corners on iOS
            },
            android: {
              paddingVertical: 20, // Default for Android
              borderRadius: 24, // Default corners for Android
            },
          }),
        ]}
      >
        {/* League and Status */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gold-100 uppercase font-bold tracking-wide text-xs">{match.league}</Text>
          <View className="flex-row items-center gap-1">
            <FontAwesome6 name={icon as any} size={12} color={color} />
            <Text className="font-semibold text-xs uppercase" style={{ color }}>
              {label}
            </Text>
          </View>
        </View>

        {/* Team logos & names */}
        <View className="flex-row items-center justify-between">
          {/* Home Team */}
          <View className="items-center flex-1">
            {match.homeLogo && (
              <Image source={{ uri: match.homeLogo }} className="w-12 h-12 mb-2" resizeMode="contain" />
            )}
            <Text className="text-white-100 font-semibold text-center text-sm">{match.homeTeam}</Text>
          </View>

          {/* Scores */}
          <View className="mx-3 bg-gold-100/20 px-3 py-1 rounded-full">
            <Text className="text-white-100 font-extrabold text-xl tracking-wide">
              {match.homeScore} - {match.awayScore}
            </Text>
          </View>

          {/* Away Team */}
          <View className="items-center flex-1">
            {match.awayLogo && (
              <Image source={{ uri: match.awayLogo }} className="w-12 h-12 mb-2" resizeMode="contain" />
            )}
            <Text className="text-white-100 font-semibold text-center text-sm">{match.awayTeam}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

export default MatchCard

