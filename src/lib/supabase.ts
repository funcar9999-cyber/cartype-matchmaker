import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://geqigxxxsrakopdhzskn.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlcWlneHh4c3Jha29wZGh6c2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NjYxMTksImV4cCI6MjA5OTI0MjExOX0.B001y0bu3JBjThZIY5Y05gi6CnLb3YugK6mqXS9wYMo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const DIAGNOSIS_DB_ID_KEY = "carbti:diagnosis:dbId";