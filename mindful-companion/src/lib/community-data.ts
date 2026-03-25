// Simple mock community data (can be replaced with backend later)

export interface CommunityRoom {
  id: string;
  name: string;
  description: string;
}

export interface Message {
  id: string;
  user: string;
  text: string;
  time: string;
}

// 🧓 Rooms designed for seniors
export const rooms: CommunityRoom[] = [
  {
    id: "1",
    name: "Morning Walk Group",
    description: "Share your daily walks and stay active together 🌿",
  },
  {
    id: "2",
    name: "Health & Wellness",
    description: "Discuss health tips and routines 💊",
  },
  {
    id: "3",
    name: "Life Stories",
    description: "Share memories and experiences 📖",
  },
];

// 💬 Dummy messages per room
export const messagesByRoom: Record<string, Message[]> = {
  "1": [
    { id: "m1", user: "Ravi", text: "Went for a 2km walk today!", time: "8:10 AM" },
    { id: "m2", user: "Meena", text: "Nice! I did yoga this morning.", time: "8:30 AM" },
  ],
  "2": [
    { id: "m3", user: "Suresh", text: "Drinking warm water helps digestion.", time: "9:00 AM" },
  ],
  "3": [
    { id: "m4", user: "Lakshmi", text: "I remember my school days fondly ❤️", time: "7:45 PM" },
  ],
};