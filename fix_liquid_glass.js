const fs = require('fs');
const file = './src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix Ghost Mode Modal Backdrop
content = content.replace(
  /background: 'rgba\(0,0,0,0\.85\)', backdropFilter: 'blur\(8px\)'/g,
  "background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(20px) saturate(180%)'"
);

// 2. Fix Modal Box
content = content.replace(
  /boxShadow: '0 25px 50px -12px rgba\(0, 0, 0, 0\.5\)'/g,
  "boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'"
);

// 3. Fix Select background
content = content.replace(
  /background: '#0a0a0a'/g,
  "background: 'var(--input-bg)'"
);

// 4. Fix Save Config button (currently hardcoded as grey if disabled, let's fix the button entirely)
// I will use regex to find the Save Config button.
content = content.replace(
  /<button onClick=\{saveGhostConfig\}[\s\S]*?Save Config[\s\S]*?<\/button>/,
  `<button onClick={saveGhostConfig} disabled={ghostConfig.scanMode === 'layoff'} style={{ width: '100%', padding: '14px', background: ghostConfig.scanMode === 'layoff' ? 'var(--input-bg)' : 'linear-gradient(135deg, #7c3aed, #4facfe)', color: ghostConfig.scanMode === 'layoff' ? 'var(--text-muted)' : '#fff', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: ghostConfig.scanMode === 'layoff' ? 'not-allowed' : 'pointer', marginTop: '1rem', transition: 'all 0.2s', boxShadow: ghostConfig.scanMode === 'layoff' ? 'none' : '0 10px 25px -5px rgba(124, 58, 237, 0.3)' }}>{ghostConfig.scanMode === 'layoff' ? 'Save Config (Disabled)' : 'Save Config'}</button>`
);

// 5. Fix AI Pitch Box (Lead Card inner box)
content = content.replace(
  /className="ai-box-mobile" style=\{\{ background: 'rgba\(0,0,0,0\.3\)', padding: '1rem', borderRadius: '8px', border: `1px solid \$\{aiOutreach\[lead\.id\] \? '#7c3aed55' : '#333'\}`/g,
  "className=\"ai-box-mobile glass-card\" style={{ padding: '1rem', borderRadius: '12px', border: `1px solid ${aiOutreach[lead.id] ? 'var(--accent)' : 'var(--border)'}`"
);

// 6. Fix text colors inside AI Pitch box
content = content.replace(
  /color: aiOutreach\[lead\.id\] \? '#e2e8f0' : '#888'/g,
  "color: aiOutreach[lead.id] ? 'var(--text-primary)' : 'var(--text-muted)'"
);

// 7. Fix Copy button background
content = content.replace(
  /background: copiedId === lead\.id \? 'rgba\(39, 201, 63, 0\.1\)' : 'rgba\(255,255,255,0\.05\)'/g,
  "background: copiedId === lead.id ? 'var(--green-light)' : 'var(--input-bg)'"
);
content = content.replace(
  /border: `1px solid \$\{copiedId === lead\.id \? '#27c93f' : '#333'\}`/g,
  "border: `1px solid ${copiedId === lead.id ? 'var(--green)' : 'var(--border)'}`"
);
content = content.replace(
  /color: copiedId === lead\.id \? '#27c93f' : '#ccc'/g,
  "color: copiedId === lead.id ? 'var(--green)' : 'var(--text-secondary)'"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed', file);
