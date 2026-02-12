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

// Helper function to check if an event is currently happening
const isEventHappeningNow = (startTime: string, endTime: string): boolean => {
  const now = new Date()
  const start = new Date(startTime)
  const end = new Date(endTime)
  return now >= start && now <= end
}

// Type for active events grouped by court_id
interface ActiveEvent {
  id: string
  title: string
  start_time: string
  end_time: string
  type: 'practice' | 'game' | 'event'
}

// Build a Map of court_id -> active event for O(1) lookups
const buildActiveEventsMap = (
  practices: any[],
  games: any[],
  events: any[]
): Map<string, ActiveEvent> => {
  const activeEventsMap = new Map<string, ActiveEvent>()

  // Process practices - O(n) single pass
  for (const p of practices) {
    if (p.court_id && p.start_time && p.end_time && isEventHappeningNow(p.start_time, p.end_time)) {
      // Only set if not already set (first match wins - practices have priority)
      if (!activeEventsMap.has(p.court_id)) {
        activeEventsMap.set(p.court_id, {
          id: p.id,
          title: `${p.team_name || 'Team'} Practice`,
          start_time: p.start_time,
          end_time: p.end_time,
          type: 'practice'
        })
      }
    }
  }

  // Process games - O(n) single pass
  for (const g of games) {
    if (g.court_id && g.start_time && g.end_time && isEventHappeningNow(g.start_time, g.end_time)) {
      if (!activeEventsMap.has(g.court_id)) {
        activeEventsMap.set(g.court_id, {
          id: g.id,
          title: `${g.home_team_name || 'Team'} vs ${g.away_team_name || 'Team'}`,
          start_time: g.start_time,
          end_time: g.end_time,
          type: 'game'
        })
      }
    }
  }

  // Process events - O(n) single pass
  for (const e of events) {
    if (e.court_id && e.start_at && e.end_at && isEventHappeningNow(e.start_at, e.end_at)) {
      if (!activeEventsMap.has(e.court_id)) {
        activeEventsMap.set(e.court_id, {
          id: e.id,
          title: e.program?.name || e.name || 'Event',
          start_time: e.start_at,
          end_time: e.end_at,
          type: 'event'
        })
      }
    }
  }

  return activeEventsMap
}

// Process courts with active events map for O(1) lookups per court
const processCourtsWithStatus = (courts: any[], activeEventsMap: Map<string, ActiveEvent>): Court[] => {
  return courts.map((court: any) => {
    const activeEvent = activeEventsMap.get(court.id)

    return {
      id: court.id,
      name: court.name,
      location_id: court.location_id,
      location_name: court.location_name,
      status: activeEvent ? 'in_use' : 'available',
      current_event: activeEvent,
    } as Court
  })
}

interface CourtsState {
  courts: Court[]
  loading: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
  lastFetched: number | null // Timestamp of last successful fetch
}

const initialState: CourtsState = {
  courts: [],
  loading: 'idle',
  error: null,
  lastFetched: null,
}

// Cache duration: 10 minutes
const CACHE_DURATION = 10 * 60 * 1000

// Fetch all courts with their current status (optimized)
export const fetchCourts = createAsyncThunk(
  'courts/fetchCourts',
  async (token: string, { rejectWithValue, getState }) => {
    // Check if we have cached data that's still fresh
    const state = getState() as any
    const { lastFetched, courts } = state.courts
    const now = Date.now()

    if (lastFetched && courts.length > 0 && (now - lastFetched) < CACHE_DURATION) {
      // Return cached data if it's less than 10 minutes old
      return courts
    }

    try {
      // Batch all API calls in parallel - use public endpoints to get ALL activities at RISE
      const [courtsResponse, allPracticesResponse, allGamesResponse, allEventsResponse] = await Promise.all([
        axios.get(`${API_URL}/courts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/practices`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })), // Fallback to empty array if fails
        axios.get(`${API_URL}/games`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })), // Fallback to empty array if fails
        axios.get(`${API_URL}/events`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })), // Fallback to empty array if fails
      ])

      const courts = courtsResponse.data
      const allPractices = allPracticesResponse.data || []
      const allGames = allGamesResponse.data || []
      const allEvents = allEventsResponse.data || []

      // Build Map for O(1) lookups instead of O(n) find() per court
      const activeEventsMap = buildActiveEventsMap(allPractices, allGames, allEvents)

      // Process courts with O(1) lookups
      const courtsWithStatus = processCourtsWithStatus(courts, activeEventsMap)

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
      state.lastFetched = null
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
        state.lastFetched = Date.now() // Store timestamp of successful fetch
      })
      .addCase(fetchCourts.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload as string
      })
      // Force fetch cases (same as regular fetch)
      .addCase(forceFetchCourts.pending, (state) => {
        state.loading = 'pending'
        state.error = null
      })
      .addCase(forceFetchCourts.fulfilled, (state, action) => {
        state.loading = 'succeeded'
        state.courts = action.payload
        state.lastFetched = Date.now()
      })
      .addCase(forceFetchCourts.rejected, (state, action) => {
        state.loading = 'failed'
        state.error = action.payload as string
      })
  },
})

export const { clearCourts } = courtsSlice.actions

// Force fetch courts (bypass cache)
export const forceFetchCourts = createAsyncThunk(
  'courts/forceFetchCourts',
  async (token: string, { rejectWithValue }) => {
    try {
      // Batch all API calls in parallel - use public endpoints to get ALL activities at RISE
      const [courtsResponse, allPracticesResponse, allGamesResponse, allEventsResponse] = await Promise.all([
        axios.get(`${API_URL}/courts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/practices`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/games`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/events`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] })),
      ])

      const courts = courtsResponse.data
      const allPractices = allPracticesResponse.data || []
      const allGames = allGamesResponse.data || []
      const allEvents = allEventsResponse.data || []

      // Build Map for O(1) lookups instead of O(n) find() per court
      const activeEventsMap = buildActiveEventsMap(allPractices, allGames, allEvents)

      // Process courts with O(1) lookups
      const courtsWithStatus = processCourtsWithStatus(courts, activeEventsMap)

      return courtsWithStatus
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.message)
      }
      return rejectWithValue('An unknown error occurred')
    }
  }
)

// Selectors
export const selectAllCourts = (state: any) => state.courts.courts
export const selectCourtsLoading = (state: any) => state.courts.loading
export const selectCourtsError = (state: any) => state.courts.error
export const selectCourtsLastFetched = (state: any) => state.courts.lastFetched
export const selectIsCourtsDataFresh = (state: any) => {
  const lastFetched = state.courts.lastFetched
  if (!lastFetched) return false
  return (Date.now() - lastFetched) < CACHE_DURATION
}
export const selectAvailableCourts = (state: any) =>
  state.courts.courts.filter((court: Court) => court.status === 'available')
export const selectCourtsInUse = (state: any) =>
  state.courts.courts.filter((court: Court) => court.status === 'in_use')

export default courtsSlice.reducer