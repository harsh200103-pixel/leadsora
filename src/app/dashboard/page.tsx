"use client";
import React, { useState, useEffect } from 'react';
import { Activity, Loader2, Download, Check, Copy, Clock, Mail, Trash2, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../../components/Logo';
import { scanAllSources } from '../../utils/leadSources';

function Dashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) window.location.href = '/login';
  }, [user, authLoading]);

  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Global');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [hunterKey, setHunterKey] = useState('b937eb0f532629a23bc002872195055922026f68'); // Default to provided key
  const [rapidApiKey, setRapidApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [highIntentOnly, setHighIntentOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [aiOutreach, setAiOutreach] = useState<{[key: string]: string}>({});
  const [foundEmails, setFoundEmails] = useState<{[key: string]: any[]}>({});
  const [fetchingEmailsFor, setFetchingEmailsFor] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('dealfinder_leads');
    if (saved) { try { setLeads(JSON.parse(saved)); } catch (e) {} }
    const savedHunter = localStorage.getItem('df_hunter_api_key');
    if (savedHunter) setHunterKey(savedHunter);
    const savedRapid = localStorage.getItem('df_rapid_api_key');
    if (savedRapid) setRapidApiKey(savedRapid);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem('dealfinder_leads', JSON.stringify(leads));
  }, [leads, mounted]);

  const saveHunterKey = (val: string) => { setHunterKey(val); localStorage.setItem('df_hunter_api_key', val); };
  const saveRapidApiKey = (val: string) => { setRapidApiKey(val); localStorage.setItem('df_rapid_api_key', val); };

  const timeAgo = (dateString: string) => {
    if (!dateString) return 'Recently';
    const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today'; if (days === 1) return 'Yesterday'; return `${days} days ago`;
  };
  const handleCopy = (id: string, text: string) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };
  const getScoreColor = (score: number) => { if (score >= 90) return '#27c93f'; if (score >= 80) return '#ffbd2e'; return '#888'; };

  const exportToCSV = () => {
    const data = highIntentOnly ? leads.filter(l => l.intentScore >= 85) : leads;
    if (!data.length) return;
    const csv = ['Company,Country,Intent Score,Signal,Outreach,Source,Posted', ...data.map(l => `"${l.company}","${l.country}","${l.intentScore}","${l.problem}","${l.outreach}","${l.sourceUrl}","${l.postedAt}"`)].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `LEADSORA_${new Date().toISOString().split('T')[0]}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault(); if (!searchQuery) return;
    setIsScanning(true); setLeads([]); setScanStatus('Initializing multi-source scan...');
    try {
      const results = await scanAllSources(searchQuery, location, (update: any) => {
        if (update.status === 'scanning') setScanStatus(`Scanning ${update.source.name}...`);
        else if (update.status === 'done') setScanStatus(`Found ${update.count} leads from ${update.source.name}`);
      });
      setLeads(results);
    } catch (err) { console.error(err); alert('Error fetching leads.'); }
    finally { setIsScanning(false); setScanStatus(''); }
  };

  const generateAIOutreach = async (lead: any) => {
    if (generatingId) return; setGeneratingId(lead.id);
    try {
      const res = await fetch('/api/generate-outreach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company: lead.company, title: lead.problem?.replace('Hiring: ', '') || '', contactName: lead.contactName || null }) });
      const data = await res.json();
      if (data.outreach) setAiOutreach(prev => ({ ...prev, [lead.id]: data.outreach }));
    } catch (err) { console.error(err); } finally { setGeneratingId(null); }
  };

  const fetchEmailsWithHunter = async (lead: any) => {
    if (!hunterKey) return alert("Please add your Hunter.io API key in the settings first!");
    setFetchingEmailsFor(lead.id);
    try {
      // Clean company name (remove Inc, LLC, etc for better matching)
      const cleanCompany = lead.company.replace(/ LLC| Inc\.?| Corp\.?| Ltd\.?/gi, '').trim();
      const res = await fetch(`https://api.hunter.io/v2/domain-search?company=${encodeURIComponent(cleanCompany)}&limit=5&api_key=${hunterKey}`);
      const data = await res.json();
      
      if (data?.data?.emails?.length > 0) {
        setFoundEmails(prev => ({ ...prev, [lead.id]: data.data.emails }));
      } else {
        setFoundEmails(prev => ({ ...prev, [lead.id]: [] })); // Found nothing
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch from Hunter.io. Verify your API key.");
    } finally {
      setFetchingEmailsFor(null);
    }
  };

  if (authLoading || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="animate-spin" size={32} color="#fff" />
    </div>
  );

  return (
    <>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #27272a', background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <Logo style={{ height: '64px', width: 'auto' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Welcome, <strong style={{ color: '#fff' }}>{user.name}</strong></span>
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#888', fontSize: '0.85rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ff5f56'; (e.currentTarget as HTMLElement).style.color = '#ff5f56'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#333'; (e.currentTarget as HTMLElement).style.color = '#888'; }}
          ><LogOut size={14} /> Sign Out</button>
        </div>
      </nav>

      {/* Scanner Hero */}
      <section className="hero container text-center" style={{ paddingTop: '3rem', paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>Live Intent Scanner</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Enter your niche and find companies actively looking for what you offer.</p>
      </section>

      {/* Scanner */}
      <section className="simulator" id="simulator">
        <div className="container">
          <form className="simulator-form" onSubmit={handleScan}>
            <input id="search-input" type="text" className="simulator-input" placeholder="e.g. AI automation, SEO, Web Design" list="niche-options" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <datalist id="niche-options">
              <option value="AI Automation" /><option value="Software Engineering" /><option value="Marketing" />
              <option value="SEO" /><option value="Web Design" /><option value="Data Science" />
            </datalist>
            <select className="simulator-input" style={{ maxWidth: '150px' }} value={location} onChange={e => setLocation(e.target.value)}>
              <option value="Global">Global</option><option value="USA">USA</option><option value="UK">UK</option>
              <option value="Canada">Canada</option><option value="Australia">Australia</option>
              <option value="India">India</option><option value="Germany">Germany</option><option value="UAE">UAE</option>
            </select>
            <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={isScanning}>
              {isScanning ? <><Loader2 className="animate-spin" size={20} /> Scanning...</> : 'Scan Web'}
            </button>
          </form>

          {/* Settings */}
          <div className="text-center mt-4">
            <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.875rem' }}>
              {showSettings ? 'Hide API Settings' : 'API Settings (Hunter.io)'}
            </button>
            {showSettings && (
              <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '1rem', justifyContent: 'center', textAlign: 'left', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#ccc' }}>Hunter.io API Key (Email Discovery):</label>
                  <input type="password" value={hunterKey} onChange={e => saveHunterKey(e.target.value)} placeholder="Enter Hunter.io API key..." style={{ width: '280px', padding: '0.5rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#ccc' }}>RapidAPI Key (JSearch India Leads):</label>
                  <input type="password" value={rapidApiKey} onChange={e => saveRapidApiKey(e.target.value)} placeholder="Enter RapidAPI key..." style={{ width: '280px', padding: '0.5rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                </div>
              </div>
            )}
          </div>

          {isScanning && (
            <div className="text-center" style={{ padding: '2rem', color: 'var(--text-secondary)' }}>
              <p className="flex items-center justify-center gap-2" style={{ fontSize: '1.1rem', color: '#ffbd2e' }}>
                <Activity className="animate-pulse" size={20} /> {scanStatus || 'Analyzing millions of data points...'}
              </p>
            </div>
          )}

          {/* Results */}
          {leads.length > 0 && (
            <div className="dashboard-card mt-8" style={{ maxWidth: '1000px' }}>
              <div className="dashboard-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="dot dot-red"></div><div className="dot dot-yellow"></div><div className="dot dot-green"></div>
                  <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.875rem' }}>intent-results.sh</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={highIntentOnly} onChange={e => setHighIntentOnly(e.target.checked)} style={{ accentColor: '#ffbd2e' }} /> High Intent Only (85+)
                  </label>
                  <button onClick={exportToCSV} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Download size={14} /> Export CSV</button>
                  <button onClick={() => { if (window.confirm('Clear leads?')) setLeads([]); }} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid #333', color: '#888' }}><Trash2 size={14} /> Clear</button>
                </div>
              </div>

              <div className="dashboard-body" style={{ background: '#111' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(highIntentOnly ? leads.filter(l => l.intentScore >= 85) : leads).map(lead => (
                    <div key={lead.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1, minWidth: '300px' }}>
                        <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{lead.company} <span style={{ fontSize: '0.875rem', color: '#888' }}>• {lead.country}</span></h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                          <p style={{ color: 'var(--text-secondary)' }}>Signal: {lead.problem}</p>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', color: '#ccc' }}><Clock size={12} /> {lead.postedAt}</span>
                        </div>

                        {/* Outreach Box */}
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: `1px solid ${aiOutreach[lead.id] ? '#7c3aed55' : '#333'}`, position: 'relative', marginTop: '1rem' }}>
                          {aiOutreach[lead.id] && <span style={{ position: 'absolute', top: '-10px', left: '12px', background: 'linear-gradient(135deg,#7c3aed,#4facfe)', color: '#fff', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>✨ AI Generated</span>}
                          <p style={{ fontSize: '0.875rem', color: aiOutreach[lead.id] ? '#e2e8f0' : '#aaa', paddingRight: '5.5rem' }}><em>"{aiOutreach[lead.id] || lead.outreach}"</em></p>
                          <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => generateAIOutreach(lead)} disabled={!!generatingId} style={{ background: 'none', border: 'none', cursor: generatingId ? 'not-allowed' : 'pointer', color: aiOutreach[lead.id] ? '#a78bfa' : '#555', padding: 0 }} title="Generate AI Outreach">
                              {generatingId === lead.id ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            </button>
                            <a href={`mailto:${foundEmails[lead.id]?.[0]?.value || lead.contactEmail || ''}?subject=${encodeURIComponent(`Exploring synergies: ${lead.problem?.replace('Hiring: ', '') || 'Open Role'} at ${lead.company}`)}&body=${encodeURIComponent(aiOutreach[lead.id] || lead.outreach)}`} style={{ color: '#4facfe', padding: 0 }} title="Email"><Mail size={18} /></a>
                            <button onClick={() => handleCopy(lead.id, aiOutreach[lead.id] || lead.outreach)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === lead.id ? '#27c93f' : '#666', padding: 0 }} title="Copy">{copiedId === lead.id ? <Check size={18} /> : <Copy size={18} />}</button>
                          </div>
                        </div>

                        {/* Contact Info / Hunter Integration */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '1rem' }}>
                          <button 
                            onClick={() => fetchEmailsWithHunter(lead)} 
                            disabled={fetchingEmailsFor === lead.id}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#fff', background: '#ffbd2e', border: 'none', padding: '4px 12px', borderRadius: '999px', cursor: fetchingEmailsFor === lead.id ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                          >
                            {fetchingEmailsFor === lead.id ? <Loader2 size={12} className="animate-spin" /> : '🎯'} Find Emails
                          </button>
                          
                          {lead.contactLinkedIn
                            ? <a href={lead.contactLinkedIn} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.78rem', color: '#fff', background: '#0a66c2', padding: '4px 12px', borderRadius: '999px', textDecoration: 'none' }}>in LinkedIn</a>
                            : <a href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(lead.company + ' hiring')}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '999px', textDecoration: 'none' }}>🔍 LinkedIn</a>
                          }
                          {lead.sourceUrl && <a href={lead.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: '#ffbd2e', textDecoration: 'underline', marginLeft: 'auto' }}>View Source ↗</a>}
                        </div>

                        {/* Display Found Emails */}
                        {foundEmails[lead.id] && (
                          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid #27272a' }}>
                            <h5 style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Decision Makers Found</h5>
                            {foundEmails[lead.id].length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {foundEmails[lead.id].map((em: any, idx: number) => (
                                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                    <div style={{ color: '#ccc' }}>
                                      <strong style={{ color: '#fff' }}>{em.first_name} {em.last_name}</strong> {em.position && <span style={{ color: '#888' }}>- {em.position}</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                      <a href={`mailto:${em.value}`} style={{ color: '#4facfe', textDecoration: 'none' }}>{em.value}</a>
                                      <button onClick={() => handleCopy(`em-${idx}-${em.value}`, em.value)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === `em-${idx}-${em.value}` ? '#27c93f' : '#666', padding: '0 4px' }} title="Copy Email">
                                        {copiedId === `em-${idx}-${em.value}` ? <Check size={14} /> : <Copy size={14} />}
                                      </button>
                                      {em.sources?.[0]?.uri?.includes('linkedin') && (
                                        <a href={em.sources[0].uri} target="_blank" rel="noreferrer" style={{ color: '#0a66c2', marginLeft: '4px' }} title="LinkedIn Profile">in</a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>No direct emails found for {lead.company}. Try manual LinkedIn search.</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="intent-score" style={{ fontSize: '1.25rem', padding: '0.75rem 1.5rem', color: getScoreColor(lead.intentScore), borderColor: getScoreColor(lead.intentScore) }}>{lead.intentScore} 🔥</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Dashboard;
