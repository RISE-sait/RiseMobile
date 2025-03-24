import { useState, useEffect } from "react"
import { Text, View, ScrollView, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import images from "@/constants/images"
import ProfileHeader from "@/components/profile/ProfileHeader"
import UpcomingCard from "@/components/events/UpcomingCard"
import QRCodeModal from "@/components/QRCodeModal"
import GoToCards from "../../../components/GoToCards"
import dayjs from "dayjs"
import { mockMatches } from "@/app/(athlete)/screens/matchesData"
import GradientBackground from "@/components/barber/GradientBackground"

type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  profileImage?: string
  countryCode: string
  token: string
  teamLogo?: string
  phoneNumber?: string
  jerseyNumber?: number
}

export default function InstructorHomeScreen() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          console.log("📢 Loaded user from AsyncStorage:", parsedUser)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error("❌ Error loading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const toggleModal = () => {
    setModalVisible(!modalVisible)
  }

  // Get today's date
  const today = dayjs().format("YYYY-MM-DD")

  // Filter upcoming matches/practices **only in the future**
  const upcomingEvent = mockMatches
    .filter((match) => ["match", "practice"].includes(match.type) && dayjs(match.date).isAfter(today))
    .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix())[0]

  // Navigation options for instructors
  const navigationOptions = [
    { label: "Class List", route: "/screens/classList" },
    { label: "Course List", route: "/screens/courseList" },
    { label: "Attendance", route: "/screens/attendance" },
    { label: "Grades", route: "/screens/grades" },
  ]

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0C0B0B] items-center justify-center">
        <ActivityIndicator size="large" color="#FFD700" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0C0B0B" }}>
      <StatusBar translucent backgroundColor="transparent" style="light" />
      <GradientBackground >
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {/* QR Code Button */}
        <QRCodeModal />

        {/* Header Section - Load user data dynamically */}
        <View className="w-full px-5 mt-20">
          {user ? (
            <ProfileHeader
              firstName={user.firstName}
              lastName={user.lastName}
              role={user.role}
              number={user?.role === "Player" && user.jerseyNumber ? user.jerseyNumber.toString() : "IN"} // ✅ Only for players
              profileImage={user.profileImage ? { uri: user.profileImage } : images.instructorHeadshot}
              countryCode={user?.countryCode || "US"} // ✅ Ensure countryCode is always defined
              teamLogo={images.teamLogo}
            />
          ) : (
            <Text className="text-white text-center">User data not available</Text>
          )}
        </View>

        {/* Upcoming Game Section */}
        {upcomingEvent && <UpcomingCard event={upcomingEvent} />}

        {/* Navigation Cards */}
        <View className="mt-6">
        <GoToCards options={navigationOptions} handleNavigate={(route) => router.push(route)} />
        </View>
      </ScrollView>
      </GradientBackground>
    </SafeAreaView>
  )
}

