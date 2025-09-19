import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { API_URL, refreshBackendJwt } from "@/utils/api"
import dayjs from "dayjs"
// import { auth } from "@/firebase/firebaseConfig" // No longer needed with centralized token management
import type { CalendarItem, PracticesState } from "@/types"
import type { CreatePracticePayload } from "@/types/practice"
import NotificationService from "@/app/services/notificationService"

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

  if (dayIndex === -1) return today.format("YYYY-MM-DD")

  const todayIndex = today.day()
  const daysUntilNext = (dayIndex - todayIndex + 7) % 7

  return today.add(daysUntilNext, "day").format("YYYY-MM-DD")
}

// Helper function to send practice notification
const sendPracticeNotification = async (
  jwt: string,
  teamId: string,
  practiceDetails: {
    date: string
    time: string
    location: string
    isRecurring?: boolean
  }
) => {
  try {
    const notificationService = NotificationService.getInstance()

    const formattedDate = dayjs(practiceDetails.date).format("MMMM D, YYYY")
    const title = "New Practice Scheduled"
    const body = practiceDetails.isRecurring
      ? `Recurring practice scheduled for ${dayjs(practiceDetails.date).format("dddd")}s at ${practiceDetails.time}${practiceDetails.location ? ` at ${practiceDetails.location}` : ""}`
      : `Practice scheduled for ${formattedDate} at ${practiceDetails.time}${practiceDetails.location ? ` at ${practiceDetails.location}` : ""}`

    await notificationService.sendNotification(jwt, {
      title,
      body,
      team_id: teamId,
      type: "practice_booked",
      data: {
        practice_date: practiceDetails.date,
        practice_time: practiceDetails.time,
        location: practiceDetails.location,
        is_recurring: practiceDetails.isRecurring || false
      }
    })

  } catch (error) {
    console.error("❌ Failed to send practice notification:", error)
    // Don't throw error - notification failure shouldn't prevent practice creation
  }
}


export const fetchPractices = createAsyncThunk(
  "practices/fetchPractices",
  async (
    {
      token,
      after,
      before,
    }: {
      token: string
      after: string
      before: string
    },
    { rejectWithValue }
  ) => {

    try {
      const params = new URLSearchParams({
        after,
        before,
        program_type: "practice",
        response_type: "date",
      })

      const response = await axios.get(`${API_URL}/secure/schedule?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      // Extract only practices data from the schedule response
      const responseData = response.data as any
      const practicesData = responseData.practices || []




      const items: CalendarItem[] = []
      const byDate: Record<string, CalendarItem[]> = {}
      const byId: Record<string, CalendarItem> = {}

      for (const practice of practicesData)  {
        const startDate = dayjs(practice.start_time).format("YYYY-MM-DD")
        const time = dayjs(practice.start_time).format("HH:mm")

        const item: CalendarItem = {
          id: practice.id,
          title: practice.team_name || extractTitle(practice),
          date: startDate,
          time,
          type: "practice",
          location: practice.location_name || practice.location?.name || "TBD",
          description: `${practice.team_name || extractTitle(practice)} practice${practice.location_name ? ' at ' + practice.location_name : ''}`,
        }

        items.push(item)
        byId[item.id] = item
        if (!byDate[startDate]) byDate[startDate] = []
        byDate[startDate].push(item)
      }

      return {
        items,
        byDate,
        byId,
        lastFetched: new Date().toISOString(),
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch practices")
    }
  }
)

export const createPracticeThunk = createAsyncThunk<
  CalendarItem,
  CreatePracticePayload,
  { rejectValue: string }
>(
  "practices/createPractice",
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      // Use centralized JWT refresh instead of manual token exchange
      const jwt = await refreshBackendJwt()
      if (!jwt) throw new Error("Could not retrieve backend JWT")

      const response = await axios.post(
        `${API_URL}/practices`,
        payload,
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )

      const responseData = response.data as any
      const item: CalendarItem = {
        id: responseData.id, // no fallback
        title: "Practice", // fallback title
        date: dayjs(payload.start_time).format("YYYY-MM-DD"),
        time: dayjs(payload.start_time).format("HH:mm"),
        type: "practice",
        location: "RISE Basketball Facility",
        description: `Practice at RISE Basketball Facility`,
      }

      // Send notification to team members
      if (payload.team_id) {
        await sendPracticeNotification(jwt, payload.team_id, {
          date: item.date,
          time: item.time,
          location: item.location || "RISE Basketball Facility",
          isRecurring: false
        })
      }

      dispatch(addPractice(item))
      return item
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to create practice")
    }
  }
)

export const createRecurringPracticeThunk = createAsyncThunk<
  void,
  {
    court_id: string
    day: string
    location_id: string
    practice_end_at: string
    practice_start_at: string
    recurrence_end_at: string
    recurrence_start_at: string
    status: string
    team_id: string
  },
  { rejectValue: string }
>(
  "practices/createRecurringPractice",
  async (payload, { rejectWithValue }) => {
    try {
      // Use centralized JWT refresh instead of manual token exchange
      const jwt = await refreshBackendJwt()
      if (!jwt) throw new Error("Could not retrieve backend JWT")


      const response = await axios.post(
        `${API_URL}/practices/recurring`,
        payload,
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )


      // Send notification for recurring practice
      if (payload.team_id) {
        const startTime = dayjs(payload.practice_start_at, "HH:mm:ss+00:00").format("HH:mm")
        const nextOccurrence = getNextDayOccurrence(payload.day)

        await sendPracticeNotification(jwt, payload.team_id, {
          date: nextOccurrence,
          time: startTime,
          location: "RISE Basketball Facility",
          isRecurring: true
        })
      }
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to create recurring practices")
    }
  }
)

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

export const { clearPractices, addPractice } = practicesSlice.actions
export default practicesSlice.reducer
