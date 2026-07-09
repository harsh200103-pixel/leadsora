import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { company, domain, tavilyKey } = await request.json();

    if (!company) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const serverTavilyKey = tavilyKey || process.env.TAVILY_API_KEY || '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';

    if (!serverTavilyKey) {
      return NextResponse.json({ error: 'Tavily API key is missing. Add it in Settings.' }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY || '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';

    // 1. Search Tavily for company details
    const searchRes = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: serverTavilyKey,
        query: `What does the company ${company} do? What is their recent news, funding, tech stack, and target market? ${domain ? `(Website: ${domain})` : ''}`,
        search_depth: 'advanced',
        include_answer: true,
        max_results: 5,
      }),
    });

    if (!searchRes.ok) {
      const errorText = await searchRes.text();
      console.error('Tavily API error:', searchRes.status, errorText);
      return NextResponse.json({ error: `Tavily Search Failed: ${searchRes.statusText}` }, { status: 502 });
    }

    const searchData = await searchRes.json();
    const rawContext = searchData.answer || searchData.results?.map((r: any) => r.content).join('\n\n') || '';

    if (!rawContext) {
      return NextResponse.json({ error: 'Could not find any meaningful data about this company.' }, { status: 404 });
    }

    // 2. Use NIM AI to summarize the raw search into a clean JSON report
    const apiUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
    const aiRes = await fetch(apiUrl, {
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
            content: `You are an expert business analyst and intelligence researcher. Read the provided search results about a company and output a strict JSON object summarizing their business.
Required JSON format:
{
  "summary": "A highly detailed 2-3 paragraph analysis of their business model, what they do, their market positioning, and any known competitors.",
  "recent_news": "A detailed paragraph covering their latest funding rounds, product launches, acquisitions, or key milestones (or null if none found).",
  "tech_stack": "A comprehensive list or paragraph describing the technologies, frameworks, and infrastructure they use (or null if unknown).",
  "ideal_customer": "A detailed breakdown of their target audience, buyer personas, and who they sell to (or null if unknown)."
}
Return ONLY the raw JSON object. Do not include markdown blocks like \`\`\`json or any conversational text.` 
          },
          { role: 'user', content: `Company: ${company}\nSearch Results:\n${rawContext}` }
        ],
        temperature: 0.3,
        top_p: 0.9,
      }),
    });

    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      console.error('NVIDIA API error during analysis:', aiRes.status, errorText);
      return NextResponse.json({ error: 'AI Summarization failed.' }, { status: 502 });
    }

    const aiData = await aiRes.json();
    let reportText = aiData?.choices?.[0]?.message?.content?.trim() || '{}';
    
    // Clean up potential markdown formatting from the AI response
    reportText = reportText.replace(/^\s*```(?:json)?\n?|```\s*$/g, '');

    let reportJson = {};
    try {
      reportJson = JSON.parse(reportText);
    } catch (parseError) {
      console.error('Failed to parse AI JSON:', reportText);
      return NextResponse.json({ error: 'AI returned invalid data format' }, { status: 500 });
    }

    return NextResponse.json({ report: reportJson, sourceUrl: searchData.results?.[0]?.url });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('analyze-company error:', message);
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 });
  }
}
