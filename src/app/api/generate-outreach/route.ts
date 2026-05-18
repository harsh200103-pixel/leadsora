import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, title, contactName, persona } = body;

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

    const contactPart = contactName ? ` Address the email to ${contactName}.` : ' Address the email to the Hiring Team.';
    const userPersona = persona || 'B2B agency';
    const prompt = `You are a founder of a ${userPersona}. Write a highly professional, well-structured cold email for a company called "${company}" that is hiring for "${title}".${contactPart} 
    Format it exactly like a real email with line breaks. 
    1. Start with a greeting (e.g. Hi [Name],)
    2. Mention you saw they are hiring for the role and explain how your specific ${userPersona} services can help them achieve the same goals faster, cheaper, or without the overhead of an in-house hire.
    3. Keep the body to 2-3 concise paragraphs.
    4. End with a professional sign-off (e.g. Best regards,\n[Your Name]). 
    Do NOT include a subject line in the output.`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 400,
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
