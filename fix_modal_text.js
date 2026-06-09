const fs = require('fs');
const file = './src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix modal labels using var(--text-muted) to use var(--text-secondary) for better contrast
content = content.replace(
  /color: 'var\(--text-muted\)', marginBottom: '4px', textTransform: 'uppercase'/g,
  "color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600"
);

// 2. Fix the Auto-Extracted Value Proposition label color from light purple (#a78bfa) to var(--accent)
content = content.replace(
  /color: '#a78bfa', marginBottom: '4px', textTransform: 'uppercase'/g,
  "color: 'var(--accent)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600"
);

// 3. Fix the Auto-Extract button inside the website input (change #a78bfa to var(--accent))
content = content.replace(
  /color: '#a78bfa', padding: '0 1rem', borderRadius: '8px'/g,
  "color: 'var(--accent)', padding: '0 1rem', borderRadius: '8px'"
);

// 4. Fix the Save Config (Disabled) button background and color in Ghost Mode
content = content.replace(
  /background: ghostConfig.enabled \? 'linear-gradient\(135deg, #27c93f, #10b981\)' : '#333', color: ghostConfig.enabled \? '#000' : '#888'/g,
  "background: ghostConfig.enabled ? 'linear-gradient(135deg, #27c93f, #10b981)' : 'var(--bg-tertiary)', color: ghostConfig.enabled ? '#000' : 'var(--text-muted)'"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed modal text contrast in', file);
