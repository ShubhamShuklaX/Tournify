import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log(
        "📱 Session check:",
        session ? "Authenticated" : "Not authenticated"
      );
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false); // ← Important: Stop loading if no session
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("❌ Error fetching profile:", error);
        setProfile(null);
      } else {
        console.log("✅ Profile fetched:", data);
        setProfile(data);
      }
    } catch (err) {
      console.error("❌ Exception fetching profile:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, name, role) => {
    console.log("🔍 SignUp called with:", { email, name, role });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log("✅ Auth signup result:", data);

    if (!error && data.user) {
      console.log("📝 About to create profile with:", {
        id: data.user.id,
        email,
        name,
        role,
      });

      // Try to insert the profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          email,
          name,
          role,
        })
        .select()
        .single();

      console.log("📊 Profile insert result:", { profileData, profileError });

      if (profileError) {
        console.error("❌ Profile creation error:", profileError);
      }
    }

    return { data, error };
  };

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
