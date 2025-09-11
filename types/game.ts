export interface Match {
  id: string
  name: string
  title?: string
  date?: string
  time?: string
  location?: string
  description?: string
  win_team?: string
  lose_team?: string
  win_score?: number
  lose_score?: number
  created_at?: string
  updated_at?: string
  // Original API team fields for proper team name display
  home_team_name?: string
  away_team_name?: string
  home_team_logo_url?: string
  away_team_logo_url?: string
  home_score?: number
  away_score?: number
  // Additional API fields
  program_type?: string
  location_address?: string
  start_at?: string
  end_at?: string
  capacity?: number
  status?: "scheduled" | "in_progress" | "completed" | "canceled" // API status field for client-side mapping
}

export interface GamesState {
  items: Match[]
  byDate: Record<string, Match[]>
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}
