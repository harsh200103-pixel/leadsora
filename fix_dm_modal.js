const fs = require('fs');

let pageFile = './src/app/dashboard/page.tsx';
let pageContent = fs.readFileSync(pageFile, 'utf8');

// 1. Fix Modal Background & Shadows
pageContent = pageContent.replace(
  /background: '#0a0a14', border: '1px solid rgba\(10,102,194,0\.4\)', borderRadius: '20px', padding: '2\.5rem', width: '100%', maxWidth: '520px', position: 'relative', boxShadow: '0 0 60px rgba\(10,102,194,0\.15\)'/g,
  "background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '520px', position: 'relative', boxShadow: 'var(--shadow)'"
);

// 2. Fix DM Text color
pageContent = pageContent.replace(
  /color: '#e2e8f0'/g,
  "color: 'var(--text-secondary)'"
);

// 3. Update the Action Button Logic
const buttonTarget = `<a
                href={\`https://www.linkedin.com/search/results/people/?keywords=\${encodeURIComponent(linkedinDMModal.lead.company)}\`}
                target="_blank"
                rel="noreferrer"
                style={{ width: '100%', padding: '12px', background: 'transparent', color: '#0a66c2', border: '1px solid rgba(10,102,194,0.4)', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', transition: 'all 0.2s', boxSizing: 'border-box', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04), 0 1px 0 rgba(255,255,255,0.8)' }}
              >
                🔍 Find Contact on LinkedIn →
              </a>`;

const buttonReplacement = `{(() => {
                const person = foundEmails[linkedinDMModal.lead.id]?.[0];
                const targetLinkedIn = person?.linkedin || person?.sources?.find((s) => s.uri?.includes('linkedin'))?.uri || \`https://www.linkedin.com/search/results/people/?keywords=\${encodeURIComponent(linkedinDMModal.lead.company + (person ? ' ' + (person.first_name || '') + ' ' + (person.last_name || '') : ''))}\`;
                return (
                  <a
                    href={targetLinkedIn}
                    target="_blank"
                    rel="noreferrer"
                    style={{ width: '100%', padding: '12px', background: 'transparent', color: '#0a66c2', border: '1px solid rgba(10,102,194,0.4)', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                  >
                    {person ? '🔍 Copy & Open Profile →' : '🔍 Find Contact on LinkedIn →'}
                  </a>
                );
              })()}`;

if (pageContent.includes(buttonTarget)) {
  pageContent = pageContent.replace(buttonTarget, buttonReplacement);
} else {
  console.log('Button target not found, skipping button replace.');
}

fs.writeFileSync(pageFile, pageContent, 'utf8');

console.log('LinkedIn DM Modal fixed.');
