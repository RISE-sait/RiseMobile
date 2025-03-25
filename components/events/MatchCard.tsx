"use client"

import type React from "react"
import { TouchableOpacity, View, Text, Image, Platform } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { FontAwesome6 } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchTeams, selectTeamById, selectTeamsLoading } from "@/store/slices/teamsSlice"

interface MatchProps {
  match: {
    id: string
    name?: string
    win_team?: string
    lose_team?: string
    win_score?: number
    lose_score?: number
    status?: "Upcoming" | "Finished" | "Live"
    league?: string
  }
}

const statusStyles = {
  Upcoming: { color: "#FFA500", label: "Upcoming", icon: "clock" },
  Finished: { color: "#22C55E", label: "Finished", icon: "check-circle" },
  Live: { color: "#EF4444", label: "Live", icon: "circle-dot" },
}

const MatchCard: React.FC<MatchProps> = ({ match }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.data)
  const token = userData?.token

  // Get teams data from Redux store
  const homeTeam = useAppSelector((state) => selectTeamById(state, match.win_team))
  const awayTeam = useAppSelector((state) => selectTeamById(state, match.lose_team))
  const teamsLoading = useAppSelector(selectTeamsLoading)

  // Default status if not provided
  const status = match.status || "Upcoming"
  const { color, label, icon } = statusStyles[status]

  // Fetch teams data if not already loaded
  useEffect(() => {
    if (token && (teamsLoading === "idle" || teamsLoading === "failed")) {
      dispatch(fetchTeams(token))
    }
  }, [dispatch, token, teamsLoading])

  // Get team names from Redux store
  const homeTeamName = homeTeam ? homeTeam.name : match.win_team || "Home Team"
  const awayTeamName = awayTeam ? awayTeam.name : match.lose_team || "Away Team"

  // Use placeholder logos
  const homeLogo = "https://via.placeholder.com/100"
  const awayLogo = "https://via.placeholder.com/100"

  const handlePress = () => {
    router.push({
      pathname: `/screens/match-details/${match.id}`,
      params: { type: "game" },
    })
  }

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handlePress} className="mb-4">
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
              paddingVertical: 20,
              borderRadius: 30,
              marginTop: 5,
            },
            android: {
              paddingVertical: 20,
              borderRadius: 24,
            },
          }),
        ]}
      >
        {/* League and Status */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gold-100 uppercase font-bold tracking-wide text-xs">
            {match.name || "Basketball Match"}
          </Text>
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
            <Image source={{ uri: homeLogo }} className="w-12 h-12 mb-2" resizeMode="contain" />
            <Text className="text-white-100 font-semibold text-center text-sm">{homeTeamName}</Text>
          </View>

          {/* Scores */}
          <View className="mx-3 bg-gold-100/20 px-3 py-1 rounded-full">
            <Text className="text-white-100 font-extrabold text-xl tracking-wide">
              {match.win_score || 0} - {match.lose_score || 0}
            </Text>
          </View>

          {/* Away Team */}
          <View className="items-center flex-1">
            <Image source={{ uri: awayLogo }} className="w-12 h-12 mb-2" resizeMode="contain" />
            <Text className="text-white-100 font-semibold text-center text-sm">{awayTeamName}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

export default MatchCard

