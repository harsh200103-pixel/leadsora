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
  
  if (scanMode === 'layoff') {
    const dept = role.replace(/Layoffs:.*in\s/, '').replace(/\sdepartment.*/, '') || 'your';
    return `Hi — I saw the news regarding the recent restructuring at ${company}. If you are looking for ways to maintain the output of your ${dept} team without taking on full-time headcount risk again, my ${p} can step in as a flexible, fractional resource. Open to a quick chat?`;
  }
  
  const cleanRole = role.replace(/^Hiring:\s*/i, '');
  return `Hi — noticed ${company} is looking for a ${cleanRole}. We're a ${p} that helps companies exactly like yours achieve these specific goals without the massive overhead of a long hiring cycle. Happy to share a quick case study if you're open to exploring?`;
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
