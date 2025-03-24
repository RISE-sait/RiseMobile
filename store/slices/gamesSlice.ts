import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { API_URL } from "@/utils/api"
import dayjs from "dayjs"
import type { CalendarItem } from "./eventsSlice"

interface GamesState {
  items: CalendarItem[]
  byDate: Record<string, CalendarItem[]>
  byId: Record<string, CalendarItem>
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  lastFetched: string | null
}

// Initial state
const initialState: GamesState = {
  items: [],
  byDate: {},
  byId: {},
  status: "idle",
  error: null,
  lastFetched: null,
}

// Helper function to extract title
const extractTitle = (game: any): string => {
  if (game.title) return game.title
  if (game.name) return game.name
  if (game.match_name) return game.match_name
  if (game.game_name) return game.game_name
  if (game.home_team && game.away_team) return `${game.home_team} vs ${game.away_team}`
  return "Game"
}

// Async thunk to fetch games
export const fetchGames = createAsyncThunk("games/fetchGames", async (token: string, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/games`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const games: CalendarItem[] = []
    const byDate: Record<string, CalendarItem[]> = {}
    const byId: Record<string, CalendarItem> = {}

    if (response.data && Array.isArray(response.data)) {
      response.data.forEach((game: any, index: number) => {
        // Create a date for the game
        const gameDate =
          game.date ||
          dayjs()
            .add(index % 30, "day")
            .format("YYYY-MM-DD")
        const title = extractTitle(game)

        const calendarItem: CalendarItem = {
          id: game.id || `game-${Math.random().toString(36).substr(2, 9)}`,
          title: title,
          date: gameDate,
          time: game.time || "7:00 PM",
          type: "match",
          location: game.location || game.venue || "RISE Basketball Court",
          description: game.description || `${title} at ${game.location || "RISE Basketball Court"}`,
        }

        games.push(calendarItem)
        byId[calendarItem.id] = calendarItem

        if (!byDate[gameDate]) {
          byDate[gameDate] = []
        }
        byDate[gameDate].push(calendarItem)
      })
    }

    return {
      items: games,
      byDate,
      byId,
      lastFetched: new Date().toISOString(),
    }
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch games")
  }
})

// Async thunk to fetch a single game by ID
export const fetchGameById = createAsyncThunk(
  "games/fetchGameById",
  async ({ id, token }: { id: string; token: string }, { rejectWithValue }) => {
    try {
      // Check if ID is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        return rejectWithValue("Invalid game ID format")
      }

      const response = await axios.get(`${API_URL}/games/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const game = response.data
      const title = extractTitle(game)

      const calendarItem: CalendarItem = {
        id: game.id,
        title: title,
        date: game.date || dayjs().format("YYYY-MM-DD"),
        time: game.time || "7:00 PM",
        type: "match",
        location: game.location || game.venue || "RISE Basketball Court",
        description: game.description || `${title} at ${game.location || "RISE Basketball Court"}`,
      }

      return calendarItem
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch game")
    }
  },
)

// Create slice
const gamesSlice = createSlice({
  name: "games",
  initialState,
  reducers: {
    clearGames: (state) => {
      state.items = []
      state.byDate = {}
      state.byId = {}
      state.status = "idle"
      state.error = null
      state.lastFetched = null
    },
    addGame: (state, action: PayloadAction<CalendarItem>) => {
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
      .addCase(fetchGames.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.items
        state.byDate = action.payload.byDate
        state.byId = action.payload.byId
        state.lastFetched = action.payload.lastFetched
        state.error = null
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
      .addCase(fetchGameById.fulfilled, (state, action) => {
        // Add or update the game in our collections
        const game = action.payload

        // Update byId
        state.byId[game.id] = game

        // Check if we need to add to items
        const existingIndex = state.items.findIndex((item) => item.id === game.id)
        if (existingIndex >= 0) {
          state.items[existingIndex] = game
        } else {
          state.items.push(game)
        }

        // Update byDate
        const date = game.date
        if (!state.byDate[date]) {
          state.byDate[date] = []
        }

        const dateIndex = state.byDate[date].findIndex((item) => item.id === game.id)
        if (dateIndex >= 0) {
          state.byDate[date][dateIndex] = game
        } else {
          state.byDate[date].push(game)
        }
      })
  },
})

// Export actions and reducer
export const { clearGames, addGame } = gamesSlice.actions
export default gamesSlice.reducer

