import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Couple = {
  id: string;
  user1_id: string;
  user2_id: string;
  relationship_start_date: string;
  couple_name?: string;
  created_at: string;
  updated_at: string;
};

export function useCouple(coupleId: string | null) {
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coupleId) {
      setLoading(false);
      return;
    }

    const fetchCouple = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("couples")
          .select("*")
          .eq("id", coupleId)
          .single();

        if (error) throw error;
        setCouple(data as Couple);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch couple");
      } finally {
        setLoading(false);
      }
    };

    fetchCouple();
  }, [coupleId]);

  return {
    couple,
    loading,
    error,
  };
}
