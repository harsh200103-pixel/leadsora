import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'Missing website URL' }, { status: 400 });
    }

    // 1. Ensure URL has protocol
    let targetUrl = url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    // 2. Fetch the website HTML
    let htmlText = '';
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      if (!response.ok) throw new Error(`Failed to fetch website: ${response.status}`);
      htmlText = await response.text();
    } catch (err) {
      console.error('Website scrape error:', err);
      return NextResponse.json({ error: 'Could not access the website. Please ensure the URL is correct and public.' }, { status: 400 });
    }

    // 3. Strip HTML tags to get raw text (very rough but LLMs can easily parse it)
    // Remove scripts and styles first
    htmlText = htmlText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
    htmlText = htmlText.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
    // Remove remaining HTML tags
    const rawText = htmlText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Take only the first 15,000 characters to prevent massive token payloads
    const limitedText = rawText.substring(0, 15000);

    // 4. Send to NVIDIA NIM to extract Value Proposition
    const apiKey = process.env.NVIDIA_API_KEY || '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';
    
    const nimResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert business analyst. I will give you the raw text scraped from a company website. Your job is to extract their EXACT value proposition AND suggest 3 specific lead targets they should search for based on what they do. Return ONLY a valid JSON object with two keys: "companyContext" (a 2-3 sentence summary written from their perspective, e.g. "We specialize in...") and "suggestedRoles" (an array of 3 concise string keywords for job roles or industries they should target, e.g. ["Frontend Developer", "E-commerce", "Marketing"]). Do not return anything outside the JSON object.' 
          },
          { role: 'user', content: limitedText }
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!nimResponse.ok) {
      const errTxt = await nimResponse.ok ? '' : await nimResponse.text();
      console.error('NVIDIA error parsing website:', errTxt);
      return NextResponse.json({ error: 'Failed to analyze website content.' }, { status: 500 });
    }

    const data = await nimResponse.json();
    let resultContext = data?.choices?.[0]?.message?.content?.trim() || '{}';
    let suggestedRoles = [];

    // Clean up potential markdown formatting from the AI response
    resultContext = resultContext.replace(/^\s*```(?:json)?\n?|```\s*$/g, '');

    try {
      // Attempt to parse JSON response
      const parsed = JSON.parse(resultContext);
      if (parsed.companyContext) resultContext = parsed.companyContext;
      if (parsed.suggestedRoles && Array.isArray(parsed.suggestedRoles)) suggestedRoles = parsed.suggestedRoles;
    } catch (e) {
      console.warn("NIM returned non-JSON format, falling back to raw text:", resultContext);
    }

    return NextResponse.json({ companyContext: resultContext, suggestedRoles });

  } catch (err: any) {
    console.error('Scrape API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
