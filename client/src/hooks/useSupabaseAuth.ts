import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signOut,
    isAuthenticated: !!user,
  };
}
