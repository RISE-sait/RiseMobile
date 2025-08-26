import type { CalendarItem } from "./event"

export interface PracticesState {
  items: CalendarItem[]
  byDate: Record<string, CalendarItem[]>
  byId: Record<string, CalendarItem>
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  lastFetched: string | null
}

export interface CreatePracticePayload {
  start_time: string
  end_time: string
  location_id: string
  court_id: string
  team_id: string
  status: "scheduled" | "cancelled" | "completed"
}




export interface CreateRecurringPracticePayload {
  day: string
  event_start_at: string
  event_end_at: string
  location_id: string
  team_id: string
  recurrence_start_at: string
  recurrence_end_at: string
}
