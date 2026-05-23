import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (typeof extra.apiUrl === "string" ? extra.apiUrl : "") ||
  "http://127.0.0.1:8000";

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  (typeof extra.supabaseUrl === "string" ? extra.supabaseUrl : "");

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  (typeof extra.supabaseAnonKey === "string" ? extra.supabaseAnonKey : "");
