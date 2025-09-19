import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { API_URL } from '@/utils/api'
import axios from 'axios'

export interface Court {
  id: string
  name: string
  location_id: string
  location_name?: string
  status: 'available' | 'in_use' | 'maintenance' | 'reserved'
  current_event?: {
    id: string
    title: string
    start_time: string
    end_time: string
    type: 'practice' | 'game' | 'event'
  }
}

interface CourtsState {
  courts: Court[]
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: CourtsState = {
  courts: [],
  loading: 'idle',
  error: null,
}

// Fetch all courts with their current status (optimized)
export const fetchCourts = createAsyncThunk(
  'courts/fetchCourts',
  async (token: string, { rejectWithValue }) => {
    try {
      // Batch all API calls in parallel instead of sequential per-court calls
      const [courtsResponse, allPracticesResponse, allGamesResponse] = await Promise.all([
        axios.get(`${API_URL}/courts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/practices?status=in_progress`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })), // Fallback to empty array if fails
        axios.get(`${API_URL}/games?status=in_progress`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })), // Fallback to empty array if fails
      ])

      const courts = courtsResponse.data
      const activePractices = allPracticesResponse.data || []
      const activeGames = allGamesResponse.data || []

      // Helper function to check if an event is currently happening
      const isEventHappeningNow = (startTime: string, endTime: string): boolean => {
        const now = new Date()
        const start = new Date(startTime)
        const end = new Date(endTime)
        return now >= start && now <= end
      }

      // Process courts with status checking (much faster - no additional API calls)
      const courtsWithStatus = courts.map((court: any) => {
        let status: Court['status'] = 'available'
        let currentEvent: Court['current_event'] | undefined

        // Check if there's an active practice on this court that's happening RIGHT NOW
        const courtPractice = activePractices.find((p: any) =>
          p.court_id === court.id &&
          isEventHappeningNow(p.start_time, p.end_time)
        )
        if (courtPractice) {
          status = 'in_use'
          currentEvent = {
            id: courtPractice.id,
            title: `${courtPractice.team_name || 'Team'} Practice`,
            start_time: courtPractice.start_time,
            end_time: courtPractice.end_time,
            type: 'practice'
          }
        }
        // Check if there's an active game on this court that's happening RIGHT NOW
        else {
          const courtGame = activeGames.find((g: any) =>
            g.court_id === court.id &&
            isEventHappeningNow(g.start_time, g.end_time)
          )
          if (courtGame) {
            status = 'in_use'
            currentEvent = {
              id: courtGame.id,
              title: `${courtGame.home_team_name || 'Team'} vs ${courtGame.away_team_name || 'Team'}`,
              start_time: courtGame.start_time,
              end_time: courtGame.end_time,
              type: 'game'
            }
          }
        }

        return {
          id: court.id,
          name: court.name,
          location_id: court.location_id,
          location_name: court.location_name,
          status,
          current_event: currentEvent,
        } as Court
      })

      return courtsWithStatus
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.message)
      }
      return rejectWithValue('An unknown error occurred')
    }
  }
)

const courtsSlice = createSlice({
  name: 'courts',
  initialState,
  reducers: {
    clearCourts: (state) => {
      state.courts = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourts.pending, (state) => {
        state.loading = 'pending'
        state.error = null
      })
      .addCase(fetchCourts.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        state.courts = action.payload
      })
      .addCase(fetchCourts.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload as string
      })
  },
})

export const { clearCourts } = courtsSlice.actions

// Selectors
export const selectAllCourts = (state: any) => state.courts.courts
export const selectCourtsLoading = (state: any) => state.courts.loading
export const selectCourtsError = (state: any) => state.courts.error
export const selectAvailableCourts = (state: any) =>
  state.courts.courts.filter((court: Court) => court.status === 'available')
export const selectCourtsInUse = (state: any) =>
  state.courts.courts.filter((court: Court) => court.status === 'in_use')

export default courtsSlice.reducer