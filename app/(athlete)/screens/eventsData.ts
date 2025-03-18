export interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  image: string
  organizer: string
  category: string
}

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Summer Basketball Tournament",
    description:
      "Join us for our annual summer basketball tournament featuring teams from across the region. Compete for prizes and recognition!",
    date: "2025-07-15",
    time: "9:00 AM - 6:00 PM",
    location: "Main Arena, RISE Facility",
    image:
      "https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    organizer: "RISE Basketball",
    category: "Tournament",
  },
  {
    id: "2",
    title: "Pro Skills Training Camp",
    description:
      "Intensive training camp led by professional coaches. Improve your skills, learn new techniques, and take your game to the next level.",
    date: new Date().toISOString().split("T")[0], // Today's date
    time: "4:00 PM - 7:00 PM",
    location: "Training Court, RISE Facility",
    image:
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
    organizer: "Elite Training Group",
    category: "Training",
  },
  {
    id: "3",
    title: "Youth Development Workshop",
    description:
      "Special workshop focused on youth basketball development. Parents and coaches welcome to observe and learn.",
    date: "2025-04-10", // Past date
    time: "10:00 AM - 1:00 PM",
    location: "Community Center, RISE Facility",
    image:
      "https://images.unsplash.com/photo-1518063319789-7217e6706b04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    organizer: "Youth Basketball Association",
    category: "Workshop",
  },
  {
    id: "4",
    title: "3-on-3 Street Ball Competition",
    description: "Urban-style 3-on-3 basketball competition with music, food, and prizes. Register your team now!",
    date: "2025-05-05", // Future date
    time: "5:00 PM - 10:00 PM",
    location: "Outdoor Courts, RISE Facility",
    image:
    "https://images.unsplash.com/photo-1518063319789-7217e6706b04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    organizer: "Street Ball League",
    category: "Competition",
  },
  {
    id: "5",
    title: "Basketball Conditioning Camp",
    description:
      "Focus on physical conditioning specifically for basketball players. Improve your endurance, strength, and agility.",
    date: "2024-12-22", // Future date
    time: "8:00 AM - 11:00 AM",
    location: "Fitness Center, RISE Facility",
    image:
      "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80",
    organizer: "Performance Athletics",
    category: "Training",
  },
]

