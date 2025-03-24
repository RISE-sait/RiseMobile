import { useState, useEffect, useRef } from "react"
import { View, Text, FlatList, Dimensions, Animated } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import dayjs from "dayjs"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store"
import { fetchEvents } from "@/store/slices/eventsSlice"
import { fetchGames } from "@/store/slices/gamesSlice"
import { fetchCourses } from "@/store/slices/coursesSlice"
import AsyncStorage from "@react-native-async-storage/async-storage"

import PageTitle from "@/components/PageTitle"
import CalendarCard from "@/components/calendar/CalendarCard"
import EventListContainer from "@/components/calendar/EventListContainer"
import EventListItem from "@/components/calendar/EventListItem"
import LoadingIndicator from "@/components/feedback/LoadingIndicator"

const { width } = Dimensions.get("window")

const AthleteCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"))
  const fadeAnim = useRef(new Animated.Value(0)).current
  const dispatch = useDispatch()

  // Get user from Redux store
  const user = useSelector((state: RootState) => state.user.data)

  // Get calendar data from Redux store
  const events = useSelector((state: RootState) => state.events)
  const games = useSelector((state: RootState) => state.games)
  const courses = useSelector((state: RootState) => state.courses)

  // Determine loading state
  const isLoading = events.status === "loading" || games.status === "loading" || courses.status === "loading"
  const hasError = events.error || games.error || courses.error
  const error = events.error || games.error || courses.error

  // Combine all calendar items and organize by date
  const [calendarData, setCalendarData] = useState<{ [date: string]: any[] }>({})

  useEffect(() => {
    // Combine and process all calendar data
    const combinedData: { [date: string]: any[] } = {}

    // Process events
    if (events.items && Array.isArray(events.items)) {
      events.items.forEach((event) => {
        if (!event.date) return

        if (!combinedData[event.date]) {
          combinedData[event.date] = []
        }

        combinedData[event.date].push({
          ...event,
          type: "event",
        })
      })
    }

    // Process games
    if (games.items && Array.isArray(games.items)) {
      games.items.forEach((game) => {
        if (!game.date) return

        if (!combinedData[game.date]) {
          combinedData[game.date] = []
        }

        combinedData[game.date].push({
          ...game,
          type: "match",
        })
      })
    }

    // Process courses
    if (courses.items && Array.isArray(courses.items)) {
      courses.items.forEach((course) => {
        if (!course.date) return

        if (!combinedData[course.date]) {
          combinedData[course.date] = []
        }

        combinedData[course.date].push({
          ...course,
          type: "course",
        })
      })
    }

    setCalendarData(combinedData)
  }, [events.items, games.items, courses.items])

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()

    fetchCalendarData()
  }, [])

  const fetchCalendarData = async () => {
    try {
      // Get token from Redux or AsyncStorage
      let token = user?.token

      if (!token) {
        // Try to get from AsyncStorage as fallback
        const userString = await AsyncStorage.getItem("user")
        if (userString) {
          const userData = JSON.parse(userString)
          token = userData.token
        }
      }

      if (!token) {
        console.error("No auth token available")
        return
      }

      // Dispatch the fetch actions for all calendar item types
      dispatch(fetchEvents(token) as any)
      dispatch(fetchGames(token) as any)
      dispatch(fetchCourses(token) as any)
    } catch (err) {
      console.error("Error fetching calendar data:", err)
    }
  }

  const handleRefresh = () => {
    fetchCalendarData()
  }

  // Get events for selected date
  const eventsForSelectedDate = calendarData[selectedDate] || []

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B] pt-2">
      <StatusBar translucent style="light" />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <PageTitle title="Calendar" subtitle="Refresh" onButtonPress={handleRefresh} />

        <View className="px-5 py-4">
          <CalendarCard
            selectedDate={selectedDate}
            events={calendarData}
            onDayPress={(day) => setSelectedDate(day.dateString)}
          />
        </View>

        <EventListContainer date={dayjs(selectedDate).format("DD MMM YYYY")}>
          {isLoading ? (
            <LoadingIndicator />
          ) : error ? (
            <View className="p-4">
              <Text className="text-center text-red-500 mb-2">{error}</Text>
              <Text className="text-center text-blue-400 underline" onPress={handleRefresh}>
                Tap to retry
              </Text>
            </View>
          ) : (
            <FlatList
              data={eventsForSelectedDate}
              keyExtractor={(item) => item.id || Math.random().toString()}
              renderItem={({ item }) => (
                <EventListItem id={item.id} title={item.title} time={item.time || "TBD"} type={item.type || "event"} />
              )}
              ListEmptyComponent={
                <Text className="text-center text-gray-300 py-8">No events scheduled for this day.</Text>
              }
            />
          )}
        </EventListContainer>
      </Animated.View>
    </SafeAreaView>
  )
}

export default AthleteCalendar

