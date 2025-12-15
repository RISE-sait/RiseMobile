import type { CalendarItem } from "./event"

export interface PracticesState {
  items: CalendarItem[]
  byDate: Record<string, CalendarItem[]>
  byId: Record<string, CalendarItem>
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  lastFetched: string | null
  isBooking: boolean // Flag to prevent double booking
}

export interface CreatePracticePayload {
  booked_by: string
  court_id: string
  end_time: string
  location_id: string
  start_time: string
  status: "scheduled" | "cancelled" | "completed"
  team_id: string
}




export interface CreateRecurringPracticePayload {
  day: string
  practice_start_at: string
  practice_end_at: string
  location_id: string
  court_id: string
  team_id: string
  status: "scheduled" | "cancelled" | "completed"
  recurrence_start_at: string
  recurrence_end_at: string
}
