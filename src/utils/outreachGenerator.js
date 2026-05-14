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
  (company, role) =>
    `Hey! Saw that ${company} is hiring a ${role} — a clear signal you need serious AI capabilities. Instead of a 6-month hiring cycle, our team can design and ship the exact AI system you need in weeks. We've built production-ready AI for companies just like yours. Worth a 15-min call?`,
  (company, role) =>
    `Hi — noticed ${company} posted a ${role} role. Building an in-house AI team is expensive and slow. We're an AI solutions company that delivers custom ML models, automation systems, and intelligent platforms end-to-end. You get the AI shipped, not just a hire. Happy to share a case study?`,
  (company, role) =>
    `Quick note — saw ${company}'s ${role} opening. We built a very similar AI system for a company in your space and had it in production in 8 weeks flat. Full stack: model training, API, deployment. Open to exploring the build-vs-hire route? I'd love to connect.`,
  (company, role) =>
    `${company} hiring a ${role} tells me you're serious about AI. We specialize in exactly that — building the custom AI infrastructure you need without you assembling a whole internal team. Let me send you a 2-minute walkthrough of something we shipped for a similar company.`,
  (company, role) =>
    `Hey! Came across ${company}'s ${role} listing — we've solved this exact problem for other companies. Rather than a long recruitment cycle, we can deliver a fully working AI system in your stack within weeks. Our last 3 clients went from brief to production in under 60 days. Interested?`,
  (company, role) =>
    `Hi there — ${company}'s search for a ${role} is a strong buying signal for us. We're a specialist AI engineering company; we build, train, and deploy the exact AI systems companies like you need. No recruitment risk, no ramp-up time — just working AI. Can I send over a quick overview?`,
  (company, role) =>
    `Saw ${company} is looking for a ${role}. We've built nearly identical solutions for 15+ companies and can usually move faster and cheaper than a full-time hire + infrastructure build. Our stack covers everything from fine-tuned LLMs to production APIs. Want a no-pitch, 10-min walkthrough?`,
  (company, role) =>
    `Quick one — ${company}'s ${role} opening stood out. We're an AI product studio that builds exactly what you're hiring for — but as a fully delivered system, not a headcount. If speed and cost matter, it's worth a conversation. Happy to share what we've shipped.`,
  (company, role) =>
    `Hi! ${company} posting for a ${role} tells me you have a real AI gap to fill. We close that gap by building the system instead of the team — custom models, integrations, deployment. We've done this for companies from Series A to Fortune 500. Would love to show you a quick example.`,
  (company, role) =>
    `Hey — noticed ${company} is hiring for ${role}. That search usually takes 3-6 months and $200k+ in first-year cost. We deliver the same capability as a finished AI system in a fraction of the time. Happy to share a relevant project we shipped recently. Worth 10 minutes?`,
];

/**
 * Select a fallback template deterministically by company name hash.
 */
function selectFallbackTemplate(company, role = '') {
  const seed = company + role;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
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
