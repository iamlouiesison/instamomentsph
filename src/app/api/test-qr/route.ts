import { NextRequest, NextResponse } from 'next/server';
import { generateQRCodeDataUrl, generateQRCodeSVG } from '@/lib/qr-code';

// GET /api/test-qr - Generate QR code for testing without database dependency
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const format = searchParams.get('format') || 'png'; // png, svg
    const size = searchParams.get('size') || '256';
    const text =
      searchParams.get('text') || 'https://instamoments.ph/gallery/test-event';

    // Validate parameters
    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TEXT',
            message: 'Text parameter is required',
          },
        },
        { status: 400 }
      );
    }

    // Generate QR code based on format
    let qrCodeData: string | Buffer;
    let contentType: string;
    let filename: string;

    switch (format.toLowerCase()) {
      case 'svg':
        qrCodeData = await generateQRCodeSVG(text, {
          size: parseInt(size),
        });
        contentType = 'image/svg+xml';
        filename = 'test-qr.svg';
        break;

      case 'png':
      default:
        qrCodeData = await generateQRCodeDataUrl(text, {
          size: parseInt(size),
        });
        contentType = 'image/png';
        filename = 'test-qr.png';
        break;
    }

    // Return QR code as response
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*',
    });

    if (typeof qrCodeData === 'string') {
      return new NextResponse(qrCodeData, { headers });
    } else {
      return new NextResponse(qrCodeData, { headers });
    }
  } catch (error) {
    console.error('Test QR Code generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'QR_GENERATION_ERROR',
          message: 'Failed to generate test QR code',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
