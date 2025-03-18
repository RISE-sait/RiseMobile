import type { SeasonStats, Game } from "../types/player"

// Mock data for season stats
export const seasonStats: SeasonStats[] = [
  { season: "2023-24", ppg: 27.2, rpg: 7.5, apg: 8.3, spg: 1.3, bpg: 0.8, fg: 0.538, threePt: 0.358, ft: 0.756 },
  { season: "2022-23", ppg: 30.3, rpg: 8.2, apg: 7.0, spg: 1.0, bpg: 0.6, fg: 0.505, threePt: 0.329, ft: 0.761 },
  { season: "2021-22", ppg: 30.3, rpg: 8.2, apg: 6.2, spg: 1.3, bpg: 1.1, fg: 0.524, threePt: 0.359, ft: 0.756 },
  { season: "2020-21", ppg: 25.0, rpg: 7.7, apg: 7.8, spg: 1.1, bpg: 0.6, fg: 0.513, threePt: 0.365, ft: 0.698 },
  { season: "2019-20", ppg: 25.3, rpg: 7.8, apg: 10.2, spg: 1.2, bpg: 0.5, fg: 0.493, threePt: 0.348, ft: 0.693 },
]

// Mock data for recent games
export const recentGames: Game[] = [
  {
    id: "1",
    date: "Dec 1, 2023",
    opponent: "OKC",
    result: "W 123-109",
    stats: {
      points: 30,
      rebounds: 8,
      assists: 10,
      steals: 2,
      blocks: 1,
      fg: "12-20",
      threePt: "4-9",
      ft: "2-3",
      minutes: 36,
    },
  },
  {
    id: "2",
    date: "Nov 29, 2023",
    opponent: "DAL",
    result: "L 115-120",
    stats: {
      points: 26,
      rebounds: 9,
      assists: 7,
      steals: 1,
      blocks: 0,
      fg: "10-22",
      threePt: "3-10",
      ft: "3-4",
      minutes: 38,
    },
  },
  {
    id: "3",
    date: "Nov 27, 2023",
    opponent: "PHI",
    result: "W 128-117",
    stats: {
      points: 28,
      rebounds: 7,
      assists: 12,
      steals: 3,
      blocks: 1,
      fg: "11-19",
      threePt: "3-7",
      ft: "3-3",
      minutes: 34,
    },
  },
  {
    id: "4",
    date: "Nov 24, 2023",
    opponent: "BOS",
    result: "L 110-115",
    stats: {
      points: 32,
      rebounds: 6,
      assists: 9,
      steals: 0,
      blocks: 2,
      fg: "13-24",
      threePt: "4-8",
      ft: "2-2",
      minutes: 37,
    },
  },
  {
    id: "5",
    date: "Nov 22, 2023",
    opponent: "MIA",
    result: "W 119-108",
    stats: {
      points: 25,
      rebounds: 8,
      assists: 11,
      steals: 1,
      blocks: 0,
      fg: "9-18",
      threePt: "2-6",
      ft: "5-6",
      minutes: 33,
    },
  },
]

// Mock data for shot chart
export const shotChartData = {
  labels: ["Paint", "Mid-Range", "3PT", "Corner 3", "Free Throw"],
  datasets: [
    {
      data: [65, 48, 36, 42, 78],
      colors: [() => "#4CAF50", () => "#2196F3", () => "#FFC107", () => "#FFD700", () => "#FF5252"],
    },
  ],
}

// Mock data for performance trends
export const performanceTrendData = {
  labels: ["Nov 22", "Nov 24", "Nov 27", "Nov 29", "Dec 1"],
  datasets: [
    {
      data: [25, 32, 28, 26, 30],
      color: () => "#FFD700",
      strokeWidth: 2,
    },
  ],
}

// Mock data for comparison with league average
export const comparisonData = {
  labels: ["PPG", "RPG", "APG", "SPG", "BPG", "FG%"],
  data: [
    [27.2, 7.5, 8.3, 1.3, 0.8, 53.8], // Player
    [24.5, 6.2, 6.0, 1.0, 0.5, 47.2], // League average
  ],
}

// Mock data for radar chart
export const radarData = {
  labels: ["Scoring", "Playmaking", "Defense", "Rebounding", "Efficiency"],
  datasets: [
    {
      data: [90, 85, 75, 80, 88],
    },
  ],
}

