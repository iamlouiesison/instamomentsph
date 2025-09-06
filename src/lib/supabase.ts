// Legacy Supabase client - DEPRECATED
// Use the new client configurations in lib/supabase/ instead

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * @deprecated Use createClient() from lib/supabase/client.ts instead
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * @deprecated Use the test script in scripts/test-supabase.js instead
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from("_dummy_table_")
      .select("*")
      .limit(1);

    if (error && error.code === "PGRST116") {
      // This error is expected for a non-existent table, but it means the connection works
      return { success: true, message: "Supabase connection successful" };
    }

    return { success: true, message: "Supabase connection successful" };
  } catch (error) {
    return { success: false, message: `Connection failed: ${error}` };
  }
}
