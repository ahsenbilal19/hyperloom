import { createClient } from "@supabase/supabase-js";

// SERVER ONLY: uses the secret key. Never import this in a client component.
export const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});