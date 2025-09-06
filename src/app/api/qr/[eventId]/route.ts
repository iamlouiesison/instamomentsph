import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateEventQRCode,
  generateEventQRCodePrint,
  generateQRCodeSVG,
} from "@/lib/qr-code";
import { Event } from "@/types/database";

// GET /api/qr/[eventId] - Generate QR code for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await params;
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const format = searchParams.get("format") || "png"; // png, svg, print
    const size = searchParams.get("size") || "512"; // Default to 512x512
    const branded = searchParams.get("branded") === "true";

    // Validate event ID
    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_EVENT_ID", message: "Invalid event ID" },
        },
        { status: 400 },
      );
    }

    // Get Supabase client
    const supabase = await createClient();

    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      console.error("Event fetch error:", eventError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EVENT_NOT_FOUND",
            message: "Event not found",
            details: eventError?.message || "No event found with this ID",
          },
        },
        { status: 404 },
      );
    }

    // Check if event is active (if status column exists)
    if (event.status && event.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EVENT_INACTIVE",
            message: "Event is not active",
          },
        },
        { status: 410 },
      );
    }

    // Generate QR code based on format
    let qrCodeData: string | Buffer;
    let contentType: string;
    let filename: string;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const eventSlug = event.gallery_slug;

    switch (format.toLowerCase()) {
      case "svg":
        qrCodeData = await generateQRCodeSVG(
          `${baseUrl}/gallery/${eventSlug}`,
          {
            size: parseInt(size),
            color: branded
              ? {
                  dark: getEventTypeColor(event.event_type),
                  light: "#FFFFFF",
                }
              : undefined,
          },
        );
        contentType = "image/svg+xml";
        filename = `qr-${eventSlug}.svg`;
        break;

      case "print":
        qrCodeData = await generateEventQRCodePrint(event, baseUrl);
        contentType = "image/png";
        filename = `qr-${eventSlug}-print.png`;
        break;

      case "png":
      default:
        if (branded) {
          qrCodeData = await generateEventQRCode(
            event,
            {
              size: parseInt(size),
              color: {
                dark: getEventTypeColor(event.event_type),
                light: "#FFFFFF",
              },
            },
            baseUrl,
          );
        } else {
          qrCodeData = await generateEventQRCode(
            event,
            {
              size: parseInt(size),
            },
            baseUrl,
          );
        }
        contentType = "image/png";
        filename = `qr-${eventSlug}.png`;
        break;
    }

    // Return QR code as response
    const headers = new Headers({
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      "Access-Control-Allow-Origin": "*",
    });

    if (typeof qrCodeData === "string") {
      // If it's a data URL, convert it to binary
      if (qrCodeData.startsWith("data:")) {
        const base64Data = qrCodeData.split(",")[1];
        const binaryData = Buffer.from(base64Data, "base64");
        return new NextResponse(binaryData, { headers });
      } else {
        // If it's SVG or other text format
        return new NextResponse(qrCodeData, { headers });
      }
    } else {
      // If it's already binary data
      return new NextResponse(qrCodeData, { headers });
    }
  } catch (error) {
    console.error("QR Code generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "QR_GENERATION_ERROR",
          message: "Failed to generate QR code",
        },
      },
      { status: 500 },
    );
  }
}

// POST /api/qr/[eventId] - Track QR code scan analytics
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await params;
    const body = await request.json();
    const { userAgent, ipAddress } = body;

    // Validate event ID
    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_EVENT_ID", message: "Invalid event ID" },
        },
        { status: 400 },
      );
    }

    // Get Supabase client
    const supabase = await createClient();

    // Verify event exists and is active
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, status")
      .eq("id", eventId)
      .eq("status", "active")
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EVENT_NOT_FOUND",
            message: "Event not found or inactive",
          },
        },
        { status: 404 },
      );
    }

    // Track QR code scan analytics
    const { error: analyticsError } = await supabase
      .from("analytics_events")
      .insert({
        event_id: eventId,
        event_type: "qr_scan",
        properties: {
          user_agent: userAgent,
          ip_address: ipAddress,
          timestamp: new Date().toISOString(),
        },
        user_agent: userAgent,
        ip_address: ipAddress,
      });

    if (analyticsError) {
      console.error("Analytics tracking error:", analyticsError);
      // Don't fail the request if analytics fails
    }

    return NextResponse.json({
      success: true,
      data: {
        eventId,
        galleryUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/gallery/${(event as Event).gallery_slug}`,
      },
    });
  } catch (error) {
    console.error("QR Code analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "ANALYTICS_ERROR", message: "Failed to track QR scan" },
      },
      { status: 500 },
    );
  }
}

// Helper function to get event type colors
function getEventTypeColor(eventType: Event["event_type"]): string {
  const eventColors = {
    wedding: "#8B5A3C", // Warm brown
    birthday: "#E91E63", // Pink
    debut: "#9C27B0", // Purple
    graduation: "#4CAF50", // Green
    anniversary: "#FF5722", // Orange-red
    corporate: "#607D8B", // Blue-grey
    other: "#2196F3", // Blue
  };

  return eventColors[eventType] || eventColors.other;
}
