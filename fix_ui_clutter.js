const fs = require('fs');

let cssFile = './src/app/globals.css';
let cssContent = fs.readFileSync(cssFile, 'utf8');

// Append new mobile-specific CSS overhauls to the bottom of the 768px media query
const mobileCSSInjection = `
  /* CLEAN UP MOBILE CLUTTER */
  .horizontal-scroll-mobile {
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 8px; /* For touch target area */
    justify-content: flex-start !important;
  }
  .horizontal-scroll-mobile::-webkit-scrollbar { display: none; }
  
  .horizontal-scroll-mobile > * {
    flex-shrink: 0 !important;
  }

  .ai-target-suggestions {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: 0.5rem 0;
    gap: 0.5rem;
  }
  .ai-target-suggestions::-webkit-scrollbar { display: none; }
  .ai-target-suggestions span { flex-shrink: 0 !important; white-space: nowrap; margin: 0 !important; }

  .lead-card-actions {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 0.5rem;
    gap: 0.5rem !important;
    margin-top: 1rem;
    justify-content: flex-start !important;
  }
  .lead-card-actions::-webkit-scrollbar { display: none; }
  .lead-card-actions button, .lead-card-actions a {
    flex-shrink: 0 !important;
    white-space: nowrap !important;
  }

  .outreach-actions {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 0.5rem !important;
    padding-bottom: 0.25rem;
    justify-content: flex-start !important;
  }
  .outreach-actions::-webkit-scrollbar { display: none; }
  .outreach-actions button, .outreach-actions a {
    flex-shrink: 0 !important;
    white-space: nowrap !important;
  }

  /* Make tabs more obvious they are scrollable */
  .scan-mode-tabs {
    padding: 6px !important;
    scroll-snap-type: x mandatory;
  }
  .scan-mode-tabs button {
    scroll-snap-align: start;
  }
`;

cssContent = cssContent.replace(/@media \(max-width: 768px\) \{/, '@media (max-width: 768px) {' + mobileCSSInjection);
fs.writeFileSync(cssFile, cssContent, 'utf8');

// Update dashboard page.tsx
let pageFile = './src/app/dashboard/page.tsx';
let pageContent = fs.readFileSync(pageFile, 'utf8');

// 1. Fix AI Target Suggestions wrapping
pageContent = pageContent.replace(
  /<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0\.5rem', alignItems: 'center', justifyContent: 'center' }}>/g,
  '<div className="ai-target-suggestions">'
);

// 2. Fix Lead Card main actions wrapping
pageContent = pageContent.replace(
  /<div style={{ display: 'flex', gap: '0\.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '1rem' }}>/g,
  '<div className="lead-card-actions">'
);

// 3. Fix Outreach actions wrapping (Blitz, Gmail, Copy, LinkedIn DM)
pageContent = pageContent.replace(
  /<div className="ai-actions-mobile" style={{ display: 'flex', gap: '0\.5rem', alignItems: 'center', alignSelf: 'flex-end', marginBottom: '0\.75rem', flexWrap: 'wrap' }}>/g,
  '<div className="ai-actions-mobile outreach-actions">'
);

fs.writeFileSync(pageFile, pageContent, 'utf8');

console.log('Mobile UI Clutter Overhaul Applied.');
