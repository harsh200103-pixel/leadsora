import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, title, contactName, persona, isFollowUp, scanMode, senderName, companyContext } = body;

    // Using NVIDIA NIM API key instead of Gemini
    const apiKey = process.env.NVIDIA_API_KEY || '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';
    if (!apiKey) {
      console.error('NVIDIA_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'NVIDIA API key not configured. Add NVIDIA_API_KEY in Vercel Environment Variables.' },
        { status: 500 }
      );
    }

    if (!company || !title) {
      return NextResponse.json({ error: 'Missing company or title' }, { status: 400 });
    }

    const contactPart = contactName ? ` Address the email to ${contactName}.` : ' Address the email to the Hiring Team.';
    const userPersona = persona || 'B2B agency';
    const signOffName = senderName ? `Sign off as ${senderName}.` : 'Sign off with [Your Name].';


    const companySlug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const pitchLink = `https://leadsora.vercel.app/pitch/${companySlug}`;

    let prompt = '';

    if (scanMode === 'layoff') {
      prompt = `You are a founder of a ${userPersona}. Write a highly professional, tactful, and empathetic cold email for a company called "${company}" that recently went through restructuring/layoffs affecting their team.${contactPart}
      Format it exactly like a real email with line breaks. 
      1. Start with a respectful greeting.
      2. Acknowledge the recent news/restructuring delicately.
      3. Explain that if they need to maintain output without the risk of hiring full-time headcount again, your ${userPersona} can step in as a fractional resource.
      4. End with: "I built a custom fractional roadmap for ${company} here: ${pitchLink}"
      5. ${signOffName} Do NOT include a subject line.`;
    }
    else if (scanMode === 'vc_whale') {
      prompt = `You are a founder of a ${userPersona}. Write a high-energy cold email for a startup called "${company}" that just raised massive funding and is hiring for "${title}".${contactPart}
      Format it exactly like a real email. 
      1. Congratulate them on the funding.
      2. Explain that investors expect hyper-growth, but hiring full-time takes 3-6 months.
      3. Pitch your ${userPersona} as the ultimate 'cheat code' to hit scaling targets immediately.
      4. End with: "I built a custom scaling roadmap for ${company} here: ${pitchLink}"
      5. ${signOffName} Do NOT include a subject line.`;
    }
    else if (scanMode === 'stale_job') {
      prompt = `You are a founder of a ${userPersona}. Write a problem-solving cold email for "${company}" that has been trying to hire for "${title}" for over 60 days.${contactPart}
      Format it exactly like a real email. 
      1. Mention their "${title}" position has been sitting open for months and the workload must be piling up.
      2. Pitch your ${userPersona} as a way to "stop the bleeding" fractionally tomorrow.
      3. End with: "I built a custom fractional execution plan for ${company} here: ${pitchLink}"
      4. ${signOffName} Do NOT include a subject line.`;
    }
    else if (isFollowUp) {
      prompt = `You are a founder of a ${userPersona}. Write a short follow-up cold email for "${company}" regarding their open "${title}" role.${contactPart}
      Format it exactly like a real email. 
      1. Keep it extremely brief. Ask if they have made any progress on the hire.
      2. End with: "In the meantime, I updated the custom ROI deck for ${company} here: ${pitchLink}"
      3. ${signOffName} Do NOT include a subject line.`;
    } else {
      prompt = `You are a founder of a ${userPersona}. Write a well-structured cold email for "${company}" that is hiring for "${title}".${contactPart} 
      Format it exactly like a real email. 
      1. Explain how your specific ${userPersona} services can help them achieve their goals faster/cheaper.
      2. End with: "I built a custom ROI pitch deck specifically for ${company} here: ${pitchLink}"
      3. ${signOffName} Do NOT include a subject line.`;
    }

    // Robust NIM Model Failover Loop
    const apiUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
    const models = ['meta/llama-3.1-70b-instruct', 'mistralai/mixtral-8x22b-instruct-v0.1', 'meta/llama3-8b-instruct'];
    
    let lastError = '';

    const injectedContext = companyContext 
      ? `CRITICAL CONTEXT: You represent a company with this specific profile/value proposition: "${companyContext}". You MUST aggressively weave these specific capabilities and services into the pitch. Do NOT sound generic. Use the specific technologies and services mentioned in the context.`
      : '';

    for (const model of models) {
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: `You are an elite B2B sales copywriter. ${injectedContext} Write a highly converting cold email based strictly on the user prompt. DO NOT include a Subject line. Go straight into the body of the email. Write the complete email, do not stop halfway.` },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            top_p: 0.9,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`NVIDIA API error on ${model}:`, res.status, errorText);
          lastError = `${model} returned ${res.status}. `;
          continue;
        }

        const data = await res.json();
        const outreach = data?.choices?.[0]?.message?.content?.trim();

        if (!outreach || outreach.length < 100) {
          console.error(`NVIDIA API ${model} returned empty or truncated response:`, outreach);
          lastError = `${model} returned truncated string. `;
          continue;
        }

        // Success!
        return NextResponse.json({ outreach });

      } catch (fetchErr) {
        console.error(`NVIDIA Network error on ${model}:`, fetchErr);
        lastError = `${model} network error. `;
        continue;
      }
    }

    // If all models fail or truncate
    return NextResponse.json(
      { error: `All NVIDIA models failed or timed out. ${lastError} Please try again.` },
      { status: 502 }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('generate-outreach error:', message);
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 });
  }
}
