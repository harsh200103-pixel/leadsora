"use client";
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signIn } from 'next-auth/react';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import Logo from '../../components/Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await login(email, password);
    if (success) {
      window.location.href = '/dashboard';
    } else {
      setError('Invalid email or password. Please try again.');
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const success = await loginWithGoogle();
    if (success) {
      window.location.href = '/dashboard';
    }
    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient Background Glows */}
      <div style={{
        position: 'fixed', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 60%)',
        top: '-150px', left: '-150px', borderRadius: '50%', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(255,189,46,0.04) 0%, transparent 60%)',
        bottom: '-200px', right: '-200px', borderRadius: '50%', zIndex: 0,
      }} />

      <div style={{
        width: '100%', maxWidth: '440px', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Logo />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Welcome back. Sign in to continue.</p>
        </div>

        {/* Login Card */}
        <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '20px' }}>
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  style={{
                    width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem',
                    background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                    borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1rem',
                    fontFamily: "'Inter', sans-serif", outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '0.875rem 3rem 0.875rem 2.75rem',
                    background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                    borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1rem',
                    fontFamily: "'Inter', sans-serif", outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: 'rgba(255,95,86,0.1)', border: '1px solid rgba(255,95,86,0.3)',
                borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.5rem',
                color: '#ff5f56', fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                width: '100%', padding: '0.95rem',
                borderRadius: '12px',
                fontSize: '1rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? <><Loader2 size={20} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="btn-secondary"
            style={{
              width: '100%', padding: '0.875rem',
              borderRadius: '12px',
              fontSize: '0.95rem', fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.9 33.1 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.2-2.7-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.4 15.5 18.8 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.4 0-9.9-3.5-11.5-8.3l-6.5 5C9.5 39.5 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C36.7 39.4 44 34 44 24c0-1.3-.2-2.7-.4-3.9z"/></svg>
            Continue with Google
          </button>
        </div>

        {/* Sign Up Link */}
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Don&apos;t have an account?{' '}
          <a href="/signup" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none', transition: 'opacity 0.2s' }}
            onMouseOver={(e) => (e.target as HTMLElement).style.opacity = '0.8'}
            onMouseOut={(e) => (e.target as HTMLElement).style.opacity = '1'}
          >
            Create one free →
          </a>
        </p>
      </div>
    </div>
  );
}
