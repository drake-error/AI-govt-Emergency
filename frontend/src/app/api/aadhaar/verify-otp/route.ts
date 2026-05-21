import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { ref_id, otp } = await req.json();

    if (!otp) {
      return NextResponse.json({ detail: 'OTP is required.' }, { status: 400 });
    }

    if (otp !== '123456') {
      return NextResponse.json(
        { detail: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      citizen_details: {
        name: 'Ramesh Kumar Sharma',
        dob: '15/08/1987',
        gender: 'Male',
        address:
          'H.No. 47, 3rd Cross, Basaveshwaranagar, Bengaluru – 560079, Karnataka',
      },
    });
  } catch {
    return NextResponse.json({ detail: 'Invalid request body.' }, { status: 400 });
  }
}
