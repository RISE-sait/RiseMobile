import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { API_URL } from "@/utils/api"
import dayjs from "dayjs"

// Define the Match type based on the actual API response
export interface Match {
  id: string
  name?: string
  description?: string
  win_team?: string
  lose_team?: string
  win_score?: number
  lose_score?: number
  created_at?: string
  updated_at?: string
  status?: "Upcoming" | "Finished" | "Live"
}

interface MatchesState {
  items: Match[]
  byDate: Record<string, Match[]>
  byId: Record<string, Match>
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  lastFetched: string | null
}

const initialState: MatchesState = {
  items: [],
  byDate: {},
  byId: {},
  status: "idle",
  error: null,
  lastFetched: null,
}

// Async thunk to fetch matches
export const fetchMatches = createAsyncThunk("matches/fetchMatches", async (token: string, { rejectWithValue }) => {
  try {
    console.log("Fetching matches from API...")

    const response = await axios.get(`${API_URL}/games`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    console.log("API response:", response.data)

    const matches: Match[] = []
    const byDate: Record<string, Match[]> = {}
    const byId: Record<string, Match> = {}

    if (response.data && Array.isArray(response.data)) {
      response.data.forEach((game: any) => {
        // Use the API data directly
        const match: Match = {
          id: game.id,
          name: game.name,
          description: game.description,
          win_team: game.win_team,
          lose_team: game.lose_team,
          win_score: game.win_score,
          lose_score: game.lose_score,
          created_at: game.created_at,
          updated_at: game.updated_at,
          // Default status based on your business logic
          status: "Finished", // You can determine this based on dates or other factors
        }

        // Add to collections
        matches.push(match)
        byId[match.id] = match

        // Organize by date (using created_at if available)
        const matchDate = game.created_at ? dayjs(game.created_at).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")

        if (!byDate[matchDate]) {
          byDate[matchDate] = []
        }
        byDate[matchDate].push(match)
      })
    }

    return {
      items: matches,
      byDate,
      byId,
      lastFetched: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error("Error fetching matches:", error)
    return rejectWithValue(error.message || "Failed to fetch matches")
  }
})

// Async thunk to fetch a single match by ID
export const fetchMatchById = createAsyncThunk(
  "matches/fetchMatchById",
  async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/games/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const game = response.data

      // Use the API data directly
      const match: Match = {
        id: game.id,
        name: game.name,
        description: game.description,
        win_team: game.win_team,
        lose_team: game.lose_team,
        win_score: game.win_score,
        lose_score: game.lose_score,
        created_at: game.created_at,
        updated_at: game.updated_at,
        status: "Finished", // Default status
      }

      return match
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch match")
    }
  },
)

// Create slice
const matchesSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {
    clearMatches: (state) => {
      state.items = []
      state.byDate = {}
      state.byId = {}
      state.status = "idle"
      state.error = null
      state.lastFetched = null
    },
    addMatch: (state, action: PayloadAction<Match>) => {
      state.items.push(action.payload)
      state.byId[action.payload.id] = action.payload

      // Organize by date (using created_at if available)
      const matchDate = action.payload.created_at
        ? dayjs(action.payload.created_at).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD")

      if (!state.byDate[matchDate]) {
        state.byDate[matchDate] = []
      }
      state.byDate[matchDate].push(action.payload)
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
        state.byId = action.payload.byId
        state.lastFetched = action.payload.lastFetched
        state.error = null
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      .addCase(fetchMatchById.fulfilled, (state, action) => {
        // Add or update the match in our collections
        const match = action.payload

        // Update byId
        state.byId[match.id] = match

        // Check if we need to add to items
        const existingIndex = state.items.findIndex((item) => item.id === match.id)
        if (existingIndex >= 0) {
          state.items[existingIndex] = match
        } else {
          state.items.push(match)
        }

        // Update byDate
        const matchDate = match.created_at ? dayjs(match.created_at).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")

        if (!state.byDate[matchDate]) {
          state.byDate[matchDate] = []
        }

        const dateIndex = state.byDate[matchDate].findIndex((item) => item.id === match.id)
        if (dateIndex >= 0) {
          state.byDate[matchDate][dateIndex] = match
        } else {
          state.byDate[matchDate].push(match)
        }
      })
  },
})

// Export actions and reducer
export const { clearMatches, addMatch } = matchesSlice.actions
export default matchesSlice.reducer
