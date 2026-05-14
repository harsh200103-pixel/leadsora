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
// FALLBACK TEMPLATES — for AI software solutions companies
// pitching to businesses that need AI capabilities built
// ============================================================

const FALLBACK_TEMPLATES = [
  // Template 1: Direct solution pitch
  (company, role) =>
    `Hey! Saw that ${company} is hiring a ${role} — that's a clear sign you're investing in AI capabilities. Instead of a 6-month hiring cycle, our AI solutions company can design and deploy the exact system you need in weeks. We've built production-ready AI for companies just like yours. Worth a quick chat?`,

  // Template 2: Build vs. hire angle
  (company, role) =>
    `Hi there — noticed ${company} has an open ${role} position. Building an in-house AI team is expensive and slow. We're an AI software solutions company that builds custom ML models, automation systems, and AI-powered platforms end-to-end. You get the AI product delivered, not just a hire. Happy to share a relevant case study.`,

  // Template 3: Speed & expertise angle
  (company, role) =>
    `Quick note — I came across ${company}'s listing for a ${role}. We recently built a similar AI solution for a company in your space and had it in production within 8 weeks. Our team handles everything from model development to deployment. If you're open to exploring the build-vs-hire route, I'd love to connect.`,

  // Template 4: No-pressure consultative
  (company, role) =>
    `Hey! ${company} looking for a ${role} caught my eye — that's exactly the kind of AI solution our company builds. From intelligent automation to custom ML pipelines, we deliver production-ready AI systems without you needing to assemble an entire AI team. Want me to send over a quick demo of a similar project?`,
];

/**
 * Select a fallback template deterministically by company name hash.
 */
function selectFallbackTemplate(company) {
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = ((hash << 5) - hash) + company.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % FALLBACK_TEMPLATES.length;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Generate personalized outreach for a lead.
 * Tries Anthropic AI first, falls back to 4 varied AI-solutions templates.
 */
export async function generateOutreach(company, role, signal) {
  const cleanRole = role.replace(/^Hiring:\s*/i, '');
  const aiMessage = await generateWithAnthropic(company, cleanRole, signal || `Hiring: ${cleanRole}`);
  if (aiMessage) return { message: aiMessage, source: 'ai' };

  const idx = selectFallbackTemplate(company);
  return { message: FALLBACK_TEMPLATES[idx](company, cleanRole), source: 'template' };
}

/**
 * Sync version — used during batch lead generation.
 */
export function generateOutreachSync(company, role) {
  const cleanRole = role.replace(/^Hiring:\s*/i, '');
  const idx = selectFallbackTemplate(company);
  return FALLBACK_TEMPLATES[idx](company, cleanRole);
}
