import { useEffect, useState } from "react"
import { Text, View, ScrollView, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import dayjs from "dayjs"
import { useAppSelector } from "@/store/hooks"

import images from "@/constants/images"
import GoToCards from "../../../components/GoToCards"
import UpcomingCard from "@/components/events/UpcomingCard"
import ProfileHeader from "@/components/profile/ProfileHeader"
import QRCodeModal from "@/components/QRCodeModal"
import { mockMatches } from "../screens/matchesData"

// Define User Type
type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  jerseyNumber?: string
  profileImage?: string
  countryCode: string
  token: string
}

// Define a common event interface to ensure type safety
interface CommonEvent {
  id: string
  title: string
  date: string
  time: string
  type: string
  location?: string
  description?: string
}

export default function AthleteHome() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Get user from Redux store
  const reduxUser = useAppSelector((state) => state.user.data)
  const [user, setUser] = useState<User | null>(null)

  // Get events from Redux store
  const events = useAppSelector((state) => state.events.items) || []
  const games = useAppSelector((state) => state.games.items) || []
  const practices = useAppSelector((state) => state.practices.items) || []
  const courses = useAppSelector((state) => state.courses.items) || []

  const [upcomingEvent, setUpcomingEvent] = useState<any>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        // If we have user in Redux, use that
        if (reduxUser) {
          console.log("📢 Using user from Redux:", reduxUser)
          setUser(reduxUser)
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
              countryCode: parsedUser.countryCode || parsedUser.country_code || "US", // Ensure correct key
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

  useEffect(() => {
    const findUpcomingEvent = () => {
      try {
        // Safely map each event type to a common structure
        const mapToCommonEvent = (item: any, type: string): CommonEvent => {
          return {
            id: item.id || "",
            title: item.title || item.name || "Event",
            date: item.date || dayjs().format("YYYY-MM-DD"),
            time: item.time || "TBD",
            type: type,
            location: item.location || "RISE Basketball Facility",
            description: item.description || "",
          }
        }

        // Combine all event types from Redux with proper type checking
        const allEvents: CommonEvent[] = [
          ...(Array.isArray(events) ? events.map((event) => mapToCommonEvent(event, "event")) : []),
          ...(Array.isArray(games) ? games.map((game) => mapToCommonEvent(game, "match")) : []),
          ...(Array.isArray(practices) ? practices.map((practice) => mapToCommonEvent(practice, "practice")) : []),
          ...(Array.isArray(courses) ? courses.map((course) => mapToCommonEvent(course, "course")) : []),
        ]

        // If we have events in Redux, use those
        if (allEvents.length > 0) {
          // Get today's date
          const today = dayjs().format("YYYY-MM-DD")

          // Filter upcoming events
          const upcoming = allEvents
            .filter((event) => {
              try {
                return dayjs(event.date).isAfter(today) || dayjs(event.date).isSame(today)
              } catch (e) {
                console.error("Invalid date format:", event.date, e)
                return false
              }
            })
            .sort((a, b) => {
              try {
                // First sort by date
                const dateComparison = dayjs(a.date).unix() - dayjs(b.date).unix()
                if (dateComparison !== 0) return dateComparison

                // If same date, sort by time
                return (a.time || "").localeCompare(b.time || "")
              } catch (e) {
                console.error("Error sorting events:", e)
                return 0
              }
            })

          if (upcoming.length > 0) {
            const nextEvent = upcoming[0]
            console.log("📢 Next upcoming event:", nextEvent)

            // Convert to the format expected by UpcomingCard
            setUpcomingEvent({
              id: nextEvent.id,
              date: nextEvent.date,
              time: nextEvent.time,
              title: nextEvent.title,
              homeTeam: nextEvent.type === "match" ? "Home Team" : undefined,
              awayTeam: nextEvent.type === "match" ? "Away Team" : undefined,
              status: "Upcoming",
              location: nextEvent.location || "RISE Basketball Facility",
              description: nextEvent.title || nextEvent.description || "Upcoming Event",
              // Use string URLs for images
              homeLogo: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1780&auto=format&fit=crop",
              awayLogo: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1780&auto=format&fit=crop",
              bgImage:
                "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
              type: nextEvent.type,
            })
            return
          }
        }

        // Fall back to mock data if no events in Redux
        fallbackToMockData()
      } catch (error) {
        console.error("❌ Error finding upcoming event:", error)
        fallbackToMockData()
      }
    }

    findUpcomingEvent()
  }, [events, games, practices, courses])

  // Fallback to mock data if needed
  const fallbackToMockData = () => {
    try {
      // Get today's date
      const today = dayjs().format("YYYY-MM-DD")

      // Filter upcoming matches/practices **only in the future**
      const filteredMatches = mockMatches
        .filter((match) => ["match", "practice"].includes(match.type) && dayjs(match.date).isAfter(today))
        .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix())

      if (filteredMatches.length > 0) {
        const nextEvent = filteredMatches[0]

        // Ensure we're setting proper string values for image URIs
        setUpcomingEvent({
          ...nextEvent,
          title: nextEvent.description,
          // Use string URLs for images
          homeLogo: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1780&auto=format&fit=crop",
          awayLogo: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1780&auto=format&fit=crop",
          bgImage:
            "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
        })
      } else {
        setUpcomingEvent(null)
      }
    } catch (error) {
      console.error("❌ Error in fallbackToMockData:", error)
      setUpcomingEvent(null)
    }
  }

  const navigationOptions = [
    { label: "Schedule", route: "/calendar", image: images.schedules },
    { label: "Events", route: "/screens/events", image: images.event },
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
              role={user.role}
              number={user?.jerseyNumber ? user.jerseyNumber.toString() : "0"} // Ensure it's a string
              profileImage={user.profileImage ? { uri: user.profileImage } : images.headshot}
              countryCode={user?.countryCode} // Ensure countryCode is always defined
              teamLogo={images.teamLogo}
            />
          ) : (
            <Text className="text-white text-center">User data not available</Text>
          )}
        </View>

        {/* Upcoming Game Section */}
        {upcomingEvent && <UpcomingCard event={upcomingEvent} />}

        {/* Navigation Buttons Section */}
        <GoToCards options={navigationOptions} handleNavigate={(route) => router.push(route as any)} />
      </ScrollView>
    </SafeAreaView>
  )
}
