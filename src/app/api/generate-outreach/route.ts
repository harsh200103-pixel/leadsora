import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, title, contactName, persona, isFollowUp } = body;

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
    
    let prompt = '';
    
    if (scanMode === 'layoff') {
      prompt = `You are a founder of a ${userPersona}. Write a highly professional, tactful, and empathetic cold email for a company called "${company}" that recently went through restructuring/layoffs affecting their team.${contactPart}
      Format it exactly like a real email with line breaks. 
      1. Start with a respectful greeting (e.g. Hi [Name],)
      2. Acknowledge the recent news/restructuring delicately. Do not be overly aggressive.
      3. Explain that if they need to maintain output or cover the gap left by the reduction in force without the risk and overhead of hiring full-time headcount again, your ${userPersona} can step in as a highly flexible, fractional resource.
      4. Keep the body to 2 concise paragraphs max.
      5. End with a soft, no-pressure call to action (e.g., "If you're open to exploring a flexible setup, let me know.") and a professional sign-off. 
      Do NOT include a subject line in the output.`;
    }
    else if (isFollowUp) {
      prompt = `You are a founder of a ${userPersona}. Write a highly professional, short follow-up cold email for a company called "${company}" that you contacted a few days ago regarding their open "${title}" role.${contactPart}
      Format it exactly like a real email with line breaks. 
      1. Start with a greeting (e.g. Hi [Name],)
      2. Keep it extremely brief (2-3 sentences max). Ask if they have made any progress on the hire, or if they would be open to a quick chat this week about how your ${userPersona} services can solve their problem faster and cheaper.
      3. End with a professional sign-off (e.g. Best regards,\n[Your Name]). 
      Do NOT include a subject line in the output.`;
    } else {
      prompt = `You are a founder of a ${userPersona}. Write a highly professional, well-structured cold email for a company called "${company}" that is hiring for "${title}".${contactPart} 
      Format it exactly like a real email with line breaks. 
      1. Start with a greeting (e.g. Hi [Name],)
      2. Mention you saw they are hiring for the role and explain how your specific ${userPersona} services can help them achieve the same goals faster, cheaper, or without the overhead of an in-house hire.
      3. Keep the body to 2-3 concise paragraphs.
      4. End with a professional sign-off (e.g. Best regards,\n[Your Name]). 
      Do NOT include a subject line in the output.`;
    }

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
