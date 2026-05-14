"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Zap, Target, MessageSquare, MapPin, CheckCircle2, ChevronRight, Activity, Briefcase, Users, Search } from 'lucide-react';
import Logo from '../components/Logo';
import MobileNav from '../components/MobileNav';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('dealfinder_user');
    if (user) router.replace('/dashboard');
  }, [router]);

  return (
    <>
      <MobileNav />

      {/* Hero */}
      <section className="hero container text-center">
        <h1>Find Clients Who Are Already Looking for You</h1>
        <p>AI-powered lead intelligence that detects real buying intent across the web — before your competitors do.</p>
        <p className="mb-8" style={{ color: '#fff', opacity: 0.7, fontWeight: 500 }}>"Not another lead tool. This is a decision engine."</p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => router.push('/signup')}>Start Free Analysis</button>
          <button className="btn-secondary" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>View Demo</button>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works container">
        <h2 className="section-title text-center">How It Works</h2>
        <div className="steps-grid">
          <div className="glass-card text-center">
            <div className="flex justify-center"><Globe className="step-icon" /></div>
            <h3>1. Scan the Internet</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Continuous monitoring of LinkedIn, job boards, forums, and company websites for buying intent.</p>
          </div>
          <div className="glass-card text-center">
            <div className="flex justify-center"><Zap className="step-icon" /></div>
            <h3>2. Detect Buying Signals</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Our proprietary NLP AI identifies urgency and clear intent to purchase services in your niche.</p>
          </div>
          <div className="glass-card text-center">
            <div className="flex justify-center"><Target className="step-icon" /></div>
            <h3>3. Get Ready-to-Close Leads</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Receive a ranked list of leads along with personalized, context-aware outreach suggestions.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features container">
        <h2 className="section-title text-center">Core Capabilities</h2>
        <div className="features-grid">
          <div className="glass-card"><Search className="step-icon" /><h3 style={{ marginBottom: '1rem' }}>AI Lead Discovery</h3><p style={{ color: 'var(--text-secondary)' }}>Finds companies actively discussing AI, automation, and hiring in real-time across global platforms.</p></div>
          <div className="glass-card"><Activity className="step-icon" /><h3 style={{ marginBottom: '1rem' }}>Intent Scoring Engine</h3><p style={{ color: 'var(--text-secondary)' }}>Scores every lead from 0–100 based on hiring velocity, urgency language, and technological gaps.</p></div>
          <div className="glass-card"><MessageSquare className="step-icon" /><h3 style={{ marginBottom: '1rem' }}>Smart Outreach Generator</h3><p style={{ color: 'var(--text-secondary)' }}>Auto-generates highly personalized LinkedIn messages and cold emails using deep company context.</p></div>
          <div className="glass-card"><MapPin className="step-icon" /><h3 style={{ marginBottom: '1rem' }}>Global Market Intelligence</h3><p style={{ color: 'var(--text-secondary)' }}>Filter your prospecting by exact country, industry, company size, and specific budget indicators.</p></div>
        </div>
      </section>

      {/* Demo */}
      <section className="dashboard-section container" id="demo">
        <h2 className="section-title text-center">See It In Action</h2>
        <div className="dashboard-card">
          <div className="dashboard-header">
            <div className="dot dot-red"></div><div className="dot dot-yellow"></div><div className="dot dot-green"></div>
            <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.875rem' }}>leadsora-dashboard.exe</span>
          </div>
          <div className="dashboard-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Smith &amp; Co Law Firm <span style={{ fontSize: '1rem', color: '#888', fontWeight: 400 }}>(USA)</span></h3>
                <p style={{ color: 'var(--text-secondary)' }}>Legal Services • 50-200 Employees</p>
              </div>
              <div><span className="intent-score">Intent Score: 91 🔥</span></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div>
                <h4 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={18} color="#ffbd2e" /> Signal Detected</h4>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <p><strong>Status:</strong> Hiring AI Consultant</p>
                  <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}><strong>Problem:</strong> Seeking solutions for contract automation and legal document review workflow.</p>
                </div>
              </div>
              <div>
                <h4 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageSquare size={18} color="#27c93f" /> Suggested Outreach</h4>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <p style={{ color: '#ccc', fontStyle: 'italic' }}>"Hi John, noticed Smith &amp; Co is exploring AI solutions for contract automation. Our agency recently helped a similar mid-sized firm reduce document review time by 40%. Would love to share the blueprint."</p>
                  <button className="btn-secondary" style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}>Copy to Clipboard</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Wins */}
      <section className="container" style={{ padding: '6rem 0' }}>
        <h2 className="section-title text-center">Who Wins With LEADSORA</h2>
        <div className="steps-grid">
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}><Briefcase size={32} color="#fff" /><div><h3 style={{ fontSize: '1.25rem' }}>AI Agencies</h3><p style={{ color: 'var(--text-secondary)' }}>Find clients faster</p></div></div>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}><Users size={32} color="#fff" /><div><h3 style={{ fontSize: '1.25rem' }}>Consultants</h3><p style={{ color: 'var(--text-secondary)' }}>Target high-paying clients</p></div></div>
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}><Target size={32} color="#fff" /><div><h3 style={{ fontSize: '1.25rem' }}>Startups</h3><p style={{ color: 'var(--text-secondary)' }}>Validate real demand</p></div></div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing container">
        <h2 className="section-title text-center">Simple, Transparent Pricing</h2>
        <div className="pricing-grid">
          <div className="glass-card pricing-card">
            <h3>Starter</h3>
            <div className="pricing-price">$29<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/mo</span></div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={18} color="#fff" /> 50 leads/month</li>
              <li><CheckCircle2 size={18} color="#fff" /> Basic scoring</li>
              <li><CheckCircle2 size={18} color="#fff" /> Global search</li>
            </ul>
            <button className="btn-secondary" style={{ width: '100%' }} onClick={() => router.push('/signup')}>Choose Starter</button>
          </div>
          <div className="glass-card pricing-card popular">
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#fff', color: '#000', padding: '0.25rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 'bold' }}>Most Popular</div>
            <h3>Growth</h3>
            <div className="pricing-price">$79<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/mo</span></div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={18} color="#fff" /> 200 leads/month</li>
              <li><CheckCircle2 size={18} color="#fff" /> Outreach generator</li>
              <li><CheckCircle2 size={18} color="#fff" /> CRM integrations</li>
            </ul>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => router.push('/signup')}>Choose Growth</button>
          </div>
          <div className="glass-card pricing-card">
            <h3>Pro</h3>
            <div className="pricing-price">$199<span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/mo</span></div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={18} color="#fff" /> Unlimited leads</li>
              <li><CheckCircle2 size={18} color="#fff" /> Advanced AI insights</li>
              <li><CheckCircle2 size={18} color="#fff" /> Priority support</li>
            </ul>
            <button className="btn-secondary" style={{ width: '100%' }} onClick={() => router.push('/signup')}>Choose Pro</button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <h2 className="section-title" style={{ marginBottom: '1rem' }}>Start Closing Better Clients Today</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.25rem' }}>Join the smartest AI agencies relying on LEADSORA.</p>
          <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => router.push('/signup')}>
            Get Started Free <ChevronRight size={20} />
          </button>
          <div style={{ marginTop: '4rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Get Early Access</h3>
            <form className="input-group" onSubmit={e => { e.preventDefault(); alert('Thank you! We will notify you when early access opens.'); (e.target as HTMLFormElement).reset(); }}>
              <input type="email" placeholder="Enter your email address" required />
              <button type="submit" className="btn-secondary">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <Logo style={{ height: '48px', width: 'auto' }} />
            <div style={{ display: 'flex', gap: '2rem' }}>
              <a href="#" style={{ transition: 'color 0.2s' }} onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.color = '#fff'} onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}>Features</a>
              <a href="#" style={{ transition: 'color 0.2s' }} onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.color = '#fff'} onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}>Pricing</a>
              <a href="#" style={{ transition: 'color 0.2s' }} onMouseOver={e => (e.currentTarget as HTMLAnchorElement).style.color = '#fff'} onMouseOut={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}>Contact</a>
            </div>
            <div style={{ fontSize: '0.875rem' }}>&copy; 2026 LEADSORA. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
