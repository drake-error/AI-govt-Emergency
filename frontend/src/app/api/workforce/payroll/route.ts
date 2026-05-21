import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { worker_id, hours_worked, hourly_rate, multiplier } = await req.json();

    if (
      hours_worked === undefined ||
      hourly_rate === undefined ||
      multiplier === undefined
    ) {
      return NextResponse.json(
        { detail: 'Missing required fields: hours_worked, hourly_rate, multiplier' },
        { status: 400 }
      );
    }

    const base_pay = hours_worked * hourly_rate;
    const hazard_bonus = base_pay * (multiplier - 1.0);
    const total_gross = base_pay + hazard_bonus;

    return NextResponse.json({
      worker_id,
      total_hours: hours_worked,
      base_earnings: Math.round(base_pay * 100) / 100,
      emergency_bonus: Math.round(hazard_bonus * 100) / 100,
      total_payable_inr: Math.round(total_gross * 100) / 100,
      compliance_status:
        hours_worked <= 12.0
          ? 'COMPLIANT'
          : 'VIOLATION: Overwork Flagged (> 12 hrs)',
    });
  } catch {
    return NextResponse.json({ detail: 'Invalid request body.' }, { status: 400 });
  }
}
