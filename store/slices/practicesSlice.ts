import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { API_URL } from "@/utils/api"
import dayjs from "dayjs"
import { auth } from "@/firebase/firebaseConfig"
import type { CalendarItem, PracticesState } from "@/types"
import type { CreatePracticePayload } from "@/types/practice"

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

      const response = await axios.get(`${API_URL}/secure/events?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log("🧪 Practices from secure events endpoint:", response.data)




      const items: CalendarItem[] = []
      const byDate: Record<string, CalendarItem[]> = {}
      const byId: Record<string, CalendarItem> = {}

      for (const event of response.data)  {
        const startDate = dayjs(event.start_at).format("YYYY-MM-DD")
        const time = dayjs(event.start_at).format("HH:mm")

        const item: CalendarItem = {
          id: event.id,
          title: event.program?.name || "Practice",
          date: startDate,
          time,
          type: "practice",
          location: event.location?.name || "RISE Basketball Facility",
          description: `${event.program?.name || "Practice"} at ${event.location?.name || "RISE Basketball Facility"}`,
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
      const firebaseUser = auth.currentUser
      if (!firebaseUser) throw new Error("No user is logged in.")

      const firebaseToken = await firebaseUser.getIdToken(true)
      const jwtResponse = await fetch(`${API_URL}/auth`, {
        method: "POST",
        headers: { Authorization: `Bearer ${firebaseToken}` },
        body: JSON.stringify({ email: firebaseUser.email }),
      })

      const jwt = jwtResponse.headers.get("authorization")?.replace("Bearer ", "")
      if (!jwt) throw new Error("Could not retrieve backend JWT")

      const response = await axios.post(
        `${API_URL}/events/one-time`,
        payload, 
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )

      const item: CalendarItem = {
        id: response.data.id, // no fallback
        title: "Practice", // fallback title
        date: dayjs(payload.start_time).format("YYYY-MM-DD"),
        time: dayjs(payload.start_time).format("HH:mm"),
        type: "practice",
        location: "RISE Basketball Facility",
        description: `Practice at RISE Basketball Facility`,
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
    day: string
    event_start_at: string
    event_end_at: string
    location_id: string
    team_id: string
    recurrence_start_at: string
    recurrence_end_at: string
  },
  { rejectValue: string }
>(
  "practices/createRecurringPractice",
  async (payload, { rejectWithValue }) => {
    try {
      const firebaseUser = auth.currentUser
      if (!firebaseUser) throw new Error("No user is logged in.")

      const firebaseToken = await firebaseUser.getIdToken(true)
      const jwtResponse = await fetch(`${API_URL}/auth`, {
        method: "POST",
        headers: { Authorization: `Bearer ${firebaseToken}` },
        body: JSON.stringify({ email: firebaseUser.email }),
      })

      const jwt = jwtResponse.headers.get("authorization")?.replace("Bearer ", "")
      if (!jwt) throw new Error("Could not retrieve backend JWT")

      await axios.post(
        `${API_URL}/events/recurring`,
        {
          day: payload.day,
          practice_start_at: payload.event_start_at,
          practice_end_at: payload.event_end_at,
          location_id: payload.location_id,
          team_id: payload.team_id,
          recurrence_start_at: payload.recurrence_start_at,
          recurrence_end_at: payload.recurrence_end_at,
          court_id: "default",
          status: "scheduled",
        },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )
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
