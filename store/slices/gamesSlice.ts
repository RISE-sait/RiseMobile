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
    console.log("🎯 DEBUG: Fetching upcoming games with token:", token ? token.substring(0, 20) + "..." : "NO TOKEN")
    console.log("🎯 DEBUG: Token length:", token ? token.length : 0)

    // Use /games endpoint with backend filter for upcoming matches
    // Conner added filter parameter: "upcoming" | "past"
    const response = await axios.get(`${API_URL}/games`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        filter: "upcoming" // Backend filter for future matches
      }
    })

    console.log("🎯 DEBUG: Games API response status:", response.status)
    console.log("🎯 DEBUG: Games API response data:", response.data)
    console.log("🎯 DEBUG: Games API response data type:", typeof response.data, Array.isArray(response.data) ? "array" : "not array")

    const games = Array.isArray(response.data) ? response.data : []
    
    // Games endpoint returns game data directly
    console.log("🎯 DEBUG: Current time:", dayjs().format("YYYY-MM-DD HH:mm:ss"))
    
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
        away_score: game.away_score
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

    console.log(`🎯 DEBUG: Processed ${matches.length} matches from ${games.length} total games`)
    matches.forEach((match, index) => {
      console.log(`🎯 DEBUG: Match ${index + 1}: ${match.name} on ${match.date} at ${match.time}`)
    })
    return { items: matches, byDate }
  } catch (error: any) {
    console.error("Games API error:", error.response?.data || error.message)
    return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch games")
  }
})

// Fetch match history for Match History tab  
export const fetchMatchHistory = createAsyncThunk("games/fetchMatchHistory", async (token: string, { rejectWithValue }) => {
  try {
    console.log("🎯 DEBUG: Fetching match history with token:", token ? token.substring(0, 20) + "..." : "NO TOKEN")

    // Use /games endpoint with backend filter for past matches
    // Conner added filter parameter: "upcoming" | "past"
    const response = await axios.get(`${API_URL}/games`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        filter: "past" // Backend filter for historical matches
      }
    })

    console.log("🎯 DEBUG: Match history API response status:", response.status)
    console.log("🎯 DEBUG: Match history API response data:", response.data)

    const games = Array.isArray(response.data) ? response.data : []
    
    // No need for frontend filtering - backend already returns only past games
    const pastGames = games
    
    const matches: Match[] = pastGames.map((game: any) => {
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
        away_score: game.away_score
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

    console.log(`Processed ${matches.length} historical matches from ${pastGames.length} past games (${games.length} total games)`)
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
