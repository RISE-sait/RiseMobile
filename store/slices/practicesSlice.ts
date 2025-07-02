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
  async (
    {
      token,
      after,
      before,
      teamId,
      locationId,
    }: {
      token: string;
      after: string;
      before: string;
      teamId?: string;
      locationId?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams({
        after,
        before,
        program_type: "practice",
        response_type: "date",
      });
      if (teamId) params.append("team_id", teamId);
      if (locationId) params.append("location_id", locationId);

      const response = await axios.get(`${API_URL}/events?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items: CalendarItem[] = [];
      const byDate: Record<string, CalendarItem[]> = {};
      const byId: Record<string, CalendarItem> = {};

      for (const event of response.data) {
        const startDate = dayjs(event.start_at).format("YYYY-MM-DD");
        const time = dayjs(event.start_at).format("HH:mm");

        const item: CalendarItem = {
          id: event.id,
          title: event.program?.name || "Practice",
          date: startDate,
          time,
          type: "practice",
          location: event.location?.name || "RISE Basketball Facility",
          description: `${event.program?.name || "Practice"} at ${event.location?.name || "RISE Basketball Facility"}`,
        };

        items.push(item);
        byId[item.id] = item;
        if (!byDate[startDate]) byDate[startDate] = [];
        byDate[startDate].push(item);
      }

      return {
        items,
        byDate,
        byId,
        lastFetched: new Date().toISOString(),
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch practices");
    }
  }
);


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

