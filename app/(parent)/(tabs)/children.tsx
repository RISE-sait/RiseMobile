"use client"

import { useState } from "react"
import { Text, View, ScrollView, TouchableOpacity, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import images from "@/constants/images"

// Mock children data - in a real app, this would come from an API
const mockChildren = [
  {
    id: "1",
    firstName: "Michael",
    lastName: "Johnson",
    age: 12,
    sport: "Basketball",
    profileImage: null,
    jerseyNumber: "23",
    team: "Rising Stars",
    position: "Point Guard",
    upcomingEvents: 3,
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    age: 14,
    sport: "Volleyball",
    profileImage: null,
    jerseyNumber: "7",
    team: "Elite Spikers",
    position: "Outside Hitter",
    upcomingEvents: 2,
  },
]

export default function ChildrenScreen() {
  const router = useRouter()
  const [children, setChildren] = useState(mockChildren)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <View className="px-5 pt-12 pb-4 flex-row justify-between items-center">
        <Text className="text-white text-2xl font-bold">Your Children</Text>
        <TouchableOpacity className="bg-gold-100 rounded-full p-2" onPress={() => router.push("/screens/add-child")}>
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5">
        {children.map((child) => (
          <TouchableOpacity
            key={child.id}
            className="bg-[#1A1A1A] rounded-xl p-4 mb-4"
            onPress={() => router.push(`/screens/child-details/${child.id}`)}
          >
            <View className="flex-row">
              <Image
                source={child.profileImage ? { uri: child.profileImage } : images.headshot}
                className="w-20 h-20 rounded-xl"
              />
              <View className="ml-4 flex-1">
                <View className="flex-row justify-between">
                  <Text className="text-white text-xl font-bold">
                    {child.firstName} {child.lastName}
                  </Text>
                  <View className="bg-[#2A2A2A] px-3 py-1 rounded-full">
                    <Text className="text-gold-100">#{child.jerseyNumber}</Text>
                  </View>
                </View>

                <Text className="text-gray-400 mt-1">
                  {child.age} years • {child.sport}
                </Text>

                <View className="flex-row justify-between mt-2">
                  <Text className="text-white">{child.team}</Text>
                  <Text className="text-white">{child.position}</Text>
                </View>
              </View>
            </View>

            <View className="flex-row justify-between mt-4 pt-3 border-t border-[#333]">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => router.push(`/screens/child-schedule/${child.id}`)}
              >
                <Ionicons name="calendar-outline" size={18} color="#FFD700" />
                <Text className="text-gold-100 ml-1">{child.upcomingEvents} Upcoming</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => router.push(`/screens/child-details/${child.id}`)}
              >
                <Text className="text-gold-100 mr-1">View Profile</Text>
                <Ionicons name="chevron-forward" size={18} color="#FFD700" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          className="bg-[#1A1A1A] rounded-xl p-4 mb-4 items-center justify-center flex-row"
          onPress={() => router.push("/screens/add-child")}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFD700" />
          <Text className="text-gold-100 ml-2 text-lg">Add Another Child</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

