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

// Fetch upcoming matches for Matches tab
export const fetchMatches = createAsyncThunk("games/fetchMatches", async (token: string, { rejectWithValue, getState }) => {
  try {
    console.log("Fetching secure games with token:", token.substring(0, 10) + "...")

    // Get current date for filtering future matches
    const currentDate = dayjs().format('YYYY-MM-DD')

    // Use secure events endpoint with after parameter for future matches only
    // Backend filters by user role, frontend filters for game/match types
    const response = await axios.get(`${API_URL}/secure/events`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        after: currentDate // Get events after current date
      }
    })

    console.log("Secure events API response:", response.data)

    const events = Array.isArray(response.data) ? response.data : []
    
    // Filter for competitive events (games, matches, tournaments)
    const gameEvents = events.filter((event: any) => {
      const programType = event.program?.type?.toLowerCase()
      const relevantTypes = ['tournament', 'game', 'match', 'competition', 'tryouts']
      return relevantTypes.some(type => programType?.includes(type))
    })
    
    const matches: Match[] = gameEvents.map((game: any) => {
      let date = dayjs().format("YYYY-MM-DD")
      let time = "TBD"

      // Use start_at from game, fall back to created_at
      const dateSource = game.start_at || game.created_at
      if (dateSource) {
        const dateObj = dayjs(dateSource)
        if (dateObj.isValid()) {
          date = dateObj.format("YYYY-MM-DD")
          time = dateObj.format("h:mm A")
        }
      }

      return {
        id: game.id || `game-${Math.random().toString(36).substr(2, 9)}`,
        name: game.program?.name || game.name || "Event",
        title: game.program?.name || game.name || "Event",
        date,
        time,
        location: game.location?.name || "RISE Basketball Facility",
        description: game.program?.description || game.description || "",
        // For games, these fields might not exist, so we'll leave them undefined
        win_team: undefined,
        lose_team: undefined,
        win_score: undefined,
        lose_score: undefined,
        created_at: dateSource,
        updated_at: game.updated_at,
        // Add game-specific fields
        program_type: game.program?.type,
        location_address: game.location?.address,
        start_at: game.start_at,
        end_at: game.end_at,
        capacity: game.capacity
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

    console.log(`Processed ${matches.length} matches from ${gameEvents.length} game events (${events.length} total events)`)
    return { items: matches, byDate }
  } catch (error: any) {
    console.error("Games API error:", error.response?.data || error.message)
    return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch games")
  }
})

// Fetch match history for Match History tab  
export const fetchMatchHistory = createAsyncThunk("games/fetchMatchHistory", async (token: string, { rejectWithValue }) => {
  try {
    console.log("Fetching match history with token:", token.substring(0, 10) + "...")

    // Get current date for filtering past matches
    const currentDate = dayjs().format('YYYY-MM-DD')

    // Use secure events endpoint with before parameter for historical matches
    // Backend filters by user role, frontend filters for game/match types
    const response = await axios.get(`${API_URL}/secure/events`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        before: currentDate // Get events before current date
      }
    })

    console.log("Match history API response:", response.data)

    const events = Array.isArray(response.data) ? response.data : []
    
    // Filter for competitive events (games, matches, tournaments) 
    const gameEvents = events.filter((event: any) => {
      const programType = event.program?.type?.toLowerCase()
      const relevantTypes = ['tournament', 'game', 'match', 'competition']
      return relevantTypes.some(type => programType?.includes(type))
    })
    
    const matches: Match[] = gameEvents.map((game: any) => {
      let date = dayjs().format("YYYY-MM-DD")
      let time = "TBD"

      const dateSource = game.start_at || game.created_at
      if (dateSource) {
        const dateObj = dayjs(dateSource)
        if (dateObj.isValid()) {
          date = dateObj.format("YYYY-MM-DD")
          time = dateObj.format("h:mm A")
        }
      }

      return {
        id: game.id || `game-${Math.random().toString(36).substr(2, 9)}`,
        name: game.program?.name || game.name || "Match",
        title: game.program?.name || game.name || "Match",
        date,
        time,
        location: game.location?.name || "RISE Basketball Facility",
        description: game.program?.description || game.description || "",
        win_team: undefined, // Historical matches might have this data
        lose_team: undefined,
        win_score: undefined,
        lose_score: undefined,
        created_at: dateSource,
        updated_at: game.updated_at,
        program_type: game.program?.type,
        location_address: game.location?.address,
        start_at: game.start_at,
        end_at: game.end_at,
        capacity: game.capacity
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

    console.log(`Processed ${matches.length} historical matches from ${games.length} total games`)
    return { items: matches, byDate }
  } catch (error: any) {
    console.error("Match history API error:", error.response?.data || error.message)
    return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch match history")
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
      // Handle match history actions
      .addCase(fetchMatchHistory.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchMatchHistory.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.items
        state.byDate = action.payload.byDate
        state.error = null
      })
      .addCase(fetchMatchHistory.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
  },
})

export const { clearMatches } = gamesSlice.actions
export default gamesSlice.reducer

// Selectors
export const selectAllMatches = (state: RootState) => state.games.items
export const selectMatchesByDate = (state: RootState, date: string) => state.games.byDate[date] || []
export const selectMatchesStatus = (state: RootState) => state.games.status
export const selectMatchesError = (state: RootState) => state.games.error

// Note: fetchMatches and fetchMatchHistory are already exported above in the async thunk definitions
