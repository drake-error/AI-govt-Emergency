import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { aadhaar_number } = await req.json();

    if (!aadhaar_number || aadhaar_number.length !== 12) {
      return NextResponse.json(
        { detail: 'Aadhaar number must be exactly 12 digits.' },
        { status: 400 }
      );
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const ref_id = Array.from(
      { length: 12 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');

    return NextResponse.json({
      success: true,
      ref_id,
      message: 'OTP sent to Aadhaar-linked mobile. Use 123456 for sandbox testing.',
    });
  } catch {
    return NextResponse.json({ detail: 'Invalid request body.' }, { status: 400 });
  }
}
