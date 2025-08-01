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
    console.log("Fetching games with token:", token.substring(0, 10) + "...")

    const response = await axios.get(`${API_URL}/games`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    console.log("Games API response:", response.data)

    const games = Array.isArray(response.data) ? response.data : []
    const matches: Match[] = games.map((game: any) => {
      let date = dayjs().format("YYYY-MM-DD")
      let time = "TBD"

      if (game.created_at) {
        const dateObj = dayjs(game.created_at)
        if (dateObj.isValid()) {
          date = dateObj.format("YYYY-MM-DD")
          time = dateObj.format("h:mm A")
        }
      }

      return {
        id: game.id || `game-${Math.random().toString(36).substr(2, 9)}`,
        name: game.name || "Game",
        title: game.name || "Game",
        date,
        time,
        location: game.location?.name || "RISE Basketball Facility",
        description: game.description || "",
        win_team: game.win_team,
        lose_team: game.lose_team,
        win_score: game.win_score,
        lose_score: game.lose_score,
        created_at: game.created_at,
        updated_at: game.updated_at,
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
