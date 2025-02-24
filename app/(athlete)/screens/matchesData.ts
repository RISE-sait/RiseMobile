import dayjs from "dayjs";

export interface MatchDetails {
  id: string;
  date: string; // YYYY-MM-DD format
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  league: string;
  status: "Upcoming" | "Finished" | "Live";
  location: string;
  description: string;
  homeLogo?: string;
  awayLogo?: string;
  bgImage?: string;
  type: "match";
}

export const mockMatches: MatchDetails[] = [
  {
    id: "1",
    date: dayjs().format("YYYY-MM-DD"),
    homeTeam: "LA Lakers",
    awayTeam: "Golden State Warriors",
    homeScore: 110,
    awayScore: 104,
    league: "NBA",
    status: "Finished",
    location: "Staples Center, Los Angeles",
    description:
      "LeBron James led the Lakers to a thrilling victory, delivering clutch plays in the final minutes against Steph Curry's Warriors.",
      homeLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/2560px-Los_Angeles_Lakers_logo.svg.png",
      awayLogo: "https://upload.wikimedia.org/wikipedia/sco/thumb/0/01/Golden_State_Warriors_logo.svg/1676px-Golden_State_Warriors_logo.svg.png",
      bgImage: "https://img.freepik.com/premium-photo/large-basketball-arena-with-copy-space-promotional-use_641503-104219.jpg",
      type: "match",
  },
  {
    id: "2",
    date: dayjs().add(2, "day").format("YYYY-MM-DD"),
    homeTeam: "Boston Celtics",
    awayTeam: "Miami Heat",
    homeScore: 0,
    awayScore: 0,
    league: "NBA",
    status: "Upcoming",
    location: "TD Garden, Boston",
    description:
      "Eastern Conference rivals, the Celtics and Heat, face off in a highly anticipated matchup.",
    homeLogo: "https://www.pngall.com/wp-content/uploads/13/Celtics-Logo-PNG-Pic.png",
    awayLogo: "https://s.yimg.com/cv/apiv2/default/nba/20181219/500x500/heat_wbgs.png",
    bgImage: "https://img.freepik.com/premium-photo/large-basketball-arena-with-copy-space-promotional-use_641503-104219.jpg",
    type: "match",
},
  {
    id: "3",
    date: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    homeTeam: "Brooklyn Nets",
    awayTeam: "Chicago Bulls",
    homeScore: 98,
    awayScore: 95,
    league: "NBA",
    status: "Live",
    location: "Barclays Center, Brooklyn",
    description:
      "The Nets and Bulls are in an intense fourth-quarter battle, with both teams trading baskets in this closely contested game.",
    homeLogo: "https://i.ebayimg.com/images/g/z3cAAOSwwUViY1Gw/s-l400.png",
    awayLogo: "https://logos-world.net/wp-content/uploads/2020/05/Chicago-Bulls-Symbol.png",
    bgImage: "https://img.freepik.com/premium-photo/large-basketball-arena-with-copy-space-promotional-use_641503-104219.jpg",
    type: "match",
},
];
