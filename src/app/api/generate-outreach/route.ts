import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, title, contactName, persona, isFollowUp, scanMode } = body;

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
    
    const companySlug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const pitchLink = `https://leadsora.com/pitch/${companySlug}`;
    
    let prompt = '';
    
    if (scanMode === 'layoff') {
      prompt = `You are a founder of a ${userPersona}. Write a highly professional, tactful, and empathetic cold email for a company called "${company}" that recently went through restructuring/layoffs affecting their team.${contactPart}
      Format it exactly like a real email with line breaks. 
      1. Start with a respectful greeting.
      2. Acknowledge the recent news/restructuring delicately.
      3. Explain that if they need to maintain output without the risk of hiring full-time headcount again, your ${userPersona} can step in as a fractional resource.
      4. End with: "I built a custom fractional roadmap for ${company} here: ${pitchLink}"
      5. Add a professional sign-off. Do NOT include a subject line.`;
    }
    else if (scanMode === 'vc_whale') {
      prompt = `You are a founder of a ${userPersona}. Write a high-energy cold email for a startup called "${company}" that just raised massive funding and is hiring for "${title}".${contactPart}
      Format it exactly like a real email. 
      1. Congratulate them on the funding.
      2. Explain that investors expect hyper-growth, but hiring full-time takes 3-6 months.
      3. Pitch your ${userPersona} as the ultimate 'cheat code' to hit scaling targets immediately.
      4. End with: "I built a custom scaling roadmap for ${company} here: ${pitchLink}"
      5. Add a professional sign-off. Do NOT include a subject line.`;
    }
    else if (scanMode === 'stale_job') {
      prompt = `You are a founder of a ${userPersona}. Write a problem-solving cold email for "${company}" that has been trying to hire for "${title}" for over 60 days.${contactPart}
      Format it exactly like a real email. 
      1. Mention their "${title}" position has been sitting open for months and the workload must be piling up.
      2. Pitch your ${userPersona} as a way to "stop the bleeding" fractionally tomorrow.
      3. End with: "I built a custom fractional execution plan for ${company} here: ${pitchLink}"
      4. Add a professional sign-off. Do NOT include a subject line.`;
    }
    else if (isFollowUp) {
      prompt = `You are a founder of a ${userPersona}. Write a short follow-up cold email for "${company}" regarding their open "${title}" role.${contactPart}
      Format it exactly like a real email. 
      1. Keep it extremely brief. Ask if they have made any progress on the hire.
      2. End with: "In the meantime, I updated the custom ROI deck for ${company} here: ${pitchLink}"
      3. Add a professional sign-off. Do NOT include a subject line.`;
    } else {
      prompt = `You are a founder of a ${userPersona}. Write a well-structured cold email for "${company}" that is hiring for "${title}".${contactPart} 
      Format it exactly like a real email. 
      1. Explain how your specific ${userPersona} services can help them achieve their goals faster/cheaper.
      2. End with: "I built a custom ROI pitch deck specifically for ${company} here: ${pitchLink}"
      3. Add a professional sign-off. Do NOT include a subject line.`;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

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
