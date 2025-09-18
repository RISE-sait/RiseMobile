import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit"
import axios from "axios"
import { API_URL } from "@/utils/api"
import type { RootState } from "@/store"
import type { Team, TeamsState } from "@/types"


const initialState: TeamsState = {
  entities: {},
  ids: [],
  loading: "idle",
  error: null,
  lastFetched: null,
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

export const fetchTeams = createAsyncThunk("teams/fetchTeams", async (token: string, { rejectWithValue, getState }) => {
  const state = getState() as RootState
  const { lastFetched } = state.teams

  // If data was fetched recently, don't fetch again
  if (lastFetched && Date.now() - lastFetched < CACHE_DURATION) {
    return null // Skip fetching, use cached data
  }

  try {
    let retries = 3
    let teamsData = null

    while (retries > 0 && !teamsData) {
      try {
        const response = await axios.get(`${API_URL}/secure/teams`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data && Array.isArray(response.data)) {
          teamsData = response.data
          break
        }
      } catch (err) {
        retries--
        if (retries === 0) throw err
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, (3 - retries) * 1000))
      }
    }

    if (!teamsData) {
      return rejectWithValue("Invalid response format from teams API")
    }

    return teamsData
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
    return rejectWithValue("An unknown error occurred")
  }
})

export const selectTeamsForCoach = (state: RootState, coachId: string) =>
  selectAllTeams(state).filter((team) => team.coach?.id === coachId)


// Fetch a single team by ID
export const fetchTeamById = createAsyncThunk(
  "teams/fetchTeamById",
  async ({ id, token }: { id: string; token: string }, { rejectWithValue, getState }) => {
    const state = getState() as RootState

    // Check if we already have this team in the store
    if (state.teams.entities[id]) {
      return null // Skip fetching, use cached data
    }

    try {
      const response = await axios.get(`${API_URL}/teams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.data) {
        return rejectWithValue("Invalid response format from teams API")
      }

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.message)
      }
      return rejectWithValue("An unknown error occurred")
    }
  },
)

const teamsSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    clearTeamsCache(state) {
      state.lastFetched = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        if (state.loading === "idle" || state.loading === "failed") {
          state.loading = "pending"
          state.error = null
        }
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = "succeeded"

        // If null is returned, it means we're using cached data
        if (action.payload === null) {
          return
        }

        // Normalize teams data
        const teams = action.payload as Team[]
        const entities: Record<string, Team> = {}
        const ids: string[] = []

        teams.forEach((team) => {
          entities[team.id] = team
          ids.push(team.id)
        })

        state.entities = entities
        state.ids = ids
        state.lastFetched = Date.now()
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = "failed"
        state.error = (action.payload as string) || "Failed to fetch teams"
      })
      .addCase(fetchTeamById.fulfilled, (state, action) => {
        // If null is returned, it means we're using cached data
        if (action.payload === null) {
          return
        }

        const team = action.payload as Team

        // Add the team to our entities
        state.entities[team.id] = team

        // Add to ids array if not already there
        if (!state.ids.includes(team.id)) {
          state.ids.push(team.id)
        }
      })
  },
})

// Base selectors
const selectTeamsState = (state: RootState) => state.teams
const selectTeamsIds = createSelector([selectTeamsState], (teams) => teams.ids)
const selectTeamsEntities = createSelector([selectTeamsState], (teams) => teams.entities)

// Memoized selectors
export const selectAllTeams = createSelector(
  [selectTeamsIds, selectTeamsEntities],
  (ids, entities) => ids.map((id) => entities[id])
)

export const selectTeamById = (state: RootState, teamId: string | undefined) =>
  teamId ? state.teams.entities[teamId] : undefined

export const selectTeamsLoading = (state: RootState) => state.teams.loading
export const selectTeamsError = (state: RootState) => state.teams.error

export const { clearTeamsCache } = teamsSlice.actions

export default teamsSlice.reducer

