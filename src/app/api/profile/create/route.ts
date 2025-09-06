import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        },
        { status: 401 },
      );
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        data: existingProfile,
        message: "Profile already exists",
      });
    }

    // Create new profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || null,
        subscription_tier: "free",
        subscription_status: "active",
        user_type: "guest",
      })
      .select()
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PROFILE_CREATION_FAILED",
            message: profileError.message,
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
      message: "Profile created successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 },
    );
  }
}
