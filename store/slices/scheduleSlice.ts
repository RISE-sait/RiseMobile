import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { API_URL } from "@/utils/api"
import type { RootState } from "@/store"

// Define schedule item interface
export interface ScheduleItem {
  id: string
  name: string
  title: string
  date: string
  time: string
  type: "event" | "match" | "practice"
  location: string | { id: string; name?: string; address?: string }
  description: string
  created_at?: string
  updated_at?: string
  program_type?: string
  program?: {
    id: string
    name?: string
    type?: string
    description?: string
  }
}

export interface ScheduleState {
  items: ScheduleItem[]
  byDate: Record<string, ScheduleItem[]>
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

const initialState: ScheduleState = {
  items: [],
  byDate: {},
  status: "idle",
  error: null,
}

// Fetch schedule data from /secure/schedule endpoint
export const fetchSchedule = createAsyncThunk("schedule/fetchSchedule", async (token: string, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/secure/schedule`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const responseData = response.data
    
    
    const scheduleItems: ScheduleItem[] = []
    
    // Process events
    if (responseData.events && Array.isArray(responseData.events)) {
      responseData.events.forEach((event: any) => {
        // Parse date correctly - handle both ISO format and space-separated format
        let parsedDate = event.date
        if (!parsedDate && event.start_at) {
          // Handle format like "2025-11-05 18:30:00 -0700 -0700"
          if (event.start_at.includes('T')) {
            // ISO format: 2025-11-05T18:30:00
            parsedDate = event.start_at.split('T')[0]
          } else {
            // Space format: 2025-11-05 18:30:00 -0700 -0700
            parsedDate = event.start_at.split(' ')[0]
          }
        }
        if (!parsedDate) {
          parsedDate = new Date().toISOString().split('T')[0]
        }


        scheduleItems.push({
          id: event.id,
          name: event.program?.name || event.name || event.title || "Event",
          title: event.program?.name || event.name || event.title || "Event",
          date: parsedDate,
          time: event.time || (event.start_at ? (() => {
            try {
              // Handle format like "2025-11-05 18:30:00 -0700 -0700"
              const timeStr = event.start_at.split(' ')[1] // Get "18:30:00"
              if (timeStr) {
                const [hours, minutes] = timeStr.split(':')
                const hour12 = parseInt(hours) > 12 ? parseInt(hours) - 12 : parseInt(hours)
                const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
                const displayHour = hour12 === 0 ? 12 : hour12
                return `${displayHour}:${minutes} ${ampm}`
              }
              return "TBD"
            } catch (e) {
              return "TBD"
            }
          })() : "TBD"),
          type: event.program?.type || "event",
          location: (typeof event.location === 'object' ? event.location?.name || event.location?.address : event.location) || event.location_name || "TBD",
          description: event.program?.description || event.description || "Event scheduled",
          created_at: event.created_at,
          updated_at: event.updated_at,
          program_type: event.program?.type,
          program: event.program,
        })
      })
    }
    
    // Process games/matches
    if (responseData.games && Array.isArray(responseData.games)) {
      responseData.games.forEach((game: any) => {
        const name = `${game.home_team_name || 'Home'} vs ${game.away_team_name || 'Away'}`
        scheduleItems.push({
          id: game.id,
          name,
          title: name,
          date: game.start_time ? game.start_time.split('T')[0] : new Date().toISOString().split('T')[0],
          time: game.start_time ? new Date(game.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : "TBD",
          type: "match",
          location: game.location_name || "TBD",
          description: `Match between ${game.home_team_name} and ${game.away_team_name}`,
          created_at: game.created_at,
          updated_at: game.updated_at,
        })
      })
    }
    
    // Process practices
    if (responseData.practices && Array.isArray(responseData.practices)) {
      responseData.practices.forEach((practice: any) => {
        scheduleItems.push({
          id: practice.id,
          name: `${practice.team_name || 'Team'} Practice`,
          title: `${practice.team_name || 'Team'} Practice`,
          date: practice.start_time ? practice.start_time.split('T')[0] : new Date().toISOString().split('T')[0],
          time: practice.start_time ? new Date(practice.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : "TBD",
          type: "practice",
          location: practice.location_name || "TBD",
          description: `Practice for ${practice.team_name}`,
          created_at: practice.created_at,
          updated_at: practice.updated_at,
        })
      })
    }

    // Organize by date
    const byDate: Record<string, ScheduleItem[]> = {}
    scheduleItems.forEach((item) => {
      if (item.date) {
        if (!byDate[item.date]) {
          byDate[item.date] = []
        }
        byDate[item.date].push(item)
      }
    })

    return { items: scheduleItems, byDate }
  } catch (error: any) {
    console.error("Schedule API error:", error.response?.data || error.message)
    return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch schedule")
  }
})

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    clearSchedule: (state) => {
      state.items = []
      state.byDate = {}
      state.status = "idle"
      state.error = null
    },
    clearScheduleError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchedule.pending, (state) => {
        state.status = "loading"
        state.error = null
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.items = action.payload.items
        state.byDate = action.payload.byDate
        state.error = null
      })
      .addCase(fetchSchedule.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload as string
      })
  },
})

export const { clearSchedule, clearScheduleError } = scheduleSlice.actions
export default scheduleSlice.reducer

// Selectors
export const selectAllScheduleItems = (state: RootState) => state.schedule.items
export const selectScheduleByDate = (state: RootState, date: string) => state.schedule.byDate[date] || []
export const selectScheduleStatus = (state: RootState) => state.schedule.status
export const selectScheduleError = (state: RootState) => state.schedule.error