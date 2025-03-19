"use client"

import { useEffect, useState } from "react"
import { Text, View, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"

import images from "@/constants/images"
import GoToCards from "../../components/GoToCards"
import ProfileHeader from "@/app/components/ProfileHeader"
import QRCodeModal from "@/app/components/QRCodeModal"
import { mockMatches } from "@/app/(athlete)/screens/matchesData"
import dayjs from "dayjs"
import ChildrenCarousel from "../components/ChildrenCarousel"

// Define User Type
type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  profileImage?: string
  countryCode: string
  token: string
}

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
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    age: 14,
    sport: "Volleyball",
    profileImage: null,
    jerseyNumber: "7",
  },
]

export default function ParentHome() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [children, setChildren] = useState(mockChildren)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          console.log("📢 Loaded user from AsyncStorage:", parsedUser)

          setUser({
            ...parsedUser,
            firstName: parsedUser.firstName || parsedUser.first_name || "",
            lastName: parsedUser.lastName || parsedUser.last_name || "",
            countryCode: parsedUser.countryCode || parsedUser.country_code || "US",
          })
        } else {
          console.log("⚠️ No user found in AsyncStorage.")
        }
      } catch (error) {
        console.error("❌ Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // Get today's date
  const today = dayjs().format("YYYY-MM-DD")

  // Filter upcoming matches/practices for all children
  const upcomingEvents = mockMatches
    .filter((match) => ["match", "practice"].includes(match.type) && dayjs(match.date).isAfter(today))
    .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix())
    .slice(0, 3) // Get the next 3 events

  const navigationOptions = [
    { label: "Add Child", route: "/screens/add-child", image: images.addPerson },
    { label: "Family Calendar", route: "/calendar", image: images.schedules },
    { label: "Membership", route: "/screens/membership", image: images.memberships },
    { label: "Store", route: "/screens/store/store", image: images.stores },
  ]

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center">
        <ActivityIndicator size="large" color="#FFD700" />
        <Text className="text-white text-center mt-4">Loading user data...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {/* QR Code Button */}
        <QRCodeModal />

        {/* Header Section - Only render when user exists */}
        <View className="w-full px-5 mt-20">
          {user ? (
            <ProfileHeader
              firstName={user.firstName}
              lastName={user.lastName}
              role="Parent"
              profileImage={user.profileImage ? { uri: user.profileImage } : images.parentHeadshot}
              countryCode={user?.countryCode}
              teamLogo={images.teamLogo}
            />
          ) : (
            <Text className="text-white text-center">User data not available</Text>
          )}
        </View>

        {/* Children Carousel */}
        <View className="mt-6">
          <Text className="text-white text-xl font-bold px-5 mb-2">Your Children</Text>
          <ChildrenCarousel
            children={children}
            onSelectChild={(childId) => router.push(`/screens/child-details/${childId}`)}
          />
        </View>

        {/* Upcoming Events Section */}
        <View className="mt-6 px-5">
          <Text className="text-white text-xl font-bold mb-2">Upcoming Events</Text>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <TouchableOpacity
                key={index}
                className="bg-[#1A1A1A] rounded-xl p-4 mb-3"
                onPress={() => router.push(`/screens/event-details/${event.id}`)}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-gold-100 font-bold">{event.type.toUpperCase()}</Text>
                    <Text className="text-white text-lg font-bold">{event.title}</Text>
                    <Text className="text-gray-400">
                      {dayjs(event.date).format("MMM D, YYYY")} • {event.time}
                    </Text>
                  </View>
                  <View className="bg-[#2A2A2A] px-3 py-1 rounded-full">
                    <Text className="text-gold-100">{event.type === "match" ? "Michael" : "Sarah"}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-gray-400 text-center py-4">No upcoming events</Text>
          )}
        </View>

        {/* Navigation Buttons Section */}
        <GoToCards options={navigationOptions} handleNavigate={(route) => router.push(route)} />
      </ScrollView>
    </SafeAreaView>
  )
}

