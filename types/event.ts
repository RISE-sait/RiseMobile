export interface CalendarItem {
  id: string
  title: string
  date: string
  time: string
  type: "practice" | "course" | "game" | "match" | "others" | "event"
  location?: string
  description?: string
  program_type?: string
  program?: {
    id: string
    name?: string
    type?: string
  }
}

export interface Event {
  id: string
  program?: {
    id: string
    name: string
    type: string
  }
  location?: {
    id: string
    name: string
    address: string
  }
  capacity?: number
  created_by?: any
  updated_by?: any
  start_at?: string
  end_at?: string
  required_membership_plan_ids?: string[]
}

export interface EventsState {
  items: CalendarItem[]
  byDate: Record<string, CalendarItem[]>
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  lastFetched: string | null
  detailedEvents: Record<string, Event>
  detailedEventsStatus: "idle" | "loading" | "succeeded" | "failed"
  detailedEventsError: string | null
  lastFetchedDetailed: Record<string, number>
}
