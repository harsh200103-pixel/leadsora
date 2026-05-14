"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    try {
      const user = localStorage.getItem('dealfinder_user');
      if (user) {
        setStatus('Taking you to dashboard...');
        router.replace('/dashboard');
      } else {
        setStatus('Taking you to login...');
        router.replace('/login');
      }
    } catch (e) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      gap: '1.5rem',
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid #27272a',
        borderTop: '3px solid #fff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#666', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
