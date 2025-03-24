import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { API_URL } from "../../utils/api"
import dayjs from "dayjs"

// Define types
interface Match {
  id: string
  name?: string
  date: string
  time?: string
  location?: string
  status: "Upcoming" | "Live" | "Finished"
  league?: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  homeLogo?: string
  awayLogo?: string
  win_team?: string
  lose_team?: string
  win_score?: number
  lose_score?: number
}

interface Team {
  id: string
  name: string
  logo?: string
}

interface MatchesState {
  items: Match[]
  byId: Record<string, Match>
  byDate: Record<string, Match[]>
  teams: {
    byId: Record<string, Team>
    allIds: string[]
  }
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}

// Helper functions
const getRandomTime = () => {
  const hours = Math.floor(Math.random() * 12) + 1
  const minutes = Math.random() > 0.5 ? "00" : "30"
  const period = Math.random() > 0.5 ? "AM" : "PM"
  return `${hours}:${minutes} ${period}`
}

const getRandomItem = (array: any[]) => {
  return array[Math.floor(Math.random() * array.length)]
}

// Initial state
const initialState: MatchesState = {
  items: [],
  byId: {},
  byDate: {},
  teams: {
    byId: {},
    allIds: [],
  },
  status: "idle",
  error: null,
}

// Thunks
export const fetchMatches = createAsyncThunk("matches/fetchMatches", async (token: string, { rejectWithValue }) => {
  try {
    console.log("Fetching matches from API...")

    const response = await axios.get(`${API_URL}/games`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    console.log("API response:", response.data)

    // Process the API response
    const matches: Match[] = []
    const byId: Record<string, Match> = {}
    const byDate: Record<string, Match[]> = {}
    const teamsById: Record<string, Team> = {}
    const teamIds: string[] = []

    // Sample team names and locations for mock data
    const teamNames = [
      "RISE Ballers",
      "City Hoops",
      "Courtside Kings",
      "Downtown Dribblers",
      "Hoop Dreams",
      "Slam Dunkers",
      "Baseline Bombers",
      "Fast Break",
      "Three-Point Threats",
    ]

    const locations = [
      "RISE Main Court",
      "Community Center",
      "RISE East Court",
      "Downtown Arena",
      "Westside Gym",
      "Central Stadium",
    ]

    const leagues = [
      "Summer Basketball League",
      "RISE Basketball League",
      "Pro Division",
      "Amateur League",
      "Youth Division",
    ]

    // Generate dates for the matches
    const today = dayjs()
    const dateRange = [-3, -2, -1, 0, 0, 0, 1, 1, 2, 3]

    if (response.data && Array.isArray(response.data)) {
      response.data.forEach((game: any, index: number) => {
        // Generate a date for this game
        const dateOffset = dateRange[index % dateRange.length]
        const gameDate = today.add(dateOffset, "day").format("YYYY-MM-DD")

        // Determine status based on date
        let status: "Upcoming" | "Live" | "Finished" = "Upcoming"
        if (dateOffset < 0) status = "Finished"
        else if (dateOffset === 0) status = "Live"

        // Generate team data if not already in the store
        const homeTeamId = game.win_team || `team-${index * 2}`
        const awayTeamId = game.lose_team || `team-${index * 2 + 1}`

        if (!teamsById[homeTeamId]) {
          teamsById[homeTeamId] = {
            id: homeTeamId,
            name: getRandomItem(teamNames),
            logo: `https://via.placeholder.com/100?text=${index * 2}`,
          }
          teamIds.push(homeTeamId)
        }

        if (!teamsById[awayTeamId]) {
          teamsById[awayTeamId] = {
            id: awayTeamId,
            name: getRandomItem(teamNames),
            logo: `https://via.placeholder.com/100?text=${index * 2 + 1}`,
          }
          teamIds.push(awayTeamId)
        }

        // Create match object
        const match: Match = {
          id: game.id,
          name: game.name || `Game ${index + 1}`,
          date: gameDate,
          time: getRandomTime(),
          location: getRandomItem(locations),
          status: status,
          league: getRandomItem(leagues),
          homeTeam: teamsById[homeTeamId].name,
          awayTeam: teamsById[awayTeamId].name,
          homeScore: game.win_score || (status === "Upcoming" ? 0 : Math.floor(Math.random() * 100)),
          awayScore: game.lose_score || (status === "Upcoming" ? 0 : Math.floor(Math.random() * 100)),
          homeLogo: teamsById[homeTeamId].logo,
          awayLogo: teamsById[awayTeamId].logo,
          win_team: game.win_team,
          lose_team: game.lose_team,
          win_score: game.win_score,
          lose_score: game.lose_score,
        }

        // Add to collections
        matches.push(match)
        byId[match.id] = match

        // Organize by date
        if (!byDate[match.date]) {
          byDate[match.date] = []
        }
        byDate[match.date].push(match)
      })
    }

    return {
      items: matches,
      byId,
      byDate,
      teams: {
        byId: teamsById,
        allIds: teamIds,
      },
    }
  } catch (error: any) {
    console.error("Error fetching matches:", error)
    return rejectWithValue(error.message || "Failed to fetch matches")
  }
})

// Slice
const matchesSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {
    addMatch: (state, action: PayloadAction<Match>) => {
      const match = action.payload

      // Add to items array
      state.items.push(match)

      // Add to byId lookup
      state.byId[match.id] = match

      // Add to byDate lookup
      if (!state.byDate[match.date]) {
        state.byDate[match.date] = []
      }
      state.byDate[match.date].push(match)
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
        state.byId = action.payload.byId
        state.byDate = action.payload.byDate
        state.teams = action.payload.teams
        state.error = null
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.status = "failed"
        state.error = (action.payload as string) || "Unknown error"
      })
  },
})

export const { addMatch } = matchesSlice.actions
export default matchesSlice.reducer

