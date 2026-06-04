import { calcIntentScore } from './src/utils/intentScoring.js';

try {
  console.log("Testing calcIntentScore...");
  const intentData = calcIntentScore({ title: 'React Developer', description: 'test', company: 'Google' });
  console.log("Success:", intentData);
} catch (e) {
  console.error("Error:", e);
}
