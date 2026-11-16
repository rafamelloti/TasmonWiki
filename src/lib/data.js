import speciesArr from '../data/species.json';
import skills from '../data/skills.json';
import jobSpecialEn from '../data/job-special-en.json';
import skillNamesEn from '../data/skill-names-en.json';
for (const [id, en] of Object.entries(skillNamesEn)) if (skills[id] && !skills[id].en) skills[id].en = en;
import passives from '../data/passives.json';
import jobsData from '../data/jobs.json';
import meta from '../data/meta.json';
import equip from '../data/equipment.json';
import enhance from '../data/enhance.json';
import talisman from '../data/talisman.json';
import sphPerks from '../data/spherePerks.json';
import enNames from '../data/names-en.json';   // optional overrides { speciesId: "English name" } – fill in as you like
export { skills, passives, meta, equip, enhance, talisman, sphPerks, enNames };
export const species = speciesArr;
export const speciesById = Object.fromEntries(speciesArr.map(s => [s.id, s]));
export const jobs = jobsData.jobs; export const jobById = Object.fromEntries(jobs.map(j => [j.id, j]));
export const jobSpecials = jobsData.specials; for (const [k, v] of Object.entries(jobSpecials)) if (jobSpecialEn[k]) v.label = jobSpecialEn[k]; export const jobIslands = jobsData.islands;
export const RARITIES = ['common','rare','ultra','legend','immortal','arcana','beyond','century','cosmic','celestial'];
export const RARITY_EN = { common:'Common', rare:'Rare', ultra:'Ultra', legend:'Legend', immortal:'Immortal', arcana:'Arcana', beyond:'Beyond', century:'Century', cosmic:'Cosmic', celestial:'Celestial' };
export const ELEMENTS = ['fire','water','wind','earth','light','dark'];
export const ELEM_EN = { fire:'Fire', water:'Water', wind:'Wind', earth:'Earth', light:'Light', dark:'Dark' };
export const ELEM_COLOR = Object.fromEntries(Object.entries(meta.elementMeta).map(([k, v]) => [k, v.color]));
export const RARITY_COLOR = Object.fromEntries(Object.entries(meta.rarity).map(([k, v]) => [k, v.color]));
export const ROLES = ['nuke','guard','heal','buff'];
export const ROLE_EN = { nuke:'Attacker', guard:'Tank', heal:'Healer', buff:'Buffer' };
export const GROUP_EN = { normal:'Standard', hero:'Hero Series', exped:'Expedition', season:'Season cast', halloween:'Halloween event', ref:'Invite partner' };
export const GROUP_HOW = {
  normal: 'Hatched from eggs of its rarity.',
  hero: 'Hero Series Tasmon (Scarecrow challenge heroes). Not part of the regular DEX.',
  exped: 'Hatched only from Expedition eggs.',
  season: 'Season cast member. Obtainable only while its season is running.',
  halloween: 'Halloween event Tasmon. Obtainable only during the event window.',
  ref: 'Invite-a-friend partner egg (Steam only). Rises in rarity with your friend’s play time.' };
export const SEASONS = { s1: { no: 1, from: Date.UTC(2026, 8, 1), to: Date.UTC(2026, 10, 6, 15) }, s2: { no: 2, from: Date.UTC(2026, 10, 6, 15), to: Date.UTC(2027, 0, 8, 15) } };
export const HALLOWEEN = { from: Date.UTC(2026, 9, 26, 15), to: Date.UTC(2026, 10, 9, 15) };
export const RECIPES = { 'flamewolf+frostwolf':'galewolf','honeybee+sparkbee':'galaxybee','duskcat+solarcat':'celestcat','moonblossom+sunblossom':'eternabloom','abyssfox+lunarfox':'nebulafox','emberdrake+sunblossom':'auradrake','mistraven+nightraven':'voiddrake','galebird+moonblossom':'mysticowl','gaiaturtle+glacierturtle':'runeturtle','celestcat+solarcat':'prismcat','galewolf+lunarfox':'phantomwolf','emberdrake+frostdrake':'stormdrake','mysticowl+runeturtle':'chronowl','runeturtle+titanmole':'relicshell','chronowl+relicshell':'cosmicdrake','auradrake+cosmicdrake':'seraphdrake' };
export const RECIPE_LIST = Object.entries(RECIPES).map(([k, child]) => ({ parents: k.split('+'), child }));
export const BREED_SUCCESS = { immortal:.5, arcana:.25, beyond:.1, century:.1, cosmic:.1, celestial:.05 };
export const REF_STEPS = [['ultra',0],['legend',24],['immortal',48],['arcana',84],['beyond',120],['century',204],['cosmic',300]];
export function availability(s, now = Date.now()){
  const fmt = t => new Date(t).toISOString().slice(0, 10);
  if (s.group === 'season') { const w = SEASONS[s.id.split('_')[0]]; if (!w) return { limited: true, state: 'ended', text: 'Season cast' }; return { limited: true, state: now < w.from ? 'soon' : now < w.to ? 'open' : 'ended', text: `Season ${w.no} · ${fmt(w.from)} → ${fmt(w.to - 1)}` }; }
  if (s.group === 'halloween') return { limited: true, state: now < HALLOWEEN.from ? 'soon' : now < HALLOWEEN.to ? 'open' : 'ended', text: `Halloween event · ${fmt(HALLOWEEN.from)} → ${fmt(HALLOWEEN.to - 1)}` };
  if (s.group === 'ref') return { limited: true, state: 'invite', text: 'Invite a friend (Steam)' };
  if (s.group === 'hero') return { limited: true, state: 'hero', text: 'Hero Series' };
  if (s.group === 'exped') return { limited: true, state: 'exped', text: 'Expedition eggs only' };
  return { limited: false, state: 'open', text: '' };
}
export const nameOf = s => enNames[s.id] || null;

export const JOB_EN = {"berserker": "Berserker", "guardian": "Guardian", "sage": "Sage", "warchief": "Warchief", "samurai": "Samurai", "warden": "Warden", "druid": "Druid", "onmyoji": "Onmyoji", "dragoon": "Dragoon", "paladin": "Paladin", "saint": "Saint", "overlord": "Overlord", "godhand": "God Hand", "titan": "Titan", "seraph": "Seraph", "hao": "Hao", "dragonknight": "Dragon Knight", "whitedragon": "White Dragon", "fairy": "Fairy", "ixion": "Ixion", "poseines": "Poseines", "pomly": "Pomly", "mirage": "Mirage", "cindarl": "Cindarl", "seraphine": "Seraphine", "nightwis": "Nightwis", "kensei": "Kensei"};
