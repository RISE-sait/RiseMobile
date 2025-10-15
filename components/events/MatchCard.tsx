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
    status?: "scheduled" | "in_progress" | "completed" | "canceled"
    league?: string
    // API team fields for proper display
    home_team_name?: string
    away_team_name?: string
    home_score?: number
    away_score?: number
    // Team logo URLs from API
    home_team_logo_url?: string
    away_team_logo_url?: string
    // Additional fields for edit/delete
    home_team_id?: string
    away_team_id?: string
    location_id?: string
    start_time?: string
  }
  onEdit?: (match: any) => void
  onDelete?: (match: any) => void
  showActions?: boolean
}

const statusStyles = {
  scheduled: { color: "#FFA500", label: "SCHEDULED", icon: "clock" },
  in_progress: { color: "#EF4444", label: "IN PROGRESS", icon: "circle-dot" },
  completed: { color: "#22C55E", label: "COMPLETED", icon: "check-circle" },
  canceled: { color: "#9CA3AF", label: "CANCELED", icon: "x-circle" },
}

const MatchCard: React.FC<MatchProps> = ({ match, onEdit, onDelete, showActions = false }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const userData = useAppSelector((state) => state.user.data)
  const token = userData?.token

  // Get teams data from Redux store
  const homeTeam = useAppSelector((state) => selectTeamById(state, match.win_team))
  const awayTeam = useAppSelector((state) => selectTeamById(state, match.lose_team))
  const teamsLoading = useAppSelector(selectTeamsLoading)

  // Default status if not provided
  const status = match.status || "scheduled"
  const { color, label, icon } = statusStyles[status]

  // Fetch teams data if not already loaded
  useEffect(() => {
    if (token && (teamsLoading === "idle" || teamsLoading === "failed")) {
      dispatch(fetchTeams(token))
    }
  }, [dispatch, token, teamsLoading])

  // Get team names - prioritize API team name fields, fallback to Redux store
  const homeTeamName = match.home_team_name || (homeTeam ? homeTeam.name : match.win_team) || "Home Team"
  const awayTeamName = match.away_team_name || (awayTeam ? awayTeam.name : match.lose_team) || "Away Team"

  // Use real team logos from API, fallback to placeholder if not available
  const homeLogo = match.home_team_logo_url || "https://via.placeholder.com/40x40?text=H"
  const awayLogo = match.away_team_logo_url || "https://via.placeholder.com/40x40?text=A"

  const handlePress = () => {
    // Navigate to match details - calls GET /games/{id}
    router.push(`/screens/match-details/${match.id}`)
  }

  const handleEdit = (e: any) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(match);
    }
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(match);
    }
  };

  return (
    <View className="mb-4">
      <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
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
              {match.home_score ?? match.win_score ?? 0} - {match.away_score ?? match.lose_score ?? 0}
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

    {/* Edit and Delete buttons - only shown for coaches */}
    {showActions && (status === "scheduled" || status === "in_progress") && (
      <View className="flex-row justify-around mt-2 px-2">
        <TouchableOpacity
          onPress={handleEdit}
          className="flex-1 bg-gold-100/20 py-2 px-4 rounded-lg mr-2 flex-row items-center justify-center"
          activeOpacity={0.7}
        >
          <FontAwesome6 name="edit" size={14} color="#FFD700" />
          <Text className="text-gold-100 font-semibold ml-2 text-sm">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          className="flex-1 bg-red-500/20 py-2 px-4 rounded-lg ml-2 flex-row items-center justify-center"
          activeOpacity={0.7}
        >
          <FontAwesome6 name="trash" size={14} color="#EF4444" />
          <Text className="text-red-500 font-semibold ml-2 text-sm">Delete</Text>
        </TouchableOpacity>
      </View>
    )}
    </View>
  )
}

export default MatchCard

