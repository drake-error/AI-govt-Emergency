import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const LANGUAGE_NAMES: Record<string, string> = {
  'en-IN': 'English', 'hi-IN': 'Hindi (हिंदी)', 'ta-IN': 'Tamil (தமிழ்)',
  'te-IN': 'Telugu (తెలుగు)', 'kn-IN': 'Kannada (ಕನ್ನಡ)', 'ml-IN': 'Malayalam (മലയാളം)',
  'bn-IN': 'Bengali (বাংলা)', 'mr-IN': 'Marathi (मराठी)', 'gu-IN': 'Gujarati (ગુજરાતી)',
  'pa-IN': 'Punjabi (ਪੰਜਾਬੀ)', 'or-IN': 'Odia (ଓଡ଼ିଆ)', 'as-IN': 'Assamese (অসমীয়া)',
  'ur-IN': 'Urdu (اردو)', 'sa-IN': 'Sanskrit (संस्कृतम्)', 'sd-IN': 'Sindhi (سنڌي)',
  'kok-IN': 'Konkani (कोंकणी)', 'mni-IN': 'Manipuri (মৈতৈলোন্)', 'ne-IN': 'Nepali (नेपाली)',
  'bho-IN': 'Bhojpuri (भोजपुरी)', 'mai-IN': 'Maithili (मैथिली)', 'ks-IN': 'Kashmiri (كٲشُر)',
  'doi-IN': 'Dogri (डोगरी)',
};

export async function POST(req: NextRequest) {
  try {
    const { message = '', lang = 'en-IN' } = await req.json();
    const languageName = LANGUAGE_NAMES[lang] || 'English';

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `You are an official AI assistant for India's National Disaster Management Authority (NDMA). 
Your primary role is to help Indian citizens during emergencies, natural disasters, and to access government schemes and services.

CRITICAL LANGUAGE RULE: The user is communicating in ${languageName}. You MUST reply ENTIRELY in ${languageName}. 
If the user writes in Tamil, reply in Tamil. If Hindi, reply in Hindi. Match their language EXACTLY.
Do NOT mix languages. Do NOT add translations. Just reply naturally in the same language.

KNOWLEDGE BASE:
- Emergency numbers: Police 100, Fire 101, Ambulance 102, Disaster 108, NDMA 1078, All-in-one 112
- Government schemes: PMFBY (crop insurance), PMAY (housing), MGNREGA (employment), PMKSY (irrigation), PM-KISAN
- Disaster relief: Cyclone, Flood, Earthquake, Drought ex-gratia payments available via state portals
- Nearby services: Tell user to use the SOS page to find nearest police, fire, hospital with live location
- Documents needed: Aadhaar card, BPL card, bank passbook, land records for scheme applications

Be empathetic, clear, and helpful. For life-threatening emergencies, ALWAYS mention calling 112 immediately.
Keep responses concise (2-4 sentences). Be practical and actionable.`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `User message: ${message}` }
    ]);

    const response = result.response.text();
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Gemini chat error:', error);
    return NextResponse.json(
      { response: 'I am experiencing a temporary issue. For emergencies, please call 112 immediately.' },
      { status: 200 }
    );
  }
}
