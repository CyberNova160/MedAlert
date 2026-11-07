import { createClient } from "@supabase/supabase-js";

// API routes must use the server-only service role key because the incidents
// table intentionally has RLS enabled and no public write policies.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && key);
export const supabase = isSupabaseConfigured ? createClient(url!, key!, {
  auth: { persistSession: false, autoRefreshToken: false }
}) : null;
