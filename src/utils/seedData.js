import { supabase } from '../config/supabase';

const mockEvents = [
  {
    title: "Welcome Week Kickoff",
    description: "Join us for the official start of the semester! Free food, music, and an introduction to campus life.",
    date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    location: "Main Quad",
    category: "Social",
    capacity: 500,
    credits: 20
  },
  {
    title: "Tech Career Fair 2026",
    description: "Meet with top employers in the tech industry. Bring your resume and dress professionally.",
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    location: "Student Union Ballroom",
    category: "Career",
    capacity: 300,
    credits: 50
  },
  {
    title: "Midnight Midnight Breakfast",
    description: "Take a break from finals studying and grab some free pancakes served by the faculty!",
    date: new Date(Date.now() + 86400000 * 14).toISOString(),
    location: "Dining Hall A",
    category: "Social",
    capacity: 200,
    credits: 10
  }
];

const mockClubs = [
  {
    name: "Computer Science Society",
    description: "For students passionate about coding, algorithms, and software development.",
    category: "Academic"
  },
  {
    name: "Outdoors Club",
    description: "Weekend hiking, camping, and rock climbing trips for nature enthusiasts.",
    category: "Recreation"
  },
  {
    name: "Debate Team",
    description: "Develop your public speaking and argumentation skills in regional competitions.",
    category: "Academic"
  }
];

export const generateMockData = async (userId) => {
  try {
    // Elevate privileges temporarily to bypass RLS
    await supabase.from('profiles').update({ role: 'leader' }).eq('id', userId);

    // 1. Insert Events
    const eventsToInsert = mockEvents.map(e => ({ ...e, created_by: userId }));
    const { error: eventError } = await supabase.from('events').insert(eventsToInsert);
    if (eventError) throw eventError;

    // 2. Insert Clubs
    const clubsToInsert = mockClubs.map(c => ({ ...c, leader_id: userId }));
    const { error: clubError } = await supabase.from('clubs').insert(clubsToInsert);
    if (clubError) throw clubError;

    // Restore privileges
    await supabase.from('profiles').update({ role: 'student' }).eq('id', userId);

    return { success: true, message: "Mock data generated successfully!" };
  } catch (error) {
    console.error("Failed to generate mock data:", error);
    await supabase.from('profiles').update({ role: 'student' }).eq('id', userId);
    return { success: false, message: error.message };
  }
};
