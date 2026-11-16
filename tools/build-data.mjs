// Generates src/data/*.json from game data dumps (only game content, nothing about any save).
// Usage: node tools/build-data.mjs <attachmentsDir> <editorHtml>
import fs from 'fs'; import vm from 'vm'; import path from 'path';
const D = process.argv[2], ED = process.argv[3], OUT = new URL('../src/data/', import.meta.url).pathname;
const read = f => fs.readFileSync(path.join(D, f), 'utf8');
function sections(file){ const s = read(file), out = {}, re = /######## ([^\n]*?) ########\n/g; let m; const idx = [];
  while ((m = re.exec(s))) idx.push([m[1], m.index, re.lastIndex]);
  idx.forEach(([name, st, body], i) => { const end = i + 1 < idx.length ? idx[i + 1][1] : s.length; (out[name] ??= []).push(s.slice(body, end).trim()); }); return out; }
const S = sections(process.env.BLOCKS || 'd76c798c-blocos__16_.txt');
const J = n => { const t = S[n]?.[0]; if (t == null) return undefined; try { return JSON.parse(t); } catch { return undefined; } };
const T = JSON.parse(read(process.env.TRANS || '5636bdc1-traducoes__16_.json')); const tr = T.tr;
const en = s => tr[s]?.en || null;
const SPECIES = J('data.js: SPECIES'), JOBS = { ...J('data.js: JOBS'), ...J('newchars.js: NEWCHAR_JOBS_ALL'), ...J('newchars.js: NEWCHAR2_JOBS_ALL') };
const SK = { ...T.skills, ...J('newchars.js: NEWCHAR_SKILLS_ALL'), ...J('data.js: SEASON_CAST_SKILLS') };
const EXCL = J('data.js: SPECIES_EXCLUSIVE_SKILLS');
const ROLES = ['nuke', 'guard', 'heal', 'buff'];
// ---- skills
const skills = {};
for (const [id, k] of Object.entries(SK)) {
  const a = k.active || {};
  skills[id] = { id, jp: k.name, en: k.nameEn || null, type: a.type || null, kind: a.kind || null, power: a.power ?? null, duration: a.duration ?? null, cooldown: k.cooldown ?? null,
    desc: en(k.desc) || k.desc, passive: k.passive || {}, signature: !!k.signature, stars: k.stars ?? null, speciesOnly: k.speciesOnly || null, rareDraw: !!k.rareDraw,
    tiers: (k.tiers || []).map(t => ({ jp: t.name, power: t.power, cooldown: t.cooldown, desc: en(t.desc) || t.desc })), unique: a.unique || null, color: a.color || null };
}
// ---- passives
const P = {}; const addP = (map, kind) => { for (const [sid, p] of Object.entries(map || {})) (P[sid] ??= {})[kind] = { jp: p.name, en: p.nameEn, mech: p.mech, cond: p.cond, value: p.value, power: p.power || null, desc: p.descEn || p.desc, descJp: p.desc }; };
addP(J('species-passives.js: SPECIES_PASSIVES_ALL'), 'species'); addP(J('species-passives.js: HALLOWEEN_PASSIVES'), 'species'); addP(J('species-passives.js: REF_PARTNER_PASSIVES'), 'species');
addP(J('add1018.js: ADD1018_PASSIVES_ALL'), 'species'); addP(J('pvp-passives.js: PVP_SPECIES_PASSIVES'), 'ranked');
// ---- dex buffs
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h = (h ^ s.charCodeAt(i)) * 16777619; h >>>= 0; } return h; };
const POOLS = J('data.js: RARITY_META') ? { nuke: ['atk', 'atk', 'exp'], guard: ['hp', 'hp', 'gold'], heal: ['hp', 'exp', 'hp'], buff: ['gold', 'drop', 'gold'] } : null;
const BASE = { atk: 5e-4, hp: 5e-4, gold: .002, drop: 2e-5, exp: .001 }; const RM = J('data.js: RARITY_META');
const expedList = new Set(Object.keys(J('state.js: EXPEDITION_EGG_SPECIES') || {}).length ? [] : (J('state.js: EXPEDITION_EGG_SPECIES') || []));
// ---- species
const species = [];
for (const sp of Object.values(SPECIES)) {
  const group = sp.refPartner ? 'ref' : sp.eventOnly ? 'halloween' : sp.seasonOnly ? 'season' : sp.scarecrow ? 'hero' : sp.expedOnly ? 'exped' : 'normal';
  const sk = SK[sp.skillId]; const role = sp.role || (ROLES.includes(sk?.active?.type) ? sk.active.type : 'nuke');
  const o = { id: sp.id, jp: sp.name, title: sp.title || null, rarity: sp.rarity, element: sp.element, atk: sp.baseAtk, hp: sp.baseHp, skill: sp.skillId, role, group, fb: sp.spriteFallback || null, extraSkills: EXCL?.[sp.id] || [], borrow: sp.refBorrow || null, halloweenOf: sp.halloweenOf || null };
  if (group === 'normal' || group === 'exped') { const stars = RM[sp.rarity]?.stars ?? 1, type = sk?.active?.type ?? 'nuke', h = hash('dexbuff:' + sp.id), stat = (POOLS[type] || POOLS.nuke)[h % 3], jit = .7 + ((h >> 4) % 61) / 100; if (group === 'normal') o.dex = { stat, value: BASE[stat] * stars * jit }; }
  species.push(o);
}
// ---- jobs
const jobs = Object.values(JOBS).map(j => ({ id: j.id, jp: j.label, charName: j.charName || null, role: j.role, tier: j.tier, rare: !!j.rare, hidden: !!j.hidden, mult: j.mult || {}, stat: j.stat || {}, skill: j.skillId || null, hue: j.hue }));
const specials = { ...J('newchars.js: NEWCHAR_JOB_SPECIALS_ALL') }; const islands = J('newchars.js: NEWCHAR_JOB_ISLANDS_ALL');
// ---- editor constants (GM, ENH, TAL_RANGES, SPH_PERKS)
const ed = fs.readFileSync(ED, 'utf8');
function grab(name){ const i = ed.indexOf('const ' + name + ' = '); if (i < 0) throw new Error(name); let p = i + ('const ' + name + ' = ').length, depth = 0, q = null, st = p;
  for (; p < ed.length; p++) { const c = ed[p]; if (q) { if (c === '\\') p++; else if (c === q) q = null; continue; } if (c === '"' || c === "'" || c === '`') q = c; else if ('{[('.includes(c)) depth++; else if ('}])'.includes(c)) { depth--; if (depth === 0) { p++; break; } } }
  return vm.runInNewContext('(' + ed.slice(st, p) + ')'); }
const equip = grab('GM'), enhance = grab('ENH'), talisman = grab('TAL_RANGES'), sphPerks = grab('SPH_PERKS');
const meta = {
  rarity: RM, elementMeta: J('data.js: ELEMENT_META'), elemAdv: J('data.js: ELEMENT_ADVANTAGE'), elemAdvMult: J('data.js: ELEMENT_ADV_MULT'), elemDisMult: J('data.js: ELEMENT_DIS_MULT'),
  roleAdv: J('data.js: ROLE_ADVANTAGE'), awakening: J('data.js: AWAKENING'), awakenMax: J('data.js: AWAKEN_MAX'), perks: J('data.js: PERKS'), dexMilestones: J('data.js: DEX_MILESTONES'), dexCaps: J('data.js: DEX_BUFF_CAPS'),
  eggDropChance: J('data.js: EGG_DROP_CHANCE'), rareJob: J('data.js: RARE_JOB_CHANCE'), hiddenJob: J('data.js: HIDDEN_JOB_CHANCE'), skipJob: J('data.js: SKIP_JOB_CHANCE'), evoStoneBoss: J('data.js: EVO_STONE_BOSS_CHANCE'),
  pinnacle: J('data.js: PINNACLE_SOLID_MULT'), expeditionPlans: J('state.js: EXPEDITION_PLANS'), expeditionHours: J('state.js: EXPEDITION_HOURS'), seasonCast: J('data.js: SEASON_CAST_SPECIES') ? Object.keys(J('data.js: SEASON_CAST_SPECIES')) : [],
};
fs.mkdirSync(OUT, { recursive: true });
const w = (n, o) => { fs.writeFileSync(OUT + n + '.json', JSON.stringify(o)); console.log(n, (JSON.stringify(o).length / 1024).toFixed(0) + 'KB'); };
w('species', species); w('skills', skills); w('passives', P); w('jobs', { jobs, specials, islands }); w('equipment', equip); w('enhance', enhance); w('talisman', talisman); w('meta', meta); w('spherePerks', sphPerks);
