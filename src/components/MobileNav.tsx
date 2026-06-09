"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Sun, Moon } from 'lucide-react';
import Logo from './Logo';
import { useTheme } from '../app/context/ThemeContext';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const go = (path: string) => { setOpen(false); router.push(path); };

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--nav-border)',
      background: 'var(--nav-bg)', backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 200,
    }}>
      <Logo style={{ height: '52px', width: 'auto', cursor: 'pointer' }} />

      {/* Desktop links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-nav-links">
        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center' }} title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button
          onClick={() => go('/login')}
          style={{ padding: '0.5rem 1.25rem', background: 'transparent', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
        >Sign In</button>
        <button className="btn-primary" onClick={() => go('/signup')} style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
          Get Started Free
        </button>
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="mobile-menu-btn"
        style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.5rem' }}
        aria-label="Toggle menu"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'var(--bg)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)', padding: '1.5rem',
          display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 200,
        }}>
          <button onClick={toggleTheme} style={{ width: '100%', padding: '0.875rem', background: 'transparent', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '1rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {theme === 'light' ? <><Moon size={18}/> Switch to Dark Mode</> : <><Sun size={18}/> Switch to Light Mode</>}
          </button>
          <button onClick={() => go('/login')} style={{ width: '100%', padding: '0.875rem', background: 'transparent', border: '1px solid var(--input-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '1rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
            Sign In
          </button>
          <button onClick={() => go('/signup')} className="btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }}>
            Get Started Free
          </button>
        </div>
      )}
    </nav>
  );
}
