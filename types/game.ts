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
}

export interface GamesState {
  items: Match[]
  byDate: Record<string, Match[]>
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
}
