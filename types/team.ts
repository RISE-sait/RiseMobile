export interface Player {
  id: string
  name: string
  email: string
  country: string
  points: number
  assists: number
  rebounds: number
  steals: number
  wins: number
  losses: number
}

export interface Team {
  id: string
  name: string
  capacity?: number
  coach: {
    id: string
    name: string
    email: string
  }
  logo_url?: string
  roster?: Player[]
  created_at?: string
  updated_at?: string
}



export interface TeamsState {
  entities: Record<string, Team>
  ids: string[]
  loading: "idle" | "pending" | "succeeded" | "failed"
  error: string | null
}
