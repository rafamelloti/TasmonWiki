import { equip } from './data.js';
// Ported from the game's equipment.js (constants and value formulas).
export const RAR = ['common','rare','ultra','legend','immortal','arcana','beyond','century','cosmic','celestial'];
export const VALUE_MULT = equip.VALUE_MULT;
export const LINES = { common:0, rare:1, ultra:2, legend:2, immortal:3, arcana:3, beyond:4, century:4, cosmic:5, celestial:6 };
export const STAT_EN = {
  atkFlat:'ATK (flat)', hpFlat:'Max HP (flat)', atkPct:'ATK %', hpPct:'Max HP %', defPct:'Damage reduction', critRate:'Crit rate', critDmg:'Crit damage', cdr:'Cooldown reduction',
  goldBonus:'Gold', expBonus:'EXP', dropBonus:'Egg drop rate', atkSpeed:'Attack speed', skillPower:'Skill power', skillAoe:'Skill spread (party-wide power)', chestBonus:'Chest drop rate',
  basicAtkPct:'Basic attack power', aoeSkillPct:'AoE skill power', dotSkillPct:'Damage-over-time skill power', singleSkillPct:'Single-target skill power', lifesteal:'Lifesteal', bossDmg:'Boss damage',
  elemAtk:'Elemental ATK', elemDef:'Elemental DEF', soulVessel:'Soul Vessel', healPower:'Healing skill power', shieldPower:'Barrier duration',
  elemAtkFire:'Fire ATK', elemAtkWater:'Water ATK', elemAtkWind:'Wind ATK', elemAtkEarth:'Earth ATK', elemAtkLight:'Light ATK', elemAtkDark:'Dark ATK',
  elemDefFire:'Fire DEF', elemDefWater:'Water DEF', elemDefWind:'Wind DEF', elemDefEarth:'Earth DEF', elemDefLight:'Light DEF', elemDefDark:'Dark DEF' };
export const STAT_HELP = {
  soulVessel: 'Healing and barrier amounts are based on HP excluding HP added by engraving. With this line, the engraved HP also counts toward those amounts.',
  dropBonus: 'Multiplies the base egg drop rate (it is not additive).', lifesteal: 'Heals this share of the damage you deal.',
  bossDmg: 'Only increases damage to bosses (act bosses, the strong last enemy of each stage, daily bosses, heroes, tower bosses).',
  healPower: 'Increases the amount restored by healing skills (the per-second cap is unchanged).', shieldPower: 'Barriers last longer (the amount absorbed does not change).' };
export const PCT = s => !(s === 'atkFlat' || s === 'hpFlat');
export const BASE_RANGE = { atkFlat:[.12,.22], hpFlat:[.14,.26] };
export const STAT_BASE = Object.fromEntries(Object.entries(equip.META).map(([k, v]) => [k, v.base]));
export const UNIQUE_POOL = ['atkSpeed', 'skillPower'];
export const NORMAL_POOL = ['atkFlat','hpFlat','atkPct','hpPct','defPct','critRate','critDmg','cdr','goldBonus','expBonus'];
export const PARTS = [
  { id:'weapon', en:'Weapon', jp:'武器', slotUnlock:1 }, { id:'armor', en:'Armor', jp:'鎧', slotUnlock:1 }, { id:'helm', en:'Helm', jp:'兜', slotUnlock:1 },
  { id:'boots', en:'Boots', jp:'靴', slotUnlock:1 }, { id:'sub', en:'Sub weapon', jp:'サブ武器', slotUnlock:1 }, { id:'charm', en:'Accessory', jp:'アクセサリー', slotUnlock:30 } ];
export const CHARM_KINDS = { ring:{ en:'Ring', stat:'goldBonus', range:[.04,.08], unlock:60 }, earring:{ en:'Earring', stat:'critRate', range:[.015,.03], unlock:30 }, necklace:{ en:'Necklace', stat:'skillPower', range:[.05,.1], unlock:45 } };
export const CHARM_SLOT_UNLOCK = [30, 45, 60];
export const ROLE_WEAPONS = { nuke:{ weapon:'Sword', sub:'Axe', label:'Attacker' }, guard:{ weapon:'Lance', sub:'Shield', label:'Tank' }, heal:{ weapon:'Staff', sub:'Orb', label:'Healer' }, buff:{ weapon:'Bow', sub:'Arrow', label:'Buffer' } };
export const ROLE_SUB_POOL = equip.ROLE_SUB;
export const ROLE_TRAIT_POOL = { nuke:['atkFlat','atkPct','critRate','critDmg'], guard:['hpFlat','hpPct','defPct'], heal:['cdr','hpPct','hpFlat'], buff:['goldBonus','expBonus','cdr'] };
export const FORGE_ROLE_TRAIT_POOL = { nuke:['atkPct','critRate','critDmg','atkFlat'], guard:['hpPct','defPct','hpFlat'], heal:['cdr','hpPct','hpFlat'], buff:['cdr','hpPct','defPct'] };
export const BASE_BY_PART = equip.BASE_BY_PART; export const CHARM_BASE_POOL = equip.CHARM_BASE; export const AOE_MEAN = equip.AOE_MEAN;
export const EQUIP_LV_TIERS = [1,5,10,15,20,30,40,50,60,65,80,90,100,115,120,125,135,150];
export const EQUIP_LV_MAX = 150;
export const lvMult = lv => 1 + Math.max(0, Math.round(lv ?? 1) - 1) * .015;
export const lvMultFor = (stat, lv) => { const b = lvMult(lv); if (stat !== 'skillPower') return b; const n = Math.round(lv ?? 1); if (n <= 125) return b; return lvMult(125) * (1 + ((n - 125) / 25) * .07); };
export const refStat = (kind, lv) => { const L = Math.max(1, Math.round(lv ?? 1)); return kind === 'hp' ? 105 * (1 + (L - 1) * .12) : 17 * (1 + (L - 1) * .1); };
const r3 = v => Math.round(v * 1e3) / 1e3;
export function flatValue(stat, frac, rar, lv){ return Math.max(1, Math.round(refStat(equip.META[stat].flat, lv) * frac * VALUE_MULT[rar] * lvMult(lv))); }
export function baseMax(def, rar, lv){
  const stat = def.stat; if (stat === 'skillAoe') return Math.min(1, AOE_MEAN[rar]);
  const [lo, hi] = def.range, mid = (lo + hi) / 2; if (equip.META[stat].flat) return flatValue(stat, mid, rar, lv);
  const c = equip.META[stat].cap; const v = r3(mid * VALUE_MULT[rar] * lvMultFor(stat, lv)); return typeof c === 'number' ? Math.min(c, v) : v;
}
export function traitMax(stat, rar, lv){
  const meta = equip.META[stat]; if (!meta || stat === 'skillAoe') return 0; const hi = meta.base[1], lvm = lvMultFor(stat, lv);
  if (meta.flat) return flatValue(stat, hi, rar, lv); const mult = UNIQUE_POOL.includes(stat) ? lvm : (VALUE_MULT[rar] ?? 1) * lvm; const v = r3(hi * mult); return typeof meta.cap === 'number' ? Math.min(meta.cap, v) : v;
}
export const fmtStat = (stat, v) => PCT(stat) ? (Math.round(v * 1e5) / 1e3) + '%' : Math.round(v).toLocaleString('en-US');
export const PARTS_BY_KIND = (kind, role) => kind;
