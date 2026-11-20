// "Every Tasmon in the game" mode: a theoretical maximum build for each species so teams can be compared without a save.
// Lv 150, max awakening, solid pinnacle, and a full set of top-rarity gear (6 pieces + 3 accessories) rolled for the Tasmon's nature.
import { BASE_BY_PART, CHARM_KINDS, LINES, baseMax, traitMax } from './gear.js';
export const BEST = {
  nuke: ['atkPct', 'critDmg', 'critRate', 'atkSpeed', 'skillPower', 'basicAtkPct', 'atkFlat'],
  guard: ['hpPct', 'defPct', 'cdr', 'hpFlat', 'skillPower'],
  heal: ['skillPower', 'cdr', 'hpPct', 'healPower', 'hpFlat'],
  buff: ['cdr', 'skillPower', 'atkPct', 'hpPct', 'atkSpeed'],
};
export function maxItems(role, rarity = 'celestial', lv = 150){
  const lines = Math.max(1, LINES[rarity] ?? 3), pref = BEST[role] || BEST.nuke, out = [];
  const lineSet = skip => pref.filter(s => s !== skip).slice(0, lines).map(stat => ({ stat, value: traitMax(stat, rarity, lv) }));
  for (const part of ['weapon', 'sub', 'armor', 'helm', 'boots']) { const def = BASE_BY_PART[part]; out.push({ part, role, rarity, lv, name: part, opts: [{ stat: def.stat, value: baseMax(def, rarity, lv) }, ...lineSet(def.stat)] }); }
  for (const [kind, c] of Object.entries(CHARM_KINDS)) out.push({ part: 'charm', charmKind: kind, role, rarity, lv, name: kind, opts: [{ stat: c.stat, value: baseMax({ stat: c.stat, range: c.range }, rarity, lv) }, ...lineSet(c.stat)] });
  return out;
}
export function maxMonster(sp, meta, { rarity = 'celestial', lv = 150 } = {}){
  return { id: 'db_' + sp.id, speciesId: sp.id, level: lv, awakening: meta.awakenMax || 6, plus: 0, pinnacle: 'solid', equipment: maxItems(sp.role, rarity, lv), equippedSkills: [], learnedSkills: [] };
}
