// Prints the articles scheduled for today (UTC) so the daily workflow knows whether to rebuild.
import { readFileSync, readdirSync } from 'node:fs';

const today = new Date().toISOString().slice(0, 10);
const due = readdirSync('src/content/articles')
  .filter((f) => f.endsWith('.md'))
  .filter((f) => readFileSync(`src/content/articles/${f}`, 'utf8').match(/^datePublished:\s*(\S+)/m)?.[1] === today);
console.log(due.join('\n'));
