import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { query = '' } = await req.json();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a routing assistant for an Indian government emergency portal. 
Given a user's query, classify their intent and return a JSON response.

Available pages:
- /sos : Emergency SOS, accident, help, danger, rescue, fire, flood evacuation
- /schemes : Government schemes, relief, compensation, ex-gratia, benefits, PMFBY, housing, farming
- /disaster-alerts : Disaster news, cyclone warnings, earthquake info, flood alerts, storm updates
- /documents : Document help, Aadhaar, BPL card, ration card, form filling, certificate
- /chatbot : General questions, AI assistant, language help, queries
- / : Home, dashboard, general navigation

User query: "${query}"

Respond ONLY with valid JSON in this format:
{
  "page": "/sos",
  "confidence": 0.95,
  "reason": "User seems to need emergency help",
  "suggestedAction": "Go to SOS page and share your live location immediately",
  "urgency": "HIGH"
}

urgency must be one of: HIGH, MEDIUM, LOW
confidence must be between 0 and 1`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    }
    
    return NextResponse.json({ page: '/chatbot', confidence: 0.5, reason: 'General query', urgency: 'LOW' });
  } catch {
    return NextResponse.json({ page: '/chatbot', confidence: 0.5, reason: 'Error classifying', urgency: 'LOW' });
  }
}
