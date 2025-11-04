
import { supabase } from './supabase';

// Fetch dashboard metrics
const MOCK = {
  activePrograms: 2,
  enrolledChildren: 124,
  pendingAssessments: 6,
  upcomingSessions: 4,
  recentPrograms: [
    { id: "p1", name: "Community Batch A", abbr: "A", site: "Community Park", children: 28 },
    { id: "p2", name: "School Aftercare B", abbr: "B", site: "Govt School", children: 21 }
  ],
  coachWorkload: [
    { coach: "c1", coachName: "You", sessions: 4, hours: 6, utilization: 75 },
    { coach: "c2", coachName: "Aman", sessions: 3, hours: 4.5, utilization: 55 }
  ],
  attendanceSnapshot: [
    { session_id: "s1", title: "Park Session 1", site: "Community Park", time: "16:00 - 17:30", present: 18, total: 22 },
    { session_id: "s2", title: "School Batch A", site: "Govt School", time: "15:30 - 17:00", present: 14, total: 18 }
  ]
};

// Fetch coaches
export async function getCoaches() {
  const { data, error } = await supabase
    .from('coaches') // replace with your table
    .select('*');

  if (error) throw error;
  return data;
}



export async function fetchCoachDashboard() {
  // For UI work, we just return MOCK with a tiny delay to simulate loading.
  return new Promise((resolve) => setTimeout(() => resolve(MOCK), 220));
}