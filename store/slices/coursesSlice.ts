import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { API_URL } from "@/utils/api"
import dayjs from "dayjs"
import type { CalendarItem } from "./eventsSlice"

interface CoursesState {
  items: CalendarItem[]
  byDate: Record<string, CalendarItem[]>
  byId: Record<string, CalendarItem>
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  lastFetched: string | null
}

// Initial state
const initialState: CoursesState = {
  items: [],
  byDate: {},
  byId: {},
  status: "idle",
  error: null,
  lastFetched: null,
}

// Helper function to extract day from program name
const extractDayFromName = (name: string): string | null => {
  if (!name) return null

  // Define day patterns to look for
  const dayPatterns = [
    { day: "MONDAY", patterns: ["monday", "mon-", "mon ", "-mon", " mon"] },
    { day: "TUESDAY", patterns: ["tuesday", "tue-", "tue ", "-tue", " tue"] },
    { day: "WEDNESDAY", patterns: ["wednesday", "wed-", "wed ", "-wed", " wed"] },
    { day: "THURSDAY", patterns: ["thursday", "thu-", "thu ", "-thu", " thu"] },
    { day: "FRIDAY", patterns: ["friday", "fri-", "fri ", "-fri", " fri"] },
    { day: "SATURDAY", patterns: ["saturday", "sat-", "sat ", "-sat", " sat"] },
    { day: "SUNDAY", patterns: ["sunday", "sun-", "sun ", "-sun", " sun"] },
  ]

  const lowerName = name.toLowerCase()

  // Check for each day pattern
  for (const { day, patterns } of dayPatterns) {
    for (const pattern of patterns) {
      if (lowerName.includes(pattern)) {
        return day
      }
    }
  }

  return null
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

// Generate a default time based on program type
const getDefaultTimeForType = (type: string): string => {
  switch (type.toLowerCase()) {
    case "practice":
      return "5:30 PM - 7:00 PM"
    case "game":
      return "7:00 PM - 9:00 PM"
    case "course":
      return "4:00 PM - 5:30 PM"
    default:
      return "6:00 PM - 7:30 PM"
  }
}

// Get default location based on program type and name
const getDefaultLocation = (type: string, name: string): string => {
  // Check for specific keywords in the name that might indicate location
  const lowerName = name.toLowerCase()

  if (lowerName.includes("court") || lowerName.includes("gym")) {
    return "RISE Basketball Courts"
  } else if (lowerName.includes("field") || lowerName.includes("outdoor")) {
    return "RISE Outdoor Fields"
  } else if (lowerName.includes("classroom") || lowerName.includes("lecture")) {
    return "RISE Learning Center"
  }

  switch (type.toLowerCase()) {
    case "practice":
      return "RISE Practice Facility"
    case "game":
      return "RISE Main Court"
    case "course":
      return "RISE Training Center"
    default:
      return "RISE Basketball Facility"
  }
}

// Async thunk to fetch courses
export const fetchCourses = createAsyncThunk("courses/fetchCourses", async (token: string, { rejectWithValue }) => {
  try {
    // Log the request for debugging

    const response = await axios.get(`${API_URL}/programs`, {
      headers: { Authorization: `Bearer ${token}` },
    })


    const courses: CalendarItem[] = []
    const byDate: Record<string, CalendarItem[]> = {}
    const byId: Record<string, CalendarItem> = {}

    if (response.data && Array.isArray(response.data)) {
      response.data.forEach((program: any) => {
        // Extract day from program name
        const dayOfWeek = extractDayFromName(program.name)

        // Get program title with better fallbacks
        const title =
          program.name ||
          (program.type
            ? `${program.type.charAt(0).toUpperCase() + program.type.slice(1).toLowerCase()} Session`
            : dayOfWeek
              ? `${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase()} Training`
              : "RISE Basketball Program")

        // Generate default time based on program type
        const timeString = getDefaultTimeForType(program.type || "course")

        // Get default location based on program type and name
        const location = program.location || getDefaultLocation(program.type || "course", title)

        // If we can extract a day, use it to schedule the program
        if (dayOfWeek) {
          // Get the next occurrence of this day
          const courseDate = getNextDayOccurrence(dayOfWeek)

          const calendarItem: CalendarItem = {
            id: program.id || `program-${Math.random().toString(36).substr(2, 9)}`,
            title: title,
            date: courseDate,
            time: timeString,
            type: program.type || "course", // Preserve the original type
            location: location,
            description: program.description || `${title} at ${location}`,
          }

          courses.push(calendarItem)
          byId[calendarItem.id] = calendarItem

          if (!byDate[courseDate]) {
            byDate[courseDate] = []
          }
          byDate[courseDate].push(calendarItem)

          // Also add recurring programs for the next 8 weeks
          for (let i = 1; i <= 8; i++) {
            const futureDate = dayjs(courseDate)
              .add(i * 7, "day")
              .format("YYYY-MM-DD")

            const recurringItem: CalendarItem = {
              id: `${program.id}-${i}` || `program-${Math.random().toString(36).substr(2, 9)}-${i}`,
              title: title,
              date: futureDate,
              time: timeString,
              type: program.type || "course", // Preserve the original type
              location: location,
              description: program.description || `${title} at ${location}`,
            }

            courses.push(recurringItem)
            byId[recurringItem.id] = recurringItem

            if (!byDate[futureDate]) {
              byDate[futureDate] = []
            }
            byDate[futureDate].push(recurringItem)
          }
        }
        // If we can't determine the day, distribute programs across the next 2 weeks
        else {
          // Distribute programs across the next 14 days to avoid clustering
          const randomDays = Math.floor(Math.random() * 14)
          const courseDate = dayjs().add(randomDays, "day").format("YYYY-MM-DD")

          // Create a unique ID with a suffix to avoid duplicate keys
          const uniqueId = `${program.id}-${randomDays}` || `program-${Math.random().toString(36).substr(2, 9)}`

          const calendarItem: CalendarItem = {
            id: uniqueId,
            title: title,
            date: courseDate,
            time: timeString,
            type: program.type || "course", // Preserve the original type
            location: location,
            description: program.description || `${title} at ${location}`,
          }

          courses.push(calendarItem)
          byId[calendarItem.id] = calendarItem

          if (!byDate[courseDate]) {
            byDate[courseDate] = []
          }
          byDate[courseDate].push(calendarItem)
        }
      })
    }

    return {
      items: courses,
      byDate,
      byId,
      lastFetched: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error("Programs API error:", error.response?.data || error.message)
    return rejectWithValue(error.message || "Failed to fetch programs")
  }
})

// Create slice
const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    clearCourses: (state) => {
      state.items = []
      state.byDate = {}
      state.byId = {}
      state.status = "idle"
      state.error = null
      state.lastFetched = null
    },
    addCourse: (state, action: PayloadAction<CalendarItem>) => {
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
      .addCase(fetchCourses.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.items
        state.byDate = action.payload.byDate
        state.byId = action.payload.byId
        state.lastFetched = action.payload.lastFetched
        state.error = null
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
  },
})

// Export actions and reducer
export const { clearCourses, addCourse } = coursesSlice.actions
export default coursesSlice.reducer

