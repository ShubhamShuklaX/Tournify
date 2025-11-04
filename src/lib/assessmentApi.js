import { supabase } from "@/lib/supabase";

export const saveAssessment = async (data) => {
  try {
    const { error } = await supabase.from("assessments").insert([data]);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error saving assessment:", error);
    return { success: false, error };
  }
};
