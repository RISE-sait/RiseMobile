"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, Image, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import EventDetailsModal from "./EventDetailsModal"

type UpcomingCardProps = {
  event?: {
    id: string
    date: string
    homeTeam?: string
    awayTeam?: string
    status: "scheduled" | "in_progress" | "completed" | "canceled"
    location: string
    description: string
    homeLogo?: any
    awayLogo?: any
    bgImage?: string
    type: "match" | "practice" | "class" | "meeting" | "event" | "course"
  } | null
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "scheduled":
      return "text-yellow-400"
    case "completed":
      return "text-gray-400"
    case "in_progress":
      return "text-red-500"
    default:
      return "text-white-100"
  }
}

// Helper function to format team names for better display
const formatTeamName = (teamName: string) => {
  if (!teamName) return ""
  
  // If team name is too long, try to abbreviate or wrap intelligently
  if (teamName.length > 12) {
    // Split by spaces and take first word + first letter of subsequent words
    const words = teamName.split(" ")
    if (words.length > 1) {
      return words[0] + " " + words.slice(1).map(word => word.charAt(0)).join("")
    }
  }
  return teamName
}

const UpcomingCard: React.FC<UpcomingCardProps> = ({ event }) => {
  const [modalVisible, setModalVisible] = useState(false)

  // If no event, show fallback UI
  if (!event) {
    return (
      <View className="w-full px-10 mt-10">
        <Text className="text-white-100 font-Oswald-Bold text-2xl">UPCOMING EVENT</Text>
        <View className="bg-[#444444] h-32 rounded-xl overflow-hidden mt-3 flex justify-center items-center relative">
          {/* Subtle background pattern/gradient */}
          <View className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-60" />
          
          {/* Content */}
          <View className="flex items-center justify-center space-y-2">
            <Ionicons name="calendar-outline" size={32} color="#9CA3AF" />
            <Text className="text-gray-400 font-Oswald-Medium text-lg text-center">
              No upcoming events
            </Text>
            <Text className="text-gray-500 font-Oswald-Regular text-sm text-center px-4">
              Check back later for new practices and matches
            </Text>
          </View>
        </View>
      </View>
    )
  }

  // Default background image if none provided
  const defaultBgImage =
    "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"

  // Ensure bgImage is a string
  const bgImageUri = typeof event.bgImage === "string" ? event.bgImage : defaultBgImage

  // Create a safe event object for the modal
  const safeEvent = {
    ...event,
    bgImage: bgImageUri,
    // Handle homeLogo and awayLogo safely
    homeLogo: event.homeLogo ? (typeof event.homeLogo === "string" ? event.homeLogo : event.homeLogo) : undefined,
    awayLogo: event.awayLogo ? (typeof event.awayLogo === "string" ? event.awayLogo : event.awayLogo) : undefined,
  }

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <View className="w-full px-10 mt-10">
          <Text className="text-white-100 font-Oswald-Bold text-2xl">UPCOMING EVENT</Text>
          <View className="bg-[#444444] h-36 rounded-xl overflow-hidden mt-3 flex justify-center items-center relative">
            <Image
              source={{ uri: bgImageUri }}
              className="w-full h-full absolute"
              style={{ resizeMode: "cover", opacity: 0.6 }}
            />
            <View className="absolute inset-0 bg-black-100/50" />

            {/* Matches & Practices (Athlete & Coach) */}
            {event.homeTeam && event.awayTeam ? (
              <View className="flex-row items-center justify-between px-4 w-full">
                {/* Home Team */}
                <View className="flex items-center flex-1 max-w-[35%]">
                  {event.homeLogo && (
                    <Image
                      source={typeof event.homeLogo === "string" ? { uri: event.homeLogo } : event.homeLogo}
                      className="w-12 h-12 mb-1"
                      resizeMode="contain"
                    />
                  )}
                  <Text 
                    className="text-white-100 font-Oswald-Medium uppercase text-center leading-tight"
                    style={{ fontSize: 14 }}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {formatTeamName(event.homeTeam)}
                  </Text>
                </View>

                {/* VS in the center */}
                <View className="flex items-center justify-center px-4">
                  <Text className="text-white-100 font-extrabold text-2xl tracking-wide">VS</Text>
                </View>

                {/* Away Team */}
                <View className="flex items-center flex-1 max-w-[35%]">
                  {event.awayLogo && (
                    <Image
                      source={typeof event.awayLogo === "string" ? { uri: event.awayLogo } : event.awayLogo}
                      className="w-12 h-12 mb-1"
                      resizeMode="contain"
                    />
                  )}
                  <Text 
                    className="text-white-100 font-Oswald-Medium uppercase text-center leading-tight"
                    style={{ fontSize: 14 }}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {formatTeamName(event.awayTeam)}
                  </Text>
                </View>
              </View>
            ) : (
              // Instructor Events (Classes/Meetings)
              <View className="px-4">
                <Text 
                  className="text-white-100 font-bold text-center leading-tight"
                  style={{ fontSize: 16 }}
                  numberOfLines={3}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {event.description}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* 🔹 Modal Inside the Card */}
      <EventDetailsModal isVisible={modalVisible} onClose={() => setModalVisible(false)} event={safeEvent} />
    </>
  )
}

export default UpcomingCard