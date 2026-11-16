import React, { useState } from 'react';
import { RARITY_EN, RARITY_COLOR, ROLES, ROLE_EN, enhance, talisman, skills, equip } from '../lib/data.js';
import { RAR, VALUE_MULT, LINES, STAT_EN, STAT_HELP, STAT_BASE, PARTS, CHARM_KINDS, CHARM_SLOT_UNLOCK, ROLE_WEAPONS, ROLE_SUB_POOL, ROLE_TRAIT_POOL, FORGE_ROLE_TRAIT_POOL, BASE_BY_PART, CHARM_BASE_POOL, EQUIP_LV_TIERS, EQUIP_LV_MAX, baseMax, traitMax, fmtStat, lvMult, UNIQUE_POOL } from '../lib/gear.js';
import { Img, gearKindArts } from '../lib/img.jsx';
import { pct } from '../lib/text.js';
import setsData from '../data/sets.json';
const FLAGS = { atkSpeed:'Unique', skillPower:'Unique', healPower:'Unique · blueprint only', shieldPower:'Unique · blueprint only', skillAoe:'Accessory only', chestBonus:'Accessory only', basicAtkPct:'Accessory only', aoeSkillPct:'Accessory only', dotSkillPct:'Accessory only', singleSkillPct:'Accessory only', lifesteal:'Unique only', bossDmg:'Unique only', soulVessel:'Engraving only' };
const FLAG_OF = k => FLAGS[k] || (k.startsWith('elem') ? 'Engraving only' : '');
const QUAL = { normal: ['Normal', 1], fine: ['Fine', 1.3], master: ['Masterwork', 1.6], god: ['Supreme', 2] };
const KIND_EN = { adorn: 'Adorn', inscribe: 'Inscribe', carve: 'Carve' }, GRADE_EN = { basic: 'Basic', element: 'Elemental', advanced: 'Advanced', mythic: 'Mythic', skill: 'Skill' }, CAT_EN = { offense: 'Offense', defense: 'Defense', utility: 'Utility' };
const fmtSet = (stat, v) => stat === 'hpFlat' ? '+' + Math.round(v) : '+' + (Math.round(v * 1000) / 10) + '%';
const PART_EN = { weapon: 'Weapon', sub: 'Sub weapon', armor: 'Armor', helm: 'Helm', boots: 'Boots' };
const SPECIAL_NO_POWER = new Set(['undying', 'critChain']);
function Sets(){
  const [role, setRole] = useState(''), [rar, setRar] = useState('');
  const list = setsData.filter(x => (!role || x.role === role) && (!rar || x.rarity === rar));
  const lines = l => l.map((o, i) => <div key={i}>{STAT_EN[o.stat] || o.stat} <b>{fmtSet(o.stat, o.value)}</b></div>);
  return (<>
    <p>Some equipment pieces are <b>set pieces</b>. Each set has <b>5 pieces</b> (weapon, sub weapon, armor, helm, boots). Wear several pieces of the same set on one Tasmon (each piece in a different slot) to unlock extra bonuses: <b>2 pieces</b> give stat bonuses, and <b>4 pieces</b> give more stats plus a special effect. There is one set per role (Attacker, Tank, Healer, Buffer) for each of the five top rarities, so <b>20 sets</b> in total. Bonuses and special effects of different sets stack as long as each set has enough pieces.</p>
    <p className="mut small">Set pieces are unique gear. Unique gear (Legend rarity and above) can replace a normal gear drop, with a {pct(0.00082, 3)} chance per roll.</p>
    <div className="filters"><label className="fld"><span>Role</span><select value={role} onChange={e => setRole(e.target.value)}><option value="">All</option>{ROLES.map(r => <option key={r} value={r}>{ROLE_EN[r]}</option>)}</select></label>
      <label className="fld"><span>Rarity</span><select value={rar} onChange={e => setRar(e.target.value)}><option value="">All</option>{['arcana', 'beyond', 'century', 'cosmic', 'celestial'].map(r => <option key={r} value={r}>{RARITY_EN[r]}</option>)}</select></label></div>
    <div className="grid3">{list.map(x => (<div key={x.id} className="card setcard" style={{ '--rc': RARITY_COLOR[x.rarity] }}>
      <div className="row sb"><h3>{x.en}</h3><span className="tag" style={{ borderColor: RARITY_COLOR[x.rarity], color: RARITY_COLOR[x.rarity] }}>{RARITY_EN[x.rarity]}</span></div>
      <div className="row mut small"><span>{ROLE_EN[x.role]} set</span><span>{x.jp}</span><span>Item Lv {x.lvBand}</span></div>
      <h4>Pieces</h4><div className="small">{x.pieces.map(pc => <div key={pc.part}><span className="mut">{PART_EN[pc.part]}:</span> {pc.en} <span className="mut">({pc.jp})</span></div>)}</div>
      <h4>2 pieces</h4><div className="small">{lines(x.two)}</div>
      <h4>4 pieces</h4><div className="small">{lines(x.four)}
        <div className="spec">✦ {x.special.desc}{!SPECIAL_NO_POWER.has(x.special.id) && <> <b>({Math.round(x.special.power * 1000) / 10}%)</b></>}</div></div></div>))}</div>
  </>);
}

function Max({ rar, lv }){
  const trait = role => ROLE_TRAIT_POOL[role];
  const row = (kind, title, def, role) => (<tr key={title}><td><Img art={gearKindArts(kind, rar)} size={36} alt={title} className="mini" /> <b>{title}</b></td><td>{STAT_EN[def.stat]}</td><td>{fmtStat(def.stat, baseMax(def, rar, lv))}</td></tr>);
  const lines = LINES[rar];
  return (<>
    <table className="tbl"><thead><tr><th>Equipment</th><th>Main stat</th><th>Max main value</th></tr></thead><tbody>
      {ROLES.map(r => row(ROLE_WEAPONS[r].weapon.toLowerCase(), `${ROLE_WEAPONS[r].weapon} (${ROLE_EN[r]} weapon)`, BASE_BY_PART.weapon, r))}
      {ROLES.flatMap(r => ROLE_SUB_POOL[r].map(def => row(ROLE_WEAPONS[r].sub.toLowerCase(), `${ROLE_WEAPONS[r].sub} (${ROLE_EN[r]} sub weapon)`, def, r)))}
      {row('armor', 'Armor', BASE_BY_PART.armor)}{row('helm', 'Helm', BASE_BY_PART.helm)}{row('boots', 'Boots', BASE_BY_PART.boots)}
      {Object.entries(CHARM_KINDS).map(([k, c]) => row(k, `${c.en} (unlocks Lv ${c.unlock})`, { stat: c.stat, range: c.range }))}
      {CHARM_BASE_POOL.map(d => <tr key={d.stat}><td><Img art={gearKindArts('ring', rar)} size={36} alt="" className="mini" /> <b>Accessory (random base)</b></td><td>{STAT_EN[d.stat]}</td><td>{fmtStat(d.stat, baseMax(d, rar, lv))}</td></tr>)}
    </tbody></table>
    <h3>Trait lines <small className="mut">({lines} line{lines === 1 ? '' : 's'} at {RARITY_EN[rar]})</small></h3>
    {lines === 0 ? <p className="mut">Common gear has no trait lines.</p> : <>
      <p className="mut small">Each line rolls one of these stats. Values shown are the best possible roll at this rarity and level.</p>
      <table className="tbl"><thead><tr><th>Role</th><th>Possible trait stats (max value)</th></tr></thead><tbody>{ROLES.map(r => <tr key={r}><td>{ROLE_EN[r]}</td><td>{trait(r).map(s => <span key={s} className="tag">{STAT_EN[s]} {fmtStat(s, traitMax(s, rar, lv))}</span>)}</td></tr>)}</tbody></table>
      {UNIQUE_POOL && lines > 0 && ['legend', 'immortal', 'arcana', 'beyond', 'century', 'cosmic', 'celestial'].includes(rar) && <p className="small">Legend and above can also roll a unique trait: {UNIQUE_POOL.map(s => <span key={s} className="tag">{STAT_EN[s]} {fmtStat(s, traitMax(s, rar, lv))}</span>)}</p>}</>}
  </>);
}
export default function Equipment(){
  const [tab, setTab] = useState('max'), [rar, setRar] = useState('celestial'), [lv, setLv] = useState(EQUIP_LV_MAX);
  const tabs = [['max', 'Max stats'], ['stats', 'Stat reference'], ['rarity', 'Rarity & levels'], ['eng', 'Engraving'], ['tal', 'Talismans'], ['sets', 'Set bonuses']];
  return (<>
    <h1>Equipment</h1>
    <div className="row">{tabs.map(([k, t]) => <button key={k} className={'btn' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{t}</button>)}</div>
    {tab === 'max' && <>
      <div className="filters"><label className="fld"><span>Rarity</span><select value={rar} onChange={e => setRar(e.target.value)}>{RAR.map(r => <option key={r} value={r}>{RARITY_EN[r]}</option>)}</select></label>
        <label className="fld grow"><span>Equipment level {lv} <small className="mut">(×{lvMult(lv).toFixed(3)} stat multiplier)</small></span><input type="range" min="1" max={EQUIP_LV_MAX} value={lv} onChange={e => setLv(+e.target.value)} /></label>
        <div className="row">{EQUIP_LV_TIERS.filter((_, i) => i % 2 === 0 || i === EQUIP_LV_TIERS.length - 1).map(t => <button key={t} className="btn sm" onClick={() => setLv(t)}>Lv {t}</button>)}</div></div>
      <Max rar={rar} lv={lv} />
    </>}
    {tab === 'stats' && <><p className="mut">Base range of each stat (before the rarity multiplier and level multiplier). Flat stats scale from a reference value instead.</p>
      <table className="tbl"><thead><tr><th>Stat</th><th>Base range</th><th>Where it appears</th><th>Notes</th></tr></thead><tbody>{Object.keys(equip.META).map(k => <tr key={k}><td><b>{STAT_EN[k] || k}</b></td><td>{STAT_BASE[k][0]} – {STAT_BASE[k][1]}{equip.META[k].flat ? ' (× reference value)' : ''}{equip.META[k].cap ? ` · cap ${pct(equip.META[k].cap, 0)}` : ''}</td><td>{FLAG_OF(k) || 'Any'}</td><td className="small">{STAT_HELP[k] || ''}</td></tr>)}</tbody></table></>}
    {tab === 'rarity' && <>
      <table className="tbl"><thead><tr><th>Rarity</th><th>Value multiplier</th><th>Trait lines</th></tr></thead><tbody>{RAR.map(r => <tr key={r}><td style={{ color: RARITY_COLOR[r] }}><b>{RARITY_EN[r]}</b></td><td>×{VALUE_MULT[r]}</td><td>{LINES[r]}</td></tr>)}</tbody></table>
      <h3>Level</h3><p>Equipment level multiplier = 1 + (Lv − 1) × 0.015. Skill power has a soft cap after Lv 125 (it reaches only +7% more by Lv 150). Flat ATK reference = 17 × (1 + (Lv − 1) × 0.1); flat HP reference = 105 × (1 + (Lv − 1) × 0.12).</p>
      <p>Equipment levels available: {EQUIP_LV_TIERS.join(', ')}. Maximum: {EQUIP_LV_MAX}. Slots: weapon, armor, helm, boots, sub weapon, and accessories (unlock at Lv {CHARM_SLOT_UNLOCK.join(' / ')}).</p></>}
    {tab === 'eng' && <>
      <p className="mut">Engraving adds extra lines to gear (Legend and above). Each rarity has a fixed ladder of steps; Carve is stronger than Inscribe, which is stronger than Adorn.</p>
      <table className="tbl"><thead><tr><th>Technique</th><th>Strength</th></tr></thead><tbody>{Object.entries(enhance.KIND_MULT).map(([k, v]) => <tr key={k}><td>{KIND_EN[k] || k}</td><td>×{v}</td></tr>)}</tbody></table>
      <h3>Quality (shown as a multiplier on engraved values)</h3>
      <table className="tbl"><thead><tr><th>Quality</th><th>Multiplier</th><th>Chance</th></tr></thead><tbody>{Object.entries(enhance.TIERS).map(([k, v]) => <tr key={k}><td>{QUAL[k]?.[0] || k}</td><td>×{v.mult}</td><td>{v.weight}%</td></tr>)}</tbody></table>
      <h3>Engraving steps per rarity</h3>
      <table className="tbl"><thead><tr><th>Rarity</th><th>Steps</th></tr></thead><tbody>{Object.entries(enhance.LADDER).map(([r, l]) => <tr key={r}><td style={{ color: RARITY_COLOR[r] }}>{RARITY_EN[r]}</td><td>{l.map((k, i) => <span key={i} className="tag">{KIND_EN[k] || k}</span>)}</td></tr>)}</tbody></table>
      {Object.entries(enhance.POOLS).map(([cat, list]) => { const tot = list.reduce((a, e) => a + e.weight, 0); return (<div key={cat}><h3>{CAT_EN[cat]} pool</h3>
        <table className="tbl small"><thead><tr><th>Grade</th><th>Effect</th><th>Value range (before technique & quality)</th><th>Chance</th></tr></thead><tbody>{list.map((e, i) => <tr key={i}><td>{GRADE_EN[e.grade] || e.grade}</td><td>{e.skill ? <>Teaches skill <b>{skills[e.skill]?.en || skills[e.skill]?.jp || e.skill}</b></> : STAT_EN[e.stat] || e.stat}</td><td>{e.range ? `${fmtStat(e.stat, e.range[0])} – ${fmtStat(e.stat, e.range[1])}` : '—'}</td><td>{(Math.round(e.weight / tot * 10000) / 100)}%</td></tr>)}</tbody></table></div>); })}</>}
    {tab === 'sets' && <Sets />}
    {tab === 'tal' && <><p className="mut">Talisman stat ranges by rarity.</p>
      <div className="scroll"><table className="tbl small"><thead><tr><th>Stat</th>{RAR.map(r => <th key={r} style={{ color: RARITY_COLOR[r] }}>{RARITY_EN[r]}</th>)}</tr></thead><tbody>{Object.entries(talisman).map(([k, o]) => <tr key={k}><td><b>{STAT_EN[k] || k}</b></td>{RAR.map(r => <td key={r}>{o[r] ? `${fmtStat(k, o[r][0])} – ${fmtStat(k, o[r][1])}` : '—'}</td>)}</tr>)}</tbody></table></div></>}
  </>);
}
