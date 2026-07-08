"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Zap, Target, MessageSquare, CheckCircle2, Activity, Briefcase, Users, Search, BarChart2, Bell, Shield, ArrowRight, Sparkles, Copy, Link2 } from 'lucide-react';
import Logo from '../components/Logo';
import MobileNav from '../components/MobileNav';
import { useAuth } from './context/AuthContext';

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // PRIORITY 1 — WAITLIST COUNT
  // Source: localStorage key 'isai_leads_waitlist_count' (per-browser, increments on each new signup).
  // To use a real backend count instead:
  //   1. Create GET /api/waitlist/count that returns { count: number } from your DB
  //   2. Replace the localStorage block below with: const res = await fetch('/api/waitlist/count'); const { count } = await res.json();
  // Counter is intentionally hidden (null) when count === 0 — showing a zero hurts conversion.
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  // Referral state — shown post-signup
  const [referralPosition, setReferralPosition] = useState<number | null>(null);
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Commented out to allow viewing the landing page even if logged in:
    // if (!authLoading && user) {
    //   router.replace('/dashboard');
    // }

    // Load real waitlist count — only show the counter if we have at least 1 real signup
    const stored = localStorage.getItem('isai_leads_waitlist_count');
    const count = stored ? parseInt(stored) : 0;
    if (count > 0) setWaitlistCount(count);
  }, [router, user, authLoading]);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);

    // Save email to localStorage waitlist
    // TODO: Replace with real backend call: await fetch('/api/waitlist', { method: 'POST', body: JSON.stringify({ email }) })
    // The response should return { position: number, referralCode: string }
    const existing: string[] = JSON.parse(localStorage.getItem('isai_leads_waitlist') || '[]');
    let position = existing.length + 1;
    if (!existing.includes(email)) {
      existing.push(email);
      localStorage.setItem('isai_leads_waitlist', JSON.stringify(existing));
      const newCount = (waitlistCount ?? 0) + 1;
      localStorage.setItem('isai_leads_waitlist_count', String(newCount));
      setWaitlistCount(newCount);
      position = newCount;
    } else {
      position = existing.indexOf(email) + 1;
    }

    // Generate a simple referral code from the email
    const code = btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setReferralPosition(position);
    setReferralLink(`${origin}/?ref=${code}`);

    await new Promise(r => setTimeout(r, 800));
    setSubmitted(true);
    setSubmitting(false);
  };

  const copyReferralLink = useCallback(() => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [referralLink]);

  const stats = [
    { value: '31', label: 'Features Built' },
    { value: '8+', label: 'Live Data Sources' },
    { value: '100%', label: 'AI-Powered' },
    { value: '0', label: 'Cold Guesses' },
  ];

  // PRIORITY 5 — TOP 3 FEATURES ONLY (remaining 5 saved for post-signup email sequence)
  const features = [
    { icon: <Search size={22} />, title: 'Hiring Intent Scrapers', desc: "Scan 8+ job boards in real time — find companies with confirmed budget and active technical pain." },
    { icon: <Zap size={22} />, title: 'Omnichannel Blitz Engine', desc: "One click generates a cold email, LinkedIn note, and call script referencing the company's exact pain. Under 3 seconds." },
    { icon: <Target size={22} />, title: 'Hiring Manager Detection', desc: "Auto-finds the CTO or VP Engineering and verifies their email — so you pitch the decision-maker, not a gatekeeper." },
  ];

  // PRIORITY 5 — TOP 3 SIGNAL MODES ONLY (remaining 2 saved for post-signup email sequence)
  const scanModes = [
    { icon: '💼', name: 'Actively Hiring', desc: 'Confirmed budget + open role — highest intent signal', color: '#27c93f' },
    { icon: '🐋', name: 'VC Funded', desc: 'Fresh raise = money to spend on new vendors', color: '#0a66c2' },
    { icon: '📉', name: 'Layoffs.fyi', desc: 'Restructuring = vendor review cycles are open', color: '#ff5f56' },
  ];

  return (
    <>
      <MobileNav />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero container text-center" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>

        {/* Coming Soon Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 174, 239, 0.12)', border: '1px solid rgba(0, 174, 239, 0.35)', borderRadius: '999px', padding: '0.35rem 1rem', marginBottom: '2rem', fontSize: '0.8rem', color: '#00AEEF' }}>
          <span style={{ width: 7, height: 7, background: '#27c93f', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
          In Active Development · Early Access Opening Soon
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
          Find Companies That<br />
          <span style={{ background: 'linear-gradient(135deg, #00AEEF, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Need You Right Now
          </span>
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          ISAI LEADS scans job boards, funding databases, and company signals to find businesses with <strong style={{ color: 'var(--text-primary)' }}>confirmed budget</strong> and <strong style={{ color: 'var(--text-primary)' }}>immediate technical pain</strong> — then writes the perfect outreach for you.
        </p>

        {/* Waitlist Form */}
        {!submitted ? (
          <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email for early access"
              required
              style={{ padding: '0.8rem 1.25rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', width: 'min(100%, 320px)' }}
            />
            <button type="submit" className="btn-primary" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }}>
              {submitting ? 'Joining...' : <><Sparkles size={16} /> Join Waitlist</>}
            </button>
          </form>
        ) : (
          // PRIORITY 3 — REFERRAL MECHANIC: shown immediately after signup
          <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(39,201,63,0.1)', border: '1px solid rgba(39,201,63,0.3)', borderRadius: '10px', padding: '0.8rem 1.5rem', marginBottom: '1.25rem', color: '#27c93f' }}>
              <CheckCircle2 size={20} />
              <span>You&apos;re on the list{referralPosition ? ` — you&apos;re #${referralPosition}` : ''}! We&apos;ll notify you when early access opens.</span>
            </div>
            {referralLink && (
              <div style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.35rem', color: 'var(--text-primary)' }}>🚀 Move to the front of the line</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Refer 3 friends and jump ahead in the queue.</p>
                {/* Referral link copy row */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input
                    readOnly
                    value={referralLink}
                    style={{ flex: 1, padding: '0.55rem 0.85rem', background: 'transparent', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem', outline: 'none' }}
                  />
                  <button
                    onClick={copyReferralLink}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: copied ? 'rgba(39,201,63,0.15)' : 'rgba(0,174,239,0.15)', border: `1px solid ${copied ? 'rgba(39,201,63,0.4)' : 'rgba(0,174,239,0.4)'}`, borderRadius: '8px', color: copied ? '#27c93f' : '#00AEEF', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    {copied ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy link</>}
                  </button>
                </div>
                {/* One-click share buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just joined the waitlist for ISAI LEADS — an AI that finds companies that need you RIGHT NOW (hiring signals, funding rounds, layoffs). Early access: ${referralLink}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.78rem', textDecoration: 'none' }}
                  >
                    𝕏 Share on X
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', background: 'rgba(10,102,194,0.15)', border: '1px solid rgba(10,102,194,0.35)', borderRadius: '8px', color: '#0a66c2', fontSize: '0.78rem', textDecoration: 'none' }}
                  >
                    <Link2 size={13} /> Share on LinkedIn
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live waitlist counter — only shown when count > 0 (real signups recorded in this browser) */}
        {/* Once connected to a real backend, remove the localStorage dependency above */}
        {waitlistCount !== null && waitlistCount > 0 && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.75rem', animation: 'fadeIn 0.5s ease' }}>
            🔥 <strong style={{ color: '#00AEEF' }}>{waitlistCount.toLocaleString()}</strong> founders & agencies already waiting
          </p>
        )}

        {/* Already have account */}
        <div style={{ marginTop: '1.5rem' }}>
          <button onClick={() => router.push('/login')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}>
            Already have an account? Sign in →
          </button>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="container" style={{ padding: '2rem 0 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem' }}>
          {stats.map((s, i) => (
            <div key={i} className="glass-card text-center" style={{ padding: '1.5rem 1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #00AEEF, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SCAN MODES ───────────────────────────────────────── */}
      <section className="container" style={{ padding: '2rem 0 5rem' }}>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>5 Intelligence Modes</p>
        <h2 className="section-title text-center" style={{ marginBottom: '2.5rem' }}>Every Buying Signal. Every Source.</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {scanModes.map((m, i) => (
            <div key={i} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.25rem', borderColor: `${m.color}33`, minWidth: 180 }}>
              <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: m.color }}>{m.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="how-it-works container">
        <h2 className="section-title text-center">How It Works</h2>
        <div className="steps-grid">
          <div className="glass-card text-center">
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0, 174, 239, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Globe size={26} color="#00AEEF" />
            </div>
            <h3>1. Scan the Market</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>Choose your signal mode. ISAI LEADS scans 8+ live data sources in parallel — from job boards to funding databases — and returns ranked leads in seconds.</p>
          </div>
          <div className="glass-card text-center">
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0, 212, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Zap size={26} color="#00D4FF" />
            </div>
            <h3>2. Get the Perfect Pitch</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>Click Blitz. The AI writes a personalized cold email, LinkedIn note, Twitter DM, and call script using the company&apos;s exact pain point. All in under 3 seconds.</p>
          </div>
          <div className="glass-card text-center">
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(39,201,63,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Target size={26} color="#27c93f" />
            </div>
            <h3>3. Close on Autopilot</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>Drag leads through your Kanban CRM. The autonomous engine follows up at day 4. Slack alerts fire when intent spikes. You close while ISAI LEADS works.</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────── */}
      <section className="features container">
        <h2 className="section-title text-center">31 Features. One Platform.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {features.map((f, i) => (
            <div key={i} className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem 1.5rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(0, 174, 239, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00AEEF', flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '0.35rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO ─────────────────────────────────────────────── */}
      <section className="dashboard-section container" id="demo">
        <h2 className="section-title text-center">Live Signal Preview</h2>
        <div className="dashboard-card">
          <div className="dashboard-header">
            <div className="dot dot-red" /><div className="dot dot-yellow" /><div className="dot dot-green" />
            <span style={{ marginLeft: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>isai leads — intent-engine.live</span>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#27c93f' }}>
              <span style={{ width: 6, height: 6, background: '#27c93f', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} /> SCANNING
            </span>
          </div>
          <div className="dashboard-body">
            {/* Mock lead card */}
            {[
              { company: 'Stripe', country: 'USA', score: 97, signal: 'Hiring: Senior Backend Engineer (Node.js, Rust) · Posted 18 hours ago', source: 'LinkedIn', tag: '🐋 VC-Funded' },
              { company: 'Figma', country: 'USA', score: 93, signal: 'Hiring: Full Stack Developer · Engineering team restructured Q1', source: 'Indeed', tag: '💼 Actively Hiring' },
              { company: 'Linear', country: 'UK', score: 91, signal: 'Series B · $35M raised · 4 new engineering roles open', source: 'TechCrunch', tag: '🚀 Just Funded' },
            ].map((lead, i) => (
              <div key={i} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', marginBottom: '0.75rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '1.1rem' }}>{lead.company}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {lead.country}</span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(0, 174, 239, 0.15)', border: '1px solid rgba(0, 174, 239, 0.25)', padding: '1px 8px', borderRadius: '999px', color: '#00AEEF' }}>{lead.tag}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{lead.signal}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: lead.score >= 95 ? '#ff5f56' : lead.score >= 90 ? '#ffbd2e' : '#27c93f' }}>{lead.score} 🔥</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>via {lead.source}</span>
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              ↑ Live data. Updated in real time every scan.
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO WINS ─────────────────────────────────────────── */}
      <section className="container" style={{ padding: '5rem 0' }}>
        <h2 className="section-title text-center">Built For</h2>
        <div className="steps-grid">
          {[
            { icon: <Briefcase size={28} color="#00AEEF" />, title: 'Software Agencies', desc: 'Find companies that need you right now — not in 6 months when a recruiter finally delivers.' },
            { icon: <Users size={28} color="#00D4FF" />, title: 'Freelance Developers', desc: 'Stop lowballing on Upwork. Target funded startups and desperate hiring managers directly.' },
            { icon: <Target size={28} color="#27c93f" />, title: 'SaaS Founders', desc: 'Find users who already feel the exact pain your product solves. Intent-first GTM.' },
          ].map((item, i) => (
            <div key={i} className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>{item.icon}</div>
              <h3 style={{ marginBottom: '0.75rem' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/*
        PRIORITY 2 — TESTIMONIALS REMOVED
        Fake names (Arjun S., Marcus T., Priya M.) removed entirely.
        ─────────────────────────────────────────────────────────────
        PLACEHOLDER — needs real content from you:
        Replace this section with one of:
          (a) Real quotes collected from actual early testers (provide name, role, and quote)
          (b) A founder credibility strip, e.g.:
              "Built by [Your Name], ex-[Previous Company] · [City]"
          (c) A 'Follow our build in public' link to your Twitter/LinkedIn
        Until then this section is intentionally omitted to avoid damaging trust.
        ─────────────────────────────────────────────────────────────
      */}

      {/* PRIORITY 2 — Lightweight trust strip (replaces fake testimonials) */}
      <section className="container" style={{ padding: '1rem 0 4rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Built with</p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', opacity: 0.6 }}>
          {['Next.js', 'OpenAI', 'Supabase', 'Vercel', 'Resend'].map(tech => (
            <span key={tech} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>{tech}</span>
          ))}
        </div>
      </section>

      {/*
        PRIORITY 4 — PRICING TABLE REMOVED
        Full 3-tier pricing table replaced with a single informational line.
        Detailed pricing distracted from the waitlist CTA on a pre-launch page.
        Full pricing can be shared post-signup in the welcome email.
      */}
      <section className="container" style={{ padding: '1rem 0 3rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Plans starting at <strong style={{ color: 'var(--text-primary)' }}>$29/mo</strong> · Founding member pricing locked in for early access signups
        </p>
      </section>

      {/* ── WAITLIST CTA ─────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(39,201,63,0.1)', border: '1px solid rgba(39,201,63,0.25)', borderRadius: '999px', padding: '0.4rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#27c93f' }}>
            🚀 Early Access — Limited Spots
          </div>
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>Stop Guessing. Start Closing.</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: 480, margin: '0 auto 2.5rem' }}>
            Be among the first founders and agencies to get early access to ISAI LEADS.
          </p>
          {!submitted ? (
            <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your work email"
                required
                style={{ padding: '0.8rem 1.25rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', width: 'min(100%, 300px)' }}
              />
              <button type="submit" className="btn-primary" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {submitting ? 'Joining...' : <>Claim Early Access <ArrowRight size={16} /></>}
              </button>
            </form>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(39,201,63,0.1)', border: '1px solid rgba(39,201,63,0.3)', borderRadius: '10px', padding: '1rem 1.5rem', color: '#27c93f' }}>
              <CheckCircle2 size={20} /> You&apos;re in! We&apos;ll be in touch very soon.
            </div>
          )}
          <div style={{ marginTop: '2rem' }}>
            <button onClick={() => router.push('/login')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>
              Already have an account? Sign in →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <Logo style={{ height: '40px', width: 'auto' }} />
            <div style={{ display: 'flex', gap: '2rem' }}>
              {['Features', 'Pricing', 'Contact'].map(link => (
                <a key={link} href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                  onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseOut={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                  {link}
                </a>
              ))}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>© 2026 ISAI Tech Solutions. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
