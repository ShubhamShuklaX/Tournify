import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to retry fetching until the profile exists
  const fetchProfileWithRetry = async (userId, retries = 5, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data);
        setLoading(false);
        return;
      }

      await new Promise((r) => setTimeout(r, delay));
    }

    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfileWithRetry(session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfileWithRetry(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // FIXED: signUp now accepts name and role
  const signUp = async (email, password, name, role) => {
    console.log("🔍 SignUp called with:", { email, name, role });

    // Sign up with metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          role: role,
        },
      },
    });

    console.log("✅ Auth signup result:", data);

    // The trigger will handle profile creation, but we can also manually create it
    if (!error && data.user) {
      console.log("📝 Creating profile manually for:", data.user.id);

      // Wait a moment for trigger to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Try to insert/update profile with correct data
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email: email,
          name: name,
          role: role,
        },
        {
          onConflict: "id",
        }
      );

      if (profileError) {
        console.error("❌ Profile creation error:", profileError);
      } else {
        console.log("✅ Profile created successfully");
      }
    }

    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const value = { user, profile, loading, signUp, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
