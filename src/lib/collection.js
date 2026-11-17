// Reads everything collectable out of a save: owned Tasmons, eggs, DEX, inventory and event progress.
import { species, speciesById, meta, RARITIES, availability } from './data.js';

const num = v => (Number.isFinite(+v) ? +v : 0);
const DEX_LIST = species.filter(s => s.dex);
export const DEX_MILESTONES = [[.1, 'Gold +5%'], [.25, 'Egg drop +0.5%'], [.5, 'EXP +10%'], [.75, 'ATK +3%'], [1, 'ATK +5% · Max HP +5%']];

export function collect(save, AN){
  const mons = [...Object.values(save.monsters || {}).map(m => ({ m, parked: false })), ...Object.values(save.parkedMonsters || {}).filter(x => x && typeof x === 'object').map(m => ({ m, parked: true }))];
  const owned = {}, rows = [];
  for (const { m, parked } of mons) {
    const s = speciesById[m.speciesId]; if (!s) continue;
    const a = AN.monster(m), o = owned[s.id] = owned[s.id] || { id: s.id, n: 0, maxLv: 0, maxAw: 0 };
    o.n++; o.maxLv = Math.max(o.maxLv, num(m.level)); o.maxAw = Math.max(o.maxAw, num(m.awakening));
    rows.push({ id: m.id, speciesId: s.id, level: num(m.level), awakening: num(m.awakening), job: m.job || '', pinnacle: m.pinnacle || '', parked, inParty: (save.party || []).includes(m.id), atk: a?.atk || 0, hp: a?.hp || 0, power: a?.power || 0, gear: (m.equipment || []).filter(Boolean).length, talisman: !!m.talisman });
  }
  rows.sort((a, b) => b.power - a.power);
  // DEX
  const dex = save.dex || {}, have = DEX_LIST.filter(s => dex[s.id]), miss = DEX_LIST.filter(s => !dex[s.id]);
  const got = {}, all = {}; for (const s of DEX_LIST) { all[s.dex.stat] = (all[s.dex.stat] || 0) + s.dex.value; if (dex[s.id]) got[s.dex.stat] = (got[s.dex.stat] || 0) + s.dex.value; }
  const frac = DEX_LIST.length ? have.length / DEX_LIST.length : 0, nextMs = DEX_MILESTONES.find(([f]) => frac < f) || null;
  const byRar = RARITIES.map(r => { const l = DEX_LIST.filter(s => s.rarity === r); return { r, total: l.length, have: l.filter(s => dex[s.id]).length }; }).filter(x => x.total);
  const unclaimed = Object.keys(save.dexUnclaimed || {}).filter(k => save.dexUnclaimed[k] && speciesById[k]);
  const notDex = Object.values(owned).filter(o => !speciesById[o.id].dex).length;
  // eggs
  const eggs = (save.eggs || []), eggRar = {}; for (const e of eggs) eggRar[e.rarity || '?'] = (eggRar[e.rarity || '?'] || 0) + 1;
  const eggKnown = eggs.filter(e => e.resultSpecies && speciesById[e.resultSpecies]);
  // inventory and progress
  const cnt = a => Array.isArray(a) ? a.length : (a && typeof a === 'object' ? Object.keys(a).length : 0);
  const sumObj = o => Object.values(o || {}).reduce((a, v) => a + num(typeof v === 'object' ? 0 : v), 0);
  const items = save.items || [], itemRar = {}; for (const it of items) itemRar[it.rarity || '?'] = (itemRar[it.rarity || '?'] || 0) + 1;
  const tower = Object.entries(save.tower || {}).map(([el, v]) => ({ el, top: num(v?.top) })).filter(x => x.top > 0);
  const hunt = (() => { let n = 0; const b = save.scarecrow?.bestMs || {}; for (const mode of Object.values(b)) for (const vol of Object.values(mode || {})) for (const v of Object.values(vol || {})) if (v) n++; return n; })();
  return { rows, owned, ownedCount: Object.keys(owned).length, totalMons: rows.length, dex: { have, miss, got, all, frac, nextMs, byRar, unclaimed, notDex, total: DEX_LIST.length, evo: cnt(save.dexEvo) },
    eggs: { n: eggs.length, cap: num(save.eggCap), byRar: eggRar, known: eggKnown },
    inv: { items: items.length, invCap: num(save.invCap), storage: cnt(save.storage), storageCap: num(save.storageCap), itemRar, chests: cnt(save.chests), keyItems: cnt(save.keyItems), souls: cnt(save.souls), evoStones: sumObj(save.evoStones), expeditions: cnt(save.expeditions) },
    prog: { kills: num(save.totalKills), cube: num(save.cube?.level), tower, hunt, gold: save.gold } };
}
export { availability, DEX_LIST };
