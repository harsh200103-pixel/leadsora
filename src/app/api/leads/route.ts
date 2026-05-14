import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('q') || '';
  const locationFilter = searchParams.get('loc') || 'All';

  try {
    // 1. DATA FETCHER: Ping external APIs from the secure server
    const response = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(search)}&limit=150`);
    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }
    const data = await response.json();
    let fetchedJobs = data.jobs || [];

    // 2. BACKEND FILTERING (Geo-fencing)
    if (locationFilter !== 'All') {
      fetchedJobs = fetchedJobs.filter((job: any) => {
        const loc = job.candidate_required_location.toLowerCase();
        if (locationFilter === 'USA') return loc.includes('usa') || loc.includes('us ') || loc === 'us';
        if (locationFilter === 'Europe') return loc.includes('europe') || loc.includes('uk');
        if (locationFilter === 'Asia') return loc.includes('asia') || loc.includes('india') || loc.includes('singapore');
        return true;
      });
    }

    // 3. AI NLP SCORING ALGORITHM (Mocked for now, ready for OpenAI)
    const urgencyKeywords = ['urgent', 'immediate', 'asap', 'fast-paced', 'critical', 'growing fast', 'scaling', 'hiring now'];
    const processedLeads = fetchedJobs.map((job: any) => {
      let baseScore = Math.floor(Math.random() * 20) + 60; // 60-80 base
      
      const description = (job.description || '').toLowerCase();
      let urgencyFound = false;
      
      urgencyKeywords.forEach(keyword => {
        if (description.includes(keyword)) {
          baseScore += 10;
          urgencyFound = true;
        }
      });
      
      if (baseScore > 99) baseScore = 99;
      
      return {
        id: job.id,
        company: job.company_name,
        location: job.candidate_required_location || 'Global',
        title: job.title,
        posted: new Date(job.publication_date).toLocaleDateString(),
        intentScore: baseScore,
        urgencyDetected: urgencyFound,
        sourceUrl: job.url,
        descriptionSnippet: job.description.replace(/<[^>]+>/g, '').substring(0, 150) + '...'
      };
    });

    // Sort by highest intent first
    processedLeads.sort((a: any, b: any) => b.intentScore - a.intentScore);

    return NextResponse.json({ success: true, leads: processedLeads });
  } catch (error: any) {
    console.error("Backend Error Fetching Leads:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch and process leads." }, { status: 500 });
  }
}
