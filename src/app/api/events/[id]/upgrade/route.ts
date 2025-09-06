import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  EventUpgradeSchema,
  SUBSCRIPTION_TIERS,
  calculateEventPrice,
} from "@/lib/validations/event";
import { z } from "zod";

// POST /api/events/[id]/upgrade - Upgrade event package
export async function POST(
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

    // Validate input
    const validatedData = EventUpgradeSchema.parse({
      ...body,
      eventId,
    });

    // Check if event exists and user owns it
    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select(
        "id, subscription_tier, has_video_addon, status, total_photos, total_videos",
      )
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

      console.error("Error fetching event for upgrade:", fetchError);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: "Failed to fetch event" },
        },
        { status: 500 },
      );
    }

    // Don't allow upgrades to expired events
    if (existingEvent.status === "expired") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EVENT_EXPIRED",
            message: "Cannot upgrade expired events",
          },
        },
        { status: 400 },
      );
    }

    const currentTier =
      existingEvent.subscription_tier as keyof typeof SUBSCRIPTION_TIERS;
    const newTier = validatedData.newTier;

    // Check if it's actually an upgrade
    const tierOrder = ["free", "basic", "standard", "premium", "pro"];
    const currentTierIndex = tierOrder.indexOf(currentTier);
    const newTierIndex = tierOrder.indexOf(newTier);

    if (newTierIndex <= currentTierIndex) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_AN_UPGRADE",
            message: "New tier must be higher than current tier",
          },
        },
        { status: 400 },
      );
    }

    // Check if current usage exceeds new tier limits
    const newTierLimits = SUBSCRIPTION_TIERS[newTier];
    if (existingEvent.total_photos > newTierLimits.maxPhotos) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USAGE_EXCEEDS_LIMIT",
            message: `Current photo count (${existingEvent.total_photos}) exceeds new tier limit (${newTierLimits.maxPhotos})`,
            details: {
              currentPhotos: existingEvent.total_photos,
              newLimit: newTierLimits.maxPhotos,
            },
          },
        },
        { status: 400 },
      );
    }

    // Calculate upgrade cost
    const currentPrice = calculateEventPrice(
      currentTier,
      existingEvent.has_video_addon,
    );
    const newPrice = calculateEventPrice(newTier, validatedData.hasVideoAddon);
    const upgradeCost = newPrice - currentPrice;

    if (upgradeCost <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_UPGRADE_COST",
            message: "No additional cost for this upgrade",
          },
        },
        { status: 400 },
      );
    }

    // Create payment record
    const paymentData = {
      event_id: eventId,
      user_id: user.id,
      amount_cents: upgradeCost * 100, // Convert to centavos
      currency: "PHP",
      payment_method: validatedData.paymentMethod,
      payment_provider: "paymongo",
      external_payment_id: `upgrade_${eventId}_${Date.now()}`, // Temporary ID
      status: "pending",
      tier_purchased: newTier,
      has_video_addon: validatedData.hasVideoAddon,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert(paymentData)
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Failed to create payment record",
          },
        },
        { status: 500 },
      );
    }

    // TODO: Integrate with PayMongo for actual payment processing
    // For now, we'll simulate a successful payment and upgrade the event

    // Update event with new tier
    const eventUpdateData = {
      subscription_tier: newTier,
      has_video_addon: validatedData.hasVideoAddon,
      max_photos: newTierLimits.maxPhotos,
      max_photos_per_user: newTierLimits.maxPhotosPerUser,
      storage_days: newTierLimits.storageDays,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedEvent, error: updateError } = await supabase
      .from("events")
      .update(eventUpdateData)
      .eq("id", eventId)
      .eq("host_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating event tier:", updateError);
      return NextResponse.json(
        {
          success: false,
          error: { code: "DATABASE_ERROR", message: "Failed to upgrade event" },
        },
        { status: 500 },
      );
    }

    // Update payment status to paid
    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (paymentUpdateError) {
      console.error("Error updating payment status:", paymentUpdateError);
      // Don't fail the request, but log the error
    }

    return NextResponse.json({
      success: true,
      data: {
        event: updatedEvent,
        payment: {
          ...payment,
          status: "paid",
          paid_at: new Date().toISOString(),
        },
        upgradeCost,
        newTierLimits,
      },
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

    console.error("Unexpected error in POST /api/events/[id]/upgrade:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
      },
      { status: 500 },
    );
  }
}
