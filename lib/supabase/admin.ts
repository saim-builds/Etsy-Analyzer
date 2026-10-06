import "server-only";
import { createClient } from "@supabase/supabase-js";

// Bypasses row level security. Use only in trusted server code.
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key) throw new Error("Supabase admin credentials are missing");
    return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}