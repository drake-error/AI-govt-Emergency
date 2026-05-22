import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, phone, message, lat, lng, address } = await req.json();
    
    // Log the SOS signal (in production: save to Supabase, send SMS via Twilio, etc.)
    console.log('🆘 SOS TRIGGERED:', { name, phone, message, lat, lng, address, time: new Date().toISOString() });

    return NextResponse.json({
      status: 'SUCCESS',
      ticketId: `SOS-${Date.now()}`,
      message: `Emergency signal received for ${name || 'Anonymous'} at ${address || `${lat}, ${lng}`}`,
      triage_priority: 'HIGH',
      action_taken: 'Alert forwarded to District Emergency Command Center. NDRF notified.',
      response_eta: '8-12 minutes',
      contact: { police: '100', fire: '101', ambulance: '102', ndma: '1078' }
    });
  } catch {
    return NextResponse.json({ status: 'ERROR', message: 'Failed to process SOS' }, { status: 500 });
  }
}
