export type PlayerPosition = "PG" | "SG" | "SF" | "PF" | "C";
export type PlayerStatus = "Active" | "Injured" | "Suspended" | "Conditioning" | "Day-to-Day";

export interface PlayerStats {
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fg: number;
  threePt: number;
  ft: number;
  mpg: number;
  topg?: number;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  number: number;  // 🔥 Changed from string to number to match players.ts
  position: PlayerPosition;
  height: string;
  weight: number;
  age: number;
  experience: number; // ✅ Added to match players.ts
  college: string; // ✅ Added to match players.ts
  image: string;
  status: PlayerStatus; // ✅ Added to match players.ts
  stats: PlayerStats; // ✅ Added to match players.ts
  hotZones?: string[]; // ✅ Added to match players.ts
  strengths?: string[];
  weaknesses?: string[];
  notes?: string;
  contract?: {
    years: number;
    amount: number;
    signed: string;
    expires: string;
  };
  lastFiveGames?: { // ✅ Added to match players.ts
    date: string;
    opponent: string;
    result: "W" | "L";
    minutes: number;
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
  }[];
}

export interface SeasonStats {
  season: string;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fg: number;
  threePt: number;
  ft: number;
  topg?: number;
}

export interface GameStats {
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  fg: string;
  threePt: string;
  ft: string;
  minutes: number;
}

export interface Game {
  id: string;
  date: string;
  opponent: string;
  result: string;
  stats: GameStats;
}
