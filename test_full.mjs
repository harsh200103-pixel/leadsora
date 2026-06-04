import { scanAllSources } from './src/utils/leadSources.js';

async function test() {
  try {
    console.log("Testing scanAllSources...");
    const results = await scanAllSources('React Developer', 'Global', 'Agency', 'hiring', (u) => {
      if (u.status === 'done') console.log(`- ${u.source.name} found ${u.count} leads`);
    });
    console.log("Total leads returned:", results.length);
    if (results.length > 0) {
      console.log("Top lead score:", results[0].intentScore);
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
