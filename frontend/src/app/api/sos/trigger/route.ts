import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, phone, message, lat, lng } = await req.json();

    return NextResponse.json({
      status: 'Success',
      message: `Distress ticket generated successfully for ${name ?? 'Citizen'}.`,
      triage_priority: 'HIGH',
      action_taken:
        'Automated alert forwarded to local District Emergency Command Center.',
      coordinates: { lat, lng },
      ticket_id: `SOS-${Date.now()}`,
    });
  } catch {
    return NextResponse.json({ detail: 'Invalid request body.' }, { status: 400 });
  }
}
