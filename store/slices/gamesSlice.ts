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

    // Use /games endpoint to fetch all matches for the user
    // The hardcoded "upcoming" filter is removed to ensure data is always displayed
    const response = await axios.get(`${API_URL}/games`, {
      headers: { Authorization: `Bearer ${token}` }
    })


    const games = Array.isArray(response.data) ? response.data : []
    
    // Games endpoint returns game data directly
    
    const matches: Match[] = games.map((game: any) => {
      let date = dayjs().format("YYYY-MM-DD")
      let time = "TBD"

      // Use start_time from game, fall back to created_at
      const dateSource = game.start_time || game.created_at
      if (dateSource) {
        const dateObj = dayjs(dateSource)
        if (dateObj.isValid()) {
          date = dateObj.format("YYYY-MM-DD")
          time = dateObj.format("h:mm A")
        }
      }

      return {
        id: game.id || `game-${Math.random().toString(36).substr(2, 9)}`,
        name: `${game.home_team_name || 'Team 1'} vs ${game.away_team_name || 'Team 2'}`,
        title: `${game.home_team_name || 'Team 1'} vs ${game.away_team_name || 'Team 2'}`,
        date,
        time,
        location: game.location_name || "RISE Basketball Facility",
        description: game.description || `Game scheduled for ${date}`,
        // Games may have score fields
        win_team: game.winner_team,
        lose_team: game.loser_team,
        win_score: game.winner_score,
        lose_score: game.loser_score,
        created_at: dateSource,
        updated_at: game.updated_at,
        // Add game-specific fields
        program_type: game.program?.type,
        location_address: game.location?.address,
        start_at: game.start_at,
        end_at: game.end_at,
        capacity: game.capacity,
        // Store original team names from API for proper team name display
        home_team_name: game.home_team_name,
        away_team_name: game.away_team_name,
        home_team_logo_url: game.home_team_logo_url,
        away_team_logo_url: game.away_team_logo_url,
        home_score: game.home_score,
        away_score: game.away_score,
        status: game.status, // Use backend status directly - no client-side mapping
        // Preserve original IDs for edit functionality
        home_team_id: game.home_team_id,
        away_team_id: game.away_team_id,
        location_id: game.location_id,
        start_time: game.start_time
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

// Fetch match history for Match History tab  
export const fetchMatchHistory = createAsyncThunk("games/fetchMatchHistory", async (params: { token: string; filter?: string }, { rejectWithValue }) => {
  try {
    const { token, filter } = params;

    // Use /secure/games endpoint with backend filtering for real-time results
    // This ensures frontend matches backend logic exactly
    const url = filter && filter !== 'all' 
      ? `${API_URL}/secure/games?filter=${filter}`
      : `${API_URL}/secure/games`;
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })


    const games = Array.isArray(response.data) ? response.data : []
    
    // Use backend filtering results directly - no client-side filtering needed
    // Backend filter parameter determines which games are returned
    
    const matches: Match[] = games.map((game: any) => {
      let date = dayjs().format("YYYY-MM-DD")
      let time = "TBD"

      const dateSource = game.start_time || game.created_at
      if (dateSource) {
        const dateObj = dayjs(dateSource)
        if (dateObj.isValid()) {
          date = dateObj.format("YYYY-MM-DD")
          time = dateObj.format("h:mm A")
        }
      }

      return {
        id: game.id || `game-${Math.random().toString(36).substr(2, 9)}`,
        name: `${game.home_team_name || 'Team 1'} vs ${game.away_team_name || 'Team 2'}`,
        title: `${game.home_team_name || 'Team 1'} vs ${game.away_team_name || 'Team 2'}`,
        date,
        time,
        location: game.location_name || "RISE Basketball Facility",
        description: game.description || `Match scheduled for ${date}`,
        // Games may have score fields
        win_team: game.winner_team,
        lose_team: game.loser_team,
        win_score: game.winner_score,
        lose_score: game.loser_score,
        created_at: dateSource,
        updated_at: game.updated_at,
        // Add game-specific fields
        program_type: game.program?.type,
        location_address: game.location?.address,
        start_at: game.start_at,
        end_at: game.end_at,
        capacity: game.capacity,
        // Store original team names from API for proper team name display
        home_team_name: game.home_team_name,
        away_team_name: game.away_team_name,
        home_team_logo_url: game.home_team_logo_url,
        away_team_logo_url: game.away_team_logo_url,
        home_score: game.home_score,
        away_score: game.away_score,
        status: game.status, // Use backend status directly - no client-side mapping
        // Preserve original IDs for edit functionality
        home_team_id: game.home_team_id,
        away_team_id: game.away_team_id,
        location_id: game.location_id,
        start_time: game.start_time
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
export const selectMatchById = (state: RootState, matchId: string) =>
  state.games.items.find((match) => match.id === matchId) || null

// Note: fetchMatches and fetchMatchHistory are already exported above in the async thunk definitions
