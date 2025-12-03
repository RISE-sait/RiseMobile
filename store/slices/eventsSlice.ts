import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { API_URL } from "@/utils/api"
import dayjs from "dayjs"
import type { RootState } from "@/store"
import type { CalendarItem, Event, EventsState } from "@/types"

const initialState: EventsState = {
  items: [],
  byDate: {},
  status: "idle",
  error: null,
  lastFetched: null,
  detailedEvents: {},
  detailedEventsStatus: "idle",
  detailedEventsError: null,
  lastFetchedDetailed: {},
}

const CACHE_DURATION = 5 * 60 * 1000

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
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 1000))
    }
  }

  throw lastError
}

const extractTitle = (event: any): string => {
  if (event.program?.name) return event.program.name
  return event.title || event.name || event.program_name || event.event_name || "RISE Basketball Event"
}

export const determineEventType = (event: any): CalendarItem["type"] => {
  // First, check if the event has an explicit type field from the API
  const explicitType = event.type?.toLowerCase()
  if (explicitType) {
    if (["match", "game"].includes(explicitType)) return "match"
    if (["practice", "training"].includes(explicitType)) return "practice"
    if (["course", "class"].includes(explicitType)) return "course"
    if (explicitType === "event") return "event"
  }

  // Then check program type
  const programType = event.program?.type?.toLowerCase()
  if (programType) {
    if (["match", "game"].includes(programType)) return "match"
    if (["practice", "training"].includes(programType)) return "practice"
    if (["course", "class"].includes(programType)) return "course"
  }

  // Check event_type or program_type fields
  const eventType = (event.event_type || event.program_type || event.category || "").toLowerCase()
  if (eventType) {
    if (eventType.includes("match") || eventType.includes("game")) return "match"
    if (eventType.includes("practice") || eventType.includes("training")) return "practice"
    if (eventType.includes("course") || eventType.includes("class")) return "course"
  }

  // Default to "event" - do NOT guess based on title keywords
  // This ensures consistent typing across all instances of the same event
  return "event"
}

const parseApiDateFormat = (dateString: string): { date: string; time: string } => {
  if (!dateString) return { date: dayjs().format("YYYY-MM-DD"), time: "TBD" }

  try {
    // Handle both formats: "2025-11-27 14:30:00" (space) and "2025-11-27T14:30:00" (ISO)
    let datePart: string
    let timePart: string

    if (dateString.includes("T")) {
      // ISO format: "2025-11-27T14:30:00Z" or "2025-11-27T14:30:00"
      [datePart, timePart] = dateString.split("T")
      timePart = timePart.split("Z")[0] // Remove Z if present
    } else if (dateString.includes(" ")) {
      // Space format: "2025-11-27 14:30:00 -0700"
      const parts = dateString.split(" ")
      datePart = parts[0]
      timePart = parts[1]
    } else {
      // Just a date, no time
      return { date: dayjs(dateString).format("YYYY-MM-DD"), time: "TBD" }
    }

    const formattedDate = dayjs(datePart).format("YYYY-MM-DD")
    const [hour, minute] = timePart.split(":")
    const hourNum = parseInt(hour, 10)
    const ampm = hourNum >= 12 ? "PM" : "AM"
    const hour12 = hourNum % 12 || 12
    const formattedTime = `${hour12}:${minute} ${ampm}`

    return { date: formattedDate, time: formattedTime }
  } catch {
    return { date: dayjs().format("YYYY-MM-DD"), time: "TBD" }
  }
}

const processEvents = (events: any[]): { items: CalendarItem[]; byDate: Record<string, CalendarItem[]> } => {
  const items: CalendarItem[] = []
  const byDate: Record<string, CalendarItem[]> = {}

  events.forEach((event) => {
    const { date, time } = parseApiDateFormat(event.start_at)
    const title = extractTitle(event)
    const type = determineEventType(event)
    const location = event.location?.name || "TBD"

    const calendarItem: CalendarItem = {
      id: event.id,
      title,
      date,
      time,
      type,
      location,
      description: event.description || "",
      program_type: event.program?.type || "",
      program: {
        id: event.program?.id || "",
        name: event.program?.name,
        type: event.program?.type,
        photo_url: event.program?.photo_url,
      },
    }

    items.push(calendarItem)
    if (!byDate[date]) byDate[date] = []
    byDate[date].push(calendarItem)
  })

  return { items, byDate }
}

// Fetch user's enrolled events (secure endpoint)
export const fetchUserEvents = createAsyncThunk("events/fetchUserEvents", async (token: string, { rejectWithValue }) => {
  try {
    const afterDate = dayjs().subtract(3, "month").format("YYYY-MM-DD")
    const beforeDate = dayjs().add(3, "month").format("YYYY-MM-DD")

    const response = await fetchWithRetry(`${API_URL}/secure/events`, token, { after: afterDate, before: beforeDate })
    const { items, byDate } = processEvents(response.data)

    return {
      items,
      byDate,
      lastFetched: new Date().toISOString(),
    }
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch user events")
  }
})

// Fetch all available events for registration (public endpoint)
export const fetchEvents = createAsyncThunk("events/fetchEvents", async (token: string, { rejectWithValue }) => {
  try {
    // Focus on more recent past events and near-future events for better performance
    const afterDate = dayjs().subtract(2, "weeks").format("YYYY-MM-DD")
    const beforeDate = dayjs().add(3, "months").format("YYYY-MM-DD")

    const response = await fetchWithRetry(`${API_URL}/events`, token, { after: afterDate, before: beforeDate })
    const { items, byDate } = processEvents(response.data)

    return {
      items,
      byDate,
      lastFetched: new Date().toISOString(),
    }
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch events")
  }
})

export const fetchEventById = createAsyncThunk<Event, { eventId: string; token: string }, { state: RootState }>(
  "events/fetchEventById",
  async ({ eventId, token }, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const lastFetched = state.events.lastFetchedDetailed[eventId]
      const now = Date.now()

      if (lastFetched && now - lastFetched < CACHE_DURATION && state.events.detailedEvents[eventId]) {
        return state.events.detailedEvents[eventId]
      }

      const baseId = eventId.includes("-") && eventId.length > 36 ? eventId.substring(0, 36) : eventId
      const response = await fetchWithRetry(`${API_URL}/events/${baseId}`, token)

      return response.data
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.error?.message || "Failed to fetch event details")
      }
      return rejectWithValue("An unexpected error occurred")
    }
  }
)

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
      if (!state.byDate[date]) state.byDate[date] = []
      state.byDate[date].push(action.payload)
    },
    // Cleanup old detailed events to prevent memory accumulation
    cleanupOldDetailedEvents: (state) => {
      const now = Date.now()
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours

      Object.keys(state.lastFetchedDetailed).forEach(eventId => {
        const lastFetched = state.lastFetchedDetailed[eventId]
        if (now - lastFetched > maxAge) {
          delete state.detailedEvents[eventId]
          delete state.lastFetchedDetailed[eventId]
        }
      })
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
      .addCase(fetchUserEvents.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchUserEvents.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.items
        state.byDate = action.payload.byDate
        state.lastFetched = action.payload.lastFetched
        state.error = null
      })
      .addCase(fetchUserEvents.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      .addCase(fetchEventById.pending, (state) => {
        state.detailedEventsStatus = "loading"
        state.detailedEventsError = null
      })
      .addCase(fetchEventById.fulfilled, (state, action: PayloadAction<Event>) => {
        state.detailedEventsStatus = "succeeded"
        if (action.payload && action.payload.id) {
          state.detailedEvents[action.payload.id] = action.payload
          state.lastFetchedDetailed[action.payload.id] = Date.now()
        }
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.detailedEventsStatus = "failed"
        state.detailedEventsError = action.payload as string
      })
  },
})

export const { clearEvents, addEvent, cleanupOldDetailedEvents } = eventsSlice.actions
export default eventsSlice.reducer

export const selectAllEvents = (state: RootState) => state.events.items
export const selectEventsByDate = (state: RootState, date: string) => state.events.byDate[date] || []
export const selectDetailedEventById = (state: RootState, eventId: string) => state.events.detailedEvents[eventId]
export const selectEventsStatus = (state: RootState) => state.events.status
export const selectEventsError = (state: RootState) => state.events.error
export const selectDetailedEventsStatus = (state: RootState) => state.events.detailedEventsStatus
export const selectDetailedEventsError = (state: RootState) => state.events.detailedEventsError
