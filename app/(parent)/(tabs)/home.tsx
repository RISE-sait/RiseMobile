"use client"

import { useEffect, useState, useRef } from "react"
import { Text, View, ActivityIndicator, Animated } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Haptics from "expo-haptics"
import { useAppSelector } from "@/store/hooks"


import images from "@/constants/images"
import GoToCards from "../../../components/GoToCards"
import UpcomingCard from "@/components/events/UpcomingCard"
import ProfileHeader from "@/components/profile/ProfileHeader"
import QRCodeModal from "@/components/QRCodeModal"
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
  const reduxUser = useAppSelector((state) => state.user.data)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [children, setChildren] = useState(mockChildren)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const matches = useAppSelector((state) => state.games.items) || []
  const practices = useAppSelector((state) => state.practices.items) || []

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()

    const loadUser = async () => {
      try {
        // If we have user in Redux, use that
        if (reduxUser) {
          setUser({
            ...reduxUser,
            firstName: reduxUser.firstName || reduxUser.first_name || "",
            lastName: reduxUser.lastName || reduxUser.last_name || "",
            countryCode: reduxUser.countryCode || reduxUser.country_code || "US",
          })
        } else {
          // Otherwise try to load from AsyncStorage (backward compatibility)
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
        }
      } catch (error) {
        console.error("❌ Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [reduxUser])

  // Get today's date
  const today = dayjs().format("YYYY-MM-DD")

  // Filter upcoming matches/practices for all children
  const relevantEvents = [...matches, ...practices].filter((event) =>
  children.some((child) => 
    event.child_id === child.id || 
    event.player_ids?.includes(child.id) || 
    event.team_id === child.teamId // depending on how your data is structured
  )
)

const upcomingEvent = relevantEvents
  .filter((event) => dayjs(event.date).isAfter(today))
  .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix())[0]


  const mapToUpcomingCardFormat = (event: any) => ({
  id: event.id,
  date: event.date || dayjs().format("YYYY-MM-DD"),
  homeTeam: event.homeTeam || "Home Team",
  awayTeam: event.awayTeam || "Away Team",
  status: "scheduled" as "scheduled",
  location: event.location || "RISE Basketball Facility",
  description: `${children[0]?.firstName || "Child"}'s ${event.type}`,
  homeLogo:
    event.homeLogo ||
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1780&auto=format&fit=crop",
  awayLogo:
    event.awayLogo ||
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1780&auto=format&fit=crop",
  bgImage:
    event.bgImage ||
    "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
  type: event.type,
})



  const navigationOptions = [
    { label: "Family Management", route: "/screens/children", image: images.addPerson },
    { label: "Family Calendar", route: "/calendar", image: images.schedules },
    { label: "Membership", route: "/screens/membership", image: images.memberships },
    { label: "Store", route: "/screens/store/store", image: images.stores },
  ]

  const handleChildSelect = (childId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(`/screens/child-details/${childId}`)
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center">
        <ActivityIndicator size="large" color="#FFD700" />
        <Text className="text-white-100 text-center mt-4">Loading user data...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        style={{ opacity: fadeAnim }}
      >
        {/* QR Code Button */}
        <QRCodeModal />

        {/* Header Section - Only render when user exists */}
        <View className="w-full px-5 mt-20">
          {user ? (
            <ProfileHeader
              firstName={user?.firstName || ""}
              lastName={user?.lastName || ""}
              role="Parent"
              number="P"
              profileImage={user?.profileImage ? { uri: user.profileImage } : images.parentHeadshot}
              countryCode={user?.countryCode}
            />
          ) : (
            <Text className="text-white text-center">User data not available</Text>
          )}
        </View>

        {/* Children Carousel */}
        <View className="mt-6">
          <ChildrenCarousel children={children} onSelectChild={handleChildSelect} showTitle={true} />
        </View>

        {/* Upcoming Game Section */}
        {upcomingEvent && (
          <View className="mt-4">
            <UpcomingCard event={mapToUpcomingCardFormat(upcomingEvent)} />
          </View>
        )}

        {/* Navigation Buttons Section */}
        <GoToCards options={navigationOptions} handleNavigate={(route) => router.push(route)} />
      </Animated.ScrollView>
    </SafeAreaView>
  )
}

