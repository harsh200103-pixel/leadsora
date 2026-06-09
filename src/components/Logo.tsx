import React from 'react';

export default function Logo({ className, style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <svg className={className} style={{ height: '100px', width: 'auto', ...style }} viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(120,60)">
        <circle cx="120" cy="120" r="28" fill="var(--text-primary)"/>
        <path d="M120 20 A100 100 0 0 1 220 120" stroke="var(--text-primary)" strokeWidth="10" strokeLinecap="round" fill="none"/>
        <path d="M120 45 A75 75 0 0 1 195 120" stroke="var(--text-primary)" strokeWidth="10" strokeLinecap="round" fill="none"/>
        <path d="M120 70 A50 50 0 0 1 170 120" stroke="var(--text-primary)" strokeWidth="10" strokeLinecap="round" fill="none"/>
        <path d="M20 120 A100 100 0 0 0 120 220" stroke="var(--text-primary)" strokeWidth="10" strokeLinecap="round" fill="none"/>
        <path d="M45 120 A75 75 0 0 0 120 195" stroke="var(--text-primary)" strokeWidth="10" strokeLinecap="round" fill="none"/>
        <path d="M70 120 A50 50 0 0 0 120 170" stroke="var(--text-primary)" strokeWidth="10" strokeLinecap="round" fill="none"/>
        <path d="M120 220 A100 100 0 0 0 220 120" stroke="var(--text-primary)" strokeWidth="10" strokeLinecap="round" fill="none" strokeDasharray="160 40"/>
        <line x1="120" y1="120" x2="210" y2="35" stroke="#ffbd2e" strokeWidth="10" strokeLinecap="round"/>
        <circle cx="210" cy="35" r="10" fill="#ffbd2e"/>
      </g>
      <text x="420" y="185" fill="var(--text-primary)" fontSize="74" fontFamily="Inter, Arial, sans-serif" fontWeight="600" letterSpacing="8">
        LEADSORA
      </text>
      <text x="424" y="235" fill="var(--text-muted)" fontSize="24" fontFamily="Inter, Arial, sans-serif" letterSpacing="4">
        FIND BUYING INTENT FASTER
      </text>
    </svg>
  );
}
