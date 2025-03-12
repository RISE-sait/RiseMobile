export type PlayerPosition = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export type PlayerStatus = 'Active' | 'Injured' | 'Suspended' | 'Conditioning' | 'Day-to-Day';

export interface PlayerStats {
  ppg: number;      // Points per game
  rpg: number;      // Rebounds per game
  apg: number;      // Assists per game
  spg: number;      // Steals per game
  bpg: number;      // Blocks per game
  fg: number;       // Field goal percentage
  threePt: number;  // Three-point percentage
  ft: number;       // Free throw percentage
  mpg: number;      // Minutes per game
  topg: number;     // Turnovers per game
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  number: number;
  position: PlayerPosition;
  height: string;
  weight: number;
  age: number;
  experience: number;
  college: string;
  image: string;
  status: PlayerStatus;
  stats: PlayerStats;
  hotZones?: string[];
  strengths?: string[];
  weaknesses?: string[];
  notes?: string;
  contract?: {
    years: number;
    amount: number;
    signed: string;
    expires: string;
  };
  lastFiveGames?: {
    date: string;
    opponent: string;
    result: 'W' | 'L';
    minutes: number;
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
  }[];
}

const players: Player[] = [
  {
    id: "1",
    firstName: "LeBron",
    lastName: "James",
    number: 23,
    position: "SF",
    height: "6'9\"",
    weight: 250,
    age: 38,
    experience: 20,
    college: "St. Vincent-St. Mary HS",
    image: "https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png",
    status: "Active",
    stats: {
      ppg: 27.2,
      rpg: 7.5,
      apg: 8.3,
      spg: 1.3,
      bpg: 0.8,
      fg: 0.538,
      threePt: 0.358,
      ft: 0.756,
      mpg: 35.5,
      topg: 3.2
    },
    hotZones: ["Paint", "Left Wing", "Top of Key"],
    strengths: ["Playmaking", "Finishing", "Basketball IQ", "Leadership"],
    weaknesses: ["Free throw consistency", "Defensive effort in regular season"],
    notes: "Team captain. Prefers to run offense through high pick and roll. Looking to reduce minutes to preserve for playoffs.",
    contract: {
      years: 2,
      amount: 97.1,
      signed: "2022-08-18",
      expires: "2024-06-30"
    },
    lastFiveGames: [
      {
        date: "2023-12-01",
        opponent: "OKC",
        result: "W",
        minutes: 36,
        points: 30,
        rebounds: 8,
        assists: 10,
        steals: 2,
        blocks: 1
      },
      {
        date: "2023-11-29",
        opponent: "DAL",
        result: "L",
        minutes: 38,
        points: 26,
        rebounds: 9,
        assists: 7,
        steals: 1,
        blocks: 0
      },
      {
        date: "2023-11-27",
        opponent: "PHI",
        result: "W",
        minutes: 34,
        points: 28,
        rebounds: 7,
        assists: 12,
        steals: 3,
        blocks: 1
      },
      {
        date: "2023-11-24",
        opponent: "BOS",
        result: "L",
        minutes: 37,
        points: 32,
        rebounds: 6,
        assists: 9,
        steals: 0,
        blocks: 2
      },
      {
        date: "2023-11-22",
        opponent: "MIA",
        result: "W",
        minutes: 33,
        points: 25,
        rebounds: 8,
        assists: 11,
        steals: 1,
        blocks: 0
      }
    ]
  },
  {
    id: "2",
    firstName: "Stephen",
    lastName: "Curry",
    number: 30,
    position: "PG",
    height: "6'2\"",
    weight: 185,
    age: 35,
    experience: 14,
    college: "Davidson",
    image: "https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png",
    status: "Active",
    stats: {
      ppg: 29.4,
      rpg: 5.2,
      apg: 6.3,
      spg: 1.5,
      bpg: 0.4,
      fg: 0.491,
      threePt: 0.428,
      ft: 0.915,
      mpg: 34.7,
      topg: 2.8
    },
    hotZones: ["Right Corner", "Left Wing", "Top of Key", "Logo Range"],
    strengths: ["Three-point shooting", "Off-ball movement", "Finishing", "Free throws"],
    weaknesses: ["Size on defense", "Turnover prone under pressure"],
    notes: "Greatest shooter of all time. Needs screens to get open. Defensive schemes should focus on denying him space.",
    contract: {
      years: 4,
      amount: 215.4,
      signed: "2021-08-06",
      expires: "2026-06-30"
    },
    lastFiveGames: [
      {
        date: "2023-12-01",
        opponent: "LAC",
        result: "W",
        minutes: 35,
        points: 33,
        rebounds: 5,
        assists: 7,
        steals: 2,
        blocks: 0
      },
      {
        date: "2023-11-29",
        opponent: "SAC",
        result: "W",
        minutes: 36,
        points: 40,
        rebounds: 6,
        assists: 5,
        steals: 1,
        blocks: 0
      },
      {
        date: "2023-11-27",
        opponent: "PHX",
        result: "L",
        minutes: 37,
        points: 25,
        rebounds: 4,
        assists: 8,
        steals: 3,
        blocks: 1
      },
      {
        date: "2023-11-24",
        opponent: "SAS",
        result: "W",
        minutes: 32,
        points: 28,
        rebounds: 3,
        assists: 6,
        steals: 2,
        blocks: 0
      },
      {
        date: "2023-11-22",
        opponent: "NOP",
        result: "L",
        minutes: 36,
        points: 31,
        rebounds: 5,
        assists: 7,
        steals: 1,
        blocks: 0
      }
    ]
  },
  {
    id: "3",
    firstName: "Nikola",
    lastName: "Jokić",
    number: 15,
    position: "C",
    height: "6'11\"",
    weight: 284,
    age: 28,
    experience: 8,
    college: "Mega Basket",
    image: "https://cdn.nba.com/headshots/nba/latest/1040x760/203999.png",
    status: "Active",
    stats: {
      ppg: 25.8,
      rpg: 12.3,
      apg: 9.1,
      spg: 1.3,
      bpg: 0.7,
      fg: 0.583,
      threePt: 0.337,
      ft: 0.822,
      mpg: 33.8,
      topg: 3.6
    },
    hotZones: ["Elbow", "Paint", "Top of Key"],
    strengths: ["Passing", "Post scoring", "Basketball IQ", "Rebounding"],
    weaknesses: ["Lateral quickness", "Rim protection"],
    notes: "Three-time MVP. Offense runs through him at the elbow. Exceptional passer from the post.",
    contract: {
      years: 5,
      amount: 272,
      signed: "2022-07-01",
      expires: "2028-06-30"
    },
    lastFiveGames: [
      {
        date: "2023-12-01",
        opponent: "POR",
        result: "W",
        minutes: 34,
        points: 28,
        rebounds: 14,
        assists: 11,
        steals: 1,
        blocks: 1
      },
      {
        date: "2023-11-29",
        opponent: "UTA",
        result: "W",
        minutes: 32,
        points: 24,
        rebounds: 15,
        assists: 8,
        steals: 2,
        blocks: 0
      },
      {
        date: "2023-11-27",
        opponent: "HOU",
        result: "W",
        minutes: 36,
        points: 32,
        rebounds: 10,
        assists: 14,
        steals: 0,
        blocks: 2
      },
      {
        date: "2023-11-24",
        opponent: "SAS",
        result: "W",
        minutes: 30,
        points: 26,
        rebounds: 13,
        assists: 7,
        steals: 1,
        blocks: 1
      },
      {
        date: "2023-11-22",
        opponent: "OKC",
        result: "L",
        minutes: 35,
        points: 22,
        rebounds: 16,
        assists: 9,
        steals: 3,
        blocks: 0
      }
    ]
  },
  {
    id: "4",
    firstName: "Giannis",
    lastName: "Antetokounmpo",
    number: 34,
    position: "PF",
    height: "7'0\"",
    weight: 243,
    age: 29,
    experience: 10,
    college: "Filathlitikos",
    image: "https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png",
    status: "Day-to-Day",
    stats: {
      ppg: 30.1,
      rpg: 11.2,
      apg: 5.8,
      spg: 1.1,
      bpg: 1.5,
      fg: 0.612,
      threePt: 0.275,
      ft: 0.685,
      mpg: 32.5,
      topg: 3.4
    },
    hotZones: ["Paint", "Restricted Area", "Transition"],
    strengths: ["Athleticism", "Finishing", "Defense", "Transition offense"],
    weaknesses: ["Outside shooting", "Free throw shooting"],
    notes: "Dealing with minor knee soreness. Limited in practice this week. Dominant in transition and attacking the rim.",
    contract: {
      years: 3,
      amount: 186.6,
      signed: "2020-12-15",
      expires: "2026-06-30"
    },
    lastFiveGames: [
      {
        date: "2023-12-01",
        opponent: "CHI",
        result: "W",
        minutes: 30,
        points: 32,
        rebounds: 12,
        assists: 5,
        steals: 1,
        blocks: 2
      },
      {
        date: "2023-11-29",
        opponent: "DET",
        result: "W",
        minutes: 28,
        points: 26,
        rebounds: 13,
        assists: 8,
        steals: 0,
        blocks: 3
      },
      {
        date: "2023-11-27",
        opponent: "IND",
        result: "L",
        minutes: 34,
        points: 35,
        rebounds: 9,
        assists: 4,
        steals: 2,
        blocks: 1
      },
      {
        date: "2023-11-24",
        opponent: "CLE",
        result: "W",
        minutes: 33,
        points: 28,
        rebounds: 14,
        assists: 7,
        steals: 1,
        blocks: 2
      },
      {
        date: "2023-11-22",
        opponent: "TOR",
        result: "W",
        minutes: 31,
        points: 30,
        rebounds: 11,
        assists: 6,
        steals: 0,
        blocks: 4
      }
    ]
  },
  {
    id: "5",
    firstName: "Luka",
    lastName: "Dončić",
    number: 77,
    position: "PG",
    height: "6'7\"",
    weight: 230,
    age: 24,
    experience: 5,
    college: "Real Madrid",
    image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1629029.png",
    status: "Active",
    stats: {
      ppg: 32.5,
      rpg: 8.8,
      apg: 9.5,
      spg: 1.4,
      bpg: 0.5,
      fg: 0.495,
      threePt: 0.380,
      ft: 0.765,
      mpg: 36.8,
      topg: 3.9
    },
    hotZones: ["Step-back Left", "Paint", "Top of Key"],
    strengths: ["Scoring", "Playmaking", "Rebounding", "Basketball IQ"],
    weaknesses: ["Defensive intensity", "Conditioning"],
    notes: "Offensive engine of the team. Excels in pick and roll. Needs to improve defensive effort.",
    contract: {
      years: 5,
      amount: 215.2,
      signed: "2021-08-10",
      expires: "2027-06-30"
    },
    lastFiveGames: [
      {
        date: "2023-12-01",
        opponent: "MEM",
        result: "W",
        minutes: 38,
        points: 36,
        rebounds: 10,
        assists: 12,
        steals: 2,
        blocks: 0
      },
      {
        date: "2023-11-29",
        opponent: "HOU",
        result: "L",
        minutes: 40,
        points: 42,
        rebounds: 8,
        assists: 7,
        steals: 1,
        blocks: 1
      },
      {
        date: "2023-11-27",
        opponent: "OKC",
        result: "W",
        minutes: 37,
        points: 35,
        rebounds: 9,
        assists: 14,
        steals: 3,
        blocks: 0
      },
      {
        date: "2023-11-24",
        opponent: "LAC",
        result: "W",
        minutes: 39,
        points: 30,
        rebounds: 7,
        assists: 8,
        steals: 2,
        blocks: 0
      },
      {
        date: "2023-11-22",
        opponent: "LAL",
        result: "L",
        minutes: 38,
        points: 33,
        rebounds: 13,
        assists: 10,
        steals: 1,
        blocks: 1
      }
    ]
  },
  {
    id: "6",
    firstName: "Joel",
    lastName: "Embiid",
    number: 21,
    position: "C",
    height: "7'0\"",
    weight: 280,
    age: 29,
    experience: 7,
    college: "Kansas",
    image: "https://cdn.nba.com/headshots/nba/latest/1040x760/203954.png",
    status: "Injured",
    stats: {
      ppg: 33.1,
      rpg: 10.2,
      apg: 4.2,
      spg: 1.0,
      bpg: 1.7,
      fg: 0.529,
      threePt: 0.330,
      ft: 0.857,
      mpg: 34.6,
      topg: 3.4
    },
    hotZones: ["Mid-range", "Paint", "Free Throw Line"],
    strengths: ["Scoring", "Post moves", "Defense", "Free throw drawing"],
    weaknesses: ["Availability", "Turnover prone"],
    notes: "Out with knee inflammation. Expected to return in 2 weeks. Dominant post presence when healthy.",
    contract: {
      years: 4,
      amount: 213.3,
      signed: "2022-07-18",
      expires: "2027-06-30"
    },
    lastFiveGames: [
      {
        date: "2023-11-22",
        opponent: "BKN",
        result: "W",
        minutes: 36,
        points: 38,
        rebounds: 12,
        assists: 5,
        steals: 1,
        blocks: 3
      },
      {
        date: "2023-11-20",
        opponent: "CLE",
        result: "W",
        minutes: 35,
        points: 32,
        rebounds: 13,
        assists: 4,
        steals: 0,
        blocks: 2
      },
      {
        date: "2023-11-18",
        opponent: "ATL",
        result: "W",
        minutes: 33,
        points: 35,
        rebounds: 8,
        assists: 6,
        steals: 2,
        blocks: 1
      },
      {
        date: "2023-11-15",
        opponent: "BOS",
        result: "L",
        minutes: 38,
        points: 30,
        rebounds: 12,
        assists: 3,
        steals: 1,
        blocks: 4
      },
      {
        date: "2023-11-13",
        opponent: "IND",
        result: "W",
        minutes: 34,
        points: 42,
        rebounds: 10,
        assists: 5,
        steals: 0,
        blocks: 2
      }
    ]
  },
  {
    id: "7",
    firstName: "Jayson",
    lastName: "Tatum",
    number: 0,
    position: "SF",
    height: "6'8\"",
    weight: 210,
    age: 25,
    experience: 6,
    college: "Duke",
    image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1628369.png",
    status: "Active",
    stats: {
      ppg: 30.1,
      rpg: 8.8,
      apg: 4.6,
      spg: 1.1,
      bpg: 0.7,
      fg: 0.466,
      threePt: 0.375,
      ft: 0.855,
      mpg: 37.6,
      topg: 2.9
    },
    hotZones: ["Right Wing", "Left Elbow", "Top of Key"],
    strengths: ["Scoring", "Two-way play", "Rebounding", "Versatility"],
    weaknesses: ["Playmaking", "Shot selection"],
    notes: "All-NBA talent. Can guard multiple positions. Working on improving playmaking skills.",
    contract: {
      years: 5,
      amount: 195.6,
      signed: "2022-07-01",
      expires: "2028-06-30"
    },
    lastFiveGames: [
      {
        date: "2023-12-01",
        opponent: "NYK",
        result: "W",
        minutes: 38,
        points: 32,
        rebounds: 9,
        assists: 5,
        steals: 2,
        blocks: 1
      },
      {
        date: "2023-11-29",
        opponent: "CHI",
        result: "W",
        minutes: 36,
        points: 28,
        rebounds: 11,
        assists: 4,
        steals: 1,
        blocks: 0
      },
      {
        date: "2023-11-27",
        opponent: "CLE",
        result: "W",
        minutes: 39,
        points: 35,
        rebounds: 8,
        assists: 6,
        steals: 0,
        blocks: 1
      },
      {
        date: "2023-11-24",
        opponent: "ORL",
        result: "L",
        minutes: 40,
        points: 26,
        rebounds: 10,
        assists: 3,
        steals: 2,
        blocks: 0
      },
      {
        date: "2023-11-22",
        opponent: "MIL",
        result: "W",
        minutes: 37,
        points: 31,
        rebounds: 7,
        assists: 5,
        steals: 1,
        blocks: 2
      }
    ]
  },
  {
    id: "8",
    firstName: "Ja",
    lastName: "Morant",
    number: 12,
    position: "PG",
    height: "6'3\"",
    weight: 174,
    age: 24,
    experience: 4,
    college: "Murray State",
    image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1629630.png",
    status: "Suspended",
    stats: {
      ppg: 26.2,
      rpg: 5.9,
      apg: 8.1,
      spg: 1.1,
      bpg: 0.3,
      fg: 0.474,
      threePt: 0.302,
      ft: 0.741,
      mpg: 31.9,
      topg: 3.4
    },
    hotZones: ["Paint", "Restricted Area", "Transition"],
    strengths: ["Athleticism", "Finishing", "Playmaking", "Speed"],
    weaknesses: ["Outside shooting", "Off-ball defense"],
    notes: "Suspended for team rule violation. Eligible to return next week. Explosive athlete with elite finishing ability.",
    contract: {
      years: 5,
      amount: 193.0,
      signed: "2022-07-01",
      expires: "2028-06-30"
    },
    lastFiveGames: [
      {
        date: "2023-11-15",
        opponent: "LAL",
        result: "W",
        minutes: 32,
        points: 28,
        rebounds: 6,
        assists: 10,
        steals: 2,
        blocks: 0
      },
      {
        date: "2023-11-13",
        opponent: "SAC",
        result: "L",
        minutes: 35,
        points: 30,
        rebounds: 5,
        assists: 8,
        steals: 1,
        blocks: 0
      },
      {
        date: "2023-11-10",
        opponent: "UTA",
        result: "W",
        minutes: 30,
        points: 24,
        rebounds: 4,
        assists: 12,
        steals: 3,
        blocks: 1
      },
      {
        date: "2023-11-08",
        opponent: "POR",
        result: "W",
        minutes: 33,
        points: 32,
        rebounds: 7,
        assists: 9,
        steals: 0,
        blocks: 0
      },
      {
        date: "2023-11-06",
        opponent: "DEN",
        result: "L",
        minutes: 36,
        points: 27,
        rebounds: 6,
        assists: 7,
        steals: 2,
        blocks: 0
      }
    ]
  },
  {
    id: "9",
    firstName: "Anthony",
    lastName: "Edwards",
    number: 1,
    position: "SG",
    height: "6'4\"",
    weight: 225,
    age: 22,
    experience: 3,
    college: "Georgia",
    image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1630162.png",
    status: "Active",
    stats: {
      ppg: 25.9,
      rpg: 5.4,
      apg: 5.1,
      spg: 1.6,
      bpg: 0.5,
      fg: 0.459,
      threePt: 0.368,
      ft: 0.832,
      mpg: 35.7,
      topg: 3.1
    },
    hotZones: ["Right Wing", "Paint", "Top of Key"],
    strengths: ["Athleticism", "Scoring", "On-ball defense", "Confidence"],
    weaknesses: ["Shot selection", "Playmaking consistency"],
    notes: "Rising superstar. Explosive athlete with improving shooting range. Becoming a leader on both ends.",
    contract: {
      years: 5,
      amount: 204.0,
      signed: "2023-07-01",
      expires: "2029-06-30"
    },
    lastFiveGames: [
      {
        date: "2023-12-01",
        opponent: "UTA",
        result: "W",
        minutes: 36,
        points: 31,
        rebounds: 6,
        assists: 5,
        steals: 2,
        blocks: 1
      },
      {
        date: "2023-11-29",
        opponent: "OKC",
        result: "L",
        minutes: 38,
        points: 28,
        rebounds: 4,
        assists: 7,
        steals: 3,
        blocks: 0
      },
      {
        date: "2023-11-27",
        opponent: "SAS",
        result: "W",
        minutes: 34,
        points: 30,
        rebounds: 5,
        assists: 4,
        steals: 1,
        blocks: 0
      },
      {
        date: "2023-11-24",
        opponent: "SAC",
        result: "W",
        minutes: 37,
        points: 26,
        rebounds: 7,
        assists: 6,
        steals: 2,
        blocks: 1
      },
      {
        date: "2023-11-22",
        opponent: "NOP",
        result: "L",
        minutes: 35,
        points: 24,
        rebounds: 5,
        assists: 3,
        steals: 1,
        blocks: 0
      }
    ]
  },
  {
    id: "10",
    firstName: "Victor",
    lastName: "Wembanyama",
    number: 1,
    position: "PF",
    height: "7'4\"",
    weight: 210,
    age: 19,
    experience: 0,
    college: "Metropolitans 92",
    image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1641705.png",
    status: "Active",
    stats: {
      ppg: 19.2,
      rpg: 9.5,
      apg: 2.6,
      spg: 1.2,
      bpg: 2.9,
      fg: 0.435,
      threePt: 0.325,
      ft: 0.805,
      mpg: 30.2,
      topg: 2.8
    },
    hotZones: ["Paint", "Top of Key", "Right Wing"],
    strengths: ["Shot blocking", "Length", "Shooting touch", "Versatility"],
    weaknesses: ["Strength", "Post play", "Experience"],
    notes: "Generational talent. Unique combination of size, skill and mobility. Still developing physically.",
    contract: {
      years: 4,
      amount: 55.2,
      signed: "2023-07-01",
      expires: "2027-06-30"
    },
    lastFiveGames: [
      {
        date: "2023-12-01",
        opponent: "NOP",
        result: "L",
        minutes: 32,
        points: 22,
        rebounds: 10,
        assists: 3,
        steals: 1,
        blocks: 4
      },
      {
        date: "2023-11-29",
        opponent: "DEN",
        result: "L",
        minutes: 30,
        points: 18,
        rebounds: 8,
        assists: 2,
        steals: 0,
        blocks: 5
      },
      {
        date: "2023-11-27",
        opponent: "LAL",
        result: "L",
        minutes: 33,
        points: 21,
        rebounds: 12,
        assists: 1,
        steals: 2,
        blocks: 3
      },
      {
        date: "2023-11-24",
        opponent: "GSW",
        result: "W",
        minutes: 31,
        points: 25,
        rebounds: 8,
        assists: 4,
        steals: 1,
        blocks: 6
      },
      {
        date: "2023-11-22",
        opponent: "LAC",
        result: "L",
        minutes: 29,
        points: 16,
        rebounds: 9,
        assists: 3,
        steals: 0,
        blocks: 4
      }
    ]
  }
];

export default players;