import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the user after successful authentication
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profile) {
          // Create a basic profile for new users
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email!,
              full_name:
                user.user_metadata?.full_name || user.user_metadata?.name || "",
              avatar_url:
                user.user_metadata?.avatar_url || user.user_metadata?.picture,
            });

          if (profileError) {
            console.error("Error creating profile:", profileError);
          }
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
