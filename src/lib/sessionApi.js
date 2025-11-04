import { supabase } from './supabase';

// Fetch sessions
export async function fetchSessions() {
  const { data, error } = await supabase.from('sessions').select('*').order('date', { ascending: true });
  if (error) console.error(error);
  return data || [];
}

// Add new session
export async function createSession(session) {
  const { data, error } = await supabase.from('sessions').insert([session]);
  if (error) console.error(error);
  return data;
}
