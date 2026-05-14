"use client";
import React, { useState, useEffect } from 'react';
import { 
  Globe, Zap, Users, Search, Target, MessageSquare, 
  MapPin, CheckCircle2, ChevronRight, Activity, 
  Briefcase, Loader2, Download, Check, Copy, Clock,
  Mail, Trash2, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../../components/Logo';
import { scanAllSources } from '../../utils/leadSources';

function App() {
  const { user, logout, isLoading: authLoading } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login';
    }
  }, [user, authLoading]);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Global');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [apifyKey, setApifyKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [highIntentOnly, setHighIntentOnly] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // 1. Auto-Save state using Local Storage (Hydration Safe)
  const [leads, setLeads] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('dealfinder_leads');
    if (saved) {
      try { setLeads(JSON.parse(saved)); } catch (e) {}
    }
    setApifyKey(localStorage.getItem('df_apify_api_key') || '');
  }, []);

  const saveApifyKey = (val: string) => {
    setApifyKey(val);
    localStorage.setItem('df_apify_api_key', val);
  };

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('dealfinder_leads', JSON.stringify(leads));
    }
  }, [leads, mounted]);

  const timeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 2. Dynamic Color Coding for Intent Scores
  const getScoreColor = (score) => {
    if (score >= 90) return '#27c93f'; // Glowing Green
    if (score >= 80) return '#ffbd2e'; // Warm Yellow
    return '#888'; // Neutral Grey
  };

  const exportToCSV = () => {
    const dataToExport = highIntentOnly ? leads.filter(l => l.intentScore >= 85) : leads;
    if (dataToExport.length === 0) return;

    const headers = ['Company', 'Country', 'Intent Score', 'Signal', 'Suggested Outreach', 'Source URL', 'Posted'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(l => 
        `"${l.company.replace(/"/g, '""')}","${l.country}","${l.intentScore}","${l.problem.replace(/"/g, '""')}","${l.outreach.replace(/"/g, '""')}","${l.sourceUrl}","${l.postedAt}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DealFinder_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearResults = () => {
    if(window.confirm('Are you sure you want to clear your current leads dashboard?')) {
      setLeads([]);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsScanning(true);
    setLeads([]);
    setScanStatus('Initializing multi-source scan...');
    
    try {
      const results = await scanAllSources(searchQuery, location, (update: any) => {
        if (update.status === 'scanning') {
          setScanStatus(`Scanning ${update.source.name}...`);
        } else if (update.status === 'done') {
          setScanStatus(`Found ${update.count} leads from ${update.source.name}`);
        }
      });
      setLeads(results);
    } catch (err) {
      console.error(err);
      alert('Error fetching leads. Please try again.');
    } finally {
      setIsScanning(false);
      setScanStatus('');
    }
  };

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={32} color="#fff" />
      </div>
    );
  }

  return (
    <>
      {/* Top Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 2rem', borderBottom: '1px solid #27272a',
        background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Logo style={{ height: '64px', width: 'auto' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
            Welcome, <strong style={{ color: '#fff' }}>{user.name}</strong>
          </span>
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', background: 'transparent',
              border: '1px solid #333', borderRadius: '8px',
              color: '#888', fontSize: '0.85rem', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#ff5f56'; (e.currentTarget as HTMLElement).style.color = '#ff5f56'; }}
            onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#333'; (e.currentTarget as HTMLElement).style.color = '#888'; }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </nav>

      <section className="hero container text-center">
        <h1>Find Clients Who Are Already Looking for You</h1>
        <p>AI-powered lead intelligence that detects real buying intent across the web — before your competitors do.</p>
        
        <p className="mb-8" style={{ color: '#fff', opacity: 0.7, fontWeight: 500 }}>
          "Not another lead tool. This is a decision engine."
        </p>

        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => {
            document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => document.getElementById('search-input')?.focus(), 500);
          }}>Start Free Analysis</button>
          <button className="btn-secondary" onClick={() => {
            document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
          }}>View Demo</button>
        </div>
      </section>

      <section className="simulator" id="simulator">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="section-title" style={{marginBottom: '1rem', fontSize: '2rem'}}>Live Intent Simulator</h2>
            <p style={{color: 'var(--text-secondary)'}}>Try the engine. Enter your niche and see the magic.</p>
          </div>
          
          <form className="simulator-form" onSubmit={handleScan}>
            <input 
              id="search-input"
              type="text" 
              className="simulator-input" 
              placeholder="e.g. AI automation, SEO, Web Design"
              list="niche-options"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <datalist id="niche-options">
              <option value="AI Automation" />
              <option value="Software Engineering" />
              <option value="Marketing" />
              <option value="SEO" />
              <option value="Web Design" />
              <option value="Data Science" />
              <option value="Customer Support" />
            </datalist>
            <select 
              className="simulator-input" 
              style={{maxWidth: '150px'}}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="Global">Global</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="India">India</option>
              <option value="Germany">Germany</option>
              <option value="UAE">UAE</option>
              <option value="Singapore">Singapore</option>
            </select>
            <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={isScanning}>
              {isScanning ? <><Loader2 className="animate-spin" size={20} /> Scanning...</> : 'Scan Web'}
            </button>
          </form>

          {/* Settings Toggle */}
          <div className="text-center mt-4">
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              style={{background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.875rem'}}
            >
              {showSettings ? 'Hide API Settings' : 'API Settings (Apify)'}
            </button>
            {showSettings && (
              <div style={{marginTop: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', display: 'inline-block', textAlign: 'left'}}>
                <label style={{display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#ccc'}}>Apify API Key (for Apollo Premium Leads):</label>
                <input 
                  type="text" 
                  value={apifyKey} 
                  onChange={(e) => saveApifyKey(e.target.value)}
                  placeholder="apify_api_..."
                  style={{width: '300px', padding: '0.5rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px'}}
                />
              </div>
            )}
          </div>

          {isScanning && (
            <div className="text-center" style={{padding: '2rem', color: 'var(--text-secondary)'}}>
              <p className="flex items-center justify-center gap-2" style={{ fontSize: '1.1rem', color: '#ffbd2e' }}>
                <Activity className="animate-pulse" size={20} /> {scanStatus || 'Analyzing millions of data points...'}
              </p>
            </div>
          )}

          {leads.length > 0 && (
            <div className="dashboard-card mt-8" style={{maxWidth: '1000px'}}>
               <div className="dashboard-header" style={{justifyContent: 'space-between'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <div className="dot dot-red"></div>
                  <div className="dot dot-yellow"></div>
                  <div className="dot dot-green"></div>
                  <span style={{marginLeft: '1rem', color: '#666', fontSize: '0.875rem'}}>intent-results.sh</span>
                </div>
                
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)'}}>
                    <input 
                      type="checkbox" 
                      checked={highIntentOnly} 
                      onChange={(e) => setHighIntentOnly(e.target.checked)}
                      style={{accentColor: '#ffbd2e'}}
                    />
                    High Intent Only (85+)
                  </label>
                  <button onClick={exportToCSV} className="btn-secondary" style={{padding: '0.25rem 0.75rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <Download size={14} /> Export CSV
                  </button>
                  <button onClick={clearResults} className="btn-secondary" style={{padding: '0.25rem 0.75rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid #333', color: '#888'}}>
                    <Trash2 size={14} /> Clear
                  </button>
                </div>
              </div>
              <div className="dashboard-body" style={{background: '#111'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  {(highIntentOnly ? leads.filter(l => l.intentScore >= 85) : leads).map(lead => (
                    <div key={lead.id} className="glass-card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
                      <div style={{flex: 1, minWidth: '300px'}}>
                        <h4 style={{fontSize: '1.25rem', marginBottom: '0.5rem'}}>{lead.company} <span style={{fontSize:'0.875rem', color: '#888'}}>• {lead.country}</span></h4>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
                          <p style={{color: 'var(--text-secondary)'}}>Signal: {lead.problem}</p>
                          <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', color: '#ccc'}}>
                            <Clock size={12} /> {lead.postedAt}
                          </span>
                        </div>
                        <div style={{background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid #333', position: 'relative', marginTop: '1rem'}}>
                          <p style={{fontSize: '0.875rem', color: '#aaa', paddingRight: '4.5rem'}}><em>"{lead.outreach}"</em></p>
                          <div style={{position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '1rem'}}>
                            {/* 3. Smart Email Pre-fill */}
                            <a 
                              href={`mailto:?subject=Regarding ${lead.company} hiring a ${lead.problem.replace('Hiring: ', '')}&body=${encodeURIComponent(lead.outreach)}`}
                              style={{background: 'none', border: 'none', cursor: 'pointer', color: '#4facfe', transition: 'color 0.2s', padding: 0}}
                              title="Open in Email Client"
                            >
                              <Mail size={18} />
                            </a>
                            <button 
                              onClick={() => handleCopy(lead.id, lead.outreach)}
                              style={{background: 'none', border: 'none', cursor: 'pointer', color: copiedId === lead.id ? '#27c93f' : '#666', transition: 'color 0.2s', padding: 0}}
                              title="Copy Outreach"
                            >
                              {copiedId === lead.id ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                          </div>
                        </div>
                        {lead.sourceUrl && (
                          <a href={lead.sourceUrl} target="_blank" rel="noreferrer" style={{fontSize: '0.875rem', color: '#ffbd2e', textDecoration: 'underline', display: 'inline-block', marginTop: '1rem'}}>
                            View Real Source ↗
                          </a>
                        )}
                      </div>
                      <div className="intent-score" style={{fontSize: '1.25rem', padding: '0.75rem 1.5rem', color: getScoreColor(lead.intentScore), borderColor: getScoreColor(lead.intentScore)}}>
                        {lead.intentScore} 🔥
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works container">
        <h2 className="section-title text-center">How It Works</h2>
        <div className="steps-grid">
          <div className="glass-card text-center">
            <div className="flex justify-center"><Globe className="step-icon" /></div>
            <h3>1. Scan the Internet</h3>
            <p style={{color: 'var(--text-secondary)', marginTop: '1rem'}}>
              Continuous monitoring of LinkedIn, job boards, forums, and company websites for buying intent.
            </p>
          </div>
          <div className="glass-card text-center">
            <div className="flex justify-center"><Zap className="step-icon" /></div>
            <h3>2. Detect Buying Signals</h3>
            <p style={{color: 'var(--text-secondary)', marginTop: '1rem'}}>
              Our proprietary NLP AI identifies urgency and clear intent to purchase services in your niche.
            </p>
          </div>
          <div className="glass-card text-center">
            <div className="flex justify-center"><Target className="step-icon" /></div>
            <h3>3. Get Ready-to-Close Leads</h3>
            <p style={{color: 'var(--text-secondary)', marginTop: '1rem'}}>
              Receive a ranked list of leads along with personalized, context-aware outreach suggestions.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="features container">
        <h2 className="section-title text-center">Core Capabilities</h2>
        <div className="features-grid">
          <div className="glass-card">
            <Search className="step-icon" />
            <h3 style={{marginBottom: '1rem'}}>AI Lead Discovery</h3>
            <p style={{color: 'var(--text-secondary)'}}>Finds companies actively discussing AI, automation, and hiring in real-time across global platforms.</p>
          </div>
          <div className="glass-card">
            <Activity className="step-icon" />
            <h3 style={{marginBottom: '1rem'}}>Intent Scoring Engine</h3>
            <p style={{color: 'var(--text-secondary)'}}>Scores every lead from 0–100 based on hiring velocity, urgency language, and technological gaps.</p>
          </div>
          <div className="glass-card">
            <MessageSquare className="step-icon" />
            <h3 style={{marginBottom: '1rem'}}>Smart Outreach Generator</h3>
            <p style={{color: 'var(--text-secondary)'}}>Auto-generates highly personalized LinkedIn messages and cold emails using deep company context.</p>
          </div>
          <div className="glass-card">
            <MapPin className="step-icon" />
            <h3 style={{marginBottom: '1rem'}}>Global Market Intelligence</h3>
            <p style={{color: 'var(--text-secondary)'}}>Filter your prospecting by exact country, industry, company size, and specific budget indicators.</p>
          </div>
        </div>
      </section>

      {/* Dashboard Sample */}
      <section className="dashboard-section container" id="demo">
        <h2 className="section-title text-center">See It In Action</h2>
        <div className="dashboard-card">
          <div className="dashboard-header">
            <div className="dot dot-red"></div>
            <div className="dot dot-yellow"></div>
            <div className="dot dot-green"></div>
            <span style={{marginLeft: '1rem', color: '#666', fontSize: '0.875rem'}}>leadsora-dashboard.exe</span>
          </div>
          <div className="dashboard-body">
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem'}}>
              <div>
                <h3 style={{fontSize: '1.5rem', marginBottom: '0.25rem'}}>Smith & Co Law Firm <span style={{fontSize: '1rem', color: '#888', fontWeight: 400}}>(USA)</span></h3>
                <p style={{color: 'var(--text-secondary)'}}>Legal Services • 50-200 Employees</p>
              </div>
              <div>
                <span className="intent-score">Intent Score: 91 🔥</span>
              </div>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
              <div>
                <h4 style={{color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Zap size={18} color="#ffbd2e" /> Signal Detected</h4>
                <div className="glass-card" style={{padding: '1.5rem'}}>
                  <p><strong>Status:</strong> Hiring AI Consultant</p>
                  <p style={{marginTop: '0.5rem', color: 'var(--text-secondary)'}}><strong>Problem:</strong> Seeking solutions for contract automation and legal document review workflow.</p>
                </div>
              </div>
              
              <div>
                <h4 style={{color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><MessageSquare size={18} color="#27c93f" /> Suggested Outreach</h4>
                <div className="glass-card" style={{padding: '1.5rem'}}>
                  <p style={{color: '#ccc', fontStyle: 'italic'}}>
                    "Hi John, noticed Smith & Co is exploring AI solutions for contract automation. Our agency recently helped a similar mid-sized firm reduce document review time by 40%. Would love to share the blueprint with you."
                  </p>
                  <button className="btn-secondary" style={{marginTop: '1rem', width: '100%', padding: '0.5rem', fontSize: '0.875rem'}}>Copy to Clipboard</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container" style={{padding: '6rem 0'}}>
        <h2 className="section-title text-center">Who Wins With LEADSORA</h2>
        <div className="steps-grid">
          <div className="glass-card" style={{display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem'}}>
            <Briefcase size={32} color="#fff" />
            <div>
              <h3 style={{fontSize: '1.25rem'}}>AI Agencies</h3>
              <p style={{color: 'var(--text-secondary)'}}>Find clients faster</p>
            </div>
          </div>
          <div className="glass-card" style={{display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem'}}>
            <Users size={32} color="#fff" />
            <div>
              <h3 style={{fontSize: '1.25rem'}}>Consultants</h3>
              <p style={{color: 'var(--text-secondary)'}}>Target high-paying clients</p>
            </div>
          </div>
          <div className="glass-card" style={{display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem'}}>
            <Target size={32} color="#fff" />
            <div>
              <h3 style={{fontSize: '1.25rem'}}>Startups</h3>
              <p style={{color: 'var(--text-secondary)'}}>Validate real demand</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing container">
        <h2 className="section-title text-center">Simple, Transparent Pricing</h2>
        <div className="pricing-grid">
          <div className="glass-card pricing-card">
            <h3>Starter</h3>
            <div className="pricing-price">$29<span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>/mo</span></div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={18} color="#fff" /> 50 leads/month</li>
              <li><CheckCircle2 size={18} color="#fff" /> Basic scoring</li>
              <li><CheckCircle2 size={18} color="#fff" /> Global search</li>
            </ul>
            <button className="btn-secondary" style={{width: '100%'}} onClick={() => alert('Stripe integration coming soon! You are currently on the Beta free plan.')}>Choose Starter</button>
          </div>
          
          <div className="glass-card pricing-card popular">
            <div style={{position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#fff', color: '#000', padding: '0.25rem 1rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 'bold'}}>
              Most Popular
            </div>
            <h3>Growth</h3>
            <div className="pricing-price">$79<span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>/mo</span></div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={18} color="#fff" /> 200 leads/month</li>
              <li><CheckCircle2 size={18} color="#fff" /> Outreach generator</li>
              <li><CheckCircle2 size={18} color="#fff" /> CRM integrations</li>
            </ul>
            <button className="btn-primary" style={{width: '100%'}} onClick={() => alert('Stripe integration coming soon! You are currently on the Beta free plan.')}>Choose Growth</button>
          </div>

          <div className="glass-card pricing-card">
            <h3>Pro</h3>
            <div className="pricing-price">$199<span style={{fontSize: '1rem', color: 'var(--text-secondary)'}}>/mo</span></div>
            <ul className="pricing-features">
              <li><CheckCircle2 size={18} color="#fff" /> Unlimited leads</li>
              <li><CheckCircle2 size={18} color="#fff" /> Advanced AI insights</li>
              <li><CheckCircle2 size={18} color="#fff" /> Priority support</li>
            </ul>
            <button className="btn-secondary" style={{width: '100%'}} onClick={() => alert('Stripe integration coming soon! You are currently on the Beta free plan.')}>Choose Pro</button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2 className="section-title" style={{marginBottom: '1rem'}}>Start Closing Better Clients Today</h2>
          <p style={{color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.25rem'}}>Join the smartest AI agencies relying on LEADSORA.</p>
          <button className="btn-primary" style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}} onClick={() => {
            document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => document.getElementById('search-input')?.focus(), 500);
          }}>
            Get Started Free <ChevronRight size={20} />
          </button>
          
          <div style={{marginTop: '4rem'}}>
            <h3 style={{fontSize: '1.25rem', marginBottom: '1rem'}}>Get Early Access</h3>
            <form className="input-group" onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for subscribing! We will notify you when early access opens.');
              (e.target as HTMLFormElement).reset();
            }}>
              <input type="email" placeholder="Enter your email address" required />
              <button type="submit" className="btn-secondary">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Logo style={{ height: '48px', width: 'auto' }} />
            </div>
            <div style={{display: 'flex', gap: '2rem'}}>
              <a href="#" style={{transition: 'color 0.2s'}} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='var(--text-secondary)'}>Features</a>
              <a href="#" style={{transition: 'color 0.2s'}} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='var(--text-secondary)'}>Pricing</a>
              <a href="#" style={{transition: 'color 0.2s'}} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='var(--text-secondary)'}>Contact</a>
            </div>
            <div style={{fontSize: '0.875rem'}}>
              &copy; 2026 LEADSORA. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
