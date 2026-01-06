// components/shared/SharedCalendar.tsx
"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { View, Animated } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useRouter } from "expo-router"
import dayjs from "dayjs"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { fetchEvents, clearEvents } from "@/store/slices/eventsSlice"
import { fetchMatches, clearMatches } from "@/store/slices/gamesSlice"
import type { Match } from "@/store/slices/gamesSlice"
import { fetchSchedule, clearSchedule, clearScheduleError } from "@/store/slices/scheduleSlice"
import PageTitle from "@/components/PageTitle"
import CalendarCard from "@/components/calendar/CalendarCard"
import EventListContainer from "@/components/calendar/EventListContainer"
import Constants from "expo-constants"

interface SharedCalendarProps {
  userRole: "athlete" | "coach" | "instructor" | "parent" | "admin" | "super_admin"
  title?: string
  childrenData?: any[]
  embedded?: boolean // New prop to indicate it's embedded in another view
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
  childrenData = [],
  embedded = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"))
  const fadeAnim = useRef(new Animated.Value(0)).current
  const dispatch = useDispatch()
  const router = useRouter()

  // Get user from Redux store
  const user = useSelector((state: RootState) => state.user.data)

  // Get token reliably from Redux or AsyncStorage
  const getToken = useCallback(async () => {
    let token = user?.token
    if (!token) {
      const userString = await AsyncStorage.getItem("user")
      if (userString) token = JSON.parse(userString).token
    }
    return token
  }, [user?.token])

  // Get calendar data from Redux store
  const reduxEvents = useSelector((state: RootState) => state.events)
  const reduxGames = useSelector((state: RootState) => state.games)
  const reduxSchedule = useSelector((state: RootState) => state.schedule)




  // Determine loading state - prioritize schedule data
  const isLoading = reduxSchedule.status === "loading" || reduxEvents.status === "loading" || reduxGames.status === "loading"

  // Only show error if ALL data sources failed (schedule + fallback)
  // If schedule failed but events/matches succeeded, don't show error
  const hasScheduleData = reduxSchedule.items.length > 0
  const hasFallbackData = reduxEvents.items.length > 0 || reduxGames.items.length > 0
  const allDataSourcesFailed =
    reduxSchedule.status === "failed" &&
    reduxEvents.status === "failed" &&
    reduxGames.status === "failed"

  const error = allDataSourcesFailed
    ? (reduxSchedule.error || reduxEvents.error || reduxGames.error)
    : null


// Fetch calendar data - simplified pattern matching Events page
  const fetchData = useCallback(async (forceRefresh = false) => {
    const token = await getToken()
    if (!token) return

    // Clear existing data before fetching fresh data
    if (forceRefresh) {
      dispatch(clearSchedule())
    }

    // Try unified schedule endpoint first
    try {
      await dispatch(fetchSchedule(token) as any).unwrap()
    } catch (scheduleErr) {
      // Fallback to separate endpoints when schedule fails
      dispatch(clearScheduleError())

      if (forceRefresh) {
        dispatch(clearEvents())
        dispatch(clearMatches())
      }

      dispatch(fetchEvents(token) as any)
      dispatch(fetchMatches(token) as any)
    }
  }, [getToken, dispatch])

  // Memoize the refresh handler
  const handleRefresh = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  // Animation effect - only run once
  useEffect(() => {
    // Start fade-in animation
    const fadeAnimation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    })
    fadeAnimation.start()

    return () => {
      fadeAnimation.stop()
      fadeAnim.stopAnimation()
    }
  }, [])

  // Fetch data when component mounts or token changes
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Process matches data to organize by date
  const matchesByDate = useMemo(() => {
    const byDate: Record<string, CalendarEvent[]> = {}

    // Process matches from the games slice
    reduxGames.items.forEach((match: Match) => {
      if (match.date) {
        // Parse the date string correctly
        const dateObj = dayjs(match.date)
        if (dateObj.isValid()) {
          const dateStr = dateObj.format("YYYY-MM-DD")

          if (!byDate[dateStr]) {
            byDate[dateStr] = []
          }

          byDate[dateStr].push({
            id: match.id,
            title: match.name || `Match ${match.id.substring(0, 6)}`,
            date: dateStr,
            time: match.time || "TBD",
            type: "match",
            location: match.location || "RISE Basketball Court",
            description: match.description || "Basketball match",
          })
        }
      }
    })

    return byDate
  }, [reduxGames.items])

  // Combine all events and matches for the selected date
  const combinedEventsForSelectedDate = useMemo(() => {
    // If schedule fetch succeeded, use schedule data (even if empty)
    // Only fall back to events/matches if schedule fetch actually FAILED
    if (reduxSchedule.status === "succeeded") {
      return reduxSchedule.byDate[selectedDate] || []
    }

    // Fallback to separate events and matches only if schedule fetch failed
    if (reduxSchedule.status === "failed") {
      const events = reduxEvents.byDate[selectedDate] || []
      const matches = matchesByDate[selectedDate] || []
      return [...events, ...matches]
    }

    // Still loading or idle - return empty
    return []
  }, [reduxSchedule.status, reduxSchedule.byDate, reduxEvents.byDate, matchesByDate, selectedDate])

  const combinedCalendarEvents = useMemo(() => {
    // If schedule fetch succeeded, use schedule data (even if empty)
    if (reduxSchedule.status === "succeeded") {
      return reduxSchedule.byDate
    }

    // Fallback to separate events and matches only if schedule fetch failed
    if (reduxSchedule.status === "failed") {
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
    }

    // Still loading or idle - return empty
    return {}
  }, [reduxSchedule.status, reduxSchedule.byDate, reduxEvents.byDate, matchesByDate])

  const windowedCalendarEvents = useMemo(() => {
    const selectedMonth = dayjs(selectedDate).startOf("month")
    const windowStart = selectedMonth.subtract(1, "month")
    const windowEnd = selectedMonth.add(1, "month").endOf("month")
    const filtered: Record<string, any[]> = {}

    Object.entries(combinedCalendarEvents).forEach(([date, items]) => {
      const dateObj = dayjs(date)
      if (dateObj.isBefore(windowStart) || dateObj.isAfter(windowEnd)) {
        return
      }
      filtered[date] = items
    })

    if (!filtered[selectedDate] && combinedCalendarEvents[selectedDate]) {
      filtered[selectedDate] = combinedCalendarEvents[selectedDate]
    }

    return filtered
  }, [combinedCalendarEvents, selectedDate])


  // Create marked dates for the calendar
  const markedDates = useMemo(() => {
    const marked: Record<string, { marked: boolean; dotColor: string }> = {}

    // If schedule fetch succeeded, use schedule data (even if empty)
    if (reduxSchedule.status === "succeeded") {
      Object.keys(reduxSchedule.byDate).forEach((date) => {
        const dayItems = reduxSchedule.byDate[date]
        if (dayItems && dayItems.length > 0) {
          // Determine color based on the type of events for this date
          const hasMatches = dayItems.some((item) => item.type === "match")
          const hasEvents = dayItems.some((item) => item.type === "event")
          const hasPractices = dayItems.some((item) => item.type === "practice")

          marked[date] = {
            marked: true,
            // Priority: matches (orange) > practices (blue) > events (green)
            dotColor: hasMatches ? "#FCA311" : hasPractices ? "#3B82F6" : "#4CAF50",
          }
        }
      })
    } else if (reduxSchedule.status === "failed") {
      // Fallback to separate events and matches only if schedule fetch failed
      // Add events from Redux
      Object.keys(reduxEvents.byDate).forEach((date) => {
        if (reduxEvents.byDate[date] && reduxEvents.byDate[date].length > 0) {
          marked[date] = {
            marked: true,
            dotColor: "#4CAF50", // Green dot
          }
        }
      })

      // Add matches from Redux (overwrites events if both exist)
      Object.keys(matchesByDate).forEach((date) => {
        if (matchesByDate[date] && matchesByDate[date].length > 0) {
          marked[date] = {
            marked: true,
            dotColor: "#FCA311", // Orange dot for matches
          }
        }
      })
    }
    // If still loading or idle, return empty marked dates

    return marked
  }, [reduxSchedule.status, reduxSchedule.byDate, reduxEvents.byDate, matchesByDate])

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
        return `No events on ${formattedDate}.\n\nFeel like you're missing an event? Please speak to the front desk or admin.`
      case "admin":
      case "super_admin":
        return `No events on ${formattedDate}.\n\nFeel like you're missing an event? Please check with a super admin.`
      case "instructor":
        return `No classes or events scheduled for ${formattedDate}.`
      default:
        return `No events scheduled for ${formattedDate}.`
    }
  }, [userRole, formattedDate])

  // Render embedded version (no SafeAreaView, StatusBar, or PageTitle)
  if (embedded) {
    return (
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View className="px-5 pt-2">
          <CalendarCard
            selectedDate={selectedDate}
            events={windowedCalendarEvents}
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
          emptyMessage={`${emptyStateMessage}\n\nLooking to register for an event? Browse available events to sign up.`}
          emptyActionLabel="Browse Events"
          onEmptyAction={() => router.push("/screens/events")}
        />
      </Animated.View>
    )
  }

  // Render full version (original layout)
  return (
    <SafeAreaView className="flex-1 bg-[#0C0B0B] pt-2" edges={['top', 'left', 'right']}>
      <StatusBar translucent style="light" />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <PageTitle title={title} onButtonPress={handleRefresh} showRefreshIcon isRefreshing={isLoading} />

        <View className="px-5 py-2">
          <CalendarCard
            selectedDate={selectedDate}
            events={windowedCalendarEvents}
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
          emptyMessage={`${emptyStateMessage}\n\nLooking to register for an event? Browse available events to sign up.`}
          emptyActionLabel="Browse Events"
          onEmptyAction={() => router.push("/screens/events")}
        />
      </Animated.View>
    </SafeAreaView>
  )
}

export default SharedCalendar
