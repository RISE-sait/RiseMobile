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
          setUser(reduxUser)
        } else {
          // Otherwise try to load from AsyncStorage (backward compatibility)
          const storedUser = await AsyncStorage.getItem("user")
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser)

            setUser({
              ...parsedUser,
              firstName: parsedUser.firstName || parsedUser.first_name || "",
              lastName: parsedUser.lastName || parsedUser.last_name || "",
              countryCode: parsedUser.countryCode || parsedUser.country_code || "US",
            })
          }
        }
      } catch (error) {
        // Error loading user data
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
          const upcomingEvents = allEvents.filter((event) => {
            try {
              return dayjs(event.date).isAfter(today) || dayjs(event.date).isSame(today)
            } catch (e) {
              return false
            }
          })

          console.log("🎯 P2-1: All upcoming events:", upcomingEvents.length)

          // Prioritize Tryouts and Games according to PRD requirements
          const prioritizeEvents = (events: CommonEvent[]): CommonEvent[] => {
            // First priority: Tryouts and Games/Matches
            const highPriorityEvents = events.filter((event) => {
              const eventType = event.type?.toLowerCase() || ""
              const eventTitle = event.title?.toLowerCase() || ""
              
              // Check for tryouts in type or title
              const isTryout = eventType.includes("tryout") || eventTitle.includes("tryout")
              // Check for games/matches in type
              const isGame = eventType === "match" || eventType === "game" || eventType.includes("game")
              
              console.log(`Event ${event.id}: type="${eventType}", title="${eventTitle}", isTryout=${isTryout}, isGame=${isGame}`)
              
              return isTryout || isGame
            })

            console.log("🏆 P2-1: High priority events (Tryouts/Games):", highPriorityEvents.length)

            if (highPriorityEvents.length > 0) {
              return highPriorityEvents.sort((a, b) => {
                try {
                  // Sort by date first, then by time
                  const dateComparison = dayjs(a.date).unix() - dayjs(b.date).unix()
                  if (dateComparison !== 0) return dateComparison
                  return (a.time || "").localeCompare(b.time || "")
                } catch (e) {
                  return 0
                }
              })
            }

            // Fallback: return all upcoming events sorted by date if no high priority events
            console.log("📅 P2-1: Using fallback - all upcoming events")
            return events.sort((a, b) => {
              try {
                const dateComparison = dayjs(a.date).unix() - dayjs(b.date).unix()
                if (dateComparison !== 0) return dateComparison
                return (a.time || "").localeCompare(b.time || "")
              } catch (e) {
                return 0
              }
            })
          }

          const prioritizedEvents = prioritizeEvents(upcomingEvents)

          if (prioritizedEvents.length > 0) {
            const nextEvent = prioritizedEvents[0]
            console.log("✅ P2-1: Selected event:", nextEvent.title, "type:", nextEvent.type)

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
        fallbackToMockData()
      }
    }

    findUpcomingEvent()
  }, [events, games, practices, courses])

  // Fallback to mock data if needed
  const fallbackToMockData = () => {
    try {
      // No mock data available, just set to null
      setUpcomingEvent(null)
    } catch (error) {
      setUpcomingEvent(null)
    }
  }

  const navigationOptions = [
    { label: "Schedule", route: "/calendar", image: images.schedules },
    { label: "Events", route: "/screens/events", image: images.event },
    { label: "Membership", route: "/screens/membership", image: images.memberships },
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
