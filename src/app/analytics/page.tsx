"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Logo from '../../components/Logo';
import { BarChart2, TrendingUp, Users, Mail, Zap, Target, ArrowLeft, Activity } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) window.location.href = '/login';
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    const prefix = `_${user.email}`;

    // Load all lead data from localStorage
    const rawLeads = localStorage.getItem(`dealfinder_leads${prefix}`);
    const rawOutreach = localStorage.getItem(`dealfinder_ai_outreach${prefix}`);
    const rawEmails = localStorage.getItem(`dealfinder_found_emails${prefix}`);

    const leads: any[] = rawLeads ? JSON.parse(rawLeads) : [];
    const outreach: Record<string, string> = rawOutreach ? JSON.parse(rawOutreach) : {};
    const emails: Record<string, any[]> = rawEmails ? JSON.parse(rawEmails) : {};

    // Pipeline funnel counts
    const statusCounts = { New: 0, Contacted: 0, 'In Discussion': 0, Closed: 0 };
    leads.forEach(l => {
      const s = l.status || 'New';
      if (s in statusCounts) statusCounts[s as keyof typeof statusCounts]++;
    });

    // Source breakdown
    const sourceCounts: Record<string, number> = {};
    leads.forEach(l => {
      const src = l.source || 'Unknown';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });
    const topSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    // Intent score distribution
    const scoreBuckets = { '90–100 🔥': 0, '80–89 ⚡': 0, '70–79 📈': 0, 'Below 70 📊': 0 };
    leads.forEach(l => {
      const s = l.intentScore || 0;
      if (s >= 90) scoreBuckets['90–100 🔥']++;
      else if (s >= 80) scoreBuckets['80–89 ⚡']++;
      else if (s >= 70) scoreBuckets['70–79 📈']++;
      else scoreBuckets['Below 70 📊']++;
    });

    // Scan mode breakdown
    const modeCounts: Record<string, { count: number; totalScore: number }> = {};
    leads.forEach(l => {
      const mode = l.scanMode || 'hiring';
      if (!modeCounts[mode]) modeCounts[mode] = { count: 0, totalScore: 0 };
      modeCounts[mode].count++;
      modeCounts[mode].totalScore += l.intentScore || 0;
    });
    const modeStats = Object.entries(modeCounts).map(([mode, data]) => ({
      mode,
      count: data.count,
      avgScore: data.count > 0 ? Math.round(data.totalScore / data.count) : 0,
    })).sort((a, b) => b.avgScore - a.avgScore);

    // Summary stats
    const totalOutreach = Object.keys(outreach).length;
    const totalEmails = Object.keys(emails).length;
    const avgScore = leads.length > 0
      ? Math.round(leads.reduce((acc, l) => acc + (l.intentScore || 0), 0) / leads.length)
      : 0;
    const hotLeads = leads.filter(l => (l.intentScore || 0) >= 90).length;

    setStats({
      totalLeads: leads.length,
      totalOutreach,
      totalEmails,
      avgScore,
      hotLeads,
      statusCounts,
      topSources,
      scoreBuckets,
      modeStats,
    });
  }, [user]);

  if (authLoading || !user || !stats) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Activity size={32} color="#7c3aed" style={{ animation: 'pulse 1.5s infinite', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  const funnelTotal = stats.totalLeads || 1;
  const funnelStages = [
    { label: 'New Leads', count: stats.statusCounts['New'], color: '#4facfe', emoji: '🎯' },
    { label: 'Contacted', count: stats.statusCounts['Contacted'], color: '#27c93f', emoji: '📧' },
    { label: 'In Discussion', count: stats.statusCounts['In Discussion'], color: '#ffbd2e', emoji: '💬' },
    { label: 'Closed', count: stats.statusCounts['Closed'], color: '#7c3aed', emoji: '🏆' },
  ];

  const modeLabels: Record<string, string> = {
    hiring: '👔 Actively Hiring',
    layoff: '📉 Restructuring',
    vc_whale: '💸 Recently Funded',
    stale_job: '🚨 Urgent/Stale',
    defection_signal: '🕵️ Defection Signal',
  };

  const maxSource = stats.topSources[0]?.[1] || 1;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.5rem', borderBottom: '1px solid #1a1a1a', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <Logo style={{ height: '44px', width: 'auto' }} />
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', border: '1px solid var(--input-border)', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s' }}
          onMouseOver={(e: any) => e.currentTarget.style.color = '#fff'}
          onMouseOut={(e: any) => e.currentTarget.style.color = '#888'}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <BarChart2 size={28} color="#7c3aed" />
            <h1 style={{ fontSize: '1.8rem', margin: 0, background: 'linear-gradient(135deg, var(--text-primary) 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Sales Intelligence Dashboard
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Live analytics calculated from your CRM pipeline and scan history.</p>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Leads', value: stats.totalLeads, icon: <Target size={18} />, color: '#4facfe' },
            { label: 'Hot Leads (90+)', value: stats.hotLeads, icon: <Zap size={18} />, color: '#ff5f56' },
            { label: 'Pitches Generated', value: stats.totalOutreach, icon: <TrendingUp size={18} />, color: '#7c3aed' },
            { label: 'Emails Found', value: stats.totalEmails, icon: <Mail size={18} />, color: '#27c93f' },
            { label: 'Avg Intent Score', value: stats.avgScore, icon: <Activity size={18} />, color: '#ffbd2e' },
          ].map((kpi, i) => (
            <div key={i} style={{ background: 'var(--input-bg)', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: kpi.color, marginBottom: '0.75rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {kpi.icon} {kpi.label}
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>
                {kpi.value}
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: kpi.color, opacity: 0.4 }} />
            </div>
          ))}
        </div>

        {/* Pipeline Funnel + Score Distribution */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Pipeline Funnel */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} color="#4facfe" /> Pipeline Funnel
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {funnelStages.map((stage, i) => {
                const pct = Math.round((stage.count / funnelTotal) * 100);
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '0.82rem' }}>
                      <span style={{ color: '#ccc' }}>{stage.emoji} {stage.label}</span>
                      <span style={{ color: stage.color, fontWeight: 700 }}>{stage.count} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ background: 'var(--surface)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(pct, 2)}%`, height: '100%', background: stage.color, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {stats.statusCounts['Closed'] > 0 && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '8px', border: '1px solid rgba(124,58,237,0.2)', fontSize: '0.78rem', color: '#a78bfa', textAlign: 'center' }}>
                🏆 {stats.statusCounts['Closed']} deals closed — conversion rate: {Math.round((stats.statusCounts['Closed'] / funnelTotal) * 100)}%
              </div>
            )}
          </div>

          {/* Intent Score Distribution */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} color="#ffbd2e" /> Intent Score Distribution
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(stats.scoreBuckets).map(([bucket, count]: any, i) => {
                const colors = ['#ff5f56', '#ffbd2e', '#4facfe', '#555'];
                const pct = stats.totalLeads > 0 ? Math.round((count / stats.totalLeads) * 100) : 0;
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span style={{ color: '#ccc' }}>{bucket}</span>
                      <span style={{ color: colors[i], fontWeight: 700 }}>{count} leads</span>
                    </div>
                    <div style={{ background: 'var(--surface)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(pct, 2)}%`, height: '100%', background: colors[i], borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Sources */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={16} color="#27c93f" /> Top Lead Sources
          </h2>
          {stats.topSources.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No leads scanned yet. Run your first scan to see source analytics.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.topSources.map(([source, count]: any, i: number) => {
                const pct = Math.round((count / maxSource) * 100);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '160px', fontSize: '0.8rem', color: '#aaa', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{source}</span>
                    <div style={{ flex: 1, background: 'var(--surface)', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: `hsl(${140 + i * 30}, 70%, 50%)`, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                    </div>
                    <span style={{ width: '36px', textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Scan Mode Performance */}
        {stats.modeStats.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="#7c3aed" /> Scan Mode Performance
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {stats.modeStats.map((mode: any, i: number) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {modeLabels[mode.mode] || mode.mode}
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: mode.avgScore >= 85 ? '#ff5f56' : mode.avgScore >= 75 ? '#ffbd2e' : '#4facfe' }}>
                    {mode.avgScore}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>avg score · {mode.count} leads</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {stats.totalLeads === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
            <BarChart2 size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No data yet</h3>
            <p>Run your first scan on the dashboard to start seeing analytics here.</p>
            <Link href="/dashboard" style={{ display: 'inline-block', marginTop: '1rem', padding: '10px 24px', background: '#7c3aed', borderRadius: '8px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.9rem' }}>
              Go to Dashboard →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
