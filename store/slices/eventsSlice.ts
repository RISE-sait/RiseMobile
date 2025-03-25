import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { API_URL } from "@/utils/api"
import dayjs from "dayjs"
import type { RootState } from "@/store"

// Define types
export interface CalendarItem {
  id: string
  title: string
  date: string
  time: string
  type: "practice" | "course" | "game" | "others" // Updated to match valid types
  location?: string
  description?: string
}

// Define the Event interface based on the API response
export interface Event {
  id: string
  capacity?: number
  day?: string
  location_address?: string
  location_id?: string
  location_name?: string
  program_end_at?: string
  program_id?: string
  program_name?: string
  program_start_at?: string
  program_type?: "practice" | "course" | "game" | "others" // Updated to match valid types
  session_end_at?: string
  session_start_at?: string
}

interface EventsState {
  items: CalendarItem[]
  byDate: Record<string, CalendarItem[]>
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  lastFetched: string | null
  // Fields for detailed event data
  detailedEvents: Record<string, Event>
  detailedEventsStatus: "idle" | "loading" | "succeeded" | "failed"
  detailedEventsError: string | null
  lastFetchedDetailed: Record<string, number> // Timestamp of when each event was last fetched
}

// Initial state
const initialState: EventsState = {
  items: [],
  byDate: {},
  status: "idle",
  error: null,
  lastFetched: null,
  // Fields for detailed event data
  detailedEvents: {},
  detailedEventsStatus: "idle",
  detailedEventsError: null,
  lastFetchedDetailed: {},
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

// Function to implement retry logic with exponential backoff
const fetchWithRetry = async (url: string, token: string, params = {}, maxRetries = 3) => {
  let retries = 0
  let lastError

  while (retries < maxRetries) {
    try {
      return await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      })
    } catch (error) {
      lastError = error
      retries++
      // Exponential backoff: wait 2^retries * 1000ms before retrying
      const delay = Math.pow(2, retries) * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// Update the extractTitle function to be more descriptive and check more fields
const extractTitle = (program: any): string => {
  // First check for explicit title fields
  if (program.title) return program.title
  if (program.name) return program.name
  if (program.program_name) return program.program_name

  // If we have a day field, create a more descriptive title
  if (program.day) {
    return `${program.day.charAt(0).toUpperCase() + program.day.slice(1).toLowerCase()} Training Session`
  }

  // Last resort fallback
  return "RISE Basketball Event"
}

// Helper function to determine event type
const determineEventType = (program: any): "practice" | "course" | "game" | "others" => {
  // Check if the program has an explicit type field
  if (program.program_type) {
    const programType = program.program_type.toLowerCase()
    if (programType === "practice") return "practice"
    if (programType === "course") return "course"
    if (programType === "game") return "game"
  }

  // Default to others
  return "others"
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

// Async thunk to fetch events (now from /programs endpoint)
export const fetchEvents = createAsyncThunk("events/fetchEvents", async (token: string, { rejectWithValue }) => {
  try {
    // Calculate date range
    const afterDate = dayjs().subtract(3, "month").format("YYYY-MM-DD")
    const beforeDate = dayjs().add(3, "month").format("YYYY-MM-DD")

    // Log the request for debugging
    console.log(`Fetching programs from ${API_URL}/programs with token: ${token.substring(0, 10)}...`)

    // Create an array of requests for each program type
    const programTypes = ["practice", "course", "game", "others"]
    const requests = programTypes.map((type) =>
      fetchWithRetry(`${API_URL}/programs`, token, {
        after: afterDate,
        before: beforeDate,
        program_type: type,
      }),
    )

    // Execute all requests in parallel
    const responses = await Promise.all(requests)

    // Combine all responses
    const allPrograms = responses.flatMap((response) => response.data || [])

    console.log(`Programs API response: ${allPrograms.length} programs found`)

    const events: CalendarItem[] = []
    const byDate: Record<string, CalendarItem[]> = {}

    if (allPrograms.length > 0) {
      allPrograms.forEach((program: any) => {
        // For programs with day of week and session times
        if (program.day && program.session_start_at) {
          // Get the next occurrence of this day
          const eventDate = getNextDayOccurrence(program.day)

          // Format the time
          const startTime = formatTimeString(program.session_start_at)
          const endTime = program.session_end_at ? formatTimeString(program.session_end_at) : ""
          const timeDisplay = endTime ? `${startTime} - ${endTime}` : startTime

          // Extract title
          const title = extractTitle(program)

          // Determine event type (using valid types)
          const eventType = determineEventType(program)

          const calendarItem: CalendarItem = {
            id: program.id || `event-${Math.random().toString(36).substr(2, 9)}`,
            title: title,
            date: eventDate,
            time: timeDisplay,
            type: eventType,
            location: program.location_name || "RISE Basketball Facility",
            description: program.description || "",
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
              id: `${program.id}-${i}` || `event-${Math.random().toString(36).substr(2, 9)}-${i}`,
              title: title,
              date: futureDate,
              time: timeDisplay,
              type: eventType,
              location: program.location_name || "RISE Basketball Facility",
              description: program.description || "",
            }

            events.push(recurringItem)

            if (!byDate[futureDate]) {
              byDate[futureDate] = []
            }
            byDate[futureDate].push(recurringItem)
          }
        }
        // For programs with regular date field
        else if (program.date) {
          const eventDate = dayjs(program.date).format("YYYY-MM-DD")
          const title = extractTitle(program)
          const eventType = determineEventType(program)

          const calendarItem: CalendarItem = {
            id: program.id || `event-${Math.random().toString(36).substr(2, 9)}`,
            title: title,
            date: eventDate,
            time: program.time || "TBD",
            type: eventType,
            location: program.location_name || "RISE Basketball Facility",
            description: program.description || "",
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
    console.error("Programs API error:", error.response?.data || error.message)
    return rejectWithValue(error.response?.data?.error?.message || error.message || "Failed to fetch programs")
  }
})

// Fetch a single event by ID
export const fetchEventById = createAsyncThunk<Event, { eventId: string; token: string }, { state: RootState }>(
  "events/fetchEventById",
  async ({ eventId, token }, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const lastFetched = state.events.lastFetchedDetailed[eventId]
      const now = Date.now()

      // If the event is in the cache and was fetched recently, return it from the cache
      if (lastFetched && now - lastFetched < CACHE_DURATION && state.events.detailedEvents[eventId]) {
        return state.events.detailedEvents[eventId]
      }

      // Extract the base ID (remove any suffix for recurring events)
      const baseId = eventId.includes("-") ? eventId.split("-")[0] : eventId

      // Otherwise, fetch from the API with retry logic
      console.log(`Fetching event details for ID: ${baseId}`)
      const response = await fetchWithRetry(`${API_URL}/events/${baseId}`, token)
      console.log("Event details response:", response.data)
      return response.data
    } catch (error: any) {
      console.error("Event details API error:", error.response?.data || error.message)
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.error?.message || "Failed to fetch event details")
      }
      return rejectWithValue("An unexpected error occurred")
    }
  },
)

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
      state.detailedEvents = {}
      state.detailedEventsStatus = "idle"
      state.detailedEventsError = null
      state.lastFetchedDetailed = {}
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
      // Handle fetchEvents
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

      // Handle fetchEventById
      .addCase(fetchEventById.pending, (state) => {
        state.detailedEventsStatus = "loading"
        state.detailedEventsError = null
      })
      .addCase(fetchEventById.fulfilled, (state, action: PayloadAction<Event>) => {
        state.detailedEventsStatus = "succeeded"
        // Add the event to the detailedEvents object
        state.detailedEvents[action.payload.id] = action.payload
        // Update the lastFetchedDetailed timestamp for this event
        state.lastFetchedDetailed[action.payload.id] = Date.now()
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.detailedEventsStatus = "failed"
        state.detailedEventsError = action.payload as string
      })
  },
})

// Export actions and reducer
export const { clearEvents, addEvent } = eventsSlice.actions

// Export selectors
export const selectAllEvents = (state: RootState) => state.events.items
export const selectEventsByDate = (state: RootState, date: string) => state.events.byDate[date] || []
export const selectDetailedEventById = (state: RootState, eventId: string) => state.events.detailedEvents[eventId]
export const selectEventsStatus = (state: RootState) => state.events.status
export const selectEventsError = (state: RootState) => state.events.error
export const selectDetailedEventsStatus = (state: RootState) => state.events.detailedEventsStatus
export const selectDetailedEventsError = (state: RootState) => state.events.detailedEventsError

export default eventsSlice.reducer

