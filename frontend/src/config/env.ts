export const env = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || "http://localhost:8000",
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID || "",
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
} as const;

