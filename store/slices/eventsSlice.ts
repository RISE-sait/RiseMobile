import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { API_URL } from "@/utils/api"
import dayjs from "dayjs"
import type { RootState } from "../index"

// Define types
export interface CalendarItem {
  id: string
  title: string
  date: string
  time: string
  type: "practice" | "course" | "game" | "match" | "others" | "event"
  location?: string
  description?: string
  program_type?: string
  program?: {
    id: string
    name?: string
    type?: string
  }
}

// Define the Event interface based on the API response
export interface Event {
  id: string
  program?: {
    id: string
    name: string
    type: string
  }
  location?: {
    id: string
    name: string
    address: string
  }
  capacity?: number
  created_by?: any
  updated_by?: any
  start_at?: string
  end_at?: string
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

// Helper function to extract title from event data
const extractTitle = (event: any): string => {
  // First check if we have a program with a name
  if (event.program && event.program.name) {
    return event.program.name
  }

  // Then check for explicit title fields
  if (event.title) return event.title
  if (event.name) return event.name
  if (event.program_name) return event.program_name
  if (event.event_name) return event.event_name

  // For games/matches, create a title based on teams if available
  if (event.home_team && event.away_team) {
    return `${event.home_team} vs ${event.away_team}`
  }

  // If we have a day field, create a more descriptive title
  if (event.day) {
    return `${event.day.charAt(0).toUpperCase() + event.day.slice(1).toLowerCase()} Training Session`
  }

  // Last resort fallback
  return "RISE Basketball Event"
}

// Helper function to determine event type
export const determineEventType = (event: any): "practice" | "course" | "game" | "match" | "others" | "event" => {
  // First check if we have a program type
  if (event.program && event.program.type) {
    const programType = event.program.type.toLowerCase()

    if (programType === "match" || programType === "game") {
      return "match"
    }
    if (programType === "practice" || programType === "training") {
      return "practice"
    }
    if (programType === "course" || programType === "class") {
      return "course"
    }
  }

  // Fallback to other fields
  const typeFields = [event.event_type, event.program_type, event.type, event.category]
    .filter(Boolean)
    .map((t) => (typeof t === "string" ? t.toLowerCase() : ""))

  // Check for match types
  if (typeFields.some((t) => t === "match" || t === "game")) {
    return "match"
  }

  // Check for practice types
  if (typeFields.some((t) => t === "practice" || t === "training")) {
    return "practice"
  }

  // Check for course types
  if (typeFields.some((t) => t === "course" || t === "class" || t === "program")) {
    return "course"
  }

  // Check title for clues
  const title = extractTitle(event).toLowerCase()

  if (title.includes("match") || title.includes("game") || title.includes("vs") || title.includes("versus")) {
    return "match"
  }

  if (title.includes("practice") || title.includes("training") || title.includes("drill")) {
    return "practice"
  }

  if (title.includes("course") || title.includes("class") || title.includes("lesson")) {
    return "course"
  }

  // Check if it's a game based on other fields
  if (event.game_id || event.home_team || event.away_team) {
    return "match"
  }

  // Distribute events more evenly for testing
  // This is a fallback to ensure we see different types in the UI
  const eventId = event.id || ""
  const lastChar = eventId.charAt(eventId.length - 1)
  const charCode = lastChar.charCodeAt(0) || 0

  if (charCode % 3 === 0) return "match"
  if (charCode % 3 === 1) return "practice"
  if (charCode % 3 === 2) return "course"

  // Default to event
  return "event"
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

// Helper function to parse the API's date format: "2025-06-02 17:30:00 +0000 UTC"
const parseApiDateFormat = (dateString: string): { date: string; time: string } => {
  if (!dateString) {
    return { date: dayjs().format("YYYY-MM-DD"), time: "TBD" }
  }

  try {
    // Extract the date and time parts
    const parts = dateString.split(" ")
    if (parts.length < 2) {
      return { date: dayjs().format("YYYY-MM-DD"), time: "TBD" }
    }

    const datePart = parts[0] // "2025-06-02"
    const timePart = parts[1] // "17:30:00"

    // Format the date as YYYY-MM-DD
    const formattedDate = dayjs(datePart).format("YYYY-MM-DD")

    // Format the time as 12-hour format with AM/PM
    const timeComponents = timePart.split(":")
    const hour = Number.parseInt(timeComponents[0], 10)
    const minute = Number.parseInt(timeComponents[1], 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    const formattedTime = `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`

    return { date: formattedDate, time: formattedTime }
  } catch (error) {
    console.error("Error parsing date:", dateString, error)
    return { date: dayjs().format("YYYY-MM-DD"), time: "TBD" }
  }
}

// Helper function to process events and structure them by date
const processEvents = (events: any[]): { items: CalendarItem[]; byDate: Record<string, CalendarItem[]> } => {
  const items: CalendarItem[] = []
  const byDate: Record<string, CalendarItem[]> = {}

  events.forEach((event) => {
    if (!event) return // Skip null or undefined events

    let date: string
    let time: string

    try {
      // Attempt to parse date and time
      const parsed = parseApiDateFormat(event.start_at)
      date = parsed.date
      time = parsed.time
    } catch (error) {
      console.error("❌ Error parsing date for event:", event, error)
      date = dayjs().format("YYYY-MM-DD")
      time = "TBD"
    }

    const title = extractTitle(event)
    const type = determineEventType(event)
    const location = event.location?.name || "TBD"

    // Log for debugging
    console.log(`Processing event: ${event.id}`)
    console.log(`- Title: ${title}`)
    console.log(`- Type: ${type}`)
    console.log(`- Location: ${location}`)
    console.log(`- Date: ${date}, Time: ${time}`)

    const calendarItem: CalendarItem = {
      id: event.id,
      title: title,
      date: date,
      time: time,
      type: type,
      location: location,
      description: event.description || "",
      program_type: event.program?.type || "",
      program: {
        id: event.program?.id || "", // Ensure program ID is included
        name: event.program?.name,
        type: event.program?.type,
      },
    }

    items.push(calendarItem)

    if (!byDate[date]) {
      byDate[date] = []
    }
    byDate[date].push(calendarItem)
  })

  return { items, byDate }
}

// Async thunk to fetch events from the /events endpoint
export const fetchEvents = createAsyncThunk("events/fetchEvents", async (token: string, { rejectWithValue }) => {
  try {
    // Calculate date range (3 months before and after current date)
    const afterDate = dayjs().subtract(3, "month").format("YYYY-MM-DD")
    const beforeDate = dayjs().add(3, "month").format("YYYY-MM-DD")

    // Log the request for debugging
    console.log(`Fetching events with token: ${token.substring(0, 10)}...`)
    console.log(`Date range: ${afterDate} to ${beforeDate}`)

    // Fetch events with required parameters
    const response = await fetchWithRetry(`${API_URL}/events`, token, {
      after: afterDate,
      before: beforeDate,
    })

    console.log(`Events API response: ${response.data?.length || 0} events found`)

    // Process all the events
    const { items, byDate } = processEvents(response.data)

    // Log the processed events for debugging
    console.log(`Processed ${items.length} events for the calendar`)
    console.log(`Events by date: ${Object.keys(byDate).length} dates`)

    // Log a sample of the processed data
    if (Object.keys(byDate).length > 0) {
      const sampleDate = Object.keys(byDate)[0]
      console.log(`Sample date ${sampleDate} has ${byDate[sampleDate].length} events`)
      console.log("Sample events:", byDate[sampleDate].slice(0, 2))
    }

    return {
      items,
      byDate,
      lastFetched: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error("Events API error:", error.response?.data || error.message)
    return rejectWithValue(error.message || "Failed to fetch events")
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

      // Clean the ID - if it's a UUID with a suffix, remove the suffix
      const baseId = eventId.includes("-") && eventId.length > 36 ? eventId.substring(0, 36) : eventId

      // Fetch from the API with retry logic
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
        // Make sure we have a valid ID
        if (action.payload && action.payload.id) {
          // Add the event to the detailedEvents object
          state.detailedEvents[action.payload.id] = action.payload
          // Update the lastFetchedDetailed timestamp for this event
          state.lastFetchedDetailed[action.payload.id] = Date.now()
        } else {
          console.error("Received invalid event data:", action.payload)
        }
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

