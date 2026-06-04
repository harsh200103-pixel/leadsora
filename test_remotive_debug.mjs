import { fetchRemotive } from './src/utils/leadSources.js';
async function test() {
  try {
    const leads = await fetchRemotive('React Developer', 'Global');
    console.log("Remotive leads:", leads.length);
  } catch (e) {
    console.error("Remotive Threw:", e);
  }
}
test();
