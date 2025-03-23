"use client"

import { useState } from "react"
import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { FlatList } from "react-native-gesture-handler"
import Animated, { FadeInDown } from "react-native-reanimated"
import BackButton from "@/app/components/BackButton"
import PageTitle from "@/app/components/PageTitle"

// Mock data for classes
const mockClasses = [
  {
    id: "1",
    name: "Basketball Fundamentals",
    day: "Monday",
    time: "4:00 PM - 5:30 PM",
    location: "Main Court",
    students: 18,
    level: "Beginner",
  },
  {
    id: "2",
    name: "Advanced Shooting Techniques",
    day: "Tuesday",
    time: "5:00 PM - 6:30 PM",
    location: "Practice Court B",
    students: 12,
    level: "Advanced",
  },
  {
    id: "3",
    name: "Team Defense Strategies",
    day: "Wednesday",
    time: "4:30 PM - 6:00 PM",
    location: "Main Court",
    students: 15,
    level: "Intermediate",
  },
  {
    id: "4",
    name: "Youth Basketball Camp",
    day: "Saturday",
    time: "10:00 AM - 12:00 PM",
    location: "Community Center",
    students: 24,
    level: "Beginner",
  },
  {
    id: "5",
    name: "Point Guard Skills",
    day: "Thursday",
    time: "5:00 PM - 6:30 PM",
    location: "Practice Court A",
    students: 10,
    level: "Intermediate",
  },
  {
    id: "6",
    name: "Game Strategy & Analysis",
    day: "Friday",
    time: "6:00 PM - 7:30 PM",
    location: "Video Room",
    students: 14,
    level: "Advanced",
  },
]

export default function ClassListScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("All")

  // Filter classes based on search query and selected filter
  const filteredClasses = mockClasses.filter((classItem) => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === "All" || classItem.level === selectedFilter
    return matchesSearch && matchesFilter
  })

  const filters = ["All", "Beginner", "Intermediate", "Advanced"]

  const renderClassItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()} className="bg-[#1C1C1E] rounded-xl p-4 mb-4">
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">{item.name}</Text>
          <Text className="text-gray-400 mt-1">
            {item.day} • {item.time}
          </Text>
          <Text className="text-gray-400">{item.location}</Text>

          <View className="flex-row mt-3 items-center">
            <View className="bg-[#FFD700] rounded-full px-3 py-1 mr-3">
              <Text className="text-black font-semibold">{item.level}</Text>
            </View>
            <Text className="text-gray-300">{item.students} students</Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-[#2C2C2E] p-3 rounded-full"
          onPress={() => console.log(`View details for ${item.name}`)}
        >
          <Ionicons name="chevron-forward" size={20} color="#FFD700" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar style="light" />

      <View className="px-4 pt-2 pb-4">
        <BackButton onPress={() => router.back()} />
        <PageTitle title="Class List" />

        {/* Search Bar */}
        <View className="bg-[#1C1C1E] flex-row items-center rounded-xl px-4 mt-4">
          <Ionicons name="search" size={20} color="#777" />
          <TextInput
            className="flex-1 py-3 px-2 text-white"
            placeholder="Search classes..."
            placeholderTextColor="#777"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#777" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              className={`px-4 py-2 rounded-full mr-2 ${selectedFilter === filter ? "bg-[#FFD700]" : "bg-[#2C2C2E]"}`}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text className={`font-medium ${selectedFilter === filter ? "text-black" : "text-white"}`}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Class List */}
      <FlatList
        data={filteredClasses}
        renderItem={renderClassItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Ionicons name="calendar-outline" size={60} color="#444" />
            <Text className="text-white text-lg mt-4 text-center">No classes found</Text>
            <Text className="text-gray-400 text-center mt-2">Try adjusting your search or filters</Text>
          </View>
        }
      />

      {/* Add Class Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-[#FFD700] w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => console.log("Add new class")}
      >
        <Ionicons name="add" size={30} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

