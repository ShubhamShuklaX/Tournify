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
  const fetchProfileWithRetry = async (userId, retries = 5, delay = 800) => {
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

    console.warn("⚠️ Profile not found after retries.");
    setLoading(false);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // ✅ 1. Load session on startup
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) console.error("Error getting session:", error);

        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfileWithRetry(session.user.id);
        } else {
          setLoading(false);
        }

        // ✅ 2. Listen for auth state changes (login, logout, token refresh)
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("🔄 Auth state changed:", event);
          setUser(session?.user ?? null);

          if (session?.user) {
            await fetchProfileWithRetry(session.user.id);
          } else {
            setProfile(null);
            setLoading(false);
          }
        });

        // ✅ 3. Cleanup listener
        return () => subscription.unsubscribe();
      } catch (err) {
        console.error("Auth initialization error:", err);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ✅ Sign Up (with metadata)
  const signUp = async (email, password, name, role) => {
    console.log("🔍 SignUp called with:", { email, name, role });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name, role },
      },
    });

    console.log("✅ Auth signup result:", data);

    if (!error && data.user) {
      console.log("📝 Creating profile manually for:", data.user.id);

      // Wait a bit to avoid trigger timing issue
      await new Promise((r) => setTimeout(r, 600));

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email,
          name,
          role,
        },
        { onConflict: "id" }
      );

      if (profileError) {
        console.error("❌ Profile creation error:", profileError);
      } else {
        console.log("✅ Profile created successfully");
      }
    }

    return { data, error };
  };

  // ✅ Sign In (handle refresh safely)
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("✅ SignIn success:", data.user);
      setUser(data.user);
      await fetchProfileWithRetry(data.user.id);
      return { data, error: null };
    } catch (err) {
      console.error("❌ SignIn failed:", err.message);
      return { data: null, error: err };
    }
  };

  // ✅ Sign Out (clear session + state)
  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("supabase.auth.token"); // 👈 Clears invalid tokens
    setUser(null);
    setProfile(null);
  };

  const value = { user, profile, loading, signUp, signIn, signOut };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen text-gray-600">
          Loading authentication...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
