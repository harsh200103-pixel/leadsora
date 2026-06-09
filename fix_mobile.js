const fs = require('fs');

// 1. UPDATE GLOBALS.CSS
let cssFile = './src/app/globals.css';
let cssContent = fs.readFileSync(cssFile, 'utf8');

// Insert new mobile CSS rules just inside the @media (max-width: 768px) block
const mobileCSSInjection = `
  /* Mobile Layout Overhauls */
  .dashboard-header { flex-direction: column !important; align-items: flex-start !important; gap: 1rem !important; }
  .dashboard-controls-mobile { width: 100% !important; justify-content: flex-start !important; }
  .dashboard-controls-mobile button { width: 100% !important; justify-content: center !important; }
  .dashboard-controls-mobile div { width: 100% !important; justify-content: center !important; }
  
  .filter-bar-mobile { flex-direction: column !important; align-items: stretch !important; }
  .filter-bar-mobile select { width: 100% !important; }

  .profile-input-row { flex-direction: column !important; align-items: stretch !important; gap: 0.5rem !important; }
  .profile-input-row button { width: 100% !important; justify-content: center !important; }

  .save-profile-btn-row { flex-direction: column !important; gap: 0.5rem !important; }
  .save-profile-btn-row button { width: 100% !important; margin: 0 !important; }
  
  .ghost-modal-content { max-height: 80vh !important; overflow-y: auto !important; padding: 1rem !important; }
`;

cssContent = cssContent.replace(/@media \(max-width: 768px\) \{/, '@media (max-width: 768px) {' + mobileCSSInjection);
fs.writeFileSync(cssFile, cssContent, 'utf8');

// 2. UPDATE DASHBOARD PAGE
let pageFile = './src/app/dashboard/page.tsx';
let pageContent = fs.readFileSync(pageFile, 'utf8');

// Add classes to target elements for mobile CSS
pageContent = pageContent.replace(
  /style={{ display: 'flex', gap: '0\.5rem' }}>\n\s*<input\n\s*type="text"/g,
  'className="profile-input-row" style={{ display: \'flex\', gap: \'0.5rem\' }}>\n                    <input\n                      type="text"'
);

// Fix bottom buttons in Profile Modal
pageContent = pageContent.replace(
  /style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}/g,
  'className="save-profile-btn-row" style={{ display: \'flex\', gap: \'1rem\', marginTop: \'2rem\' }}'
);

// Fix Ghost Modal
pageContent = pageContent.replace(
  /<div style={{ textAlign: 'center', marginBottom: '2rem' }}>\n\s*<h2 style={{ margin: '0 0 0\.5rem 0', fontSize: '1\.5rem', color: '#27c93f' }}>👻 Ghost Mode Configuration<\/h2>/g,
  '<div className="ghost-modal-content" style={{ textAlign: \'center\', marginBottom: \'2rem\' }}>\n              <h2 style={{ margin: \'0 0 0.5rem 0\', fontSize: \'1.5rem\', color: \'#27c93f\' }}>👻 Ghost Mode Configuration</h2>'
);

// Fix the "View Analytics Dashboard | Settings" links squishing
pageContent = pageContent.replace(
  /<div className="text-center mt-4" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>/g,
  '<div className="text-center mt-4" style={{ display: \'flex\', justifyContent: \'center\', gap: \'1rem\', alignItems: \'center\', flexWrap: \'wrap\' }}>'
);

// Fix the Filter Bar
pageContent = pageContent.replace(
  /style={{ display: 'flex', flexWrap: 'wrap', gap: '0\.5rem', marginBottom: '1rem', padding: '0\.75rem 1rem'/g,
  'className="filter-bar-mobile" style={{ display: \'flex\', flexWrap: \'wrap\', gap: \'0.5rem\', marginBottom: \'1rem\', padding: \'0.75rem 1rem\''
);

fs.writeFileSync(pageFile, pageContent, 'utf8');

console.log('Mobile layout fixes applied.');
