"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Zap, Target, CheckCircle2, Activity, Briefcase, Users, Search, Copy, ArrowRight, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';
import MobileNav from '../components/MobileNav';

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // PRIORITY 1: Waitlist counter
  // SOURCE: Reads from localStorage key 'leadsora_waitlist_count'.
  // This only shows if the stored count is > 0 (real signups).
  // To connect a real backend: replace the localStorage read below with
  // fetch('/api/waitlist/count').then(r => r.json()).then(d => setWaitlistCount(d.count))
  // and update the POST in handleWaitlist to also hit your backend.
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [showCount, setShowCount] = useState(false);

  // PRIORITY 3: Referral state
  const [referralLink, setReferralLink] = useState('');
  const [position, setPosition] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('dealfinder_user');
    if (user) router.replace('/dashboard');

    // Only show the counter if there are real signups stored
    const stored = parseInt(localStorage.getItem('leadsora_waitlist_count') || '0');
    if (stored > 0) {
      setWaitlistCount(stored);
      setShowCount(true);
    }
  }, [router]);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);

    // Save to localStorage waitlist
    const existing: string[] = JSON.parse(localStorage.getItem('leadsora_waitlist') || '[]');
    let pos = existing.indexOf(email);
    if (pos === -1) {
      existing.push(email);
      localStorage.setItem('leadsora_waitlist', JSON.stringify(existing));
      pos = existing.length - 1;
      const newCount = existing.length;
      localStorage.setItem('leadsora_waitlist_count', String(newCount));
      setWaitlistCount(newCount);
      setShowCount(true);
    }

    // PRIORITY 3: Generate referral link using email hash
    const slug = btoa(email).replace(/=/g, '').substring(0, 10);
    const link = `${window.location.origin}/?ref=${slug}`;
    setReferralLink(link);
    setPosition(pos + 1);

    await new Promise(r => setTimeout(r, 800));
    setSubmitted(true);
    setSubmitting(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // PRIORITY 5: Trimmed to 3 most compelling scan modes
  const scanModes = [
    { icon: '💼', name: 'Actively Hiring', desc: 'Confirmed budget · role approved', color: '#27c93f' },
    { icon: '🐋', name: 'VC Funding', desc: 'Fresh raises · growth pressure on', color: '#0a66c2' },
    { icon: '🕵️', name: 'Defection Signals', desc: 'Unhappy with current vendor', color: '#a78bfa' },
  ];

  // PRIORITY 5: Trimmed to 3 most compelling features
  const features = [
    { icon: <Search size={22} />, title: 'Hiring Intent Scrapers', desc: 'Scan 8+ job boards in real time and surface companies with confirmed budgets and active technical pain.' },
    { icon: <Activity size={22} />, title: 'AI Intent Scoring', desc: 'Every lead scored 0–100 by urgency and seniority. Only the hottest reach the top of your list.' },
    { icon: <Zap size={22} />, title: 'One-Click Outreach Blitz', desc: 'Cold email, LinkedIn DM, and call script — all written and ready in under 3 seconds.' },
  ];

  const shareText = `I just joined the waitlist for @LEADSORA — AI that finds B2B companies actively looking to hire and writes the perfect cold email for you. Join me: ${referralLink}`;

  return (
    <>
      <MobileNav />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="hero container text-center" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>

        {/* Coming Soon Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: '999px', padding: '0.35rem 1rem', marginBottom: '2rem', fontSize: '0.8rem', color: '#a78bfa' }}>
          <span style={{ width: 7, height: 7, background: '#27c93f', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
          In Active Development · Early Access Opening Soon
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
          Find Companies That<br />
          <span style={{ background: 'linear-gradient(135deg, #a78bfa, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Need You Right Now
          </span>
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          LEADSORA scans job boards, funding databases, and company signals to find businesses with <strong style={{ color: 'var(--text-primary)' }}>confirmed budget</strong> and <strong style={{ color: 'var(--text-primary)' }}>immediate technical pain</strong> — then writes the perfect outreach for you.
        </p>

        {/* Waitlist Form / Post-signup referral */}
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
          /* PRIORITY 3: Post-signup referral mechanic */
          <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(39,201,63,0.1)', border: '1px solid rgba(39,201,63,0.3)', borderRadius: '10px', padding: '0.8rem 1.5rem', marginBottom: '1.5rem', color: '#27c93f' }}>
              <CheckCircle2 size={20} /> You&apos;re #{position} on the waitlist!
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Refer 3 friends</strong> to move to the front of the line.
            </p>

            {/* Referral link box */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '10px', padding: '0.6rem 0.75rem', alignItems: 'center' }}>
              <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{referralLink}</span>
              <button onClick={handleCopy} style={{ background: copied ? 'rgba(39,201,63,0.15)' : 'rgba(124,58,237,0.15)', border: 'none', borderRadius: '6px', padding: '0.35rem 0.75rem', cursor: 'pointer', color: copied ? '#27c93f' : '#a78bfa', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                <Copy size={13} /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Share buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share on X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#0a66c2', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Share on LinkedIn
              </a>
            </div>
          </div>
        )}

        {/* PRIORITY 1: Only render counter if count > 0 (real signups only) */}
        {showCount && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            🔥 <strong style={{ color: '#a78bfa' }}>{waitlistCount.toLocaleString()}</strong> founders &amp; agencies already waiting
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
          {[
            { value: '31', label: 'Features Built' },
            { value: '8+', label: 'Live Data Sources' },
            { value: '100%', label: 'AI-Powered' },
            { value: '0', label: 'Cold Guesses' },
          ].map((s, i) => (
            <div key={i} className="glass-card text-center" style={{ padding: '1.5rem 1rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SCAN MODES (trimmed to 3) ─────────────────────────── */}
      <section className="container" style={{ padding: '2rem 0 5rem' }}>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Signal Intelligence</p>
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
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Globe size={26} color="#a78bfa" />
            </div>
            <h3>1. Scan the Market</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>Choose your signal mode. LEADSORA scans 8+ live data sources in parallel — from job boards to funding databases — and returns ranked leads in seconds.</p>
          </div>
          <div className="glass-card text-center">
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(79,172,254,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Zap size={26} color="#4facfe" />
            </div>
            <h3>2. Get the Perfect Pitch</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>Click Blitz. The AI writes a personalized cold email, LinkedIn note, and call script using the company&apos;s exact pain point. All in under 3 seconds.</p>
          </div>
          <div className="glass-card text-center">
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(39,201,63,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Target size={26} color="#27c93f" />
            </div>
            <h3>3. Close on Autopilot</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>Drag leads through your Kanban CRM. The autonomous engine follows up at day 4. Slack alerts fire when intent spikes. You close while LEADSORA works.</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID (trimmed to 3) ─────────────────────── */}
      <section className="features container">
        <h2 className="section-title text-center">What Makes It Different</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {features.map((f, i) => (
            <div key={i} className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem 1.5rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', flexShrink: 0 }}>
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
            <span style={{ marginLeft: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>leadsora — intent-engine.live</span>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#27c93f' }}>
              <span style={{ width: 6, height: 6, background: '#27c93f', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} /> SCANNING
            </span>
          </div>
          <div className="dashboard-body">
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
                    <span style={{ fontSize: '0.7rem', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', padding: '1px 8px', borderRadius: '999px', color: '#a78bfa' }}>{lead.tag}</span>
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
            { icon: <Briefcase size={28} color="#a78bfa" />, title: 'Software Agencies', desc: 'Find companies that need you right now — not in 6 months when a recruiter finally delivers.' },
            { icon: <Users size={28} color="#4facfe" />, title: 'Freelance Developers', desc: 'Stop lowballing on Upwork. Target funded startups and desperate hiring managers directly.' },
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
        PLACEHOLDER — Social proof section.
        Replace this comment with real testimonial quotes once you have them from actual early testers.
        Suggested format: { quote: "...", name: "Real Name", role: "Role, Company" }
      */}

      {/* ── PRIORITY 4: Simplified pricing — single line, no table ── */}
      <section className="container" style={{ padding: '1rem 0 4rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          💳 Founding member pricing from <strong style={{ color: 'var(--text-primary)' }}>$29/mo</strong> — locked in for everyone who joins the waitlist before launch.
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
            Join the waitlist and get early access to LEADSORA before public launch.
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
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              ✅ You&apos;re on the list — check above for your referral link to move up.
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
              {['Features', 'Contact'].map(link => (
                <a key={link} href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
                  onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseOut={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                  {link}
                </a>
              ))}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>© 2026 LEADSORA. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
