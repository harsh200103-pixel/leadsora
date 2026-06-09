const fs = require('fs');

let pageFile = './src/app/dashboard/page.tsx';
let pageContent = fs.readFileSync(pageFile, 'utf8');

// 1. Fix List View LinkedIn Button
const listViewTarget = `{em.sources?.[0]?.uri?.includes('linkedin') && (
                                        <a href={em.sources[0].uri} target="_blank" rel="noreferrer" style={{ color: '#0a66c2', marginLeft: '4px' }} title="LinkedIn Profile">in</a>
                                      )}`;

const listViewReplacement = `<a href={em.linkedin || em.sources?.find((s: any) => s.uri?.includes('linkedin'))?.uri || \`https://www.linkedin.com/search/results/people/?keywords=\${encodeURIComponent(lead.company + ' ' + (em.first_name || '') + ' ' + (em.last_name || ''))}\`} target="_blank" rel="noreferrer" style={{ color: '#0a66c2', background: 'rgba(10,102,194,0.1)', padding: '2px 6px', borderRadius: '4px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem' }} title="Open LinkedIn Profile">💼 LinkedIn</a>`;

pageContent = pageContent.replace(listViewTarget, listViewReplacement);

// 2. Fix Pipeline View LinkedIn Button
const pipelineTarget = `{emailVerification[\`\${lead.id}_\${foundEmails[lead.id][0].value}\`] === 'risky' && <span style={{fontSize:'10px'}}>⚠️</span>}
                                  </a>
                                )}`;

const pipelineReplacement = `{emailVerification[\`\${lead.id}_\${foundEmails[lead.id][0].value}\`] === 'risky' && <span style={{fontSize:'10px'}}>⚠️</span>}
                                  </a>
                                )}
                                {foundEmails[lead.id]?.[0] && (
                                  <a href={foundEmails[lead.id][0].linkedin || foundEmails[lead.id][0].sources?.find((s: any) => s.uri?.includes('linkedin'))?.uri || \`https://www.linkedin.com/search/results/people/?keywords=\${encodeURIComponent(lead.company + ' ' + (foundEmails[lead.id][0].first_name || '') + ' ' + (foundEmails[lead.id][0].last_name || ''))}\`} target="_blank" rel="noreferrer" style={{ color: '#0a66c2', background: 'rgba(10,102,194,0.1)', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '0.8rem' }} title="Open LinkedIn">💼 In</a>
                                )}`;

pageContent = pageContent.replace(pipelineTarget, pipelineReplacement);

fs.writeFileSync(pageFile, pageContent, 'utf8');

console.log('LinkedIn buttons updated.');
