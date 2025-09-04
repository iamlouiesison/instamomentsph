'use client';

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Event } from '@/types/database';
import { FILIPINO_EVENT_TYPES } from '@/lib/validations/event';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

interface PrintQRPageProps {
  params: { eventId: string };
  searchParams: {
    layout?: 'simple' | 'detailed' | 'table-tent' | 'invitation';
    size?: 'small' | 'medium' | 'large';
  };
}

export default function PrintQRPage({
  params,
  searchParams,
}: PrintQRPageProps) {
  const { eventId } = params;
  const { layout = 'simple', size = 'medium' } = searchParams;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const supabase = createClient();

        const { data: eventData, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .eq('status', 'active')
          .single();

        if (error || !eventData) {
          notFound();
        }

        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  const eventTypeInfo = FILIPINO_EVENT_TYPES[event.event_type];
  const qrCodeUrl = `/api/qr/${event.id}?format=print&size=512&branded=true`;

  // Size configurations
  const sizeConfig = {
    small: { qrSize: 200, containerWidth: 'w-64' },
    medium: { qrSize: 300, containerWidth: 'w-80' },
    large: { qrSize: 400, containerWidth: 'w-96' },
  };

  const currentSize = sizeConfig[size];

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-after: always;
          }
          .print-container {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
          }
        }

        @page {
          margin: 0.5in;
          size: A4;
        }
      `}</style>

      {/* Print Button (hidden when printing) */}
      <div className="no-print fixed top-4 right-4 z-50">
        <button
          onClick={() => window.print()}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
        >
          🖨️ Print QR Code
        </button>
      </div>

      {/* Layout Selection */}
      {layout === 'simple' && (
        <div className="print-container">
          <div className={`${currentSize.containerWidth} text-center`}>
            {/* Event Info */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {event.name}
              </h1>
              {eventTypeInfo && (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">{eventTypeInfo.icon}</span>
                  <span className="text-lg text-gray-600">
                    {eventTypeInfo.label}
                  </span>
                </div>
              )}
              {event.event_date && (
                <p className="text-gray-600">
                  {format(new Date(event.event_date), 'MMMM d, yyyy')}
                </p>
              )}
              {event.location && (
                <p className="text-gray-600">{event.location}</p>
              )}
            </div>

            {/* QR Code */}
            <div className="mb-6">
              <img
                src={qrCodeUrl}
                alt={`QR Code for ${event.name}`}
                width={currentSize.qrSize}
                height={currentSize.qrSize}
                className="mx-auto border-2 border-gray-300"
              />
            </div>

            {/* Instructions */}
            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-semibold">Paano gamitin ang QR Code:</p>
              <ol className="text-left space-y-1">
                <li>1. Buksan ang camera ng inyong phone</li>
                <li>2. I-point ang camera sa QR code</li>
                <li>3. I-tap ang link na lalabas</li>
                <li>4. Mag-upload ng mga larawan at video!</li>
              </ol>
            </div>

            {/* Branding */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">InstaMoments.ph</p>
            </div>
          </div>
        </div>
      )}

      {layout === 'detailed' && (
        <div className="print-container">
          <div className="max-w-2xl w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {event.name}
              </h1>
              {eventTypeInfo && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-3xl">{eventTypeInfo.icon}</span>
                  <span className="text-xl text-gray-600">
                    {eventTypeInfo.label}
                  </span>
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
              {event.event_date && (
                <div>
                  <span className="font-semibold">Date:</span>
                  <p>{format(new Date(event.event_date), 'MMMM d, yyyy')}</p>
                </div>
              )}
              {event.location && (
                <div>
                  <span className="font-semibold">Location:</span>
                  <p>{event.location}</p>
                </div>
              )}
              <div>
                <span className="font-semibold">Plan:</span>
                <p className="capitalize">{event.subscription_tier}</p>
              </div>
              <div>
                <span className="font-semibold">Max Photos:</span>
                <p>{event.max_photos}</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center mb-8">
              <img
                src={qrCodeUrl}
                alt={`QR Code for ${event.name}`}
                width={400}
                height={400}
                className="mx-auto border-2 border-gray-300"
              />
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-lg mb-4">
                How to Share Your Photos:
              </h3>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                    1
                  </span>
                  <span>Open your phone&apos;s camera app</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                    2
                  </span>
                  <span>Point the camera at the QR code above</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                    3
                  </span>
                  <span>Tap the link that appears on your screen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                    4
                  </span>
                  <span>Upload your photos and videos from the event!</span>
                </li>
              </ol>
            </div>

            {/* Custom Message */}
            {event.custom_message && (
              <div className="bg-pink-50 p-4 rounded-lg mb-6">
                <p className="text-sm italic">
                  &quot;{event.custom_message}&quot;
                </p>
              </div>
            )}

            {/* Branding */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Powered by InstaMoments.ph
              </p>
            </div>
          </div>
        </div>
      )}

      {layout === 'table-tent' && (
        <div className="print-container">
          <div className="w-full max-w-md">
            {/* Table Tent Layout */}
            <div className="bg-white border-2 border-gray-300 p-6 text-center">
              {/* Front Side */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Share Your Photos!
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Scan QR code to upload
                </p>

                <img
                  src={qrCodeUrl}
                  alt={`QR Code for ${event.name}`}
                  width={200}
                  height={200}
                  className="mx-auto mb-4"
                />

                <p className="text-xs text-gray-500">InstaMoments.ph</p>
              </div>

              {/* Back Side */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold mb-2">{event.name}</h3>
                {eventTypeInfo && (
                  <p className="text-sm text-gray-600 mb-4">
                    {eventTypeInfo.icon} {eventTypeInfo.label}
                  </p>
                )}

                <div className="text-xs text-gray-500 space-y-1">
                  <p>1. Open camera app</p>
                  <p>2. Point at QR code</p>
                  <p>3. Tap the link</p>
                  <p>4. Upload photos!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {layout === 'invitation' && (
        <div className="print-container">
          <div className="max-w-lg w-full">
            {/* Invitation Style */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-lg border border-gray-200">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {event.name}
                </h1>
                {eventTypeInfo && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-2xl">{eventTypeInfo.icon}</span>
                    <span className="text-lg text-gray-600">
                      {eventTypeInfo.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Event Details */}
              <div className="text-center mb-8 space-y-2">
                {event.event_date && (
                  <p className="text-gray-700">
                    📅{' '}
                    {format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}
                  </p>
                )}
                {event.location && (
                  <p className="text-gray-700">📍 {event.location}</p>
                )}
              </div>

              {/* QR Code Section */}
              <div className="bg-white p-6 rounded-lg mb-6 text-center">
                <h3 className="font-semibold text-lg mb-4">
                  Share Your Memories!
                </h3>
                <img
                  src={qrCodeUrl}
                  alt={`QR Code for ${event.name}`}
                  width={250}
                  height={250}
                  className="mx-auto mb-4"
                />
                <p className="text-sm text-gray-600">
                  Scan this QR code to upload your photos and videos
                </p>
              </div>

              {/* Instructions */}
              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">📱 Open your camera app</p>
                <p className="mb-2">📷 Point at the QR code</p>
                <p className="mb-2">👆 Tap the link that appears</p>
                <p>📸 Upload your photos and videos!</p>
              </div>

              {/* Custom Message */}
              {event.custom_message && (
                <div className="mt-6 p-4 bg-white rounded-lg">
                  <p className="text-sm italic text-center">
                    &quot;{event.custom_message}&quot;
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">InstaMoments.ph</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
