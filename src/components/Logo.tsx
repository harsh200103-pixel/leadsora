import React from 'react';

export default function Logo({ className, style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <svg className={className} style={{ height: '90px', width: 'auto', ...style }} viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ISAI Tech Circular Mark / Icon */}
      <g transform="translate(100,50)">
        <defs>
          <linearGradient id="isaiLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00AEEF" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
        </defs>
        
        {/* Outer Ring and background */}
        <circle cx="150" cy="150" r="130" stroke="url(#isaiLogoGrad)" strokeWidth="12" fill="rgba(0, 174, 239, 0.08)" />
        <circle cx="150" cy="150" r="105" stroke="#00AEEF" strokeWidth="4" strokeOpacity="0.4" fill="none" />
        
        {/* Inner AI / Tech Connected Nodes */}
        <path d="M150 70 L210 120 L190 200 L110 200 L90 120 Z" stroke="#00D4FF" strokeWidth="8" strokeLinejoin="round" fill="none" />
        <line x1="150" y1="70" x2="150" y2="150" stroke="#00AEEF" strokeWidth="6" />
        <line x1="210" y1="120" x2="150" y2="150" stroke="#00AEEF" strokeWidth="6" />
        <line x1="190" y1="200" x2="150" y2="150" stroke="#00AEEF" strokeWidth="6" />
        <line x1="110" y1="200" x2="150" y2="150" stroke="#00AEEF" strokeWidth="6" />
        <line x1="90" y1="120" x2="150" y2="150" stroke="#00AEEF" strokeWidth="6" />
        
        {/* Nodes */}
        <circle cx="150" cy="150" r="24" fill="url(#isaiLogoGrad)" />
        <circle cx="150" cy="70" r="12" fill="#FFFFFF" />
        <circle cx="210" cy="120" r="12" fill="#FFFFFF" />
        <circle cx="190" cy="200" r="12" fill="#FFFFFF" />
        <circle cx="110" cy="200" r="12" fill="#FFFFFF" />
        <circle cx="90" cy="120" r="12" fill="#FFFFFF" />
      </g>

      {/* Brand Name: ISAI LEADS (Responsive/Theme-friendly fill) */}
      <text x="430" y="185" fill="var(--text-primary)" fontSize="78" fontFamily="Inter, -apple-system, Arial, sans-serif" fontWeight="800" letterSpacing="4">
        ISAI <tspan fill="#00AEEF">LEADS</tspan>
      </text>

      {/* Tagline / Subtitle */}
      <text x="435" y="238" fill="var(--text-muted, #5A6882)" fontSize="24" fontFamily="Inter, -apple-system, Arial, sans-serif" fontWeight="600" letterSpacing="6">
        BY ISAI TECH SOLUTIONS
      </text>
    </svg>
  );
}
