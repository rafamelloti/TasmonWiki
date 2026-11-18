import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { species, speciesById, skills, meta, jobs, jobSpecials, JOB_EN, RARITIES, RARITY_EN, ELEMENTS, ELEM_EN, ROLE_EN } from '../lib/data.js';
import { buildTiers, buildJobTiers, TIER_ORDER } from '../lib/tier-core.js';
import { SpeciesChip, TasmonName, RarTag, ElemTag, GroupTag } from '../components.jsx';
import { SkillCard } from '../cards.jsx';
import { Img, monArts, jobArts } from '../lib/img.jsx';
import { fmtBig } from '../lib/text.js';

export const TIERS = buildTiers({ species, skills, meta });
export const JOBTIERS = buildJobTiers({ jobs, specials: jobSpecials, skills });
export const TIER_COLOR = { SS: '#ff4d6d', S: '#ff8a3c', A: '#f2c94c', B: '#8bd450', C: '#3fc2a0', D: '#4a8cf0', E: '#8a7af0', F: '#8a8f9c' };
const NATURES = [['nuke', 'Attacker', 'Raw damage: ATK and attack skills.'], ['guard', 'Tank', 'Staying power: Max HP, shields and damage reduction.'], ['heal', 'Healer', 'Party HP restored per second, plus revive and death-ward effects.'], ['buff', 'Buffer', 'How much it boosts the whole party’s damage while its buff is up.']];
const fmtMetric = e => e.role === 'heal' ? (e.score * 100).toFixed(1) + '% / s' : e.role === 'buff' ? '+' + (e.score * 100).toFixed(0) + '%' : fmtBig(e.score);

export function TierBadge({ id }){
  const e = TIERS.byId[id]; if (!e) return null;
  return <Link to={`/tiers?n=${e.role}&s=${id}`} className="tierbadge" style={{ borderColor: TIER_COLOR[e.tier], color: TIER_COLOR[e.tier] }} title={`${ROLE_EN[e.role]} tier list`}><b>{e.tier}</b> {ROLE_EN[e.role]} · #{e.rank} of {e.of}</Link>;
}


function JobSection({ nat, which }){
  const natures = nat ? [nat] : NATURES.map(n => n[0]), all = [['Rare Jobs', e => e.rare, 'rare'], ['Hidden Jobs', e => e.hidden, 'hidden']].filter(g => !which || g[2] === which);
  return (<>{natures.flatMap(nt => all.map(([title, f]) => ({ nt, title, f }))).map(({ nt, title, f }) => { const g = (JOBTIERS.by[nt] || []).filter(f); if (!g.length) return null;
    return (<section key={title + nt} className="sec"><h2>{title} · {ROLE_EN[nt]}</h2>
      <div className="tiers">{TIER_ORDER.filter(t => t !== 'SS').map(t => { const row = g.filter(e => e.tier2 === t); if (!row.length) return null; return (<div key={t} className="trow"><div className="tlab" style={{ background: TIER_COLOR[t] }}>{t}</div>
        <div className="tmons">{row.map(e => <span key={e.id} className="tchip" style={{ width: 'auto', padding: '4px 8px', gap: 6, display: 'inline-flex', alignItems: 'center' }} title={`${e.metric} ×${e.score.toFixed(2)}${e.special ? ' · ' + e.special.label : ''}`}><Img art={jobArts(e.id)} size={32} alt={e.id} label={e.id} /><span className="small"><b>{JOB_EN[e.id] || e.id}</b><br />{e.metric} ×{e.score.toFixed(2)} · #{e.rank} of {e.of}</span></span>)}</div></div>); })}</div></section>); })}
    <p className="mut small">Jobs are scored from their own ATK/HP multipliers, stat bonuses, special perk and job skill, then ranked against every job of the same nature (common jobs included).</p></>);
}

export default function Tiers(){
  const [view, setView] = useState('mon');
  const q0 = new URLSearchParams((window.location.hash.split('?')[1]) || '');
  const [nat, setNat] = useState(NATURES.some(n => n[0] === q0.get('n')) ? q0.get('n') : 'nuke'), [sel, setSel] = useState(q0.get('s') || ''), [q, setQ] = useState(''), [rar, setRar] = useState(''), [el, setEl] = useState('');
  const arr = TIERS.by[nat] || [];
  const shown = useMemo(() => arr.filter(e => (!rar || e.rarity === rar) && (!el || e.element === el) && (!q || (e.id + ' ' + speciesById[e.id].jp).toLowerCase().includes(q.toLowerCase()))), [arr, rar, el, q]);
  const cur = sel && TIERS.byId[sel] && TIERS.byId[sel].role === nat ? TIERS.byId[sel] : null, cs = cur ? speciesById[cur.id] : null;
  const info = NATURES.find(n => n[0] === nat);
  const VIEWS = [['mon', 'Tasmons'], ['rare', 'Rare Jobs'], ['hidden', 'Hidden Jobs']];
  return (<>
    <h1>Tasmon Tier List</h1>
    <div className="row wrap">{VIEWS.map(([k, t]) => <button key={k} className={'btn' + (k === view ? ' on' : '')} onClick={() => setView(k)}>{t}</button>)}</div>
    {view !== 'mon' ? (<><p>Jobs ranked inside their nature. Each job is scored from its own ATK/HP multipliers, stat bonuses, special perk and job skill, against every job of the same nature (common jobs included).</p><JobSection which={view} /></>) : (<>
    <p>Pick what you are looking for and see the best Tasmons for it. Every Tasmon is ranked against others of the <b>same nature</b>, using the game’s own numbers (base stats, rarity, level growth, passives and skill power and cooldown), all compared at Lv 150 with neutral IV, no awakening and no gear. <b>SS</b> is reserved for Tasmons far above everyone else; then S, A, B, C, D, E and F from best to worst.</p>
    <div className="row wrap">{NATURES.map(([k, t]) => <button key={k} className={'btn' + (k === nat ? ' on' : '')} onClick={() => { setNat(k); setSel(''); }}>{t} <span className="mut small">({(TIERS.by[k] || []).length})</span></button>)}</div>
    <p className="mut">{info[2]}</p>
    <div className="filters">
      <label className="fld grow"><span>Search</span><input value={q} onChange={e => setQ(e.target.value)} placeholder="Name or ID…" /></label>
      <label className="fld"><span>Rarity</span><select value={rar} onChange={e => setRar(e.target.value)}><option value="">All</option>{RARITIES.map(r => <option key={r} value={r}>{RARITY_EN[r]}</option>)}</select></label>
      <label className="fld"><span>Element</span><select value={el} onChange={e => setEl(e.target.value)}><option value="">All</option>{ELEMENTS.map(r => <option key={r} value={r}>{ELEM_EN[r]}</option>)}</select></label>
    </div>
    <div className="tiers">{TIER_ORDER.map(t => { const row = shown.filter(e => e.tier === t); return (<div key={t} className="trow"><div className="tlab" style={{ background: TIER_COLOR[t] }}>{t}</div>
      <div className="tmons">{row.length ? row.map(e => <button key={e.id} className={'tchip' + (cur?.id === e.id ? ' on' : '')} onClick={() => setSel(e.id)} title={`${speciesById[e.id].jp} · ${fmtMetric(e)}`}><Img art={monArts(speciesById[e.id])} size={44} alt={e.id} label={e.id} /></button>) : <span className="mut small">—</span>}</div></div>); })}</div>
    {cur && (<section className="sec card tierdetail"><div className="row sb"><h2><TasmonName s={cs} big /> <span className="tierbadge" style={{ borderColor: TIER_COLOR[cur.tier], color: TIER_COLOR[cur.tier] }}><b>{cur.tier}</b></span></h2><Link className="btn sm" to={`/tasmons/${cur.id}`}>Open Tasmon page</Link></div>
      <div className="row wrap"><RarTag r={cur.rarity} /><ElemTag e={cur.element} /><GroupTag g={cur.group} /><span className="tag">{ROLE_EN[cur.role]}</span></div>
      <p><b>{cur.metric}:</b> {fmtMetric(cur)} · ranks <b>#{cur.rank}</b> of {cur.of} {ROLE_EN[cur.role].toLowerCase()}s{cur.tier === 'SS' ? ' — far above the rest' : ''}.</p>
      <p className="mut small">At Lv 150 (neutral IV, no awakening or gear): ATK {fmtBig(cur.A)} · Max HP {fmtBig(cur.H)}.</p>
      <div className="stack">{cur.skillIds.map(id => <SkillCard key={id} id={id} />)}</div></section>)}
    <JobSection nat={nat} />
    </>)}
    <section className="sec"><h2>How the score works</h2><ul className="bul small">
      <li><b>Attacker:</b> ATK × (1 + skill damage per second ÷ ATK). Area skills count ×1.35, execute ×1.15, drain and single-hit ×1.1, multi-hit skills count every hit. Uses the strongest awakening tier of its skill.</li>
      <li><b>Tank:</b> Max HP × the durability its skill adds. Shields are valued over a 30-second fight; guard and party damage-reduction skills by how much damage they cut over time; taunt, death-ward and instant-rise get a bonus.</li>
      <li><b>Healer:</b> party HP healed per second (regeneration, revive and death-ward included). It does not depend on rarity, so a Common healer can match a rarer one.</li>
      <li><b>Buffer:</b> average party damage increase: ATK buffs count in full, attack-speed, basic-attack and crit buffs by their real share of your damage, all weighted by how long the buff stays up.</li>
      <li><b>Tiers:</b> SS is for scores far above the rest of the nature (log-score ≥ 2.3 standard deviations). The others are split by position: S top 8%, A next 12%, B 20%, C 24%, D 18%, E 12%, F last 6%. Tasmons with identical scores share a tier.</li>
      <li>This ranks base power. Awakening, gear, Sphere, Talisman and party synergy raise everyone, and a well-built lower-tier Tasmon can beat a neglected higher-tier one. Elemental matchups and event availability are not part of the score.</li></ul></section>
  </>);
}
