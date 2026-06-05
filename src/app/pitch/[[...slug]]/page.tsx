"use client";
import React, { useState, useEffect } from 'react';
import { TrendingDown, Zap, Clock, CheckCircle2, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function PitchDeck({ params, searchParams }: { params: Promise<{ slug?: string[] }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = React.use(params);
  const resolvedSearch = React.use(searchParams);
  
  const [mounted, setMounted] = useState(false);
  const [showContact, setShowContact] = useState(false);
  
  const slugArray = resolvedParams.slug || ['company'];
  const companySlug = slugArray[0];
  const companyName = companySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  const senderEmail = resolvedSearch?.e as string || '';
  const senderPhone = resolvedSearch?.p as string || '';
  
  let jobTitle = resolvedSearch?.t as string || 'your open role';
  if (slugArray.length > 1) {
    jobTitle = slugArray.slice(1).join(' ').replace(/-/g, ' ');
  }
  const roleName = jobTitle.replace(/\b\w/g, l => l.toUpperCase());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
      
      {/* Background Effects */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(79, 172, 254, 0.15) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
        
        {/* Header */}
        <div 
          style={{ textAlign: 'center', marginBottom: '4rem', animation: 'fadeInUp 0.6s ease-out forwards' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f', boxShadow: '0 0 10px #27c93f' }} />
            <span style={{ fontSize: '0.85rem', color: '#a1a1aa', letterSpacing: '1px', textTransform: 'uppercase' }}>Exclusive Proposal for {companyName}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Accelerate <span style={{ background: 'linear-gradient(135deg, #7c3aed, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{companyName}&apos;s</span> Growth.
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Bypass the 3-month hiring cycle for {roleName === 'Your Open Role' ? 'your open role' : `your ${roleName}`}. Deploy an elite fractional team tomorrow and hit your scaling targets immediately.
          </p>
        </div>

        {/* The Speed & Risk Arbitrage Widget */}
        <div 
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '3rem', marginBottom: '4rem', backdropFilter: 'blur(10px)', animation: 'fadeInUp 0.6s ease-out 0.2s forwards', opacity: 0 }}
        >
          <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem', textAlign: 'center' }}>The Execution Arbitrage</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            
            {/* In-House Speed */}
            <div style={{ background: 'rgba(255, 95, 86, 0.05)', border: '1px solid rgba(255, 95, 86, 0.2)', borderRadius: '16px', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#ff5f56' }} />
              <p style={{ color: '#ff5f56', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Traditional In-House</p>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.2 }}>3 to 6<br/><span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 400 }}>Months to Value</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#a1a1aa', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li style={{ display: 'flex', gap: '8px' }}><TrendingDown size={16} color="#ff5f56" /> 45-90 Day Recruiting Cycle</li>
                <li style={{ display: 'flex', gap: '8px' }}><Clock size={16} color="#ff5f56" /> 30+ Day Onboarding Ramp</li>
                <li style={{ display: 'flex', gap: '8px' }}><TrendingDown size={16} color="#ff5f56" /> Severance & Firing Risk</li>
              </ul>
            </div>

            {/* Fractional Speed */}
            <div style={{ background: 'linear-gradient(180deg, rgba(39, 201, 63, 0.1) 0%, rgba(39, 201, 63, 0.02) 100%)', border: '1px solid rgba(39, 201, 63, 0.3)', borderRadius: '16px', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#27c93f' }} />
              <p style={{ color: '#27c93f', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Fractional Partnership</p>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.2 }}>48<br/><span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 400 }}>Hours to Value</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#a1a1aa', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li style={{ display: 'flex', gap: '8px' }}><Zap size={16} color="#27c93f" /> Start Tomorrow</li>
                <li style={{ display: 'flex', gap: '8px' }}><CheckCircle2 size={16} color="#27c93f" /> Immediate System Integration</li>
                <li style={{ display: 'flex', gap: '8px' }}><CheckCircle2 size={16} color="#27c93f" /> Pause or Cancel Anytime</li>
              </ul>
            </div>
            
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '2.5rem', padding: '1.5rem', background: 'var(--input-bg)', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>The Outcome: <span style={{ color: '#27c93f', fontSize: '1.5rem' }}>Zero Execution Risk</span></h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Skip the hiring pipeline and start shipping immediately.</p>
          </div>
        </div>

        {/* Execution Plan */}
        <div 
          style={{ marginBottom: '4rem', animation: 'fadeInUp 0.6s ease-out 0.4s forwards', opacity: 0 }}
        >
          <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>The Execution Roadmap</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { title: "Day 1: Onboarding & Audit", desc: `We integrate directly into ${companyName}'s Slack & workflows. Immediate audit of bottlenecks.` },
              { title: "Week 1: Quick Wins Deployed", desc: "We deploy our first set of deliverables to instantly clear your backlog and generate momentum." },
              { title: "Month 1: Scaling Systems", desc: `Full optimization. We operate as an extension of the ${companyName} team, scaling output autonomously.` }
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#a78bfa', fontSize: '1.25rem', fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>{step.title}</h4>
                  <p style={{ color: '#a1a1aa', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div 
          style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(79, 172, 254, 0.1))', padding: '4rem 2rem', borderRadius: '24px', border: '1px solid rgba(124, 58, 237, 0.2)', animation: 'fadeInUp 0.6s ease-out 0.6s forwards', opacity: 0 }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Ready to scale {companyName}?</h2>
          <p style={{ color: '#a1a1aa', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Let&apos;s hop on a 15-minute discovery call to map out exactly how we can step in.</p>
          
          {showContact ? (
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', display: 'inline-flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', animation: 'fadeInUp 0.3s ease-out forwards' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Direct Contact Info</p>
              {senderEmail && <a href={`mailto:${senderEmail}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>📧 {senderEmail}</a>}
              {senderPhone && <a href={`tel:${senderPhone}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>📞 {senderPhone}</a>}
              {!senderEmail && !senderPhone && <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', margin: 0 }}>Please reply directly to the email you received to schedule a call!</p>}
            </div>
          ) : (
            <button onClick={() => setShowContact(true)} style={{ background: '#fff', color: '#000', border: 'none', cursor: 'pointer', padding: '1rem 2.5rem', borderRadius: '999px', fontSize: '1.1rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
              <Calendar size={20} />
              Book Discovery Call
            </button>
          )}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
