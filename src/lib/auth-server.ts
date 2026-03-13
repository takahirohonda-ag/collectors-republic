import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/**
 * Get the current authenticated user from Supabase session cookies.
 * Returns null if not authenticated or Supabase is not configured.
 */
export async function getCurrentUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  const cookieStore = await cookies();
  const supabase = createClient(url, key, {
    global: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  return {
    id: user.id,
    email: user.email || "",
    username: user.user_metadata?.username || user.email?.split("@")[0] || "User",
  };
}
