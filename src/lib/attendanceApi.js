import { supabase } from './supabase';

// Fetch attendance for session
export async function fetchAttendance(sessionId) {
  const { data, error } = await supabase
    .from('attendance')
    .select('*, children(name)')
    .eq('session_id', sessionId);
  if (error) console.error(error);
  return data;
}

// Save attendance
export async function saveAttendance(sessionId, attendance) {
  const rows = Object.entries(attendance).map(([child_id, present]) => ({
    session_id: sessionId,
    child_id,
    present
  }));
  const { data, error } = await supabase.from('attendance').upsert(rows);
  if (error) console.error(error);
  return data;
}
