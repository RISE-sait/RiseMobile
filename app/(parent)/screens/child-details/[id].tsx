"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import BackButton from "@/app/components/BackButton"
import images from "@/constants/images"
import { mockMatches } from "@/app/(athlete)/screens/matchesData"
import dayjs from "dayjs"

// Mock child data - in a real app, this would come from an API
const mockChildren = {
  "1": {
    id: "1",
    firstName: "Michael",
    lastName: "Johnson",
    age: 12,
    sport: "Basketball",
    profileImage: null,
    jerseyNumber: "23",
    team: "Rising Stars",
    position: "Point Guard",
    height: "5'2\"",
    weight: "110 lbs",
    coach: "Coach Williams",
    stats: {
      points: 12.5,
      rebounds: 3.2,
      assists: 4.8,
      steals: 1.5,
    },
  },
  "2": {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    age: 14,
    sport: "Volleyball",
    profileImage: null,
    jerseyNumber: "7",
    team: "Elite Spikers",
    position: "Outside Hitter",
    height: "5'6\"",
    weight: "125 lbs",
    coach: "Coach Martinez",
    stats: {
      kills: 8.3,
      blocks: 2.1,
      aces: 3.5,
      digs: 6.2,
    },
  },
}

export default function ChildDetailsScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [child, setChild] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // In a real app, fetch child data from API
    setChild(mockChildren[id as string])
  }, [id])

  if (!child) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    )
  }

  // Get upcoming events for this child
  const today = dayjs().format("YYYY-MM-DD")
  const upcomingEvents = mockMatches
    .filter(
      (match) =>
        dayjs(match.date).isAfter(today) &&
        // In a real app, filter by childId
        (child.sport === "Basketball" ? match.type === "match" : match.type === "practice"),
    )
    .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix())
    .slice(0, 3)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <ScrollView className="flex-1">
        <View className="px-5 pt-12">
          <BackButton />

          <View className="items-center mt-4">
            <Image
              source={child.profileImage ? { uri: child.profileImage } : images.headshot}
              className="w-24 h-24 rounded-full"
            />

            <View className="bg-[#2A2A2A] px-3 py-1 rounded-full mt-2">
              <Text className="text-gold-100">#{child.jerseyNumber}</Text>
            </View>

            <Text className="text-white text-2xl font-bold mt-2">
              {child.firstName} {child.lastName}
            </Text>

            <Text className="text-gray-400">
              {child.age} years • {child.sport}
            </Text>

            <View className="flex-row mt-4">
              <TouchableOpacity
                className="bg-[#1A1A1A] px-4 py-2 rounded-full flex-row items-center mr-3"
                onPress={() => router.push(`/screens/child-schedule/${child.id}`)}
              >
                <Ionicons name="calendar" size={16} color="#FFD700" />
                <Text className="text-gold-100 ml-2">Schedule</Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-[#1A1A1A] px-4 py-2 rounded-full flex-row items-center">
                <Ionicons name="pencil" size={16} color="#FFD700" />
                <Text className="text-gold-100 ml-2">Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row justify-around bg-[#1A1A1A] rounded-xl p-2 mt-6">
            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg ${activeTab === "overview" ? "bg-[#333]" : ""}`}
              onPress={() => setActiveTab("overview")}
            >
              <Text className={`text-center ${activeTab === "overview" ? "text-gold-100" : "text-white"}`}>
                Overview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg ${activeTab === "stats" ? "bg-[#333]" : ""}`}
              onPress={() => setActiveTab("stats")}
            >
              <Text className={`text-center ${activeTab === "stats" ? "text-gold-100" : "text-white"}`}>Stats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-2 rounded-lg ${activeTab === "documents" ? "bg-[#333]" : ""}`}
              onPress={() => setActiveTab("documents")}
            >
              <Text className={`text-center ${activeTab === "documents" ? "text-gold-100" : "text-white"}`}>
                Documents
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "overview" && (
            <View className="mt-6">
              <View className="bg-[#1A1A1A] rounded-xl p-4 mb-4">
                <Text className="text-white font-bold mb-3">Team Information</Text>

                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-400">Team</Text>
                  <Text className="text-white">{child.team}</Text>
                </View>

                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-400">Position</Text>
                  <Text className="text-white">{child.position}</Text>
                </View>

                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-400">Coach</Text>
                  <Text className="text-white">{child.coach}</Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Jersey #</Text>
                  <Text className="text-white">{child.jerseyNumber}</Text>
                </View>
              </View>

              <View className="bg-[#1A1A1A] rounded-xl p-4 mb-4">
                <Text className="text-white font-bold mb-3">Physical Information</Text>

                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-400">Age</Text>
                  <Text className="text-white">{child.age} years</Text>
                </View>

                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-400">Height</Text>
                  <Text className="text-white">{child.height}</Text>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Weight</Text>
                  <Text className="text-white">{child.weight}</Text>
                </View>
              </View>

              <View className="mb-4">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-white font-bold">Upcoming Events</Text>
                  <TouchableOpacity onPress={() => router.push(`/screens/child-schedule/${child.id}`)}>
                    <Text className="text-gold-100">View All</Text>
                  </TouchableOpacity>
                </View>

                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event, index) => (
                    <TouchableOpacity key={index} className="bg-[#1A1A1A] rounded-xl p-4 mb-2">
                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text className="text-gold-100 font-bold">{event.type.toUpperCase()}</Text>
                          <Text className="text-white text-lg font-bold">{event.title}</Text>
                          <Text className="text-gray-400">
                            {dayjs(event.date).format("MMM D, YYYY")} • {event.time}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#666" />
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View className="bg-[#1A1A1A] rounded-xl p-4 items-center">
                    <Text className="text-white">No upcoming events</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {activeTab === "stats" && (
            <View className="mt-6">
              <View className="bg-[#1A1A1A] rounded-xl p-4 mb-4">
                <Text className="text-white font-bold mb-3">Season Statistics</Text>

                {child.sport === "Basketball" ? (
                  <>
                    <View className="flex-row justify-between mb-4">
                      <View className="items-center">
                        <Text className="text-gold-100 text-xl font-bold">{child.stats.points}</Text>
                        <Text className="text-gray-400">PPG</Text>
                      </View>

                      <View className="items-center">
                        <Text className="text-gold-100 text-xl font-bold">{child.stats.rebounds}</Text>
                        <Text className="text-gray-400">RPG</Text>
                      </View>

                      <View className="items-center">
                        <Text className="text-gold-100 text-xl font-bold">{child.stats.assists}</Text>
                        <Text className="text-gray-400">APG</Text>
                      </View>

                      <View className="items-center">
                        <Text className="text-gold-100 text-xl font-bold">{child.stats.steals}</Text>
                        <Text className="text-gray-400">SPG</Text>
                      </View>
                    </View>

                    <View className="mb-2">
                      <Text className="text-gray-400 mb-1">Points Per Game</Text>
                      <View className="h-2 bg-[#333] rounded-full overflow-hidden">
                        <View
                          className="h-full bg-gold-100 rounded-full"
                          style={{ width: `${(child.stats.points / 30) * 100}%` }}
                        />
                      </View>
                    </View>

                    <View className="mb-2">
                      <Text className="text-gray-400 mb-1">Rebounds Per Game</Text>
                      <View className="h-2 bg-[#333] rounded-full overflow-hidden">
                        <View
                          className="h-full bg-gold-100 rounded-full"
                          style={{ width: `${(child.stats.rebounds / 15) * 100}%` }}
                        />
                      </View>
                    </View>

                    <View className="mb-2">
                      <Text className="text-gray-400 mb-1">Assists Per Game</Text>
                      <View className="h-2 bg-[#333] rounded-full overflow-hidden">
                        <View
                          className="h-full bg-gold-100 rounded-full"
                          style={{ width: `${(child.stats.assists / 10) * 100}%` }}
                        />
                      </View>
                    </View>

                    <View>
                      <Text className="text-gray-400 mb-1">Steals Per Game</Text>
                      <View className="h-2 bg-[#333] rounded-full overflow-hidden">
                        <View
                          className="h-full bg-gold-100 rounded-full"
                          style={{ width: `${(child.stats.steals / 5) * 100}%` }}
                        />
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <View className="flex-row justify-between mb-4">
                      <View className="items-center">
                        <Text className="text-gold-100 text-xl font-bold">{child.stats.kills}</Text>
                        <Text className="text-gray-400">Kills</Text>
                      </View>

                      <View className="items-center">
                        <Text className="text-gold-100 text-xl font-bold">{child.stats.blocks}</Text>
                        <Text className="text-gray-400">Blocks</Text>
                      </View>

                      <View className="items-center">
                        <Text className="text-gold-100 text-xl font-bold">{child.stats.aces}</Text>
                        <Text className="text-gray-400">Aces</Text>
                      </View>

                      <View className="items-center">
                        <Text className="text-gold-100 text-xl font-bold">{child.stats.digs}</Text>
                        <Text className="text-gray-400">Digs</Text>
                      </View>
                    </View>

                    <View className="mb-2">
                      <Text className="text-gray-400 mb-1">Kills Per Game</Text>
                      <View className="h-2 bg-[#333] rounded-full overflow-hidden">
                        <View
                          className="h-full bg-gold-100 rounded-full"
                          style={{ width: `${(child.stats.kills / 15) * 100}%` }}
                        />
                      </View>
                    </View>

                    <View className="mb-2">
                      <Text className="text-gray-400 mb-1">Blocks Per Game</Text>
                      <View className="h-2 bg-[#333] rounded-full overflow-hidden">
                        <View
                          className="h-full bg-gold-100 rounded-full"
                          style={{ width: `${(child.stats.blocks / 5) * 100}%` }}
                        />
                      </View>
                    </View>

                    <View className="mb-2">
                      <Text className="text-gray-400 mb-1">Aces Per Game</Text>
                      <View className="h-2 bg-[#333] rounded-full overflow-hidden">
                        <View
                          className="h-full bg-gold-100 rounded-full"
                          style={{ width: `${(child.stats.aces / 5) * 100}%` }}
                        />
                      </View>
                    </View>

                    <View>
                      <Text className="text-gray-400 mb-1">Digs Per Game</Text>
                      <View className="h-2 bg-[#333] rounded-full overflow-hidden">
                        <View
                          className="h-full bg-gold-100 rounded-full"
                          style={{ width: `${(child.stats.digs / 10) * 100}%` }}
                        />
                      </View>
                    </View>
                  </>
                )}
              </View>

              <TouchableOpacity className="bg-[#1A1A1A] rounded-xl p-4 mb-4 items-center justify-center">
                <Text className="text-gold-100 font-bold">View Detailed Stats</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "documents" && (
            <View className="mt-6">
              <View className="bg-[#1A1A1A] rounded-xl p-4 mb-4">
                <Text className="text-white font-bold mb-3">Documents</Text>

                <TouchableOpacity className="flex-row items-center mb-3 pb-3 border-b border-[#333]">
                  <MaterialCommunityIcons name="file-document-outline" size={24} color="#FFD700" />
                  <View className="ml-3 flex-1">
                    <Text className="text-white">Medical Release Form</Text>
                    <Text className="text-gray-400 text-xs">Uploaded on Jan 15, 2023</Text>
                  </View>
                  <Ionicons name="download-outline" size={20} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center mb-3 pb-3 border-b border-[#333]">
                  <MaterialCommunityIcons name="file-document-outline" size={24} color="#FFD700" />
                  <View className="ml-3 flex-1">
                    <Text className="text-white">Liability Waiver</Text>
                    <Text className="text-gray-400 text-xs">Uploaded on Jan 15, 2023</Text>
                  </View>
                  <Ionicons name="download-outline" size={20} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center">
                  <MaterialCommunityIcons name="file-document-outline" size={24} color="#FFD700" />
                  <View className="ml-3 flex-1">
                    <Text className="text-white">Player Registration</Text>
                    <Text className="text-gray-400 text-xs">Uploaded on Jan 15, 2023</Text>
                  </View>
                  <Ionicons name="download-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity className="bg-[#1A1A1A] rounded-xl p-4 mb-4 flex-row items-center justify-center">
                <Ionicons name="cloud-upload-outline" size={24} color="#FFD700" />
                <Text className="text-gold-100 ml-2 font-bold">Upload New Document</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

