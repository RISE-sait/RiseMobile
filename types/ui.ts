import type { Team } from "@/types/team"

export interface TeamDisplay extends Team {
  players: number
  icon: string
  image: string
}
