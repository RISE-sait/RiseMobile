// components/shared/SharedCalendar.tsx
"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { View, Animated, InteractionManager } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import dayjs from "dayjs"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "@/store"
import { fetchEvents } from "@/store/slices/eventsSlice"
import { fetchMatches } from "@/store/slices/gamesSlice"
import type { Match } from "@/store/slices/gamesSlice"
import { fetchSchedule, clearSchedule } from "@/store/slices/scheduleSlice"
import PageTitle from "@/components/PageTitle"
import CalendarCard from "@/components/calendar/CalendarCard"
import EventListContainer from "@/components/calendar/EventListContainer"
import { useAuth } from "@/utils/auth"
import Constants from "expo-constants"

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
  const { getValidToken, forceReLogin } = useAuth()
  const calendarInteractionRef = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(null)

  // Get user from Redux store
  const user = useSelector((state: RootState) => state.user.data)

  // Get calendar data from Redux store
  const reduxEvents = useSelector((state: RootState) => state.events)
  const reduxGames = useSelector((state: RootState) => state.games)
  const reduxSchedule = useSelector((state: RootState) => state.schedule)




  // Determine loading state - prioritize schedule data
  const isLoading = reduxSchedule.status === "loading" || reduxEvents.status === "loading" || reduxGames.status === "loading"

  const error = reduxSchedule.error || reduxEvents.error || reduxGames.error


const fetchCalendarData = useCallback(() => {
  if (calendarInteractionRef.current) {
    calendarInteractionRef.current.cancel()
  }

  calendarInteractionRef.current = InteractionManager.runAfterInteractions(async () => {
    try {
      const jwt = await getValidToken()

      if (!jwt) {
        await forceReLogin("Session expired. Please log in again.")
        return
      }

      try {
        dispatch(clearSchedule())
        dispatch(fetchSchedule(jwt) as any)
      } catch (scheduleErr) {
        console.warn("Schedule endpoint failed, falling back to individual endpoints:", scheduleErr)
        dispatch(fetchEvents(jwt) as any)
        dispatch(fetchMatches(jwt) as any)
      }
    } catch (err) {
      console.error("Error fetching calendar data:", err)
    }
  })
}, [dispatch, forceReLogin, getValidToken])



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

    return () => {
      calendarInteractionRef.current?.cancel()
      calendarInteractionRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    // If we have schedule data, use it (unified data source)
    if (reduxSchedule.items.length > 0) {
      return reduxSchedule.byDate[selectedDate] || []
    }
    
    // Fallback to separate events and matches
    const events = reduxEvents.byDate[selectedDate] || []
    const matches = matchesByDate[selectedDate] || []
    
    return [...events, ...matches]
  }, [reduxSchedule.byDate, reduxEvents.byDate, matchesByDate, selectedDate])

  const combinedCalendarEvents = useMemo(() => {
    // If we have schedule data, use it (unified data source)
    if (reduxSchedule.items.length > 0) {
      return reduxSchedule.byDate
  }
  
  // Fallback to separate events and matches
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
}, [reduxSchedule.byDate, reduxEvents.byDate, matchesByDate])

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

    // If we have schedule data, use it (unified data source)
    if (reduxSchedule.items.length > 0) {
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
    } else {
      // Fallback to separate events and matches
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

    // Log for debugging
    if (Object.keys(marked).length > 0) {
    }

    return marked
  }, [reduxSchedule.byDate, reduxEvents.byDate, matchesByDate])

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
          emptyMessage={emptyStateMessage}
        />
      </Animated.View>
    </SafeAreaView>
  )
}

export default SharedCalendar
