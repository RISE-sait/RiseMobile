export interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    image: string;
    description: string;
  }
  
  // Mock API Data
  export const mockEvents: Event[] = [
    {
      id: "1",
      title: "Basketball Training Camp",
      date: "2025-01-15",
      time: "10:00 AM",
      location: "Main Court",
      image: "https://images.unsplash.com/photo-1602105155315-077e218d8654?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Join our exclusive training camp to sharpen your basketball skills with professional coaches.",
    },
    {
      id: "2",
      title: "Speed & Agility Workshop",
      date: "2025-03-20",
      time: "2:00 PM",
      location: "Training Field",
      image: "https://plus.unsplash.com/premium_photo-1685366454607-0faf2157945b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Improve your speed and agility with specialized drills from top trainers.",
    },
    {
      id: "3",
      title: "Nutrition for Athletes Seminar",
      date: "2025-03-25",
      time: "1:00 PM",
      location: "Conference Room",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Learn about proper nutrition and meal plans for peak athletic performance.",
    },
  ];
  