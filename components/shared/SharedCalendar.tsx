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
import { fetchGames } from "@/store/slices/gamesSlice"
import { fetchCourses } from "@/store/slices/coursesSlice"
import AsyncStorage from "@react-native-async-storage/async-storage"

import PageTitle from "@/components/PageTitle"
import CalendarCard from "@/components/calendar/CalendarCard"
import EventListContainer from "@/components/calendar/EventListContainer"

interface SharedCalendarProps {
  userRole: "athlete" | "coach" | "instructor" | "parent"
  title?: string
  subtitle?: string
  childrenData?: any[]
}

// Helper function to map API types to display types
const mapProgramTypeToDisplayType = (apiType: string): "event" | "match" | "practice" | "course" => {
  switch (apiType.toLowerCase()) {
    case "game":
      return "match"
    case "practice":
      return "practice"
    case "course":
      return "course"
    default:
      return "event"
  }
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
  const reduxCourses = useSelector((state: RootState) => state.courses)

  // Determine loading state
  const isLoading =
    reduxEvents.status === "loading" || reduxGames.status === "loading" || reduxCourses.status === "loading"

  const error = reduxEvents.error || reduxGames.error || reduxCourses.error

  // Combine all calendar items
  const [calendarData, setCalendarData] = useState<{ [date: string]: any[] }>({})

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

  // Memoize the fetch function to avoid recreating it on every render
  const fetchCalendarData = useCallback(async () => {
    try {
      const token = await getToken()

      if (!token) {
        console.error("No auth token available")
        return
      }

      // Dispatch the fetch actions
      dispatch(fetchEvents(token) as any)
      dispatch(fetchGames(token) as any)
      dispatch(fetchCourses(token) as any)
    } catch (err) {
      console.error("Error fetching calendar data:", err)
    }
  }, [dispatch, getToken])

  // Memoize the refresh handler
  const handleRefresh = useCallback(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  // Process data based on user role - with stable dependency array
  useEffect(() => {
    // Skip processing if we don't have data yet
    if (!reduxEvents.items && !reduxGames.items && !reduxCourses.items) {
      return
    }

    // Combine and process all calendar data
    const combinedData: { [date: string]: any[] } = {}

    // Process events
    if (reduxEvents.items && Array.isArray(reduxEvents.items)) {
      reduxEvents.items.forEach((event) => {
        if (!event.date) return

        if (!combinedData[event.date]) {
          combinedData[event.date] = []
        }

        // For parent role, add child name to event title
        let eventTitle = event.title
        if (userRole === "parent" && childrenData.length > 0) {
          // Assign event to a child (simplified logic)
          const childIndex = Math.floor(Math.random() * childrenData.length)
          eventTitle = `${childrenData[childIndex].firstName}: ${event.title}`
        }

        combinedData[event.date].push({
          ...event,
          title: eventTitle,
          type: "event",
        })
      })
    }

    // Process games
    if (reduxGames.items && Array.isArray(reduxGames.items)) {
      reduxGames.items.forEach((game) => {
        if (!game.date) return

        if (!combinedData[game.date]) {
          combinedData[game.date] = []
        }

        // For parent role, add child name to game title
        let gameTitle = game.title
        if (userRole === "parent" && childrenData.length > 0) {
          // Assign game to a child (simplified logic)
          const childIndex = Math.floor(Math.random() * childrenData.length)
          gameTitle = `${childrenData[childIndex].firstName}: ${game.title}`
        }

        combinedData[game.date].push({
          ...game,
          title: gameTitle,
          type: "match", // Games are displayed as matches
        })
      })
    }

    // Process courses/programs
    if (reduxCourses.items && Array.isArray(reduxCourses.items)) {
      reduxCourses.items.forEach((program) => {
        if (!program.date) return

        if (!combinedData[program.date]) {
          combinedData[program.date] = []
        }

        // Map the API type to the correct display type
        const displayType = mapProgramTypeToDisplayType(program.type || "course")

        combinedData[program.date].push({
          ...program,
          type: displayType,
        })
      })
    }

    // Only update state if data has actually changed
    setCalendarData((prevData) => {
      // Simple length check to avoid deep comparison on every update
      const prevDataKeys = Object.keys(prevData)
      const newDataKeys = Object.keys(combinedData)

      if (
        prevDataKeys.length === newDataKeys.length &&
        prevDataKeys.every((key) => prevData[key].length === (combinedData[key]?.length || 0))
      ) {
        return prevData // Return previous state to avoid re-render
      }
      return combinedData
    })
  }, [reduxEvents.items, reduxGames.items, reduxCourses.items, childrenData, userRole])

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

  // Memoize events for selected date
  const eventsForSelectedDate = useMemo(() => {
    return calendarData[selectedDate] || []
  }, [calendarData, selectedDate])

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
  }, [userRole, formattedDate])

  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B] pt-2">
      <StatusBar translucent style="light" />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <PageTitle title={title} subtitle={subtitle} onButtonPress={subtitle ? handleRefresh : undefined} />

        <View className="px-5 py-4">
          <CalendarCard
            selectedDate={selectedDate}
            events={calendarData}
            onDayPress={(day) => setSelectedDate(day.dateString)}
          />
        </View>

        {/* Updated EventListContainer that accepts data directly */}
        <EventListContainer
          date={dayjs(selectedDate).format("DD MMM YYYY")}
          data={eventsForSelectedDate}
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

