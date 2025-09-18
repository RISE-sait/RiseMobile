import { useState, useEffect } from "react"
import { useAppSelector } from "@/store/hooks"
import axios from "axios"
import { API_URL } from "@/utils/api"
import dayjs from "dayjs"

interface ScheduleEvent {
  id: string
  capacity: number
  created_by: {
    first_name: string
    id: string
    last_name: string
  }
  customers: any[]
  end_at: string  // 🔥 Event uses end_at
  location: {
    address: string
    id: string
    name: string
  }
  program: {
    description: string
    id: string
    name: string
    type: string
  }
  staff: any[]
  start_at: string  // 🔥 Event uses start_at
  team?: {
    id: string
    name: string
  }
  updated_by: {
    first_name: string
    id: string
    last_name: string
  }
}

interface ScheduleGame {
  id: string
  away_score: number
  away_team_id: string
  away_team_logo_url: string
  away_team_name: string
  court_id: string
  court_name: string
  created_at: string
  end_time: string  // 🔥 Game uses end_time
  home_score: number
  home_team_id: string
  home_team_logo_url: string
  home_team_name: string
  location_id: string
  location_name: string
  start_time: string  // 🔥 Game uses start_time
  status: string
  updated_at: string
}

interface SchedulePractice {
  id: string
  booked_by: string
  booked_by_name: string
  court_id: string
  court_name: string
  created_at: string
  end_time: string  // 🔥 Practice uses end_time
  location_id: string
  location_name: string
  start_time: string  // 🔥 Practice uses start_time
  status: string
  team_id: string
  team_logo_url: string
  team_name: string
  updated_at: string
}

interface ScheduleResponse {
  events: ScheduleEvent[]
  games: ScheduleGame[]
  practices: SchedulePractice[]
}

interface UpcomingEventData {
  id: string
  date: string
  time: string
  title: string
  homeTeam?: string
  awayTeam?: string
  status: "scheduled" | "in_progress" | "completed" | "canceled"
  location: string
  description: string
  homeLogo?: string
  awayLogo?: string
  bgImage: string
  type: "match" | "practice" | "event"
}

// Cache duration: 6 hours (6 * 60 * 60 * 1000 milliseconds)
const CACHE_DURATION = 6 * 60 * 60 * 1000;

export const useUpcomingEvent = () => {
  const [upcomingEvent, setUpcomingEvent] = useState<UpcomingEventData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<number | null>(null)

  const userData = useAppSelector((state) => state.user.data)

  const fetchUpcomingEvent = async () => {
    if (!userData?.token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await axios.get<ScheduleResponse>(`${API_URL}/secure/schedule`, {
        headers: { Authorization: `Bearer ${userData.token}` },
      })

      const { events, games, practices } = response.data

        // Convert all items to a common format with timestamps for sorting
        const allItems: Array<UpcomingEventData & { timestamp: number }> = []
        
        // Process events - use start_at field
        if (events && Array.isArray(events)) {
          events.forEach((event) => {
            const startTime = dayjs(event.start_at)  // 🔥 Event uses start_at
            if (startTime.isAfter(dayjs())) { // Only upcoming events
              allItems.push({
                id: event.id,
                date: startTime.format("YYYY-MM-DD"),
                time: startTime.format("h:mm A"),
                title: event.program?.name || "Event",
                status: "scheduled" as const,
                location: event.location?.name || "RISE Facility",
                description: event.program?.description || event.program?.name || "Event",
                bgImage: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
                type: "event" as const,
                timestamp: startTime.unix()
              })
            }
          })
        }
        
        // Process games/matches - use start_time field  
        if (games && Array.isArray(games)) {
          games.forEach((game) => {
            const startTime = dayjs(game.start_time)  // 🔥 Game uses start_time
            if (startTime.isAfter(dayjs())) { // Only upcoming games
              allItems.push({
                id: game.id,
                date: startTime.format("YYYY-MM-DD"),
                time: startTime.format("h:mm A"),
                title: `${game.home_team_name} vs ${game.away_team_name}`,
                homeTeam: game.home_team_name,
                awayTeam: game.away_team_name,
                status: "scheduled" as const,
                location: game.location_name || "RISE Facility",
                description: `Match between ${game.home_team_name} and ${game.away_team_name}`,
                homeLogo: game.home_team_logo_url || "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1780&auto=format&fit=crop",
                awayLogo: game.away_team_logo_url || "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1780&auto=format&fit=crop",
                bgImage: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
                type: "match" as const,
                timestamp: startTime.unix()
              })
            }
          })
        }
        
        // Process practices - use start_time field
        if (practices && Array.isArray(practices)) {
          practices.forEach((practice) => {
            const startTime = dayjs(practice.start_time)  // 🔥 Practice uses start_time
            if (startTime.isAfter(dayjs()) && (practice.status === "scheduled" || !practice.status)) { // Only upcoming scheduled practices
              allItems.push({
                id: practice.id,
                date: startTime.format("YYYY-MM-DD"),
                time: startTime.format("h:mm A"),
                title: `${practice.team_name} Practice`,
                status: "scheduled" as const,
                location: `${practice.court_name} at ${practice.location_name}`,
                description: `Practice for ${practice.team_name}`,
                bgImage: practice.team_logo_url || "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
                type: "practice" as const,
                timestamp: startTime.unix()
              })
            }
          })
        }

        // Sort by timestamp (earliest first) and get the closest one
        if (allItems.length > 0) {
          const sortedItems = allItems.sort((a, b) => a.timestamp - b.timestamp)
          const closestEvent = sortedItems[0]

          // Remove timestamp before setting state
          const { timestamp, ...eventData } = closestEvent
          setUpcomingEvent(eventData)
        } else {
          setUpcomingEvent(null)
        }

        // Update last fetched timestamp
        setLastFetched(Date.now())

    } catch (err: any) {
      console.error("Error fetching upcoming events:", err.response?.data || err.message)
      setError("Failed to load upcoming events")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const shouldFetch = () => {
      // Don't fetch if no token
      if (!userData?.token) return false;

      // Don't fetch if currently loading
      if (loading) return false;

      // Fetch if no data exists yet
      if (!upcomingEvent || !lastFetched) return true;

      // Fetch if cache has expired (6 hours)
      const now = Date.now();
      const cacheExpired = (now - lastFetched) > CACHE_DURATION;

      return cacheExpired;
    };

    if (shouldFetch()) {
      fetchUpcomingEvent();
    }
  }, [userData?.token, upcomingEvent, lastFetched, loading])

  // Calculate time until next refresh for debugging
  const timeUntilRefresh = lastFetched
    ? Math.max(0, CACHE_DURATION - (Date.now() - lastFetched))
    : 0;

  return {
    upcomingEvent,
    loading,
    error,
    refetch: fetchUpcomingEvent,
    cacheTimeRemaining: timeUntilRefresh // milliseconds until next auto-refresh
  }
}
