import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { API_URL } from "@/utils/api"
import dayjs from "dayjs"

// Define types
export interface CalendarItem {
  id: string
  title: string
  date: string
  time: string
  type: "event" | "match" | "practice" | "course"
  location?: string
  description?: string
}

interface EventsState {
  items: CalendarItem[]
  byDate: Record<string, CalendarItem[]>
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  lastFetched: string | null
}

// Initial state
const initialState: EventsState = {
  items: [],
  byDate: {},
  status: "idle",
  error: null,
  lastFetched: null,
}

// Helper function to extract title
const extractTitle = (event: any): string => {
  if (event.title) return event.title
  if (event.name) return event.name
  if (event.practice_name) return event.practice_name
  if (event.course_name) return event.course_name
  return "Scheduled Event"
}

// Helper function to format time
const formatTimeString = (timeString: string) => {
  if (!timeString) return "TBD"

  // Handle format like "18:30:00+00:00"
  if (timeString.includes(":")) {
    const timeParts = timeString.split(":")
    const hour = Number.parseInt(timeParts[0], 10)
    const minute = timeParts[1] ? Number.parseInt(timeParts[1], 10) : 0

    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12

    return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`
  }

  return timeString
}

// Helper function to get next day occurrence
const getNextDayOccurrence = (dayName: string) => {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
  const today = dayjs()
  const dayIndex = days.indexOf(dayName.toUpperCase())

  if (dayIndex === -1) return today.format("YYYY-MM-DD") // Invalid day name

  const todayIndex = today.day() // 0 is Sunday, 1 is Monday, etc.
  const daysUntilNext = (dayIndex - todayIndex + 7) % 7

  return today.add(daysUntilNext, "day").format("YYYY-MM-DD")
}

// Async thunk to fetch events
export const fetchEvents = createAsyncThunk("events/fetchEvents", async (token: string, { rejectWithValue }) => {
  try {
    // Calculate date range
    const afterDate = dayjs().subtract(3, "month").format("YYYY-MM-DD")
    const beforeDate = dayjs().add(3, "month").format("YYYY-MM-DD")

    const response = await axios.get(`${API_URL}/events`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        after: afterDate,
        before: beforeDate,
      },
    })

    const events: CalendarItem[] = []
    const byDate: Record<string, CalendarItem[]> = {}

    if (response.data && Array.isArray(response.data)) {
      response.data.forEach((event: any) => {
        // For events with day of week and session times
        if (event.day && event.session_start_at) {
          // Get the next occurrence of this day
          const eventDate = getNextDayOccurrence(event.day)

          // Format the time
          const startTime = formatTimeString(event.session_start_at)
          const endTime = event.session_end_at ? formatTimeString(event.session_end_at) : ""
          const timeDisplay = endTime ? `${startTime} - ${endTime}` : startTime

          // Extract title
          const title = extractTitle(event)

          const calendarItem: CalendarItem = {
            id: event.id || `event-${Math.random().toString(36).substr(2, 9)}`,
            title: title,
            date: eventDate,
            time: timeDisplay,
            type: "event",
            location: event.location || "RISE Basketball Facility",
            description: event.description || "",
          }

          events.push(calendarItem)

          if (!byDate[eventDate]) {
            byDate[eventDate] = []
          }
          byDate[eventDate].push(calendarItem)

          // Also add recurring events
          for (let i = 1; i <= 8; i++) {
            const futureDate = dayjs(eventDate)
              .add(i * 7, "day")
              .format("YYYY-MM-DD")

            const recurringItem: CalendarItem = {
              id: `${event.id}-${i}` || `event-${Math.random().toString(36).substr(2, 9)}-${i}`,
              title: title,
              date: futureDate,
              time: timeDisplay,
              type: "event",
              location: event.location || "RISE Basketball Facility",
              description: event.description || "",
            }

            events.push(recurringItem)

            if (!byDate[futureDate]) {
              byDate[futureDate] = []
            }
            byDate[futureDate].push(recurringItem)
          }
        }
        // For events with regular date field
        else if (event.date) {
          const eventDate = dayjs(event.date).format("YYYY-MM-DD")
          const title = extractTitle(event)

          const calendarItem: CalendarItem = {
            id: event.id || `event-${Math.random().toString(36).substr(2, 9)}`,
            title: title,
            date: eventDate,
            time: event.time || "TBD",
            type: "event",
            location: event.location || "RISE Basketball Facility",
            description: event.description || "",
          }

          events.push(calendarItem)

          if (!byDate[eventDate]) {
            byDate[eventDate] = []
          }
          byDate[eventDate].push(calendarItem)
        }
      })
    }

    return {
      items: events,
      byDate,
      lastFetched: new Date().toISOString(),
    }
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch events")
  }
})

// Create slice
const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearEvents: (state) => {
      state.items = []
      state.byDate = {}
      state.status = "idle"
      state.error = null
      state.lastFetched = null
    },
    addEvent: (state, action: PayloadAction<CalendarItem>) => {
      state.items.push(action.payload)

      const date = action.payload.date
      if (!state.byDate[date]) {
        state.byDate[date] = []
      }
      state.byDate[date].push(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.items
        state.byDate = action.payload.byDate
        state.lastFetched = action.payload.lastFetched
        state.error = null
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
  },
})

// Export actions and reducer
export const { clearEvents, addEvent } = eventsSlice.actions
export default eventsSlice.reducer

