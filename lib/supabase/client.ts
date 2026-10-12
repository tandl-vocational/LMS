import { createClient } from "@supabase/supabase-js";

// Next.js (NEXT_PUBLIC_*) および Vite (VITE_*) の両方に対応
const getEnvVar = (key: string): string => {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  // Vite 環境下
  if (typeof import.meta !== "undefined" && (import.meta as any).env) {
    return (import.meta as any).env[key] || "";
  }
  return "";
};

const supabaseUrl =
  getEnvVar("NEXT_PUBLIC_SUPABASE_URL") ||
  getEnvVar("VITE_SUPABASE_URL") ||
  "https://placeholder-project.supabase.co";

const supabaseAnonKey =
  getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
  getEnvVar("VITE_SUPABASE_ANON_KEY") ||
  "placeholder-anon-key";

export const createClientComponentClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

export const supabase = createClientComponentClient();
