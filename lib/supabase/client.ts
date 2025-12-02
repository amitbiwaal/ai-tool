import { createBrowserClient } from "@supabase/ssr";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseBrowserClient() {
  // Check for environment variables dynamically
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables");
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}

// Create client dynamically instead of at module level
export const getSupabaseClient = () => createSupabaseBrowserClient();

// Keep the old export for backward compatibility but mark as deprecated
export const supabase = getSupabaseClient();

export const supabaseAdmin: SupabaseClient<any> | null = (() => {
  // Temporarily disabled for development without Supabase
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
})();

