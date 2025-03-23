"use client"

import { useState } from "react"
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { FlatList } from "react-native-gesture-handler"
import Animated, { FadeInDown } from "react-native-reanimated"
import BackButton from "@/app/components/BackButton"
import PageTitle from "@/app/components/PageTitle"

// Mock data for courses
const mockCourses = [
  {
    id: "1",
    name: "Basketball 101",
    description: "Introduction to basketball fundamentals and basic skills",
    duration: "8 weeks",
    enrolledStudents: 24,
    totalCapacity: 30,
    startDate: "Jan 15, 2024",
    endDate: "Mar 10, 2024",
    progress: 75,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "2",
    name: "Advanced Shooting",
    description: "Master advanced shooting techniques and strategies",
    duration: "6 weeks",
    enrolledStudents: 18,
    totalCapacity: 20,
    startDate: "Feb 5, 2024",
    endDate: "Mar 18, 2024",
    progress: 60,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "3",
    name: "Team Defense",
    description: "Learn team defense concepts and zone strategies",
    duration: "4 weeks",
    enrolledStudents: 15,
    totalCapacity: 20,
    startDate: "Mar 1, 2024",
    endDate: "Mar 28, 2024",
    progress: 25,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "4",
    name: "Basketball Conditioning",
    description: "Improve stamina and physical conditioning for basketball",
    duration: "10 weeks",
    enrolledStudents: 22,
    totalCapacity: 25,
    startDate: "Jan 10, 2024",
    endDate: "Mar 20, 2024",
    progress: 80,
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "5",
    name: "Point Guard Masterclass",
    description: "Specialized training for point guards and ball handlers",
    duration: "6 weeks",
    enrolledStudents: 12,
    totalCapacity: 15,
    startDate: "Feb 15, 2024",
    endDate: "Mar 30, 2024",
    progress: 50,
    image: "/placeholder.svg?height=80&width=80",
  },
]

export default function CourseListScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("All")

  // Filter courses based on search query and selected filter
  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesFilter = true
    if (selectedFilter === "In Progress") {
      matchesFilter = course.progress > 0 && course.progress < 100
    } else if (selectedFilter === "Completed") {
      matchesFilter = course.progress === 100
    } else if (selectedFilter === "Not Started") {
      matchesFilter = course.progress === 0
    }

    return matchesSearch && matchesFilter
  })

  const filters = ["All", "In Progress", "Not Started", "Completed"]

  const renderCourseItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()} className="bg-[#1C1C1E] rounded-xl p-4 mb-4">
      <View className="flex-row">
        <Image source={{ uri: item.image }} className="w-16 h-16 rounded-lg bg-[#2C2C2E]" />

        <View className="flex-1 ml-3">
          <Text className="text-white font-bold text-lg">{item.name}</Text>
          <Text className="text-gray-400 mt-1 text-sm" numberOfLines={2}>
            {item.description}
          </Text>

          <View className="mt-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-300 text-xs">{item.progress}% Complete</Text>
              <Text className="text-gray-300 text-xs">
                {item.enrolledStudents}/{item.totalCapacity}
              </Text>
            </View>

            <View className="h-2 bg-[#2C2C2E] rounded-full mt-1 overflow-hidden">
              <View className="h-full bg-[#FFD700] rounded-full" style={{ width: `${item.progress}%` }} />
            </View>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-[#333]">
        <Text className="text-gray-400 text-xs">
          {item.startDate} - {item.endDate}
        </Text>

        <TouchableOpacity
          className="bg-[#2C2C2E] px-3 py-1 rounded-full flex-row items-center"
          onPress={() => console.log(`View details for ${item.name}`)}
        >
          <Text className="text-[#FFD700] font-medium mr-1">Manage</Text>
          <Ionicons name="chevron-forward" size={14} color="#FFD700" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar style="light" />

      <View className="px-4 pt-2 pb-4">
        <BackButton onPress={() => router.back()} />
        <PageTitle title="Course List" />

        {/* Search Bar */}
        <View className="bg-[#1C1C1E] flex-row items-center rounded-xl px-4 mt-4">
          <Ionicons name="search" size={20} color="#777" />
          <TextInput
            className="flex-1 py-3 px-2 text-white"
            placeholder="Search courses..."
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

      {/* Course List */}
      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Ionicons name="book-outline" size={60} color="#444" />
            <Text className="text-white text-lg mt-4 text-center">No courses found</Text>
            <Text className="text-gray-400 text-center mt-2">Try adjusting your search or filters</Text>
          </View>
        }
      />

      {/* Add Course Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-[#FFD700] w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => console.log("Add new course")}
      >
        <Ionicons name="add" size={30} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

