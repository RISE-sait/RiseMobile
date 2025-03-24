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

// Helper function to extract title
const extractTitle = (course: any): string => {
  if (course.title) return course.title
  if (course.name) return course.name
  if (course.course_name) return course.course_name
  return "Course"
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

// Async thunk to fetch courses
export const fetchCourses = createAsyncThunk("courses/fetchCourses", async (token: string, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const courses: CalendarItem[] = []
    const byDate: Record<string, CalendarItem[]> = {}
    const byId: Record<string, CalendarItem> = {}

    if (response.data && Array.isArray(response.data)) {
      response.data.forEach((course: any) => {
        // Extract day information from the name if possible
        let dayOfWeek = null
        const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        for (const day of dayNames) {
          if (course.name && course.name.includes(day)) {
            dayOfWeek = day.toUpperCase()
            break
          }
        }

        const title = extractTitle(course)

        if (dayOfWeek) {
          // Get the next occurrence of this day
          const courseDate = getNextDayOccurrence(dayOfWeek)

          const calendarItem: CalendarItem = {
            id: course.id || `course-${Math.random().toString(36).substr(2, 9)}`,
            title: title,
            date: courseDate,
            time: course.time || "TBD",
            type: "course",
            location: course.location || "RISE Basketball Facility",
            description: course.description || `${title} at ${course.location || "RISE Basketball Facility"}`,
          }

          courses.push(calendarItem)
          byId[calendarItem.id] = calendarItem

          if (!byDate[courseDate]) {
            byDate[courseDate] = []
          }
          byDate[courseDate].push(calendarItem)

          // Also add recurring courses
          for (let i = 1; i <= 8; i++) {
            const futureDate = dayjs(courseDate)
              .add(i * 7, "day")
              .format("YYYY-MM-DD")

            const recurringItem: CalendarItem = {
              id: `${course.id}-${i}` || `course-${Math.random().toString(36).substr(2, 9)}-${i}`,
              title: title,
              date: futureDate,
              time: course.time || "TBD",
              type: "course",
              location: course.location || "RISE Basketball Facility",
              description: course.description || `${title} at ${course.location || "RISE Basketball Facility"}`,
            }

            courses.push(recurringItem)
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
          const courseDate = dayjs().add(randomDays, "day").format("YYYY-MM-DD")

          const calendarItem: CalendarItem = {
            id: course.id || `course-${Math.random().toString(36).substr(2, 9)}`,
            title: title,
            date: courseDate,
            time: course.time || "TBD",
            type: "course",
            location: course.location || "RISE Basketball Facility",
            description: course.description || `${title} at ${course.location || "RISE Basketball Facility"}`,
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
    return rejectWithValue(error.message || "Failed to fetch courses")
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

