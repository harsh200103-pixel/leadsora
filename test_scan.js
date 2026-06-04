import { scanAllSources } from './src/utils/leadSources.js';

async function test() {
  try {
    console.log('Starting scan...');
    const results = await scanAllSources('Engineer', 'Global', 'Agency', 'hiring', (u) => console.log(u));
    console.log('Results count:', results.length);
  } catch (err) {
    console.error('Scan failed:', err);
  }
}
test();
