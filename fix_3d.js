const fs = require('fs');

// 1. UPDATE GLOBALS.CSS
let cssFile = './src/app/globals.css';
let cssContent = fs.readFileSync(cssFile, 'utf8');

// Add highlight variable for 3D beveling
cssContent = cssContent.replace(/--surface-raised:  rgba\(255, 255, 255, 0\.85\);/, '--surface-raised:  rgba(255, 255, 255, 0.85);\n  --highlight:       rgba(255, 255, 255, 0.7);');
cssContent = cssContent.replace(/--surface-raised:  #16162a;/, '--surface-raised:  #16162a;\n  --highlight:       rgba(255, 255, 255, 0.1);');

// Update border radii
cssContent = cssContent.replace(/--radius-sm:       8px;/g, '--radius-sm:       12px;');
cssContent = cssContent.replace(/--radius-md:       12px;/g, '--radius-md:       16px;');
cssContent = cssContent.replace(/--radius-lg:       16px;/g, '--radius-lg:       24px;');
cssContent = cssContent.replace(/--radius-xl:       24px;/g, '--radius-xl:       32px;');

// Update shadows to 3D
cssContent = cssContent.replace(/--shadow-sm:       0 1px 3px rgba\(0,0,0,0\.08\), 0 1px 2px rgba\(0,0,0,0\.05\);/g, '--shadow-sm:       0 4px 14px rgba(0,0,0,0.06), inset 0 1px 1px var(--highlight);');
cssContent = cssContent.replace(/--shadow-md:       0 4px 12px rgba\(0,0,0,0\.08\), 0 2px 6px rgba\(0,0,0,0\.05\);/g, '--shadow-md:       0 12px 32px rgba(0,0,0,0.08), inset 0 1px 1px var(--highlight);');
cssContent = cssContent.replace(/--shadow-lg:       0 10px 30px rgba\(0,0,0,0\.1\), 0 4px 12px rgba\(0,0,0,0\.06\);/g, '--shadow-lg:       0 20px 48px rgba(0,0,0,0.12), inset 0 1px 1px var(--highlight);');
cssContent = cssContent.replace(/--shadow-xl:       0 20px 60px rgba\(0,0,0,0\.12\), 0 8px 24px rgba\(0,0,0,0\.08\);/g, '--shadow-xl:       0 30px 60px rgba(0,0,0,0.15), inset 0 1px 1px var(--highlight);');

// Dark mode shadows
cssContent = cssContent.replace(/--shadow-sm:       0 1px 3px rgba\(0,0,0,0\.4\);/g, '--shadow-sm:       0 4px 14px rgba(0,0,0,0.4), inset 0 1px 1px var(--highlight);');
cssContent = cssContent.replace(/--shadow-md:       0 4px 12px rgba\(0,0,0,0\.4\);/g, '--shadow-md:       0 12px 32px rgba(0,0,0,0.5), inset 0 1px 1px var(--highlight);');
cssContent = cssContent.replace(/--shadow-lg:       0 10px 30px rgba\(0,0,0,0\.5\);/g, '--shadow-lg:       0 20px 48px rgba(0,0,0,0.6), inset 0 1px 1px var(--highlight);');
cssContent = cssContent.replace(/--shadow-xl:       0 20px 60px rgba\(0,0,0,0\.6\);/g, '--shadow-xl:       0 30px 60px rgba(0,0,0,0.7), inset 0 1px 1px var(--highlight);');

fs.writeFileSync(cssFile, cssContent, 'utf8');

// 2. UPDATE DASHBOARD PAGE
let pageFile = './src/app/dashboard/page.tsx';
let pageContent = fs.readFileSync(pageFile, 'utf8');

// Increase inline border radii across modals and inputs
pageContent = pageContent.replace(/borderRadius: '8px'/g, "borderRadius: '16px'");
pageContent = pageContent.replace(/borderRadius: '16px'/g, "borderRadius: '24px'");
pageContent = pageContent.replace(/borderRadius: '6px'/g, "borderRadius: '12px'");
pageContent = pageContent.replace(/borderRadius: '10px'/g, "borderRadius: '16px'");
pageContent = pageContent.replace(/borderRadius: '12px'/g, "borderRadius: '20px'");

// Make inputs look 3D
pageContent = pageContent.replace(/boxSizing: 'border-box'/g, "boxSizing: 'border-box', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.8)'");

// Add 3D bevel to the glass cards and modals inline
pageContent = pageContent.replace(/boxShadow: '0 25px 50px -12px rgba\(0, 0, 0, 0\.1\), inset 0 1px 0 rgba\(255, 255, 255, 0\.2\)'/g, "boxShadow: 'var(--shadow-xl)'");

fs.writeFileSync(pageFile, pageContent, 'utf8');

console.log('Applied 3D aesthetics and rounded corners');
