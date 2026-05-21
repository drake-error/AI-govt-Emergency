import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message = '', lang = 'en-IN' } = await req.json();
    const userMsg = message.toLowerCase();

    let response =
      'I am the AI E-Governance Citizen Assistant. Your request has been noted. Please contact 112 for immediate emergencies.';

    if (userMsg.includes('shelter')) {
      response =
        'The nearest verified relief shelter is at the District Community Hall, 2.4 km away. Beds and food are available.';
    } else if (userMsg.includes('mla') || userMsg.includes('power')) {
      response =
        'Your ward MLA is Mr. Sharma (Ph: 9876543210). The power cutoff is due to precautionary grid isolation and will be restored in 4 hours.';
    } else if (
      userMsg.includes('scheme') ||
      userMsg.includes('relief') ||
      userMsg.includes('compensation')
    ) {
      response =
        'Under the Cyclone Relief Scheme, affected citizens are eligible for ₹10,000 ex-gratia. Apply via the Citizen Distress Hub with your Aadhaar number.';
    } else if (userMsg.includes('sos') || userMsg.includes('emergency') || userMsg.includes('help')) {
      response =
        'Emergency flagged. Dial 112 immediately. SDRF dispatch has been notified. Share your location using the map feature on the home page.';
    } else if (userMsg.includes('food') || userMsg.includes('water') || userMsg.includes('ration')) {
      response =
        'Free food and water distribution is active at 14 government schools in your district. Show your Aadhaar card to collect your relief kit.';
    }

    return NextResponse.json({ response });
  } catch {
    return NextResponse.json({ detail: 'Invalid request body.' }, { status: 400 });
  }
}
