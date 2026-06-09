const fs = require('fs');

let cssFile = './src/app/globals.css';
let cssContent = fs.readFileSync(cssFile, 'utf8');

// LIGHT MODE
// iOS Light Material is highly blurred, very low opacity white.
cssContent = cssContent.replace(/--surface:         rgba\(255, 255, 255, 0\.65\);/, '--surface:         rgba(255, 255, 255, 0.4);');
cssContent = cssContent.replace(/--surface-raised:  rgba\(255, 255, 255, 0\.85\);/, '--surface-raised:  rgba(255, 255, 255, 0.55);');

// DARK MODE
// iOS Dark Material is highly blurred, low opacity white/grey (NOT pure black).
cssContent = cssContent.replace(/--surface:         rgba\(255, 255, 255, 0\.04\);/, '--surface:         rgba(255, 255, 255, 0.15);');
cssContent = cssContent.replace(/--surface-raised:  #16162a;/, '--surface-raised:  rgba(255, 255, 255, 0.22);');

// GLASS CARD OVERHAUL (iOS Control Center Style)
// Intense blur and saturation, distinct white border
cssContent = cssContent.replace(/backdrop-filter: blur\(24px\) saturate\(180%\);/g, 'backdrop-filter: blur(40px) saturate(200%);');
cssContent = cssContent.replace(/box-shadow: 0 8px 32px rgba\(0, 0, 0, 0\.04\), inset 0 1px 0 rgba\(255, 255, 255, 0\.4\);/g, 'box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.1);');

// We also need to remove the solid borders we had previously on .glass-card
cssContent = cssContent.replace(/border: 1px solid var\(--border\);/g, 'border: none; /* handled by inset shadow for iOS look */');

fs.writeFileSync(cssFile, cssContent, 'utf8');
console.log('Applied iOS Control Center Liquid Glass aesthetics');
