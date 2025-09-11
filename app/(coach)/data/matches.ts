import { Match } from '@/hooks/useMatchFIlters';

const mockMatches: Match[] = [
  {
    id: "1",
    date: "2023-12-01",
    homeTeam: "Lakers",
    awayTeam: "Celtics",
    homeTeamLogo: "https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg",
    awayTeamLogo: "https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg",
    homeScore: 108,
    awayScore: 102,
    homeFG: 48,
    awayFG: 45,
    homeRebounds: 42,
    awayRebounds: 38,
    homeAssists: 24,
    awayAssists: 22,
    status: "completed",
    venue: "Staples Center, Los Angeles",
    league: "NBA",
    mvp: {
      id: "1",
      name: "LeBron James",
      image: "https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png",
      points: 32,
      assists: 11,
      rebounds: 8
    },
    events: [
      {
        id: "e1",
        time: "12",
        teamId: "1",
        type: "goal",
        player: "LeBron James",
        description: "3-point jump shot"
      },
      {
        id: "e2",
        time: "24",
        teamId: "2",
        type: "foul",
        player: "Jayson Tatum",
        description: "Personal foul"
      },
      {
        id: "e3",
        time: "36",
        teamId: "1",
        type: "timeout",
        player: "Coach",
        description: "Team timeout"
      }
    ],
    highlights: [
      "https://example.com/highlight1.jpg",
      "https://example.com/highlight2.jpg",
      "https://example.com/highlight3.jpg"
    ]
  },
  {
    id: "2",
    date: "2023-12-05",
    homeTeam: "Warriors",
    awayTeam: "Nets",
    homeTeamLogo: "https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg",
    awayTeamLogo: "https://cdn.nba.com/logos/nba/1610612751/primary/L/logo.svg",
    homeScore: 115,
    awayScore: 110,
    homeFG: 52,
    awayFG: 49,
    homeRebounds: 40,
    awayRebounds: 35,
    homeAssists: 30,
    awayAssists: 25,
    status: "completed",
    venue: "Chase Center, San Francisco",
    league: "NBA",
    mvp: {
      id: "2",
      name: "Stephen Curry",
      image: "https://cdn.nba.com/headshots/nba/latest/1040x760/201939.png",
      points: 38,
      assists: 8,
      rebounds: 5
    }
  },
  {
    id: "3",
    date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    homeTeam: "Bucks",
    awayTeam: "76ers",
    homeTeamLogo: "https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg",
    awayTeamLogo: "https://cdn.nba.com/logos/nba/1610612755/primary/L/logo.svg",
    homeScore: 0,
    awayScore: 0,
    homeFG: 0,
    awayFG: 0,
    homeRebounds: 0,
    awayRebounds: 0,
    homeAssists: 0,
    awayAssists: 0,
    status: "scheduled",
    venue: "Fiserv Forum, Milwaukee",
    league: "NBA",
    mvp: {
      id: "3",
      name: "Giannis Antetokounmpo",
      image: "https://cdn.nba.com/headshots/nba/latest/1040x760/203507.png",
      points: 0,
      assists: 0,
      rebounds: 0
    }
  },
  {
    id: "4",
    date: new Date().toISOString(), // Today
    homeTeam: "Heat",
    awayTeam: "Knicks",
    homeTeamLogo: "https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg",
    awayTeamLogo: "https://cdn.nba.com/logos/nba/1610612752/primary/L/logo.svg",
    homeScore: 78,
    awayScore: 72,
    homeFG: 45,
    awayFG: 42,
    homeRebounds: 30,
    awayRebounds: 28,
    homeAssists: 18,
    awayAssists: 15,
    status: "in_progress",
    venue: "FTX Arena, Miami",
    league: "NBA",
    mvp: {
      id: "4",
      name: "Jimmy Butler",
      image: "https://cdn.nba.com/headshots/nba/latest/1040x760/202710.png",
      points: 22,
      assists: 5,
      rebounds: 7
    },
    events: [
      {
        id: "e4",
        time: "18",
        teamId: "4",
        type: "goal",
        player: "Jimmy Butler",
        description: "Driving layup"
      },
      {
        id: "e5",
        time: "22",
        teamId: "5",
        type: "foul",
        player: "Julius Randle",
        description: "Shooting foul"
      }
    ]
  },
  {
    id: "5",
    date: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
    homeTeam: "Suns",
    awayTeam: "Mavericks",
    homeTeamLogo: "https://cdn.nba.com/logos/nba/1610612756/primary/L/logo.svg",
    awayTeamLogo: "https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg",
    homeScore: 0,
    awayScore: 0,
    homeFG: 0,
    awayFG: 0,
    homeRebounds: 0,
    awayRebounds: 0,
    homeAssists: 0,
    awayAssists: 0,
    status: "scheduled",
    venue: "Footprint Center, Phoenix",
    league: "NBA",
    mvp: {
      id: "5",
      name: "Devin Booker",
      image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1626164.png",
      points: 0,
      assists: 0,
      rebounds: 0
    }
  },
  {
    id: "6",
    date: new Date().toISOString(), // Today
    homeTeam: "Nuggets",
    awayTeam: "Clippers",
    homeTeamLogo: "https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg",
    awayTeamLogo: "https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg",
    homeScore: 95,
    awayScore: 89,
    homeFG: 47,
    awayFG: 44,
    homeRebounds: 38,
    awayRebounds: 36,
    homeAssists: 22,
    awayAssists: 20,
    status: "in_progress",
    venue: "Ball Arena, Denver",
    league: "NBA",
    mvp: {
      id: "6",
      name: "Nikola Jokic",
      image: "https://cdn.nba.com/headshots/nba/latest/1040x760/203999.png",
      points: 28,
      assists: 12,
      rebounds: 14
    }
  },
  {
    id: "7",
    date: "2023-11-28",
    homeTeam: "Bulls",
    awayTeam: "Raptors",
    homeTeamLogo: "https://cdn.nba.com/logos/nba/1610612741/primary/L/logo.svg",
    awayTeamLogo: "https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg",
    homeScore: 98,
    awayScore: 104,
    homeFG: 43,
    awayFG: 46,
    homeRebounds: 34,
    awayRebounds: 36,
    homeAssists: 19,
    awayAssists: 24,
    status: "completed",
    venue: "United Center, Chicago",
    league: "NBA",
    mvp: {
      id: "7",
      name: "Pascal Siakam",
      image: "https://cdn.nba.com/headshots/nba/latest/1040x760/1627783.png",
      points: 26,
      assists: 7,
      rebounds: 9
    }
  },
  {
    id: "8",
    date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    homeTeamLogo: "https://media.api-sports.io/football/teams/541.png",
    awayTeamLogo: "https://media.api-sports.io/football/teams/529.png",
    homeScore: 0,
    awayScore: 0,
    homeFG: 0,
    awayFG: 0,
    homeRebounds: 0,
    awayRebounds: 0,
    homeAssists: 0,
    awayAssists: 0,
    status: "scheduled",
    venue: "Santiago Bernabéu, Madrid",
    league: "EuroLeague",
    mvp: {
      id: "8",
      name: "Sergio Llull",
      image: "https://media.euroleague.net/api/v1/images-42/6d/6d/6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d.jpg",
      points: 0,
      assists: 0,
      rebounds: 0
    }
  }
];

export default mockMatches;