import { meta, jobById, speciesById, skills, RARITIES, JOB_EN } from './data.js';
import { romaji } from './text.js';
export const LEVEL_CAP = 150, IV_MIN = .85, IV_MAX = 1.15, IV_MAX_BRED = 1.3, PLUS_CAP = 99, PLUS_PER = .02, TANK_HP = 1.3;
export const GROWTH = { atk: .1, hp: .12 }, FOCUS_FROM = 125, OFF_FOCUS = .5;
const sps = Object.values(speciesById);
const ratios = sps.map(s => s.atk / s.hp).filter(Boolean).sort((a, b) => a - b); const MEDIAN = ratios[Math.floor(ratios.length / 2)] ?? .15;
export const focusOf = s => (s.atk / s.hp >= MEDIAN ? 'atk' : 'hp');
export function levelMult(s, stat, lv){
  const per = GROWTH[stat], plain = 1 + (lv - 1) * per; if (lv <= FOCUS_FROM) return plain;
  if (focusOf(s) === stat) return plain; return 1 + (FOCUS_FROM - 1) * per + (lv - FOCUS_FROM) * per * OFF_FOCUS;
}
export const rarityStatMult = r => { const st = meta.rarity[r]?.stars ?? 1; return st <= 5 ? 1 + (st - 1) * .045 : 1.42 + (st - 6) * .16; };
export const awakenMult = (aw, stat) => aw > 0 ? meta.awakening.mult[aw][stat] : 1;
export const roleOf = (s, jobId) => jobById[jobId]?.role ?? s.role;
// Intrinsic stat (before gear, perks, DEX bonus and passives): same terms as the game's monsterAtk / monsterMaxHp.
export function statsOf(s, { lv = 1, iv = 1, aw = 0, plus = 0, pinnacle = false, job = '' } = {}){
  const sk = skills[s.skill], jm = jobById[job]?.mult || {}, pin = pinnacle ? meta.pinnacle : {};
  const atk = s.atk * levelMult(s, 'atk', lv) * iv * rarityStatMult(s.rarity) * (sk?.passive?.atkMult ?? 1) * awakenMult(aw, 'atk') * (jm.atk ?? 1) * (pin.atk ?? 1) * (1 + PLUS_PER * plus);
  const hp = s.hp * (roleOf(s, job) === 'guard' ? TANK_HP : 1) * levelMult(s, 'hp', lv) * iv * rarityStatMult(s.rarity) * (sk?.passive?.hpMult ?? 1) * awakenMult(aw, 'hp') * (jm.hp ?? 1) * (pin.hp ?? 1) * (1 + PLUS_PER * plus);
  return { atk, hp };
}
export const maxStatsOf = (s, job = '') => statsOf(s, { lv: LEVEL_CAP, iv: IV_MAX_BRED, aw: meta.awakenMax ?? 6, plus: PLUS_CAP, pinnacle: true, job });
export const ELEM_STRONG = Object.entries(meta.elemAdv || {});
export function weakTo(el){ return Object.entries(meta.elemAdv).filter(([a, d]) => (Array.isArray(d) ? d.includes(el) : d === el)).map(([a]) => a); }
export function skillStarsText(sk){ return sk?.stars ? '★'.repeat(Math.min(sk.stars, 10)) : ''; }
export const jobEn = j => JOB_EN[j.id] || romaji(j.jp);
export const charEn = j => j.charName ? romaji(j.charName) : '';
export const jobName = j => charEn(j) ? `${jobEn(j)} (${charEn(j)})` : jobEn(j);
