import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { EventUpdateSchema } from "@/lib/validations/event";
import { z } from "zod";

// GET /api/events/[id] - Get specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 },
      );
    }

    const { id: eventId } = await params;

    // Validate UUID
    if (!z.string().uuid().safeParse(eventId).success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_ID", message: "Invalid event ID" },
        },
        { status: 400 },
      );
    }

    const { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("host_id", user.id) // Ensure user owns the event
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: { code: "NOT_FOUND", message: "Event not found" },
          },
          { status: 404 },
        );
      }

      console.error("Error fetching event:", error);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: "Failed to fetch event" },
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/events/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 },
    );
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 },
      );
    }

    const { id: eventId } = await params;
    const body = await request.json();

    // Validate UUID
    if (!z.string().uuid().safeParse(eventId).success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_ID", message: "Invalid event ID" },
        },
        { status: 400 },
      );
    }

    // Validate input (partial update)
    const updateSchema = EventUpdateSchema.omit({ id: true });
    const validatedData = updateSchema.parse(body);

    // Check if event exists and user owns it
    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("id, status")
      .eq("id", eventId)
      .eq("host_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: { code: "NOT_FOUND", message: "Event not found" },
          },
          { status: 404 },
        );
      }

      console.error("Error fetching event for update:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: "Failed to fetch event" },
        },
        { status: 500 },
      );
    }

    // Don't allow updates to expired events
    if (existingEvent.status === "expired") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EVENT_EXPIRED",
            message: "Cannot update expired events",
          },
        },
        { status: 400 },
      );
    }

    // Prepare update data with snake_case field names
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Convert camelCase to snake_case for database fields
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.eventType !== undefined)
      updateData.event_type = validatedData.eventType;
    if (validatedData.eventDate !== undefined) {
      updateData.event_date = new Date(validatedData.eventDate)
        .toISOString()
        .split("T")[0];
    }
    if (validatedData.location !== undefined)
      updateData.location = validatedData.location;
    if (validatedData.subscriptionTier !== undefined)
      updateData.subscription_tier = validatedData.subscriptionTier;
    if (validatedData.hasVideoAddon !== undefined)
      updateData.has_video_addon = validatedData.hasVideoAddon;
    if (validatedData.requiresModeration !== undefined)
      updateData.requires_moderation = validatedData.requiresModeration;
    if (validatedData.allowDownloads !== undefined)
      updateData.allow_downloads = validatedData.allowDownloads;
    if (validatedData.isPublic !== undefined)
      updateData.is_public = validatedData.isPublic;
    if (validatedData.customMessage !== undefined)
      updateData.custom_message = validatedData.customMessage;

    const { data: event, error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", eventId)
      .eq("host_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating event:", error);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: "Failed to update event" },
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: error.issues,
          },
        },
        { status: 400 },
      );
    }

    console.error("Unexpected error in PUT /api/events/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 },
    );
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 },
      );
    }

    const { id: eventId } = await params;

    // Validate UUID
    if (!z.string().uuid().safeParse(eventId).success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_ID", message: "Invalid event ID" },
        },
        { status: 400 },
      );
    }

    // Check if event exists and user owns it
    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("id, status, total_photos, total_videos")
      .eq("id", eventId)
      .eq("host_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: { code: "NOT_FOUND", message: "Event not found" },
          },
          { status: 404 },
        );
      }

      console.error("Error fetching event for deletion:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: "Failed to fetch event" },
        },
        { status: 500 },
      );
    }

    // Warn if event has content
    if (existingEvent.total_photos > 0 || existingEvent.total_videos > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EVENT_HAS_CONTENT",
            message:
              "Cannot delete event with photos or videos. Archive instead.",
            details: {
              photos: existingEvent.total_photos,
              videos: existingEvent.total_videos,
            },
          },
        },
        { status: 400 },
      );
    }

    // Delete event (cascade will handle related records)
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("host_id", user.id);

    if (error) {
      console.error("Error deleting event:", error);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: "Failed to delete event" },
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Event deleted successfully" },
    });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/events/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 },
    );
  }
}
