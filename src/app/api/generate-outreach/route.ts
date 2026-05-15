import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, title, contactName } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'Gemini API key not configured. Add GEMINI_API_KEY in Vercel Environment Variables.' },
        { status: 500 }
      );
    }

    if (!company || !title) {
      return NextResponse.json({ error: 'Missing company or title' }, { status: 400 });
    }

    const contactPart = contactName ? ` The contact person is ${contactName}.` : '';
    const prompt = `You are a B2B sales expert. Write a SHORT cold outreach message (2-3 sentences max) for a company called "${company}" that is hiring for "${title}".${contactPart} Make it feel human, mention their hiring signal, and offer to solve a related business problem. Output ONLY the message, no quotes, no labels, no subject line.`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 200,
          topP: 0.9,
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Gemini API error:', res.status, errorText);
      return NextResponse.json(
        { error: `Gemini API returned ${res.status}. Check your API key.` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const outreach = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!outreach) {
      console.error('Gemini returned empty response:', JSON.stringify(data));
      return NextResponse.json({ error: 'Gemini returned no content' }, { status: 502 });
    }

    return NextResponse.json({ outreach });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('generate-outreach error:', message);
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 });
  }
}
