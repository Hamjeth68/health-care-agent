import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config";
import { secureStoreAdapter } from "./secureStoreAdapter";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = createClient(
  SUPABASE_URL || "https://example.supabase.co",
  SUPABASE_ANON_KEY || "missing-key",
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
      storage: secureStoreAdapter
    }
  }
);
