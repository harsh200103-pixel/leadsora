import { fetchRemotive } from './src/utils/leadSources.js';

async function test() {
  try {
    const leads = await fetchRemotive('React Developer', 'Global');
    console.log("Leads count:", leads.length);
    if (leads.length > 0) {
       console.log("First lead:", leads[0].title);
    }
  } catch (e) {
    console.error(e);
  }
}
test();
