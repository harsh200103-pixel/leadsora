import React from 'react';

export default function Logo({ className, style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <svg className={className} style={{ height: '90px', width: 'auto', ...style }} viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* New ISAI Leads Circular Badge Mark */}
      <g transform="translate(100, 50)">
        {/* Circular Background */}
        <circle cx="150" cy="150" r="130" fill="#222222" />
        
        {/* Circular White Border */}
        <circle cx="150" cy="150" r="122" fill="none" stroke="#ffffff" strokeWidth="5" />
        
        {/* Text inside badge: ISAI */}
        <text x="150" y="158" textAnchor="middle" fontSize="58" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fill="#ffffff" letterSpacing="2">ISAI</text>
        
        {/* Text inside badge: leads */}
        <text x="150" y="222" textAnchor="middle" fontSize="22" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="bold" fill="#ffffff" letterSpacing="4">leads</text>
      </g>

      {/* Brand Name: ISAI LEADS */}
      <text x="430" y="185" fill="var(--text-primary)" fontSize="78" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" letterSpacing="4">
        ISAI <tspan fill="#00AEEF">LEADS</tspan>
      </text>

      {/* Tagline / Subtitle */}
      <text x="435" y="238" fill="var(--text-muted, #5A6882)" fontSize="24" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" letterSpacing="6">
        BY ISAI TECH SOLUTIONS
      </text>
    </svg>
  );
}
