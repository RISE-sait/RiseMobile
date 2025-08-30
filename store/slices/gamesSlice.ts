import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { API_URL } from "@/utils/api"
import dayjs from "dayjs"
import type { RootState } from "@/store"
import type { Match, GamesState } from "@/types"

const initialState: GamesState = {
  items: [],
  byDate: {},
  status: "idle",
  error: null,
}

export const fetchMatches = createAsyncThunk("games/fetchMatches", async (token: string, { rejectWithValue }) => {
  try {
    console.log("Fetching events with token:", token.substring(0, 10) + "...")

    const response = await axios.get(`${API_URL}/events?after=2024-01-01&before=2026-01-01`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    console.log("Events API response:", response.data)

    const events = Array.isArray(response.data) ? response.data : []
    const matches: Match[] = events.map((event: any) => {
      let date = dayjs().format("YYYY-MM-DD")
      let time = "TBD"

      // Use start_at if available, otherwise fall back to created_at
      const dateSource = event.start_at || event.created_at
      if (dateSource) {
        const dateObj = dayjs(dateSource)
        if (dateObj.isValid()) {
          date = dateObj.format("YYYY-MM-DD")
          time = dateObj.format("h:mm A")
        }
      }

      return {
        id: event.id || `event-${Math.random().toString(36).substr(2, 9)}`,
        name: event.program?.name || event.name || "Event",
        title: event.program?.name || event.name || "Event",
        date,
        time,
        location: event.location?.name || "RISE Basketball Facility",
        description: event.description || "",
        win_team: event.win_team,
        lose_team: event.lose_team,
        win_score: event.win_score,
        lose_score: event.lose_score,
        created_at: dateSource,
        updated_at: event.updated_at,
      }
    })

    const byDate: Record<string, Match[]> = {}
    matches.forEach((match) => {
      if (match.date) {
        if (!byDate[match.date]) {
          byDate[match.date] = []
        }
        byDate[match.date].push(match)
      }
    })

    return { items: matches, byDate }
  } catch (error: any) {
    console.error("Games API error:", error.response?.data || error.message)
    return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch games")
  }
})

const gamesSlice = createSlice({
  name: "games",
  initialState,
  reducers: {
    clearMatches: (state) => {
      state.items = []
      state.byDate = {}
      state.status = "idle"
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.items
        state.byDate = action.payload.byDate
        state.error = null
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
  },
})

export const { clearMatches } = gamesSlice.actions
export default gamesSlice.reducer

export const selectAllMatches = (state: RootState) => state.games.items
export const selectMatchesByDate = (state: RootState, date: string) => state.games.byDate[date] || []
export const selectMatchesStatus = (state: RootState) => state.games.status
export const selectMatchesError = (state: RootState) => state.games.error
