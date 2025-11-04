import { supabase } from "@/lib/supabase";

export const getChildren = async () => {
  const { data, error } = await supabase.from("children").select("id, full_name");
  if (error) throw error;
  return data;
};
