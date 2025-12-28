import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";

describe("Supabase Connection", () => {
  it("should connect to Supabase with valid credentials", async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    expect(supabaseUrl).toBeDefined();
    expect(supabaseAnonKey).toBeDefined();

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase credentials not found");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test basic connection by fetching auth status
    const { data, error } = await supabase.auth.getSession();

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
