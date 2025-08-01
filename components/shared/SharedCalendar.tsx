// components/shared/SharedCalendar.tsx
"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { View, Animated } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import dayjs from "dayjs"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store"
import { fetchEvents } from "@/store/slices/eventsSlice"
import { fetchMatches } from "@/store/slices/gamesSlice"
import type { Match } from "@/store/slices/gamesSlice"
import AsyncStorage from "@react-native-async-storage/async-storage"
import PageTitle from "@/components/PageTitle"
import CalendarCard from "@/components/calendar/CalendarCard"
import EventListContainer from "@/components/calendar/EventListContainer"
import { getAuth } from "firebase/auth"

interface SharedCalendarProps {
  userRole: "athlete" | "coach" | "instructor" | "parent"
  title?: string
  subtitle?: string
  childrenData?: any[]
}

// Define an interface for calendar events
interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: string
  location: string
  description: string
}

const SharedCalendar: React.FC<SharedCalendarProps> = ({
  userRole,
  title = "Calendar",
  subtitle,
  childrenData = [],
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"))
  const fadeAnim = useRef(new Animated.Value(0)).current
  const dispatch = useDispatch()

  // Get user from Redux store
  const user = useSelector((state: RootState) => state.user.data)

  // Get calendar data from Redux store
  const reduxEvents = useSelector((state: RootState) => state.events)
  const reduxGames = useSelector((state: RootState) => state.games)




  // Determine loading state
  const isLoading = reduxEvents.status === "loading" || reduxGames.status === "loading"

  const error = reduxEvents.error || reduxGames.error

  // Memoize the token retrieval to avoid recreating this function on every render
  const getToken = useCallback(async () => {
    let token = user?.token

    if (!token) {
      try {
        const userString = await AsyncStorage.getItem("user")
        if (userString) {
          const userData = JSON.parse(userString)
          token = userData.token
        }
      } catch (err) {
        console.error("Error getting token from AsyncStorage:", err)
      }
    }

    return token
  }, [user?.token])

const fetchCalendarData = useCallback(async () => {
  try {
    const jwt = await AsyncStorage.getItem("authToken")
    if (!jwt) {
      console.error("❌ Missing backend JWT")
      return
    }

    console.log("🪪 Backend JWT:", jwt)

    dispatch(fetchEvents(jwt) as any)
    dispatch(fetchMatches(jwt) as any)
  } catch (err) {
    console.error("Error fetching calendar data:", err)
  }
}, [dispatch])



  // Memoize the refresh handler
  const handleRefresh = useCallback(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  // Animation and initial data fetch - only run once
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()

    fetchCalendarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run once

  // Process matches data to organize by date
  const matchesByDate = useMemo(() => {
    const byDate: Record<string, CalendarEvent[]> = {}

    // Process matches from the games slice
    reduxGames.items.forEach((match: Match) => {
      if (match.created_at) {
        // Parse the date string correctly
        const dateObj = dayjs(match.created_at)
        if (dateObj.isValid()) {
          const dateStr = dateObj.format("YYYY-MM-DD")

          if (!byDate[dateStr]) {
            byDate[dateStr] = []
          }

          byDate[dateStr].push({
            id: match.id,
            title: match.name || `Match ${match.id.substring(0, 6)}`,
            date: dateStr,
            time: dateObj.format("h:mm A"),
            type: "match",
            location: "RISE Basketball Court",
            description: match.description || "Basketball match",
          })
        }
      }
    })

    return byDate
  }, [reduxGames.items])

  // Combine all events and matches for the selected date
  const combinedEventsForSelectedDate = useMemo(() => {
  const events = reduxEvents.byDate[selectedDate] || []


}, [reduxEvents.byDate, matchesByDate])

const combinedCalendarEvents = useMemo(() => {
  const allDates = {
    ...reduxEvents.byDate,
    ...matchesByDate,
  }

  const combined: Record<string, any[]> = {}

  Object.keys(allDates).forEach((date) => {
    combined[date] = [
      ...(reduxEvents.byDate[date] || []),
      ...(matchesByDate[date] || []),
    ]
  })

  return combined
}, [reduxEvents.byDate, matchesByDate])


  // Create marked dates for the calendar
  const markedDates = useMemo(() => {
    const marked: Record<string, { marked: boolean; dotColor: string }> = {}

    // Add events from Redux
    Object.keys(reduxEvents.byDate).forEach((date) => {
      if (reduxEvents.byDate[date] && reduxEvents.byDate[date].length > 0) {
        marked[date] = {
          marked: true,
          dotColor: "#4CAF50", // Green dot
        }
      }
    })

    // Add matches from Redux
    Object.keys(matchesByDate).forEach((date) => {
      if (matchesByDate[date] && matchesByDate[date].length > 0) {
        marked[date] = {
          marked: true,
          dotColor: "#4CAF50", // Green dot
        }
      }
    })

    // Log for debugging
    console.log(`Calendar has ${Object.keys(marked).length} dates with events`)
    if (Object.keys(marked).length > 0) {
      console.log("Sample marked date:", Object.keys(marked)[0])
    }

    return marked
  }, [reduxEvents.byDate, matchesByDate])

  // Memoize formatted date
  const formattedDate = useMemo(() => {
    return dayjs(selectedDate).format("MMMM D, YYYY")
  }, [selectedDate])

  // Memoize empty state message
  const emptyStateMessage = useMemo(() => {
    switch (userRole) {
      case "parent":
        return `No events scheduled for your children on ${formattedDate}.`
      case "coach":
        return `No events scheduled for your team on ${formattedDate}.`
      case "instructor":
        return `No classes or events scheduled for ${formattedDate}.`
      default:
        return `No events scheduled for ${formattedDate}.`
    }
}, [reduxEvents.byDate, matchesByDate])

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B] pt-2">
      <StatusBar translucent style="light" />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <PageTitle title={title} subtitle={subtitle} onButtonPress={subtitle ? handleRefresh : undefined} />

        <View className="px-5 py-4">
          <CalendarCard
            selectedDate={selectedDate}
            events={combinedCalendarEvents}
            onDayPress={(day) => setSelectedDate(day.dateString)}
          />
        </View>

        {/* Updated EventListContainer that accepts data directly */}
        <EventListContainer
          date={dayjs(selectedDate).format("DD MMM YYYY")}
          data={combinedEventsForSelectedDate}
          isLoading={isLoading}
          error={error}
          onRetry={handleRefresh}
          emptyMessage={emptyStateMessage}
        />
      </Animated.View>
    </SafeAreaView>
  )
}

export default SharedCalendar
