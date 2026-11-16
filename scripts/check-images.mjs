// Lists which images the site expects but are missing from public/img.   Usage: npm run check
import { fileURLToPath } from 'url'; import fs from 'fs'; import path from 'path';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), img = p => fs.existsSync(path.join(root, 'public', 'img', p));
const species = JSON.parse(fs.readFileSync(path.join(root, 'src/data/species.json'), 'utf8')), jobs = JSON.parse(fs.readFileSync(path.join(root, 'src/data/jobs.json'), 'utf8'));
const lib = fs.readFileSync(path.join(root, 'src/lib/img.jsx'), 'utf8'), season = new Set([...lib.matchAll(/'(s\d_[a-z0-9]+)'/g)].map(m => m[1]));
const miss = { tasmons: [], jobs: [] };
for (const s of species) { const c = [season.has(s.id) ? `season/cast/${s.id}.png` : `monsters/${s.id}.png`, s.fb && `monsters/${s.fb}.png`].filter(Boolean); if (!c.some(img)) miss.tasmons.push(s.id); }
for (const j of (jobs.jobs || jobs)) if (j.id && !img(`jobs/${j.id}.png`) && !img(`jobs/evolved/${j.id}_e1.png`)) miss.jobs.push(j.id);
const have = fs.existsSync(path.join(root, 'public', 'img')) ? 'ok' : 'NO public/img folder';
console.log(`public/img: ${have}\nTasmons without image: ${miss.tasmons.length}/${species.length}\n${miss.tasmons.join(', ')}\nJobs without image: ${miss.jobs.length}\n${miss.jobs.join(', ')}`);
if (miss.tasmons.length) console.log('\nRe-run the extractor (folder mode keeps existing files) or: npm run assets -- "<game folder>"');
