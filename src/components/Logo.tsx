import React from 'react';

export default function Logo({ className, style }: { className?: string, style?: React.CSSProperties }) {
  return (
    <img 
      src="/leadsora-logo.svg" 
      alt="Leadsora Logo" 
      className={className} 
      style={{ height: '100px', width: 'auto', ...style }} 
    />
  );
}
