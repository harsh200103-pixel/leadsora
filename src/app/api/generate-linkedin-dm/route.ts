import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, title, contactName, persona, scanMode, senderName, companyContext, deepDiveContext } = body;

    const apiKey = process.env.NVIDIA_API_KEY || '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';

    if (!company || !title) {
      return NextResponse.json({ error: 'Missing company or title' }, { status: 400 });
    }

    const userPersona = persona || 'B2B agency';
    const nameGreeting = contactName ? `Hi ${contactName.split(' ')[0]},` : 'Hi there,';
    const signOff = senderName ? `\n\n— ${senderName}` : '';

    const contextInjection = companyContext
      ? `Your specific value proposition: "${companyContext}". Weave this in naturally.`
      : '';

    const deepDiveInjection = deepDiveContext
      ? `Company intel: ${JSON.stringify(deepDiveContext)}. Use ONE specific data point to open with personalization.`
      : '';

    let dmPrompt = '';

    if (scanMode === 'layoff') {
      dmPrompt = `Write a LinkedIn DM for someone at "${company}" that recently had layoffs. The sender runs a ${userPersona}. ${contextInjection} ${deepDiveInjection}
      Rules:
      - Start with: "${nameGreeting}"
      - MAX 300 characters total. LinkedIn DMs are SHORT. This is NOT an email.
      - Acknowledge the situation with empathy, not exploitation.
      - ONE clear value proposition.
      - ONE call-to-action question at the end.
      - NO links, NO emojis, NO bullet points.
      - ${signOff}`;
    } else if (scanMode === 'vc_whale') {
      dmPrompt = `Write a LinkedIn DM for someone at "${company}" that just raised funding and is hiring for "${title}". The sender runs a ${userPersona}. ${contextInjection} ${deepDiveInjection}
      Rules:
      - Start with: "${nameGreeting}"
      - MAX 300 characters total. LinkedIn DMs are SHORT.
      - Congratulate briefly, then pivot to your value.
      - ONE clear value proposition about moving fast post-funding.
      - ONE question as a CTA.
      - NO links, NO emojis, NO bullet points.
      - ${signOff}`;
    } else {
      dmPrompt = `Write a LinkedIn DM for someone at "${company}" which is hiring for "${title}". The sender runs a ${userPersona}. ${contextInjection} ${deepDiveInjection}
      Rules:
      - Start with: "${nameGreeting}"
      - MAX 300 characters total. LinkedIn DMs are SHORT.
      - Get to the point in 1-2 sentences.
      - ONE clear value proposition.
      - ONE soft question as CTA (e.g. "Would it make sense to connect?")
      - NO links, NO emojis, NO bullet points.
      - ${signOff}`;
    }

    const apiUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
    const models = ['meta/llama-3.1-70b-instruct', 'mistralai/mixtral-8x22b-instruct-v0.1', 'meta/llama3-8b-instruct'];
    let lastError = '';

    for (const model of models) {
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: `You are an elite LinkedIn sales copywriter who specializes in short, punchy, human-sounding connection messages. You never write generic templates. Your DMs feel like they were written by a real person who did their homework. CRITICAL: Keep it under 300 characters. No emojis. No links. No subject lines. Just the raw DM text.`
              },
              { role: 'user', content: dmPrompt }
            ],
            temperature: 0.75,
            top_p: 0.9,
            max_tokens: 150,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          lastError = `${model} returned ${res.status}. `;
          continue;
        }

        const data = await res.json();
        const dm = data?.choices?.[0]?.message?.content?.trim();

        if (!dm || dm.length < 30) {
          lastError = `${model} returned empty response. `;
          continue;
        }

        return NextResponse.json({ dm });

      } catch (fetchErr) {
        lastError = `${model} network error. `;
        continue;
      }
    }

    return NextResponse.json(
      { error: `All models failed. ${lastError}` },
      { status: 502 }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 });
  }
}
