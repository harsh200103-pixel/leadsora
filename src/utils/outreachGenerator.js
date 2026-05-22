// ============================================================
// AI Outreach Generator v2.0
// ============================================================
// Context: DealFinder is used by AI SOFTWARE SOLUTIONS companies
// (agencies that BUILD AI products, ML models, automation tools,
// and intelligent systems for other businesses).
//
// The outreach targets companies hiring AI/ML talent — signaling
// they NEED AI capabilities. The pitch: "Let us build the AI
// solution for you instead of hiring full-time."
//
// Primary: Anthropic API (Claude 3 Haiku) — fully AI-written
// Fallback: 4 varied templates for AI solutions companies
// ============================================================

const ANTHROPIC_MODEL = 'claude-3-haiku-20240307';

/**
 * Get the Anthropic API key from localStorage (set in Settings page).
 */
function getAnthropicApiKey() {
  return localStorage.getItem('df_anthropic_api_key') || null;
}

/**
 * Generate AI-powered outreach via Anthropic API.
 * System prompt positions the sender as an AI software solutions
 * company that builds AI/ML products for other businesses.
 */
async function generateWithAnthropic(company, role, signal) {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerously-allow-browser': 'true',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        system: `You are writing cold outreach on behalf of an AI software solutions company. This company BUILDS custom AI products, machine learning models, intelligent automation systems, NLP tools, computer vision solutions, and AI-powered platforms for other businesses. They do NOT provide staffing or recruitment — they deliver end-to-end AI solutions as a service. When a company is hiring for AI/ML roles, that signals they need AI capabilities. The pitch is: "We can build the AI solution you need — faster and more cost-effective than hiring a full-time AI team from scratch." Write a short, personalized message (3-4 sentences max). Be conversational and professional. Reference the specific company and role. Don't use brackets or placeholders. Sign off casually. Keep it under 60 words.`,
        messages: [
          {
            role: 'user',
            content: `Write a cold outreach to ${company}, which is hiring a ${role}. Signal: "${signal}". Our AI solutions company can design, develop, and deploy the exact AI system they need — from ML models to production-ready AI platforms — without them needing to build an in-house AI team.`
          }
        ],
        temperature: 0.8,
        max_tokens: 150,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch (err) {
    console.warn('Anthropic API call failed:', err.message);
    return null;
  }
}

// ============================================================
// DYNAMIC FALLBACK TEMPLATE
// ============================================================

/**
 * Generate a dynamic placeholder outreach based on the user's persona and mode.
 */
export function generateOutreachSync(company, role, persona, scanMode = 'hiring') {
  const p = persona || 'B2B agency';
  const cleanRole = role.replace(/^Hiring:\s*/i, '').replace(/Layoffs:.*\.\s*/, '').replace(/\..*/, '');
  
  if (scanMode === 'layoff') {
    return `Hi Team,\n\nI was following the recent news surrounding ${company}. Managing transitions while maintaining core product output is always a difficult balance to strike.\n\nIf your operational demands haven't slowed down, my ${p} can act as an elastic, fractional partner to bridge the gap—delivering high-level execution without the permanent headcount liability.\n\nWould a brief conversation make sense this week?`;
  } else if (scanMode === 'vc_whale') {
    return `Hi Team,\n\nMassive congratulations on the recent funding milestone! I know investors expect rapid deployment, which makes scaling ${company} quickly your top priority right now.\n\nInstead of losing 60+ days hunting for an in-house ${cleanRole}, my ${p} can plug in tomorrow to help you hit those immediate scaling targets and clear the backlog.\n\nAre you open to exploring a fractional partnership to accelerate your roadmap?`;
  } else if (scanMode === 'stale_job') {
    return `Hi Team,\n\nI saw that your ${cleanRole} position has been sitting open for quite some time now. When critical roles remain unfilled, roadmap execution inevitably slows down.\n\nWhile you continue searching for the perfect full-time fit, my ${p} can step in immediately to clear the backlog and stop the bleeding.\n\nCould we schedule a quick chat to see if a fractional setup makes sense in the interim?`;
  }
  
  return `Hi Team,\n\nI noticed ${company} is currently recruiting for a ${cleanRole}. As you know, the hiring process can take months, and onboarding takes even longer.\n\nMy ${p} can step in immediately as a fractional partner to execute your roadmap—bypassing the expensive recruiter fees, training time, and headcount risks.\n\nAre you open to reviewing a quick case study of how we've done this for similar scaling teams?`;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Generate personalized outreach for a lead using Anthropic.
 * (Now largely superseded by the Gemini endpoint in Next.js backend)
 */
export async function generateOutreach(company, role, signal) {
  const cleanRole = role.replace(/^Hiring:\s*/i, '');
  const aiMessage = await generateWithAnthropic(company, cleanRole, signal || `Hiring: ${cleanRole}`);
  if (aiMessage) return { message: aiMessage, source: 'ai' };

  return { message: generateOutreachSync(company, cleanRole, 'B2B agency'), source: 'template' };
}
