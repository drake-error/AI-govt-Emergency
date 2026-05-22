import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { question = '', docType = '', lang = 'en-IN' } = await req.json();

    const LANG_NAMES: Record<string, string> = {
      'en-IN': 'English', 'hi-IN': 'Hindi', 'ta-IN': 'Tamil', 'te-IN': 'Telugu',
      'kn-IN': 'Kannada', 'ml-IN': 'Malayalam', 'bn-IN': 'Bengali', 'mr-IN': 'Marathi',
      'gu-IN': 'Gujarati', 'pa-IN': 'Punjabi',
    };

    const langName = LANG_NAMES[lang] || 'English';
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert in Indian government documents and bureaucratic processes. 
Help a citizen understand and navigate document requirements.
IMPORTANT: Respond ENTIRELY in ${langName}. Do not use any other language.

Document type being asked about: ${docType || 'general'}
User question: ${question}

Provide:
1. A clear step-by-step guide (numbered list)
2. Documents required
3. Where to apply (office or website)
4. Approximate timeline
5. Common mistakes to avoid

Keep it simple, practical, and empathetic. Citizen may be in distress. Max 250 words.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return NextResponse.json({ response, lang });
  } catch {
    return NextResponse.json({ 
      response: 'Unable to process your document query. Please visit your nearest government office or call 1800-11-0001 for assistance.',
      lang: 'en-IN'
    });
  }
}
