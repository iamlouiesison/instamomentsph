import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Database } from "@/types/database";

export type User = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Require authentication for a route
 * Redirects to sign-in if user is not authenticated
 */
export async function requireAuth(): Promise<User> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/signin");
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    // If profile doesn't exist, redirect to complete profile
    redirect("/complete-profile");
  }

  return profile;
}

/**
 * Require event ownership for a specific event
 * Redirects to dashboard if user doesn't own the event
 */
export async function requireEventOwnership(eventId: string): Promise<User> {
  const user = await requireAuth();

  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", eventId)
    .single();

  if (error || !event || event.host_id !== user.id) {
    redirect("/dashboard");
  }

  return user;
}

/**
 * Get current user without redirecting
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return profile;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Redirect authenticated users away from auth pages
 */
export async function redirectIfAuthenticated(): Promise<void> {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }
}
