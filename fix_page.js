const fs = require('fs');
const files = [
  './src/app/page.tsx',
  './src/app/globals.css'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace colors in page.tsx
  content = content.replace(/color:\s*['"]#fff['"]/g, "color: 'var(--text-primary)'");
  content = content.replace(/color:\s*['"]#888['"]/g, "color: 'var(--text-muted)'");
  content = content.replace(/color:\s*['"]#ccc['"]/g, "color: 'var(--text-muted)'");
  content = content.replace(/color:\s*['"]#666['"]/g, "color: 'var(--text-muted)'");
  content = content.replace(/color:\s*['"]#555['"]/g, "color: 'var(--text-muted)'");
  content = content.replace(/color:\s*['"]#333['"]/g, "color: 'var(--text-muted)'");
  
  content = content.replace(/background:\s*['"]#000['"]/g, "background: 'var(--bg)'");
  content = content.replace(/background:\s*['"]#111['"]/g, "background: 'var(--surface)'");
  content = content.replace(/background:\s*['"]rgba\(0,0,0,0.5\)['"]/g, "background: 'var(--input-bg)'");
  content = content.replace(/backgroundColor:\s*['"]#000['"]/g, "backgroundColor: 'var(--bg)'");
  
  content = content.replace(/background:\s*['"]rgba\(255,255,255,0\.03\)['"]/g, "background: 'var(--input-bg)'");
  content = content.replace(/background:\s*['"]rgba\(255,255,255,0\.1\)['"]/g, "background: 'var(--input-bg)'");
  content = content.replace(/border:\s*['"]1px solid #333['"]/g, "border: '1px solid var(--input-border)'");
  content = content.replace(/borderBottom:\s*['"]1px solid #333['"]/g, "borderBottom: '1px solid var(--border)'");
  
  // Specific tailwind/className fixes for page.tsx
  content = content.replace(/text-white/g, "text-[var(--text-primary)]");
  content = content.replace(/text-gray-400/g, "text-[var(--text-secondary)]");

  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed', file);
});
