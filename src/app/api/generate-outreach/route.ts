import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { company, title, contactName } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured on server.' }, { status: 500 });
    }

    const contactPart = contactName ? ` The key contact is ${contactName}.` : '';
    const prompt = `You are an expert B2B sales copywriter. Write a SHORT, highly personalized cold outreach message (max 2-3 sentences) for reaching out to ${company}, which is actively hiring for "${title}".${contactPart} The message should feel human, reference their specific hiring signal as proof of research, and offer a clear value proposition. Output ONLY the message text, no quotes, no subject line.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.85, maxOutputTokens: 200 },
        }),
      }
    );

    const data = await res.json();
    const outreach = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!outreach) {
      return NextResponse.json({ error: 'Gemini returned no content.' }, { status: 500 });
    }

    return NextResponse.json({ outreach });
  } catch (err) {
    console.error('Gemini API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
