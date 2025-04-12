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
  const reduxMatches = useSelector((state: RootState) => state.matches)

  // Determine loading state
  const isLoading = reduxEvents.status === "loading" || reduxMatches.status === "loading"

  const error = reduxEvents.error || reduxMatches.error

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

      // Dispatch the fetch actions for events and matches (from games endpoint)
      dispatch(fetchEvents(token) as any)
      dispatch(fetchMatches(token) as any)
    } catch (err) {
      console.error("Error fetching calendar data:", err)
    }
  }, [dispatch, getToken])

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
    const byDate: Record<string, any[]> = {}

    // Process matches from the matches slice
    reduxMatches.items.forEach((match) => {
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
  }, [reduxMatches.items])

  // Combine all events and matches for the selected date
  const combinedEventsForSelectedDate = useMemo(() => {
    const events = reduxEvents.byDate[selectedDate] || []
    const matches = matchesByDate[selectedDate] || []

    return [...events, ...matches]
  }, [reduxEvents.byDate, matchesByDate, selectedDate])

  // Combine all events and matches for the calendar display
  const combinedCalendarEvents = useMemo(() => {
    const allDates = {
      ...reduxEvents.byDate,
      ...matchesByDate,
    }

    // Create a new object with combined events for each date
    const combined: Record<string, any[]> = {}

    Object.keys(allDates).forEach((date) => {
      combined[date] = [...(reduxEvents.byDate[date] || []), ...(matchesByDate[date] || [])]
    })

    return combined
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
  }, [userRole, formattedDate])

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
