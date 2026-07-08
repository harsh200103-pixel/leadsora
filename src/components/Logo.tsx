import React from 'react';

export default function Logo({ className, style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <svg className={className} style={{ height: '100px', width: 'auto', ...style }} viewBox="0 0 520 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="70" fill="var(--text-primary)" fontSize="72" fontFamily="'Space Grotesk', Inter, sans-serif" fontWeight="700" letterSpacing="6">
        LEADSORA
      </text>
      <text x="4" y="105" fill="var(--text-muted)" fontSize="18" fontFamily="'Inter', sans-serif" fontWeight="500" letterSpacing="5">
        FIND BUYING INTENT FASTER
      </text>
    </svg>
  );
}
