import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { API_URL } from "@/utils/api"
import dayjs from "dayjs"
import type { CalendarItem } from "./eventsSlice"

interface PracticesState {
  items: CalendarItem[]
  byDate: Record<string, CalendarItem[]>
  byId: Record<string, CalendarItem>
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  lastFetched: string | null
}

// Initial state
const initialState: PracticesState = {
  items: [],
  byDate: {},
  byId: {},
  status: "idle",
  error: null,
  lastFetched: null,
}

// Helper function to extract title
const extractTitle = (practice: any): string => {
  if (practice.title) return practice.title
  if (practice.name) return practice.name
  if (practice.practice_name) return practice.practice_name
  return "Practice Session"
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

// Async thunk to fetch practices
export const fetchPractices = createAsyncThunk(
  "practices/fetchPractices",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/practices`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const practices: CalendarItem[] = []
      const byDate: Record<string, CalendarItem[]> = {}
      const byId: Record<string, CalendarItem> = {}

      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((practice: any) => {
          // Extract day information from the name if possible
          let dayOfWeek = null
          const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

          for (const day of dayNames) {
            if (practice.name && practice.name.includes(day)) {
              dayOfWeek = day.toUpperCase()
              break
            }
          }

          const title = extractTitle(practice)

          if (dayOfWeek) {
            // Get the next occurrence of this day
            const practiceDate = getNextDayOccurrence(dayOfWeek)

            const calendarItem: CalendarItem = {
              id: practice.id || `practice-${Math.random().toString(36).substr(2, 9)}`,
              title: title,
              date: practiceDate,
              time: practice.time || "TBD",
              type: "practice",
              location: practice.location || "RISE Basketball Facility",
              description: practice.description || `${title} at ${practice.location || "RISE Basketball Facility"}`,
            }

            practices.push(calendarItem)
            byId[calendarItem.id] = calendarItem

            if (!byDate[practiceDate]) {
              byDate[practiceDate] = []
            }
            byDate[practiceDate].push(calendarItem)

            // Also add recurring practices
            for (let i = 1; i <= 8; i++) {
              const futureDate = dayjs(practiceDate)
                .add(i * 7, "day")
                .format("YYYY-MM-DD")

              const recurringItem: CalendarItem = {
                id: `${practice.id}-${i}` || `practice-${Math.random().toString(36).substr(2, 9)}-${i}`,
                title: title,
                date: futureDate,
                time: practice.time || "TBD",
                type: "practice",
                location: practice.location || "RISE Basketball Facility",
                description: practice.description || `${title} at ${practice.location || "RISE Basketball Facility"}`,
              }

              practices.push(recurringItem)
              byId[recurringItem.id] = recurringItem

              if (!byDate[futureDate]) {
                byDate[futureDate] = []
              }
              byDate[futureDate].push(recurringItem)
            }
          }
          // If we can't determine the day, add it to a random day in the next week
          else {
            const randomDays = Math.floor(Math.random() * 7)
            const practiceDate = dayjs().add(randomDays, "day").format("YYYY-MM-DD")

            const calendarItem: CalendarItem = {
              id: practice.id || `practice-${Math.random().toString(36).substr(2, 9)}`,
              title: title,
              date: practiceDate,
              time: practice.time || "TBD",
              type: "practice",
              location: practice.location || "RISE Basketball Facility",
              description: practice.description || `${title} at ${practice.location || "RISE Basketball Facility"}`,
            }

            practices.push(calendarItem)
            byId[calendarItem.id] = calendarItem

            if (!byDate[practiceDate]) {
              byDate[practiceDate] = []
            }
            byDate[practiceDate].push(calendarItem)
          }
        })
      }

      return {
        items: practices,
        byDate,
        byId,
        lastFetched: new Date().toISOString(),
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch practices")
    }
  },
)

// Create slice
const practicesSlice = createSlice({
  name: "practices",
  initialState,
  reducers: {
    clearPractices: (state) => {
      state.items = []
      state.byDate = {}
      state.byId = {}
      state.status = "idle"
      state.error = null
      state.lastFetched = null
    },
    addPractice: (state, action: PayloadAction<CalendarItem>) => {
      state.items.push(action.payload)
      state.byId[action.payload.id] = action.payload

      const date = action.payload.date
      if (!state.byDate[date]) {
        state.byDate[date] = []
      }
      state.byDate[date].push(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPractices.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchPractices.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.items
        state.byDate = action.payload.byDate
        state.byId = action.payload.byId
        state.lastFetched = action.payload.lastFetched
        state.error = null
      })
      .addCase(fetchPractices.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
  },
})

// Export actions and reducer
export const { clearPractices, addPractice } = practicesSlice.actions
export default practicesSlice.reducer

