"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Loader2, Download, Check, Copy, Clock, Mail, Trash2, LogOut, Sparkles, X, User, Settings, AlignLeft, AlignJustify, FileText, BarChart2, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import Logo from '../../components/Logo';
import { scanAllSources } from '../../utils/leadSources';

const Typewriter = ({ text, delay = 10 }: { text: string, delay?: number }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => { setCurrentText(''); setCurrentIndex(0); }, [text]);
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);
  return <span>{currentText}</span>;
};

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
  const [rapidApiKey, setRapidApiKey] = useState('dce6b2a37amshb9608bc3c001bdfp140418jsnef8c85290652');
  const [userPersona, setUserPersona] = useState('Software Development Agency');
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');
  const [showSettings, setShowSettings] = useState(false);
  const [scanMode, setScanMode] = useState<'hiring' | 'layoff' | 'vc_whale' | 'stale_job' | 'defection_signal'>('hiring');
  const [followUpModal, setFollowUpModal] = useState<any>(null);
  const [searchType, setSearchType] = useState<'keyword' | 'cloner'>('keyword');
  const [ghostModeEnabled, setGhostModeEnabled] = useState(false);
  const [blitzLead, setBlitzLead] = useState<any>(null);
  const [highIntentOnly, setHighIntentOnly] = useState(false);
  const [emailLength, setEmailLength] = useState<'short' | 'detailed'>('short');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [aiOutreach, setAiOutreach] = useState<{[key: string]: string}>({});
  const [foundEmails, setFoundEmails] = useState<{[key: string]: any[]}>({});
  const [hunterData, setHunterData] = useState<{[key: string]: any}>({});
  const [fetchingEmailsFor, setFetchingEmailsFor] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  // ── New Feature State ──
  const [notes, setNotes] = useState<{[key: string]: string}>({});
  const [showNote, setShowNote] = useState<{[key: string]: boolean}>({});
  const [emailVerification, setEmailVerification] = useState<{[key: string]: 'valid' | 'risky' | 'invalid' | 'checking'}>({});
  const [findingManagerFor, setFindingManagerFor] = useState<string | null>(null);
  const [slackWebhook, setSlackWebhook] = useState('');

  // Tier 2 — Filter, Sort, Presets, Score Explainer
  const [sortBy, setSortBy] = useState<'score' | 'newest' | 'company'>('score');
  const [filterScore, setFilterScore] = useState<number>(0); // 0 = show all
  const [filterSource, setFilterSource] = useState<string>('all');
  const [savedSearches, setSavedSearches] = useState<{label: string; query: string; location: string; mode: string}[]>([]);
  const [showScoreExplainer, setShowScoreExplainer] = useState<string | null>(null); // leadId

  // Business Profile State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileDismissed, setProfileDismissed] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<{
    fullName: string; jobTitle: string; companyName: string;
    email: string; phone: string; website: string; address: string;
    companyContext?: string;
    suggestedRoles?: string[];
  }>({ fullName: '', jobTitle: '', companyName: '', email: '', phone: '', website: '', address: '', companyContext: '', suggestedRoles: [] });
  const [isScrapingWebsite, setIsScrapingWebsite] = useState(false);

  // Ghost Mode Scheduler State
  const [showGhostConfig, setShowGhostConfig] = useState(false);
  const [ghostConfig, setGhostConfig] = useState({
    scanTime: '08:00', leadsPerDay: 10, scanMode: 'hiring' as string, keywords: ''
  });

  useEffect(() => {
    if (!user || authLoading) return;
    setMounted(true);
    const prefix = `_${user.email}`;
    
    const saved = localStorage.getItem(`dealfinder_leads${prefix}`);
    if (saved) { try { setLeads(JSON.parse(saved)); } catch (e) {} }
    
    const savedOutreach = localStorage.getItem(`dealfinder_ai_outreach${prefix}`);
    if (savedOutreach) { try { setAiOutreach(JSON.parse(savedOutreach)); } catch (e) {} }
    
    const savedEmails = localStorage.getItem(`dealfinder_found_emails${prefix}`);
    if (savedEmails) { try { setFoundEmails(JSON.parse(savedEmails)); } catch (e) {} }

    // API keys are platform-level, so they are not scoped to the user email
    const savedHunter = localStorage.getItem('df_hunter_api_key');
    if (savedHunter) setHunterKey(savedHunter);
    const savedRapid = localStorage.getItem('df_rapid_api_key');
    if (savedRapid) setRapidApiKey(savedRapid);
    
    const savedLength = localStorage.getItem(`df_email_length${prefix}`);
    if (savedLength) setEmailLength(savedLength as 'short' | 'detailed');
    
    const savedPersona = localStorage.getItem(`df_user_persona${prefix}`);
    if (savedPersona) setUserPersona(savedPersona);
    
    const savedProfile = localStorage.getItem(`leadsora_business_profile${prefix}`);
    if (savedProfile) { try { setBusinessProfile(JSON.parse(savedProfile)); } catch (e) {} }
    else if (user) { 
      setBusinessProfile(prev => ({ ...prev, fullName: user.name || '', email: user.email || '' }));
      setShowProfileModal(true); 
    }
    
    const savedGhost = localStorage.getItem(`leadsora_ghost_config${prefix}`);
    if (savedGhost) { try { setGhostConfig(JSON.parse(savedGhost)); } catch (e) {} }

    const savedNotes = localStorage.getItem(`leadsora_notes${prefix}`);
    if (savedNotes) { try { setNotes(JSON.parse(savedNotes)); } catch (e) {} }

    const savedSlack = localStorage.getItem('df_slack_webhook');
    if (savedSlack) setSlackWebhook(savedSlack);

    const savedSearchesData = localStorage.getItem(`leadsora_saved_searches${prefix}`);
    if (savedSearchesData) { try { setSavedSearches(JSON.parse(savedSearchesData)); } catch (e) {} }
  }, [user, authLoading]);

  useEffect(() => {
    if (mounted && user) localStorage.setItem(`dealfinder_leads_${user.email}`, JSON.stringify(leads));
  }, [leads, mounted, user]);

  useEffect(() => {
    if (mounted && user) localStorage.setItem(`dealfinder_ai_outreach_${user.email}`, JSON.stringify(aiOutreach));
  }, [aiOutreach, mounted, user]);

  useEffect(() => {
    if (mounted && user) localStorage.setItem(`dealfinder_found_emails_${user.email}`, JSON.stringify(foundEmails));
  }, [foundEmails, mounted, user]);

  const saveHunterKey = (val: string) => { setHunterKey(val); localStorage.setItem('df_hunter_api_key', val); };
  const saveRapidApiKey = (val: string) => { setRapidApiKey(val); localStorage.setItem('df_rapid_api_key', val); };
  const saveSlackWebhook = (val: string) => { setSlackWebhook(val); localStorage.setItem('df_slack_webhook', val); };

  const saveNote = (leadId: string, text: string) => {
    const updated = { ...notes, [leadId]: text };
    setNotes(updated);
    if (user) localStorage.setItem(`leadsora_notes_${user.email}`, JSON.stringify(updated));
  };

  const saveSearch = () => {
    if (!searchQuery.trim()) return;
    const label = `${searchQuery} · ${location} · ${scanMode}`;
    const newSearch = { label, query: searchQuery, location, mode: scanMode };
    const updated = [newSearch, ...savedSearches.filter(s => s.label !== label)].slice(0, 5);
    setSavedSearches(updated);
    if (user) localStorage.setItem(`leadsora_saved_searches_${user.email}`, JSON.stringify(updated));
  };

  const loadSearch = (s: {label: string; query: string; location: string; mode: string}) => {
    setSearchQuery(s.query);
    setLocation(s.location);
    setScanMode(s.mode as any);
  };

  const deleteSearch = (label: string) => {
    const updated = savedSearches.filter(s => s.label !== label);
    setSavedSearches(updated);
    if (user) localStorage.setItem(`leadsora_saved_searches_${user.email}`, JSON.stringify(updated));
  };

  // Compute filtered + sorted leads
  const getDisplayLeads = (rawLeads: any[]) => {
    let filtered = rawLeads;
    if (highIntentOnly) filtered = filtered.filter(l => l.intentScore >= 85);
    if (filterScore > 0) filtered = filtered.filter(l => l.intentScore >= filterScore);
    if (filterSource !== 'all') filtered = filtered.filter(l => (l.source || l.sourceName || '').includes(filterSource));
    if (sortBy === 'score') filtered = [...filtered].sort((a, b) => b.intentScore - a.intentScore);
    if (sortBy === 'newest') filtered = [...filtered].sort((a, b) => {
      const parse = (s: string) => { const m = s?.match(/(\d+)\s*days?/i); return m ? parseInt(m[1]) : 0; };
      return parse(a.postedAt) - parse(b.postedAt);
    });
    if (sortBy === 'company') filtered = [...filtered].sort((a, b) => a.company?.localeCompare(b.company));
    return filtered;
  };

  const sendSlackNotification = async (lead: any, type: 'new_lead' | 'follow_up') => {
    if (!slackWebhook) return;
    try {
      await fetch('/api/slack-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: slackWebhook, lead, type }),
      });
    } catch (e) { console.error('Slack notify failed', e); }
  };

  const findHiringManager = async (lead: any) => {
    if (!hunterKey) return alert('Add your Hunter.io API key in Settings first!');
    setFindingManagerFor(lead.id);
    try {
      const res = await fetch('/api/find-hiring-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: lead.company, sourceUrl: lead.sourceUrl || '', hunterKey }),
      });
      const data = await res.json();
      if (data.found && data.email) {
        setLeads(prev => prev.map(l => l.id === lead.id
          ? { ...l, contactName: data.name || l.contactName, contactEmail: data.email, contactLinkedIn: data.linkedin || l.contactLinkedIn }
          : l
        ));
        alert(`✅ Hiring Manager Found!\n\nName: ${data.name}\nTitle: ${data.title}\nEmail: ${data.email}\nDomain: ${data.domain}\n\nThe AI pitch will now address ${data.name} directly.`);
      } else {
        // Show specific, actionable error messages
        if (data.errorCode === 'QUOTA_EXCEEDED') {
          alert(`⚠️ Hunter.io Monthly Quota Reached\n\nYour free plan (25 searches/month) is used up.\n\nFix: Upgrade your Hunter.io plan at hunter.io/pricing\nOr wait until next month when the quota resets.\n\nTip: Use the "Find Emails" button instead — it uses a different Hunter endpoint.`);
        } else if (data.errorCode === 'INVALID_KEY') {
          alert(`❌ Invalid Hunter.io API Key\n\nYour key was rejected. Go to Settings and update it.\nGet your key at: hunter.io → Dashboard → API`);
        } else {
          alert(`🔍 No Contacts Found for "${lead.company}"\n\nDomain tried: ${data.domain}\n${data.triedDomains?.length > 1 ? `Also tried: ${data.triedDomains.slice(1).join(', ')}` : ''}\n\nWhy this happens:\n• Company too small/new for Hunter.io's database\n• Non-.com domain that Hunter hasn't indexed\n• Startup with fewer than ~10 employees\n\nTry the "Find Emails" button instead for more options.`);
        }
      }
    } catch (e) {
      console.error(e);
      alert('Network error. Check your connection and try again.');
    } finally {
      setFindingManagerFor(null);
    }
  };


  const verifyEmail = async (email: string, leadId: string) => {
    if (!hunterKey || emailVerification[`${leadId}_${email}`]) return;
    setEmailVerification(prev => ({ ...prev, [`${leadId}_${email}`]: 'checking' }));
    try {
      const res = await fetch(`https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${hunterKey}`);
      const data = await res.json();
      const status = data?.data?.status;
      const score = data?.data?.score || 0;
      let badge: 'valid' | 'risky' | 'invalid' = 'risky';
      if (status === 'valid' || score >= 70) badge = 'valid';
      else if (score < 40 || status === 'invalid') badge = 'invalid';
      setEmailVerification(prev => ({ ...prev, [`${leadId}_${email}`]: badge }));
    } catch {
      setEmailVerification(prev => ({ ...prev, [`${leadId}_${email}`]: 'risky' }));
    }
  };

  const saveBusinessProfile = (profile: typeof businessProfile) => {
    setBusinessProfile(profile);
    if(user) localStorage.setItem(`leadsora_business_profile_${user.email}`, JSON.stringify(profile));
  };
  const saveGhostConfig = (config: typeof ghostConfig) => {
    setGhostConfig(config);
    if(user) localStorage.setItem(`leadsora_ghost_config_${user.email}`, JSON.stringify(config));
  };

  const buildSignature = () => {
    const p = businessProfile;
    if (!p.fullName && !p.companyName) return '';
    let sig = '\n\n──────────────';
    if (p.fullName) sig += `\n${p.fullName}`;
    if (p.jobTitle) sig += ` | ${p.jobTitle}`;
    if (p.companyName) sig += `\n${p.companyName}`;
    const contact = [p.email ? `📧 ${p.email}` : '', p.phone ? `📞 ${p.phone}` : ''].filter(Boolean).join(' | ');
    if (contact) sig += `\n${contact}`;
    if (p.website) sig += `\n🌐 ${p.website}`;
    if (p.address) sig += `\n📍 ${p.address}`;
    return sig;
  };

  const getSubjectLine = (lead: any) => {
    const role = (lead.title || lead.problem || '').replace('Hiring: ', '').substring(0, 30);
    const score = lead.intentScore;
    
    // Dynamic subject lines based on how hot the lead is
    if (score >= 90) return `Quick question about the ${role} opening at ${lead.company}`;
    if (score >= 80) return `Exploring synergies: ${role} at ${lead.company}`;
    return `${lead.company} <> Engineering Collaboration`;
  };

  const getEmailBody = (lead: any) => {
    if (!lead) return '';
    const base = aiOutreach[lead.id] || lead.outreach || '';
    const signature = buildSignature();
    if (signature && !base.includes(signature)) {
      return base + signature;
    }
    return base;
  };
  const savePersona = (val: string) => { 
    setUserPersona(val); 
    if(user) localStorage.setItem(`df_user_persona_${user.email}`, val); 
    if (val === 'Software Development Agency') setSearchQuery('Software Engineering');
    else if (val === 'Marketing & SEO Agency') setSearchQuery('Marketing');
    else if (val === 'Recruitment & Headhunting Firm') setSearchQuery('Hiring');
    else if (val === 'B2B SaaS Company') setSearchQuery('Operations');
    else if (val === 'Freelance Consultant') setSearchQuery('Consultant');
    else if (val === 'Lead Generation Agency') setSearchQuery('Sales');
    else if (val === 'Design & Branding Agency') setSearchQuery('Design');
    else if (val === 'Video Production & Editing') setSearchQuery('Video');
    else if (val === 'Financial & Accounting Services') setSearchQuery('Accounting');
    else if (val === 'Cybersecurity Firm') setSearchQuery('Security');
    else if (val === 'Web3 & Blockchain Development') setSearchQuery('Web3');
    else if (val === 'PR & Communications Agency') setSearchQuery('Public Relations');
    else if (val === 'HR & Payroll Consultancy') setSearchQuery('HR');
    else if (val === 'IT Managed Services (MSP)') setSearchQuery('IT Support');
  };

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
      const results = await scanAllSources(searchQuery, location, userPersona, scanMode, (update: any) => {
        if (update.status === 'scanning') setScanStatus(`Scanning ${update.source.name}...`);
        else if (update.status === 'done') setScanStatus(`Found ${update.count} leads from ${update.source.name}`);
      });
      setLeads(results);
      // Fire Slack notification for highest-scoring lead >= 90
      if (slackWebhook) {
        const hotLead = results.find((l: any) => (l.intentScore || 0) >= 90);
        if (hotLead) sendSlackNotification(hotLead, 'new_lead');
      }
    } catch (err) { console.error(err); alert('Error fetching leads.'); }
    finally { setIsScanning(false); setScanStatus(''); }
  };

  const generateAIOutreach = async (lead: any, isFollowUp = false) => {
    if (generatingId) return; setGeneratingId(lead.id);
    try {
      const res = await fetch('/api/generate-outreach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company: lead.company, title: lead.problem, contactName: lead.contactName || null, persona: userPersona, isFollowUp: isFollowUp || (lead.status || 'New') === 'Contacted', scanMode: lead.scanMode || 'hiring', senderName: businessProfile.fullName || null, companyContext: businessProfile.companyContext || null, emailLength, senderEmail: businessProfile.email || null, senderPhone: businessProfile.phone || null, location: lead.location || location }) });
      const data = await res.json();
      if (data.outreach) {
        const signature = buildSignature();
        setAiOutreach(prev => ({ ...prev, [lead.id]: data.outreach + signature }));
      } else {
        alert("AI Error: " + (data.error || "Failed to generate outreach."));
      }
    } catch (err) { 
      console.error(err);
      alert("Network error. Make sure your Gemini API key is configured.");
    } finally { 
      setGeneratingId(null); 
    }
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
        setHunterData(prev => ({ ...prev, [lead.id]: data.data }));
        // Auto-verify the top 3 found emails
        data.data.emails.slice(0, 3).forEach((em: any) => {
          if (em.value) verifyEmail(em.value, lead.id);
        });
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

  // 🚀 AUTOMATED FOLLOW-UP ENGINE
  useEffect(() => {
    if (!mounted || leads.length === 0) return;
    const now = Date.now();
    const fourDaysInMs = 4 * 24 * 60 * 60 * 1000;
    
    let needsUpdate = false;
    const updatedLeads = leads.map(lead => {
      // If lead is in Contacted, has a timestamp, and 4 days have passed
      if ((lead.status === 'Contacted') && lead.lastContactedAt && (now - lead.lastContactedAt > fourDaysInMs)) {
        if (!lead.followUpGenerated) {
          needsUpdate = true;
          // Fire the AI generation sequence for the follow-up
          generateAIOutreach(lead, true);
          // Show a polished modal instead of an ugly alert
          setTimeout(() => { setFollowUpModal(lead); sendSlackNotification(lead, 'follow_up'); }, 600);
          return { ...lead, followUpGenerated: true };
        }
      }
      return lead;
    });

    if (needsUpdate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLeads(updatedLeads);
    }
  }, [leads, mounted]);

  if (authLoading || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="animate-spin" size={32} color="#fff" />
    </div>
  );

  const scrapeWebsite = async () => {
    if (!businessProfile.website) return alert('Please enter a website URL first.');
    setIsScrapingWebsite(true);
    try {
      const res = await fetch('/api/scrape-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: businessProfile.website })
      });
      const data = await res.json();
      if (data.companyContext) {
        setBusinessProfile(prev => ({ 
          ...prev, 
          companyContext: data.companyContext,
          suggestedRoles: data.suggestedRoles || prev.suggestedRoles 
        }));
        if (data.suggestedRoles && data.suggestedRoles.length > 0 && !searchQuery) {
          setSearchQuery(data.suggestedRoles[0]);
        }
      } else {
        alert(data.error || 'Failed to extract company context.');
      }
    } catch (err) {
      alert('Network error while scraping website.');
    }
    setIsScrapingWebsite(false);
  };
  return (
    <>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #27272a', background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'nowrap', gap: '0.5rem' }}>
        <Logo style={{ height: '48px', width: 'auto', flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap', overflow: 'hidden' }}>
          
          {/* Ghost Mode Toggle — label hidden on mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: ghostModeEnabled ? 'rgba(39, 201, 63, 0.1)' : 'rgba(255,255,255,0.05)', padding: '5px 8px', borderRadius: '8px', border: `1px solid ${ghostModeEnabled ? '#27c93f' : '#333'}`, flexShrink: 0 }}>
            <span style={{ fontSize: '0.8rem', color: ghostModeEnabled ? '#27c93f' : '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>
              <span className="hide-on-mobile">👻 Ghost Mode</span>
              <span className="show-on-mobile" style={{ display: 'none' }}>👻</span>
            </span>
            <label style={{ position: 'relative', display: 'inline-block', width: '30px', height: '18px', flexShrink: 0 }}>
              <input type="checkbox" checked={ghostModeEnabled} onChange={(e) => { setGhostModeEnabled(e.target.checked); if (e.target.checked) setShowGhostConfig(true); }} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: ghostModeEnabled ? '#27c93f' : '#555', transition: '.4s', borderRadius: '34px' }}>
                <span style={{ position: 'absolute', height: '12px', width: '12px', left: '3px', bottom: '3px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%', transform: ghostModeEnabled ? 'translateX(12px)' : 'translateX(0)' }}></span>
              </span>
            </label>
            {ghostModeEnabled && <button onClick={() => setShowGhostConfig(true)} style={{ background: 'none', border: 'none', color: '#27c93f', cursor: 'pointer', padding: 0, flexShrink: 0 }}><Settings size={13} /></button>}
          </div>

          {/* Profile Button */}
          <button onClick={() => setShowProfileModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 8px', background: businessProfile.fullName ? 'rgba(124, 58, 237, 0.1)' : 'rgba(255,189,46,0.1)', border: `1px solid ${businessProfile.fullName ? 'rgba(124, 58, 237, 0.3)' : 'rgba(255,189,46,0.3)'}`, borderRadius: '8px', color: businessProfile.fullName ? '#a78bfa' : '#ffbd2e', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, flexShrink: 0, maxWidth: '110px', overflow: 'hidden' }}>
            <User size={13} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{businessProfile.fullName?.split(' ')[0] || 'Profile'}</span>
          </button>

          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 8px', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#888', fontSize: '0.78rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", flexShrink: 0, whiteSpace: 'nowrap' }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ff5f56'; (e.currentTarget as HTMLElement).style.color = '#ff5f56'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = '#333'; (e.currentTarget as HTMLElement).style.color = '#888'; }}
          ><LogOut size={13} /> <span className="hide-on-mobile">Sign Out</span></button>
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
          
          {/* Deprecated Search Type Tabs Removed */}

          <form className="simulator-form" onSubmit={handleScan} style={{ marginBottom: '1rem' }}>
            {/* The Unified Search Bar */}
            <input id="search-input" type="text" className="simulator-input w-full" placeholder="Search target role (e.g. 'React Developer', 'Software Engineer', 'DevOps')" list="industry-roles" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ border: '1px solid #0a66c2' }} />
            <datalist id="industry-roles">
              <option value="React Developer" />
              <option value="Software Engineer" />
              <option value="Full Stack Developer" />
              <option value="Frontend Engineer" />
              <option value="Backend Developer" />
              <option value="DevOps Engineer" />
              <option value="Mobile Developer" />
              <option value="iOS Developer" />
              <option value="Android Developer" />
              <option value="UI/UX Designer" />
              <option value="Data Scientist" />
              <option value="Machine Learning Engineer" />
              <option value="Cloud Architect" />
              <option value="Technical Lead" />
              <option value="Mobile App Development" />
            </datalist>
            
            <select className="simulator-input w-full sm:w-auto" style={{ maxWidth: '100%', minWidth: '120px' }} value={location} onChange={e => setLocation(e.target.value)}>
              <option value="Global">Global</option><option value="USA">USA</option><option value="UK">UK</option>
              <option value="Canada">Canada</option><option value="Australia">Australia</option>
              <option value="India">India</option><option value="Germany">Germany</option>
              <option value="UAE">UAE</option><option value="Singapore">Singapore</option>
              <option value="France">France</option><option value="Netherlands">Netherlands</option>
              <option value="Ireland">Ireland</option><option value="Spain">Spain</option>
            </select>
            <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={isScanning} style={{ background: scanMode === 'layoff' ? '#ff5f56' : scanMode === 'vc_whale' ? '#0a66c2' : scanMode === 'stale_job' ? '#ffbd2e' : '' }}>
              {isScanning ? <><Loader2 className="animate-spin" size={20} /> Scanning...</> : 'Scan Market'}
            </button>
            <button type="button" onClick={saveSearch} title="Save this search as a preset" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', borderRadius: '8px', padding: '0 0.75rem', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              ⭐ Save Search
            </button>
          </form>


          {/* Dynamic Keyword Suggestions from Auto-Extract */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {businessProfile?.suggestedRoles && businessProfile.suggestedRoles.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-xs text-[#888] uppercase tracking-wider font-semibold">AI Target Suggestions:</span>
                {businessProfile.suggestedRoles.map((role, idx) => (
                  <button key={idx} type="button" onClick={() => setSearchQuery(role)} style={{ fontSize: '0.75rem', background: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: '1px solid #7c3aed', padding: '0.375rem 0.75rem', borderRadius: '9999px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 0 10px rgba(124,58,237,0.2)' }}>
                    {role}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-xs text-[#888] uppercase tracking-wider font-semibold">Popular Targets:</span>
                {['React Developer', 'Software Engineer', 'Full Stack', 'DevOps', 'Mobile'].map((kw) => (
                  <button key={kw} type="button" onClick={() => setSearchQuery(kw)} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', padding: '0.375rem 0.75rem', borderRadius: '9999px', cursor: 'pointer' }}>
                    {kw}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', padding: '0 0.5rem' }}>
            <div className="scan-mode-tabs" style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '999px', border: '1px solid #333', overflowX: 'auto', maxWidth: '100%' }}>
              <button onClick={() => setScanMode('hiring')} type="button" style={{ padding: '6px 16px', borderRadius: '999px', border: 'none', background: scanMode === 'hiring' ? '#27c93f' : 'transparent', color: scanMode === 'hiring' ? '#000' : '#888', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                👔 Actively Hiring
              </button>
              <button onClick={() => setScanMode('vc_whale')} type="button" style={{ padding: '6px 16px', borderRadius: '999px', border: 'none', background: scanMode === 'vc_whale' ? '#0a66c2' : 'transparent', color: scanMode === 'vc_whale' ? '#fff' : '#888', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                💸 Recently Funded
              </button>
              <button onClick={() => setScanMode('stale_job')} type="button" style={{ padding: '6px 16px', borderRadius: '999px', border: 'none', background: scanMode === 'stale_job' ? '#ffbd2e' : 'transparent', color: scanMode === 'stale_job' ? '#000' : '#888', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                🚨 Urgent Needs (Stale)
              </button>
              <button onClick={() => setScanMode('layoff')} type="button" style={{ padding: '6px 16px', borderRadius: '999px', border: 'none', background: scanMode === 'layoff' ? '#ff5f56' : 'transparent', color: scanMode === 'layoff' ? '#fff' : '#888', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                📉 Restructuring
              </button>
              <button onClick={() => setScanMode('defection_signal')} type="button" style={{ padding: '6px 16px', borderRadius: '999px', border: 'none', background: scanMode === 'defection_signal' ? '#7c3aed' : 'transparent', color: scanMode === 'defection_signal' ? '#fff' : '#888', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                🕵️ Defection Signals (Beta)
              </button>
            </div>
          </div>

          {/* Settings */}
          {/* Settings & Nav */}
          <div className="text-center mt-4" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
            <Link href="/analytics" style={{ color: '#7c3aed', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BarChart2 size={16} /> View Analytics Dashboard
            </Link>
            <span style={{ color: '#333' }}>|</span>
            <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.875rem' }}>
              {showSettings ? 'Hide Settings' : 'API & Integrations Settings'}
            </button>
          </div>
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
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#ccc' }}>Slack Webhook URL (Alerts):</label>
                  <input type="password" value={slackWebhook} onChange={e => saveSlackWebhook(e.target.value)} placeholder="https://hooks.slack.com/..." style={{ width: '280px', padding: '0.5rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                </div>

              </div>
            )}

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
                <div className="dashboard-controls-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={highIntentOnly} onChange={e => setHighIntentOnly(e.target.checked)} style={{ accentColor: '#ffbd2e' }} /> High Intent Only (85+)
                  </label>
                  <div style={{ display: 'flex', background: '#000', border: '1px solid #333', borderRadius: '6px', overflow: 'hidden' }}>
                    <button onClick={() => setViewMode('list')} style={{ background: viewMode === 'list' ? '#333' : 'transparent', color: viewMode === 'list' ? '#fff' : '#888', border: 'none', padding: '0.25rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}>List View</button>
                    <button onClick={() => setViewMode('pipeline')} style={{ background: viewMode === 'pipeline' ? '#333' : 'transparent', color: viewMode === 'pipeline' ? '#fff' : '#888', border: 'none', padding: '0.25rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}>Pipeline CRM</button>
                  </div>
                  <button onClick={() => { const newLen = emailLength === 'short' ? 'detailed' : 'short'; setEmailLength(newLen); if(user) localStorage.setItem(`df_email_length_${user.email}`, newLen); }} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: emailLength === 'detailed' ? 'rgba(124, 58, 237, 0.1)' : 'transparent', border: emailLength === 'detailed' ? '1px solid #7c3aed' : '1px solid #333', color: emailLength === 'detailed' ? '#a78bfa' : '#888' }} title="Toggle AI Email Length">
                    {emailLength === 'detailed' ? <AlignLeft size={14} /> : <AlignJustify size={14} />} {emailLength === 'detailed' ? 'Detailed Pitch' : 'Short & Punchy'}
                  </button>
                  <button onClick={exportToCSV} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Download size={14} /> Export CSV</button>
                  <button onClick={() => { if (window.confirm('Clear leads?')) setLeads([]); }} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid #333', color: '#888' }}><Trash2 size={14} /> Clear</button>
                </div>
              </div>

              <div className="dashboard-body" style={{ background: '#111' }}>

                {/* ── Filter & Sort Bar ── */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid #222', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#666', marginRight: '0.25rem' }}>🎛️ Filter:</span>

                  {/* Score filter */}
                  <select value={filterScore} onChange={e => setFilterScore(Number(e.target.value))} style={{ background: '#000', border: '1px solid #333', color: filterScore > 0 ? '#a78bfa' : '#888', borderRadius: '4px', padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <option value={0}>All Scores</option>
                    <option value={90}>90+ 🔥 Ultra Hot</option>
                    <option value={85}>85+ ⚡ High Intent</option>
                    <option value={70}>70+ ✅ Good</option>
                  </select>

                  {/* Source filter */}
                  <select value={filterSource} onChange={e => setFilterSource(e.target.value)} style={{ background: '#000', border: '1px solid #333', color: filterSource !== 'all' ? '#a78bfa' : '#888', borderRadius: '4px', padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <option value="all">All Sources</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Indeed">Indeed</option>
                    <option value="Remotive">Remotive</option>
                    <option value="Himalayas">Himalayas</option>
                    <option value="Layoffs">Layoffs.fyi</option>
                    <option value="TechCrunch">TechCrunch</option>
                  </select>

                  {/* Sort */}
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ background: '#000', border: '1px solid #333', color: '#888', borderRadius: '4px', padding: '3px 8px', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <option value="score">Sort: Highest Score</option>
                    <option value="newest">Sort: Newest First</option>
                    <option value="company">Sort: Company A–Z</option>
                  </select>

                  <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#555' }}>
                    {getDisplayLeads(leads).length} of {leads.length} leads
                  </span>

                  {/* Reset filters */}
                  {(filterScore > 0 || filterSource !== 'all' || sortBy !== 'score') && (
                    <button onClick={() => { setFilterScore(0); setFilterSource('all'); setSortBy('score'); }} style={{ background: 'none', border: '1px solid #333', color: '#888', borderRadius: '4px', padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer' }}>✕ Reset</button>
                  )}
                </div>

                {/* ── Saved Search Presets ── */}
                {savedSearches.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#555' }}>⭐ Saved:</span>
                    {savedSearches.map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '999px', overflow: 'hidden' }}>
                        <button onClick={() => loadSearch(s)} style={{ background: 'none', border: 'none', color: '#a78bfa', padding: '3px 10px', fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>{s.label}</button>
                        <button onClick={() => deleteSearch(s.label)} style={{ background: 'none', border: 'none', color: '#555', padding: '3px 6px 3px 0', fontSize: '0.7rem', cursor: 'pointer' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'list' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {getDisplayLeads(leads).map(lead => (
                    <div key={lead.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1, minWidth: '300px' }}>
                        <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{lead.company} <span style={{ fontSize: '0.875rem', color: '#888' }}>• {lead.country}</span></h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                          <p style={{ color: 'var(--text-secondary)' }}>Signal: {lead.problem}</p>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', color: '#ccc' }}><Clock size={12} /> {lead.postedAt}</span>
                        </div>

                        {/* Outreach Box */}
                        <div className="ai-box-mobile" style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: `1px solid ${aiOutreach[lead.id] ? '#7c3aed55' : '#333'}`, position: 'relative', marginTop: '1rem' }}>
                          {aiOutreach[lead.id] && <span style={{ position: 'absolute', top: '-10px', left: '12px', background: 'linear-gradient(135deg,#7c3aed,#4facfe)', color: '#fff', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>✨ AI Generated</span>}
                          <p className="ai-text-mobile" style={{ fontSize: '0.875rem', color: aiOutreach[lead.id] ? '#e2e8f0' : '#aaa', margin: 0, paddingRight: '100px' }}><em>"{aiOutreach[lead.id] ? <Typewriter text={aiOutreach[lead.id]} /> : lead.outreach}"</em></p>
                          {/* Omnichannel Blitz / AI Actions */}
                          <div className="ai-actions-mobile" style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button onClick={() => { setBlitzLead(lead); if(!aiOutreach[lead.id]) generateAIOutreach(lead); if(!foundEmails[lead.id] && hunterKey) fetchEmailsWithHunter(lead); }} disabled={!!generatingId} style={{ background: 'linear-gradient(135deg, #7c3aed, #4facfe)', color: '#fff', border: 'none', cursor: generatingId ? 'not-allowed' : 'pointer', padding: '4px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }} title="Omnichannel Blitz">
                              {generatingId === lead.id ? <Loader2 size={12} className="animate-spin" /> : <><Sparkles size={12} /> Blitz</>}
                            </button>
                            <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${foundEmails[lead.id]?.map((e: any) => e.value).join(',') || lead.contactEmail || ''}&su=${encodeURIComponent(getSubjectLine(lead))}&body=${encodeURIComponent(getEmailBody(lead))}`} target="_blank" rel="noreferrer" style={{ background: 'rgba(79, 172, 254, 0.1)', border: '1px solid rgba(79, 172, 254, 0.3)', color: '#4facfe', display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', textDecoration: 'none', gap: '6px' }} title="Send in Gmail">
                              <Mail size={12} /> Gmail
                            </a>
                            <button onClick={() => handleCopy(lead.id, getEmailBody(lead))} style={{ background: copiedId === lead.id ? 'rgba(39, 201, 63, 0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${copiedId === lead.id ? '#27c93f' : '#333'}`, cursor: 'pointer', color: copiedId === lead.id ? '#27c93f' : '#ccc', display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', gap: '6px', transition: 'all 0.2s' }} title="Copy to Clipboard">
                              {copiedId === lead.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                            </button>
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

                          <button 
                            onClick={() => findHiringManager(lead)} 
                            disabled={findingManagerFor === lead.id}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#fff', background: '#4facfe', border: 'none', padding: '4px 12px', borderRadius: '999px', cursor: findingManagerFor === lead.id ? 'not-allowed' : 'pointer', fontWeight: 600 }}
                          >
                            {findingManagerFor === lead.id ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />} Hiring Manager
                          </button>

                          <button 
                            onClick={() => setShowNote(prev => ({ ...prev, [lead.id]: !prev[lead.id] }))} 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#ccc', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', padding: '4px 12px', borderRadius: '999px', cursor: 'pointer', fontWeight: 600 }}
                          >
                            <FileText size={12} /> Notes
                          </button>
                          
                          {lead.contactLinkedIn
                            ? <a href={lead.contactLinkedIn} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.78rem', color: '#fff', background: '#0a66c2', padding: '4px 12px', borderRadius: '999px', textDecoration: 'none' }}>in LinkedIn</a>
                            : <a href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(lead.company + ' hiring')}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '999px', textDecoration: 'none' }}>🔍 LinkedIn</a>
                          }
                          {lead.sourceUrl && <a href={lead.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: '#ffbd2e', textDecoration: 'underline', marginLeft: 'auto' }}>View on {lead.source || 'Source'} ↗</a>}
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
                                      <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${em.value}&su=${encodeURIComponent(`Exploring synergies: ${lead.problem?.replace('Hiring: ', '') || 'Open Role'} at ${lead.company}`)}&body=${encodeURIComponent(getEmailBody(lead))}`} target="_blank" rel="noreferrer" style={{ color: '#4facfe', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} title="Send Pitch in Gmail">
                                        <Mail size={14} /> 
                                        {em.value}
                                        {emailVerification[`${lead.id}_${em.value}`] === 'valid' && <span title="Verified Safe" style={{ color: '#27c93f', fontSize: '10px' }}>✅</span>}
                                        {emailVerification[`${lead.id}_${em.value}`] === 'risky' && <span title="Accept-All / Risky" style={{ color: '#ffbd2e', fontSize: '10px' }}>⚠️</span>}
                                        {emailVerification[`${lead.id}_${em.value}`] === 'invalid' && <span title="Invalid Email" style={{ color: '#ff5f56', fontSize: '10px' }}>❌</span>}
                                        {emailVerification[`${lead.id}_${em.value}`] === 'checking' && <Loader2 size={10} className="animate-spin" style={{ color: '#888' }} />}
                                      </a>
                                      <button onClick={() => handleCopy(`em-${idx}-${em.value}`, em.value)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === `em-${idx}-${em.value}` ? '#27c93f' : '#666', padding: '0 4px' }} title="Copy Email">
                                        {copiedId === `em-${idx}-${em.value}` ? <Check size={14} /> : <Copy size={14} />}
                                      </button>
                                      {em.sources?.[0]?.uri?.includes('linkedin') && (
                                        <a href={em.sources[0].uri} target="_blank" rel="noreferrer" style={{ color: '#0a66c2', marginLeft: '4px' }} title="LinkedIn Profile">in</a>
                                      )}
                                      {!emailVerification[`${lead.id}_${em.value}`] && (
                                        <button onClick={() => verifyEmail(em.value, lead.id)} style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: '#888', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer' }}>Verify</button>
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

                        {/* Notes Section */}
                        {showNote[lead.id] && (
                          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid #27272a' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <h5 style={{ fontSize: '0.75rem', color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Internal Notes</h5>
                              <button onClick={() => setShowNote(prev => ({ ...prev, [lead.id]: false }))} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 0 }}><X size={14} /></button>
                            </div>
                            <textarea
                              value={notes[lead.id] || ''}
                              onChange={(e) => saveNote(lead.id, e.target.value)}
                              placeholder="Add a note about this lead... (Saved automatically)"
                              style={{ width: '100%', minHeight: '80px', background: '#000', border: '1px solid #333', borderRadius: '4px', color: '#fff', padding: '0.5rem', fontSize: '0.85rem', resize: 'vertical', fontFamily: "'Inter', sans-serif" }}
                            />
                          </div>
                        )}
                      </div>
                      <div 
                        className="intent-score" 
                        title={lead.intentSignals ? lead.intentSignals.join('\n') : 'Score breakdown available on new scans'}
                        style={{ position: 'relative', cursor: 'help', fontSize: '1.25rem', padding: '0.75rem 1.5rem', color: getScoreColor(lead.intentScore), borderColor: getScoreColor(lead.intentScore) }}
                      >
                        {lead.intentScore} 🔥
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', minHeight: '600px' }}>
                  {['New', 'Contacted', 'In Discussion', 'Closed'].map(col => (
                    <div key={col} 
                         onDragOver={e => e.preventDefault()} 
                         onDrop={e => {
                           const leadId = e.dataTransfer.getData('text/plain');
                           setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: col, lastContactedAt: col === 'Contacted' ? Date.now() : l.lastContactedAt } : l));
                         }}
                         style={{ flex: 1, minWidth: '320px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '1rem', border: '1px dashed #333' }}>
                      <h3 onDoubleClick={() => {
                           if (col === 'Contacted') {
                             setLeads(prev => prev.map(l => l.status === 'Contacted' ? { ...l, lastContactedAt: Date.now() - (5 * 24 * 60 * 60 * 1000), followUpGenerated: false } : l));
                           }
                         }}
                         style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: '#888', marginBottom: col === 'Contacted' ? '0.4rem' : '1rem', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between', cursor: col === 'Contacted' ? 'pointer' : 'default' }}>
                        {col} <span style={{ background: '#000', padding: '2px 8px', borderRadius: '12px' }}>{(highIntentOnly ? leads.filter(l => l.intentScore >= 85) : leads).filter(l => (l.status || 'New') === col).length}</span>
                      </h3>
                      {col === 'Contacted' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem', background: 'rgba(39,201,63,0.08)', border: '1px solid rgba(39,201,63,0.2)', borderRadius: '6px', padding: '4px 8px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#27c93f', display: 'inline-block', boxShadow: '0 0 6px #27c93f', animation: 'pulse 2s infinite' }}></span>
                          <span style={{ fontSize: '0.65rem', color: '#27c93f', fontWeight: 600 }}>INBOX SYNC ACTIVE</span>
                          <span style={{ fontSize: '0.6rem', color: '#555', marginLeft: 'auto' }}>↓↓ double-click to time-travel</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(highIntentOnly ? leads.filter(l => l.intentScore >= 85) : leads).filter(l => (l.status || 'New') === col).map(lead => (
                          <div key={lead.id} draggable onDragStart={e => e.dataTransfer.setData('text/plain', lead.id)} className="glass-card" style={{ cursor: 'grab', padding: '1rem', border: '1px solid #222', background: 'rgba(0,0,0,0.4)' }}>
                            <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: '#fff' }}>{lead.company}</h4>
                            <p style={{ fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.75rem', lineHeight: 1.3 }}>{lead.problem}</p>
                            
                            {aiOutreach[lead.id] && (
                              <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.75rem', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
                                <span style={{ color: '#a78bfa', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>✨ AI Draft</span>
                                <p style={{ fontSize: '0.75rem', color: '#e2e8f0', margin: 0 }}><em><Typewriter text={aiOutreach[lead.id]} /></em></p>
                              </div>
                            )}
                            
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button onClick={() => fetchEmailsWithHunter(lead)} disabled={fetchingEmailsFor === lead.id} style={{ fontSize: '0.7rem', color: '#fff', background: '#ffbd2e', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                                  {fetchingEmailsFor === lead.id ? '...' : 'Find Email'}
                                </button>
                                <button onClick={() => findHiringManager(lead)} disabled={findingManagerFor === lead.id} style={{ fontSize: '0.7rem', color: '#fff', background: '#4facfe', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                                  {findingManagerFor === lead.id ? '...' : 'Hiring Manager'}
                                </button>
                                <button onClick={() => setShowNote(prev => ({ ...prev, [lead.id]: !prev[lead.id] }))} style={{ fontSize: '0.7rem', color: '#ccc', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                                  Notes
                                </button>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => { setBlitzLead(lead); if(!aiOutreach[lead.id]) generateAIOutreach(lead); if(!foundEmails[lead.id] && hunterKey) fetchEmailsWithHunter(lead); }} disabled={!!generatingId} style={{ background: 'linear-gradient(135deg, #7c3aed, #4facfe)', color: '#fff', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }} title="Omnichannel Blitz">
                                  {generatingId === lead.id ? <Loader2 size={12} className="animate-spin" /> : <><Sparkles size={12} /> Blitz</>}
                                </button>
                                {foundEmails[lead.id]?.[0]?.value && (
                                  <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${foundEmails[lead.id]?.map((e: any) => e.value).join(',') || ''}&su=${encodeURIComponent(`Exploring synergies at ${lead.company}`)}&body=${encodeURIComponent(getEmailBody(lead))}`} target="_blank" rel="noreferrer" style={{ color: '#4facfe', background: 'rgba(79, 172, 254, 0.1)', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }} title="Open in Gmail">
                                    <Mail size={14} />
                                    {emailVerification[`${lead.id}_${foundEmails[lead.id][0].value}`] === 'valid' && <span style={{fontSize:'10px'}}>✅</span>}
                                    {emailVerification[`${lead.id}_${foundEmails[lead.id][0].value}`] === 'risky' && <span style={{fontSize:'10px'}}>⚠️</span>}
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Pipeline Notes Section */}
                            {showNote[lead.id] && (
                              <div style={{ marginTop: '0.75rem' }}>
                                <textarea
                                  value={notes[lead.id] || ''}
                                  onChange={(e) => saveNote(lead.id, e.target.value)}
                                  placeholder="Add a note..."
                                  style={{ width: '100%', minHeight: '60px', background: 'rgba(0,0,0,0.5)', border: '1px solid #333', borderRadius: '4px', color: '#fff', padding: '0.5rem', fontSize: '0.75rem', resize: 'vertical' }}
                                />
                              </div>
                            )}

                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 🤖 Auto-Follow-Up Engine Modal */}
      {followUpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, padding: '1rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #0a0a0a, #111827)', border: '1px solid rgba(39,201,63,0.4)', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '580px', position: 'relative', boxShadow: '0 0 60px rgba(39,201,63,0.15), 0 25px 50px -12px rgba(0,0,0,0.8)' }}>
            {/* Pulsing Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(39,201,63,0.15)', border: '2px solid #27c93f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', animation: 'pulse 1.5s infinite' }}>🤖</div>
              <div>
                <div style={{ fontSize: '0.65rem', color: '#27c93f', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '2px' }}>⚡ Autonomous Engine Triggered</div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>Follow-Up #1 Drafted for <span style={{ color: '#27c93f' }}>{followUpModal.company}</span></h2>
              </div>
            </div>
            
            {/* Detection Summary */}
            <div style={{ background: 'rgba(39,201,63,0.05)', border: '1px solid rgba(39,201,63,0.15)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div><span style={{ color: '#555' }}>📅 Last Contacted:</span><br /><span style={{ color: '#fff', fontWeight: 600 }}>4+ days ago</span></div>
                <div><span style={{ color: '#555' }}>📭 Reply Status:</span><br /><span style={{ color: '#ff5f56', fontWeight: 600 }}>No Reply Detected</span></div>
                <div><span style={{ color: '#555' }}>🧠 Action:</span><br /><span style={{ color: '#27c93f', fontWeight: 600 }}>AI Follow-Up Generated</span></div>
                <div><span style={{ color: '#555' }}>🎯 Lead Score:</span><br /><span style={{ color: '#ffbd2e', fontWeight: 600 }}>{followUpModal.intentScore || 90}🔥</span></div>
              </div>
            </div>

            {/* AI Draft Preview */}
            <div style={{ background: '#000', border: '1px solid #1a1a1a', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#a1a1aa', whiteSpace: 'pre-wrap', fontFamily: 'monospace', maxHeight: '180px', overflowY: 'auto' }}>
              {aiOutreach[followUpModal.id] || 'Generating follow-up email via AI... ✨'}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a href={`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(`Following up – ${followUpModal.company}`)}&body=${encodeURIComponent(aiOutreach[followUpModal.id] || 'Following up on my previous message...')}`} target="_blank" rel="noreferrer" onClick={() => setFollowUpModal(null)} style={{ flex: 1, background: 'linear-gradient(135deg, #27c93f, #0a8a21)', color: '#000', padding: '12px 20px', borderRadius: '10px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minWidth: '160px' }}>
                📧 Send in Gmail
              </a>
              <button onClick={() => { setBlitzLead(followUpModal); setFollowUpModal(null); }} style={{ flex: 1, background: 'linear-gradient(135deg, #7c3aed, #4facfe)', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', minWidth: '160px' }}>
                ⚡ Full Blitz Mode
              </button>
              <button onClick={() => setFollowUpModal(null)} style={{ background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid #333', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer' }}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Omnichannel Blitz Modal */}
      {blitzLead && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#111', border: '1px solid #333', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <button onClick={() => setBlitzLead(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,0,0,0.5)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} title="Close">
              <X size={20} />
            </button>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #7c3aed, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}><Sparkles /> Omnichannel Blitz: {blitzLead.company}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Email */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', borderRadius: '8px', padding: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: '#e2e8f0', fontSize: '1rem' }}>📧 Step 1: The Cold Email</h3>
                <div style={{ background: '#000', padding: '1rem', borderRadius: '6px', fontSize: '0.85rem', color: '#a1a1aa', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {generatingId === blitzLead.id && !aiOutreach[blitzLead.id] ? "Generating AI Pitch..." : getEmailBody(blitzLead)}
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${foundEmails[blitzLead.id]?.map((e: any) => e.value).join(',') || blitzLead.contactEmail || ''}&su=${encodeURIComponent(`Exploring synergies at ${blitzLead.company}`)}&body=${encodeURIComponent(getEmailBody(blitzLead))}`} target="_blank" rel="noreferrer" style={{ background: '#4facfe', color: '#000', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Mail size={16}/> Open in Gmail</a>
                  {!foundEmails[blitzLead.id] && hunterKey && (
                    <span style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center' }}>Searching for email... <Loader2 size={12} className="animate-spin" style={{ marginLeft: '4px' }} /></span>
                  )}
                </div>
              </div>

              {/* LinkedIn */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', borderRadius: '8px', padding: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: '#e2e8f0', fontSize: '1rem' }}>💼 Step 2: LinkedIn Connect</h3>
                <div style={{ background: '#000', padding: '1rem', borderRadius: '6px', fontSize: '0.85rem', color: '#a1a1aa', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {`Hi! Saw the news about ${blitzLead.company} and wanted to connect. My ${userPersona} helps companies exactly like yours hit their targets faster via fractional execution. Sent you an email with a custom ROI roadmap!`}
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => { 
                    navigator.clipboard.writeText(`Hi! Saw the news about ${blitzLead.company} and wanted to connect. My ${userPersona} helps companies exactly like yours hit their targets faster via fractional execution. Sent you an email with a custom ROI roadmap!`); 
                    const personLinkedIn = foundEmails[blitzLead.id]?.[0]?.linkedin;
                    const targetLinkedIn = personLinkedIn || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(blitzLead.company)}`;
                    window.open(targetLinkedIn, '_blank'); 
                  }} style={{ background: '#0a66c2', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    {foundEmails[blitzLead.id]?.[0]?.linkedin ? 'Copy & Open Profile' : 'Copy & Search LinkedIn'}
                  </button>
                </div>
              </div>

              {/* Twitter */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #222', borderRadius: '8px', padding: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: '#e2e8f0', fontSize: '1rem' }}>🐦 Step 3: Twitter DM</h3>
                <div style={{ background: '#000', padding: '1rem', borderRadius: '6px', fontSize: '0.85rem', color: '#a1a1aa', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {`Huge fan of what you're building at ${blitzLead.company}. Just sent over an email outlining exactly how we can step in and help you hit your scaling targets. Check your inbox!`}
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                   <button onClick={() => { 
                     navigator.clipboard.writeText(`Huge fan of what you're building at ${blitzLead.company}. Just sent over an email outlining exactly how we can step in and help you hit your scaling targets. Check your inbox!`); 
                     const personTwitter = foundEmails[blitzLead.id]?.[0]?.twitter;
                     const companyTwitter = hunterData[blitzLead.id]?.twitter;
                     const targetTwitter = personTwitter ? `https://twitter.com/${personTwitter}` : companyTwitter ? `https://twitter.com/${companyTwitter}` : `https://twitter.com/search?q=${encodeURIComponent(blitzLead.company)}&src=typed_query&f=user`;
                     window.open(targetTwitter, '_blank'); 
                   }} style={{ background: '#1da1f2', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                     {foundEmails[blitzLead.id]?.[0]?.twitter || hunterData[blitzLead.id]?.twitter ? 'Copy & Open Profile' : 'Copy & Search Twitter'}
                   </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      {/* Business Profile Onboarding Modal */}
      {showProfileModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#111', border: '1px solid #333', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <button onClick={() => setShowProfileModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,0,0,0.5)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}><X size={20} /></button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #7c3aed, #4facfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><User size={28} color="#fff" /></div>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', background: 'linear-gradient(135deg, #7c3aed, #4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Your Business Profile</h2>
              <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>Set up your identity for professional email signatures. All fields are optional.</p>
            </div>

            {!businessProfile.fullName && !profileDismissed && (
              <div style={{ background: 'rgba(255,189,46,0.1)', border: '1px solid rgba(255,189,46,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#ffbd2e' }}>
                ⚠️ Without a profile, your AI emails will sign off with generic placeholders like &quot;[Your Name]&quot;.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { key: 'fullName', label: 'Full Name', placeholder: 'e.g. John Doe', icon: '👤' },
                { key: 'jobTitle', label: 'Job Title', placeholder: 'e.g. Founder & CEO', icon: '💼' },
                { key: 'companyName', label: 'Company Name', placeholder: 'e.g. Acme Corp', icon: '🏢' },
                { key: 'email', label: 'Email Address', placeholder: 'e.g. john@acmecorp.com', icon: '📧' },
                { key: 'phone', label: 'Phone Number', placeholder: 'e.g. +1 (555) 000-0000', icon: '📞' },
                { key: 'website', label: 'Website URL', placeholder: 'e.g. acmecorp.com', icon: '🌐' },
                { key: 'address', label: 'Mailing Address', placeholder: 'e.g. New York, USA', icon: '📍' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{field.icon} {field.label}</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={(businessProfile as any)[field.key]}
                      onChange={e => setBusinessProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
                      onBlur={e => e.currentTarget.style.borderColor = '#333'}
                    />
                    {field.key === 'website' && (
                      <button onClick={scrapeWebsite} disabled={isScrapingWebsite} style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid #7c3aed', color: '#a78bfa', padding: '0 1rem', borderRadius: '8px', cursor: isScrapingWebsite ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {isScrapingWebsite ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Auto-Extract
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#a78bfa', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>✨ Auto-Extracted Value Proposition (AI Context)</label>
                <textarea
                  value={businessProfile.companyContext || ''}
                  onChange={e => setBusinessProfile(prev => ({ ...prev, companyContext: e.target.value }))}
                  placeholder="Enter your website URL above and click Auto-Extract, or write a short description of your core services and unique value proposition here..."
                  style={{ width: '100%', minHeight: '80px', padding: '10px 14px', background: 'rgba(124, 58, 237, 0.05)', border: '1px solid #7c3aed55', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Signature Preview */}
            {(businessProfile.fullName || businessProfile.companyName) && (
              <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid #222', borderRadius: '8px', padding: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Signature Preview</p>
                <div style={{ fontSize: '0.85rem', color: '#a1a1aa', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.6 }}>
                  ──────────────{'\n'}
                  {businessProfile.fullName}{businessProfile.jobTitle ? ` | ${businessProfile.jobTitle}` : ''}{'\n'}
                  {businessProfile.companyName}{'\n'}
                  {[businessProfile.email ? `📧 ${businessProfile.email}` : '', businessProfile.phone ? `📞 ${businessProfile.phone}` : ''].filter(Boolean).join(' | ')}{'\n'}
                  {businessProfile.website ? `🌐 ${businessProfile.website}` : ''}{'\n'}
                  {businessProfile.address ? `📍 ${businessProfile.address}` : ''}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => { saveBusinessProfile(businessProfile); setShowProfileModal(false); }} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #7c3aed, #4facfe)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                Save Profile
              </button>
              <button onClick={() => { setProfileDismissed(true); setShowProfileModal(false); }} style={{ padding: '12px 20px', background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ghost Mode Scheduler Modal */}
      {showGhostConfig && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#111', border: '1px solid #333', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '550px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <button onClick={() => setShowGhostConfig(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,0,0,0.5)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}><X size={20} /></button>

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#27c93f' }}>👻 Ghost Mode Configuration</h2>
              <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>Configure when and how the autonomous engine hunts for leads.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Scan Time */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⏰ Daily Scan Time</label>
                <input type="time" value={ghostConfig.scanTime} onChange={e => setGhostConfig(prev => ({ ...prev, scanTime: e.target.value }))} style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Leads Per Day */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📊 Leads Per Day: <strong style={{ color: '#27c93f' }}>{ghostConfig.leadsPerDay}</strong></label>
                <input type="range" min="5" max="50" step="5" value={ghostConfig.leadsPerDay} onChange={e => setGhostConfig(prev => ({ ...prev, leadsPerDay: parseInt(e.target.value) }))} style={{ width: '100%', accentColor: '#27c93f' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#555' }}><span>5</span><span>25</span><span>50</span></div>
              </div>

              {/* Scan Mode */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🎯 Scan Mode</label>
                <select value={ghostConfig.scanMode} onChange={e => setGhostConfig(prev => ({ ...prev, scanMode: e.target.value }))} style={{ width: '100%', padding: '10px 14px', background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.95rem', outline: 'none' }}>
                  <option value="hiring">🔥 Hiring Intent</option>
                  <option value="layoff">🎯 Layoff Sniper</option>
                  <option value="vc_whale">🐋 VC Whales</option>
                  <option value="stale_job">⏳ Stale Jobs</option>
                </select>
              </div>

              {/* Keywords */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔍 Target Keywords</label>
                <input type="text" value={ghostConfig.keywords} onChange={e => setGhostConfig(prev => ({ ...prev, keywords: e.target.value }))} placeholder="e.g. React Developer, Marketing Manager" style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <button onClick={() => { saveGhostConfig(ghostConfig); setShowGhostConfig(false); }} style={{ width: '100%', padding: '14px', marginTop: '2rem', background: 'linear-gradient(135deg, #27c93f, #10b981)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
              👻 Save & Activate Ghost Mode
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;
