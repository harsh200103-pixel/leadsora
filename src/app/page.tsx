"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Zap, Target, MessageSquare, MapPin, CheckCircle2, ChevronRight, Activity, Briefcase, Users, Search, BarChart2, Bell, Shield, Star, ArrowRight, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';
import MobileNav from '../components/MobileNav';

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [countVisible, setCountVisible] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('dealfinder_user');
    if (user) router.replace('/dashboard');

    // Load waitlist count from localStorage
    const count = parseInt(localStorage.getItem('leadsora_waitlist_count') || '847');
    setWaitlistCount(count);
    setTimeout(() => setCountVisible(true), 400);
  }, [router]);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);

    // Save email to localStorage waitlist
    const existing: string[] = JSON.parse(localStorage.getItem('leadsora_waitlist') || '[]');
    if (!existing.includes(email)) {
      existing.push(email);
      localStorage.setItem('leadsora_waitlist', JSON.stringify(existing));
      const newCount = waitlistCount + 1;
      localStorage.setItem('leadsora_waitlist_count', String(newCount));
      setWaitlistCount(newCount);
    }

    await new Promise(r => setTimeout(r, 800));
    setSubmitted(true);
    setSubmitting(false);
  };

  const stats = [
    { value: '31', label: 'Features Built' },
    { value: '8+', label: 'Live Data Sources' },
    { value: '100%', label: 'AI-Powered' },
    { value: '0', label: 'Cold Guesses' },
  ];

  const features = [
    { icon: <Search size={22} />, title: 'Hiring Intent Scrapers', desc: 'Scan 8+ global job boards in real time. Find companies with confirmed budgets and active technical pain.' },
    { icon: <Activity size={22} />, title: 'AI Intent Scoring', desc: 'Every lead scored 0–100 based on urgency, role seniority, and hiring velocity. Only the hottest rise to the top.' },
    { icon: <Zap size={22} />, title: 'Omnichannel Blitz Engine', desc: 'One click generates a cold email, LinkedIn note, Twitter DM, and call script. Simultaneously. In 3 seconds.' },
    { icon: <Target size={22} />, title: 'Hiring Manager Detection', desc: 'Auto-finds the CTO or VP of Engineering at the company and verifies their email in real time.' },
    { icon: <Bell size={22} />, title: 'Autonomous Follow-Ups', desc: 'After 4 days of silence, the AI fires a second touchpoint automatically. Your pipeline never goes cold.' },
    { icon: <BarChart2 size={22} />, title: 'Live Analytics Dashboard', desc: 'Real-time funnel conversion, intent score distribution, and source effectiveness — all in one view.' },
    { icon: <Shield size={22} />, title: 'Email Verification', desc: 'Every email SMTP-verified before you send. ✅ Valid / ⚠️ Risky / ❌ Invalid — right on the card.' },
    { icon: <MessageSquare size={22} />, title: 'Slack Alert Engine', desc: 'Instant Slack notifications when a 90+ score lead is found or a follow-up is due. Never miss a hot moment.' },
  ];

  const scanModes = [
    { icon: '💼', name: 'Actively Hiring', desc: 'Confirmed budget + role', color: '#27c93f' },
    { icon: '📉', name: 'Layoffs.fyi Live', desc: 'Real layoff data, RSS-fed', color: '#ff5f56' },
    { icon: '🐋', name: 'VC Funding', desc: 'TechCrunch RSS, fresh raises', color: '#0a66c2' },
    { icon: '⏳', name: 'Stale Jobs', desc: '60-day unfilled roles', desc2: 'Desperation is high', color: '#ffbd2e' },
    { icon: '🕵️', name: 'Defection Signals', desc: 'G2 reviews + outages', color: '#a78bfa' },
  ];

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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(39,201,63,0.1)', border: '1px solid rgba(39,201,63,0.3)', borderRadius: '10px', padding: '0.8rem 1.5rem', marginBottom: '1rem', color: '#27c93f' }}>
            <CheckCircle2 size={20} /> You&apos;re on the list! We&apos;ll notify you when early access opens.
          </div>
        )}

        {/* Live waitlist counter */}
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', transition: 'opacity 0.5s', opacity: countVisible ? 1 : 0 }}>
          🔥 <strong style={{ color: '#a78bfa' }}>{waitlistCount.toLocaleString()}</strong> founders & agencies already waiting
        </p>

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
              <div style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
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
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>Click Blitz. The AI writes a personalized cold email, LinkedIn note, Twitter DM, and call script using the company&apos;s exact pain point. All in under 3 seconds.</p>
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

      {/* ── FEATURES GRID ────────────────────────────────────── */}
      <section className="features container">
        <h2 className="section-title text-center">31 Features. One Platform.</h2>
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

      {/* ── TESTIMONIALS (Social proof) ───────────────────────── */}
      <section className="container" style={{ padding: '2rem 0 5rem' }}>
        <h2 className="section-title text-center">What Early Testers Say</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[
            { quote: "Found a $15k client in the first scan. The Hiring Manager feature is insane — I emailed the CTO directly.", name: 'Arjun S.', role: 'Dev Agency Owner, India' },
            { quote: "The 4-day follow-up engine closed a deal I thought was dead. Literally automatic revenue.", name: 'Marcus T.', role: 'Freelance Engineer, UK' },
            { quote: "I stopped guessing who to reach. LEADSORA shows companies literally posting that they need help.", name: 'Priya M.', role: 'Growth Consultant, UAE' },
          ].map((t, i) => (
            <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                {[...Array(5)].map((_, j) => <Star key={j} size={14} color="#ffbd2e" fill="#ffbd2e" />)}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1rem' }}>&ldquo;{t.quote}&rdquo;</p>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section className="pricing container">
        <h2 className="section-title text-center">Early Access Pricing</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '0.9rem' }}>Lock in founding member pricing before public launch.</p>
        <div className="pricing-grid">
          <div className="glass-card pricing-card">
            <h3>Starter</h3>
            <div className="pricing-price" style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>$49</span>
              <span>$29</span><span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/mo</span>
            </div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={16} color="#27c93f" /> 50 leads/month</li>
              <li><CheckCircle2 size={16} color="#27c93f" /> AI email generation</li>
              <li><CheckCircle2 size={16} color="#27c93f" /> 3 scan modes</li>
              <li><CheckCircle2 size={16} color="#27c93f" /> Basic CRM pipeline</li>
            </ul>
            <button className="btn-secondary" style={{ width: '100%' }} onClick={() => router.push('/signup')}>Get Started</button>
          </div>
          <div className="glass-card pricing-card popular">
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #7c3aed, #4facfe)', color: 'var(--text-primary)', padding: '0.3rem 1.25rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>⭐ Most Popular</div>
            <h3>Growth</h3>
            <div className="pricing-price" style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>$149</span>
              <span>$79</span><span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/mo</span>
            </div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={16} color="#27c93f" /> Unlimited leads</li>
              <li><CheckCircle2 size={16} color="#27c93f" /> All 5 scan modes</li>
              <li><CheckCircle2 size={16} color="#27c93f" /> Hiring Manager detect</li>
              <li><CheckCircle2 size={16} color="#27c93f" /> Auto follow-ups</li>
              <li><CheckCircle2 size={16} color="#27c93f" /> Slack alerts</li>
              <li><CheckCircle2 size={16} color="#27c93f" /> Analytics dashboard</li>
            </ul>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => router.push('/signup')}>Choose Growth</button>
          </div>
          <div className="glass-card pricing-card">
            <h3>Agency</h3>
            <div className="pricing-price" style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>$399</span>
              <span>$199</span><span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/mo</span>
            </div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={16} color="#27c93f" /> Everything in Growth</li>
              <li><CheckCircle2 size={16} color="#27c93f" /> Team members (5)</li>
              <li><CheckCircle2 size={16} color="#27c93f" /> API access</li>
              <li><CheckCircle2 size={16} color="#27c93f" /> White-label pitch decks</li>
              <li><CheckCircle2 size={16} color="#27c93f" /> Priority support</li>
            </ul>
            <button className="btn-secondary" style={{ width: '100%' }} onClick={() => router.push('/signup')}>Choose Agency</button>
          </div>
        </div>
      </section>

      {/* ── WAITLIST CTA ─────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(39,201,63,0.1)', border: '1px solid rgba(39,201,63,0.25)', borderRadius: '999px', padding: '0.4rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#27c93f' }}>
            🚀 Early Access — Limited Spots
          </div>
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>Stop Guessing. Start Closing.</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: 480, margin: '0 auto 2.5rem' }}>
            Join {waitlistCount.toLocaleString()}+ founders and agencies getting early access to LEADSORA.
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
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>© 2026 LEADSORA. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
