import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { API_URL } from "@/utils/api"
import dayjs from "dayjs"

// Define types
export interface Match {
  id: string
  name: string
  description?: string
  win_team?: string
  lose_team?: string
  win_score?: number
  lose_score?: number
  created_at?: string
  updated_at?: string
  // Add any other fields that might be in the API response
}

interface MatchesState {
  items: Match[]
  byDate: Record<string, Match[]>
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

// Initial state
const initialState: MatchesState = {
  items: [],
  byDate: {},
  status: "idle",
  error: null,
}

// Async thunk to fetch matches from the games endpoint
export const fetchMatches = createAsyncThunk("matches/fetchMatches", async (token: string, { rejectWithValue }) => {
  try {
    console.log("Fetching games with token:", token.substring(0, 10) + "...")

    const response = await axios.get(`${API_URL}/games`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    console.log("Games API response:", response.data)

    // Process the games to organize by date and convert to Match format
    const games = response.data
    const matches: Match[] = games.map((game: any) => ({
      id: game.id,
      name: game.name || "Game",
      description: game.description,
      win_team: game.win_team,
      lose_team: game.lose_team,
      win_score: game.win_score,
      lose_score: game.lose_score,
      created_at: game.created_at,
      updated_at: game.updated_at,
    }))

    const byDate: Record<string, Match[]> = {}

    matches.forEach((match: Match) => {
      if (match.created_at) {
        // Parse the date string correctly
        const dateObj = dayjs(match.created_at)
        if (dateObj.isValid()) {
          const dateStr = dateObj.format("YYYY-MM-DD")

          if (!byDate[dateStr]) {
            byDate[dateStr] = []
          }

          byDate[dateStr].push(match)
        }
      }
    })

    return { items: matches, byDate }
  } catch (error: any) {
    console.error("Games API error:", error.response?.data || error.message)
    return rejectWithValue(error.message || "Failed to fetch games")
  }
})

// Create slice
const matchesSlice = createSlice({
  name: "matches",
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

// Export actions and reducer
export const { clearMatches } = matchesSlice.actions
export default matchesSlice.reducer
