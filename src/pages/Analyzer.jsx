import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { nameOf, speciesById, skills, jobById, meta, sphPerks, ELEM_EN, ELEM_COLOR, RARITY_EN, ROLE_EN, JOB_EN } from '../lib/data.js';
import setsArr from '../data/sets.json';
import { PH } from '../lib/stages.js';
import { createAnalyzer } from '../lib/analyzer-core.js';
import { SEAL } from '../lib/seal.js';
import { Img, monArts, elemArts } from '../lib/img.jsx';
import { TasmonName, RarTag } from '../components.jsx';
import { fmtBig, romaji } from '../lib/text.js';
import { collect, DEX_MILESTONES, availability } from '../lib/collection.js';
import { TierBadge, TIERS, TIER_COLOR } from './Tiers.jsx';
import { RARITIES, ROLES } from '../lib/data.js';

const AN = createAnalyzer({ species: speciesById, skills, jobs: jobById, meta, sets: Object.fromEntries(setsArr.map(s => [s.id, s])), perks: sphPerks, PH });
const nm = id => { const s = speciesById[id]; return s ? <TasmonName s={s} /> : id; };
const dur = s => { if (!isFinite(s)) return '∞'; if (s < 1) return '<1 s'; if (s < 60) return s.toFixed(1) + ' s'; if (s < 3600) return Math.floor(s / 60) + ' min ' + Math.round(s % 60) + ' s'; if (s < 86400) return (s / 3600).toFixed(1) + ' h'; if (s < 86400 * 365) return (s / 86400).toFixed(1) + ' days'; return fmtBig(s / 86400 / 365) + ' years'; };
const P1 = v => (v * 100).toFixed(1) + '%';
const names = (arr, n = 4) => arr.slice(0, n).map(i => { const sp = speciesById[i]; return sp ? (nameOf(sp) || romaji(sp.jp)) : i; }).join(', ') + (arr.length > n ? ` +${arr.length - n}` : '');
const WHAT = { atk10: 'ATK +10% on every Tasmon', crit: 'Crit rate at the 50% cap', critdmg: 'Crit damage +50%', spd: 'Attack speed at the 60% cap', cdr: 'Cooldown reduction at the 50% cap', skill: 'Skill power +50% on every Tasmon' };

function advice(s){
  switch (s.key) {
    case 'party-small': return `Your party has only ${s.n} Tasmon${s.n === 1 ? '' : 's'}; the party holds up to ${s.max}. An empty slot is lost damage and survivability.`;
    case 'level': return `${s.n} party member${s.n === 1 ? ' is' : 's are'} below your current level cap (${s.cap}): ${names(s.names)}. Feed them EXP.`;
    case 'sphere': return `${s.pts} unspent Sphere point${s.pts === 1 ? '' : 's'} on ${names(s.names)}. Sphere nodes give free ATK, HP, crit, speed and skill power.`;
    case 'slots': return `${s.missing} empty equipment slot${s.missing === 1 ? '' : 's'} (${names(s.names)}). Accessory slots unlock at levels 30, 45 and 60.`;
    case 'talisman': return `${s.names.length} party Tasmon${s.names.length === 1 ? ' has' : 's have'} no Talisman (${names(s.names)}), and you have ${s.bag} in your bag. A talisman of the Tasmon’s own element adds 3–5 stat lines.`;
    case 'berries': return `You hold ${fmtBig(s.n)} Elemental Berries. Using them on Tasmons of the same element adds permanent ATK, HP, crit and skill power up to each stat’s cap.`;
    case 'crit': return `Crit rate is ${P1(s.cur)} (cap 50%). Crit rate and crit damage multiply all of your damage.`;
    case 'speed': return `Attack speed bonus is ${P1(s.cur)} (cap 60%). Every point is a straight DPS increase for basic attacks.`;
    case 'weak': return `${names([s.name])} is far weaker than the rest of the party. Consider swapping it for a stronger Tasmon.`;
    case 'no-support': return 'Your party has no Tank or Healer. This helps clear speed, but it limits how far you can push harder stages.';
    case 'noskill': return `${names(s.names)} ${s.names.length === 1 ? 'has' : 'have'} no equipped skill.`;
    case 'awaken': return `${names(s.names)} ${s.names.length === 1 ? 'is' : 'are'} not awakened. Awakening raises ATK, HP and skill power.`;
    case 'element': return `The stage you are on is ${ELEM_EN[s.stageElem]}. It is weak to ${ELEM_EN[s.counter]}, and nobody in your party is ${ELEM_EN[s.counter]}.`;
    case 'top-gain': return `Biggest estimated lever: ${WHAT[s.what]} (≈ +${(s.gain * 100).toFixed(0)}% DPS).`;
    default: return s.key;
  }
}
const SAVE_DIR = '%userprofile%\\AppData\\Roaming\\Taskbar Monsters\\cloud\\';
const SEV = ['Insight', 'Tip', 'Important', 'Do first'];

function Bars({ rows, cur }){
  const W = 760, H = 150, pad = 26, vals = rows.map(r => Math.max(.01, r.sec)).filter(isFinite), lo = Math.log10(Math.min(...vals, 1)), hi = Math.log10(Math.max(...vals, 10));
  const y = v => H - pad - ((Math.log10(Math.max(.01, v)) - lo) / Math.max(.1, hi - lo)) * (H - pad - 8), bw = (W - pad * 2) / rows.length;
  const ticks = [1, 10, 60, 600, 3600, 86400, 86400 * 30, 86400 * 365].filter(t => Math.log10(t) >= lo && Math.log10(t) <= hi);
  const tl = t => t < 60 ? t + 's' : t < 3600 ? t / 60 + 'm' : t < 86400 ? t / 3600 + 'h' : t < 86400 * 30 ? t / 86400 + 'd' : t < 86400 * 365 ? '1mo' : '1y';
  return (<svg viewBox={`0 0 ${W} ${H}`} className="anbars" role="img" aria-label="Estimated clear time per stage">
    {ticks.map(t => <g key={t}><line x1={pad} x2={W - 6} y1={y(t)} y2={y(t)} stroke="currentColor" opacity=".12" /><text x={pad - 4} y={y(t) + 3} fontSize="9" textAnchor="end" fill="currentColor" opacity=".6">{tl(t)}</text></g>)}
    {rows.map((r, i) => isFinite(r.sec) && <rect key={i} x={pad + i * bw + .5} y={y(r.sec)} width={Math.max(1, bw - 1)} height={Math.max(1, H - pad - y(r.sec))} fill={r.boss ? '#e0603c' : r.gim ? '#b08aff' : '#4a8cf0'} opacity={cur === r.st ? 1 : .8}><title>{`Stage ${r.st}${r.boss ? ' (boss)' : ''}: ${dur(r.sec)}`}</title></rect>)}
    <text x={pad} y={H - 8} fontSize="9" fill="currentColor" opacity=".6">Stage 1</text><text x={W - 6} y={H - 8} fontSize="9" textAnchor="end" fill="currentColor" opacity=".6">Stage 100</text>
  </svg>);
}


const STAT_EN = { atk: 'ATK', hp: 'Max HP', gold: 'Gold', drop: 'Egg drop', exp: 'EXP' };
const pctTxt = v => { const p = v * 100; for (const d of [2, 3, 4, 5]) { const r = Number(p.toFixed(d)); if (r > 0) return r + '%'; } return p.toExponential(1) + '%'; };
const Bar = ({ v, c = '#4a8cf0' }) => <div className="anshare" style={{ minWidth: 120 }}><i style={{ width: Math.max(2, Math.min(1, v) * 100) + '%', background: c }} /></div>;
const MonLinks = ({ id }) => <span className="small"><Link to={`/tasmons/${id}`}>Page</Link> · <Link to={`/tasmons/${id}/sim`}>Simulator</Link> · <TierBadge id={id} /></span>;

function Collection({ col }){
  const [tab, setTab] = useState('mons'), [nat, setNat] = useState(''), [rar, setRar] = useState(''), [lim, setLim] = useState(40), [showMiss, setShowMiss] = useState(30), [mq, setMq] = useState('');
  const D = col.dex, rows = col.rows.filter(r => { const s = speciesById[r.speciesId]; return (!nat || s.role === nat) && (!rar || s.rarity === rar); });
  const missRar = RARITIES.slice().reverse().map(r => [r, D.miss.filter(x => x.rarity === r)]).filter(x => x[1].length);
  const TABS = [['mons', `Tasmons (${col.totalMons})`], ['dex', `DEX (${D.have.length}/${D.total})`], ['eggs', `Eggs (${col.eggs.n})`], ['inv', 'Inventory & progress']];
  return (<section className="sec"><h2>Everything in your save</h2>
    <div className="grid4">
      <div className="card stat"><div className="mut small">Tasmons owned</div><div className="big">{col.totalMons}</div><div className="mut small">{col.ownedCount} different species</div></div>
      <div className="card stat"><div className="mut small">DEX</div><div className="big">{(D.frac * 100).toFixed(0)}%</div><div className="mut small">{D.have.length} of {D.total} species</div></div>
      <div className="card stat"><div className="mut small">Eggs</div><div className="big">{col.eggs.n}{col.eggs.cap ? <small> / {col.eggs.cap}</small> : ''}</div><div className="mut small">{col.eggs.known.length} with a known result</div></div>
      <div className="card stat"><div className="mut small">Bag · Storage</div><div className="big">{col.inv.items}<small> / {col.inv.invCap || '?'}</small></div><div className="mut small">storage {col.inv.storage}{col.inv.storageCap ? ` / ${col.inv.storageCap}` : ''}</div></div>
    </div>
    <div className="row wrap" style={{ margin: '10px 0' }}>{TABS.map(([k, t]) => <button key={k} className={'btn sm' + (k === tab ? ' on' : '')} onClick={() => setTab(k)}>{t}</button>)}</div>

    {tab === 'mons' && (<>
      <div className="filters"><label className="fld"><span>Nature</span><select value={nat} onChange={e => { setNat(e.target.value); setLim(40); }}><option value="">All</option>{ROLES.map(r => <option key={r} value={r}>{ROLE_EN[r]}</option>)}</select></label>
        <label className="fld"><span>Rarity</span><select value={rar} onChange={e => { setRar(e.target.value); setLim(40); }}><option value="">All</option>{RARITIES.map(r => <option key={r} value={r}>{RARITY_EN[r]}</option>)}</select></label>
        <span className="mut small">{rows.length} Tasmons, strongest first. Each row links to its wiki page, the gear simulator and the tier list.</span></div>
      <div className="scroll"><table className="tbl small"><thead><tr><th>Tasmon</th><th>Lv</th><th>Awak.</th><th>ATK</th><th>Max HP</th><th>Gear</th><th>Status</th><th>Wiki</th></tr></thead><tbody>
        {rows.slice(0, lim).map(r => { const s = speciesById[r.speciesId]; return (<tr key={r.id}><td><div className="row"><Img art={monArts(s)} size={36} alt={s.id} /><div><Link to={`/tasmons/${s.id}`}><TasmonName s={s} /></Link><div className="mut small"><span style={{ color: ELEM_COLOR[s.element] }}>{ELEM_EN[s.element]}</span> · {RARITY_EN[s.rarity]} · {ROLE_EN[s.role]}</div></div></div></td>
          <td>{r.level}</td><td>{r.awakening ? 'Ⅰ Ⅱ Ⅲ Ⅳ Ⅴ Ⅵ'.split(' ')[r.awakening - 1] : '—'}</td><td>{fmtBig(r.atk)}</td><td>{fmtBig(r.hp)}</td><td>{r.gear}</td><td>{r.inParty ? 'In party' : r.parked ? 'Parked' : ''}{r.talisman ? ' · Talisman' : ''}</td><td><MonLinks id={s.id} /></td></tr>); })}
      </tbody></table></div>
      {lim < rows.length && <p className="center"><button className="btn" onClick={() => setLim(lim + 60)}>Show more</button></p>}
    </>)}

    {tab === 'dex' && (<>
      <p>You have <b>{D.have.length}</b> of <b>{D.total}</b> collectable species ({(D.frac * 100).toFixed(1)}%). {D.nextMs ? <>Next milestone at <b>{D.nextMs[0] * 100}%</b> ({Math.ceil(D.nextMs[0] * D.total) - D.have.length} more species): <b>{D.nextMs[1]}</b>.</> : 'You completed the DEX!'} <Link to="/dex">DEX guide →</Link></p>
      <Bar v={D.frac} c="#4ac08c" />
      <div className="row wrap small" style={{ margin: '8px 0' }}>{DEX_MILESTONES.map(([f, t]) => <span key={f} className="tag" style={{ opacity: D.frac >= f ? 1 : .5 }}>{D.frac >= f ? '✔' : '○'} {f * 100}% · {t}</span>)}</div>
      {D.unclaimed.length > 0 && <p className="warn">⚠ {D.unclaimed.length} DEX buff{D.unclaimed.length === 1 ? ' is' : 's are'} waiting to be claimed in the game: {D.unclaimed.slice(0, 6).map(id => nameOf(speciesById[id]) || id).join(', ')}{D.unclaimed.length > 6 ? '…' : ''}.</p>}
      {D.notDex > 0 && <p className="mut small">{D.notDex} of your species (Hero, Season, Halloween or invite Tasmons) are not part of the DEX and give no buff.</p>}
      <div className="grid2"><div><h3>Buff collected</h3><table className="tbl small"><thead><tr><th>Stat</th><th>Collected</th><th>If complete</th></tr></thead><tbody>{Object.keys(D.all).map(k => <tr key={k}><td>{STAT_EN[k]}</td><td>{pctTxt(D.got[k] || 0)}</td><td>{pctTxt(D.all[k])}</td></tr>)}</tbody></table><p className="mut small">Before the game’s caps and milestone bonuses.</p></div>
        <div><h3>By rarity</h3><table className="tbl small"><tbody>{D.byRar.map(x => <tr key={x.r}><td>{RARITY_EN[x.r]}</td><td>{x.have} / {x.total}</td><td><Bar v={x.have / x.total} c="#4a8cf0" /></td></tr>)}</tbody></table></div></div>
      <h3>Still missing ({D.miss.length})</h3>
      {missRar.map(([r, l]) => <div key={r}><div className="mut small" style={{ margin: '6px 0 2px' }}>{RARITY_EN[r]} · {l.length}</div><div className="row wrap">{l.slice(0, showMiss).map(x => { const av = availability(x); return <Link key={x.id} to={`/tasmons/${x.id}`} className="chip" title={av.text || 'Standard egg'}><Img art={monArts(x)} size={28} alt={x.id} label={x.id} /><span>{nameOf(x) || romaji(x.jp)}</span></Link>; })}{l.length > showMiss && <span className="mut small">+{l.length - showMiss}</span>}</div></div>)}
      {D.miss.length > showMiss && <p><button className="btn sm" onClick={() => setShowMiss(999)}>Show every missing species</button></p>}
    </>)}

    {tab === 'eggs' && (<>
      <p>{col.eggs.n} egg{col.eggs.n === 1 ? '' : 's'} in your incubator{col.eggs.cap ? ` (capacity ${col.eggs.cap})` : ''}. See <Link to="/tasmons">how to get each Tasmon</Link>, the <Link to="/tower">Elemental Tower</Link> and <Link to="/events">Events</Link> for more egg sources.</p>
      <table className="tbl small"><thead><tr><th>Rarity</th><th>Eggs</th></tr></thead><tbody>{RARITIES.filter(r => col.eggs.byRar[r]).map(r => <tr key={r}><td><RarTag r={r} /></td><td>{col.eggs.byRar[r]}</td></tr>)}{col.eggs.byRar['?'] && <tr><td>Unknown</td><td>{col.eggs.byRar['?']}</td></tr>}</tbody></table>
      {col.eggs.known.length > 0 && <><h3>Eggs with a known result</h3><div className="row wrap">{col.eggs.known.map((e, i) => { const x = speciesById[e.resultSpecies]; return <Link key={i} to={`/tasmons/${x.id}`} className="chip"><Img art={monArts(x)} size={28} alt={x.id} label={x.id} /><span>{nameOf(x) || romaji(x.jp)}</span></Link>; })}</div></>}
    </>)}

    {tab === 'inv' && (<div className="grid2"><div>
      <h3>Inventory</h3><table className="tbl small"><tbody>
        <tr><td>Bag</td><td>{col.inv.items}{col.inv.invCap ? ` / ${col.inv.invCap}` : ''}</td></tr><tr><td>Storage</td><td>{col.inv.storage}{col.inv.storageCap ? ` / ${col.inv.storageCap}` : ''}</td></tr>
        <tr><td>Chests</td><td>{col.inv.chests}</td></tr><tr><td>Evolution stones</td><td>{fmtBig(col.inv.evoStones)}</td></tr><tr><td>Souls</td><td>{col.inv.souls}</td></tr><tr><td>Key items</td><td>{col.inv.keyItems}</td></tr><tr><td>Expeditions running</td><td>{col.inv.expeditions}</td></tr></tbody></table>
      {Object.keys(col.inv.itemRar).length > 0 && <><h3>Bag by rarity</h3><div className="row wrap">{RARITIES.filter(r => col.inv.itemRar[r]).map(r => <span key={r} className="tag"><RarTag r={r} /> × {col.inv.itemRar[r]}</span>)}</div></>}
      <p className="mut small">See the <Link to="/equipment">Equipment</Link> and <Link to="/jobs">Jobs</Link> guides for what to look for.</p></div>
      <div><h3>Progress</h3><table className="tbl small"><tbody>
        <tr><td>Total kills</td><td>{fmtBig(col.prog.kills)}</td></tr><tr><td>Cube level</td><td>{col.prog.cube || '—'}</td></tr>
        <tr><td><Link to="/hunt">Hero Hunt</Link> clears recorded</td><td>{col.prog.hunt}</td></tr>
        {col.prog.tower.map(t => <tr key={t.el}><td><Link to="/tower">Tower</Link> · {ELEM_EN[t.el] || t.el}</td><td>Floor {t.top} / 50</td></tr>)}
        {!col.prog.tower.length && <tr><td><Link to="/tower">Elemental Tower</Link></td><td>Not started</td></tr>}</tbody></table>
        <p className="mut small">Check <Link to="/stages">Stages</Link> for enemy values and <Link to="/mechanics">Mechanics</Link> for how everything works.</p></div></div>)}
  </section>);
}

function Progress({ res }){
  const pr = res.progress, tot = pr.reduce((a, x) => a + x.cleared, 0), open = pr.filter(x => x.unlocked), next = pr.find(x => !x.unlocked);
  const status = x => !x.unlocked ? 'Locked' : x.done ? 'Cleared' : x.cleared || x.reached > 1 ? 'In progress' : 'Unlocked';
  return (<section className="sec"><h2>Stage progress</h2>
    <p>You have cleared <b>{tot}</b> of <b>{pr.length * 100}</b> stages across {open.length} unlocked difficult{open.length === 1 ? 'y' : 'ies'}. You are on <b style={{ color: PH.DIFFS[res.current.difficulty]?.color }}>{PH.DIFFS[res.current.difficulty]?.name}</b>, stage {res.current.stage}.{next ? <> Next to unlock: <b style={{ color: next.color }}>{next.name}</b> — clear stage 100 of the difficulty before it.</> : null} See <Link to="/stages">Stages</Link> for enemy values.</p>
    <div className="scroll"><table className="tbl small"><thead><tr><th>Difficulty</th><th>Status</th><th>Cleared</th><th>Highest stage reached</th><th>Left to clear</th><th>Acts (10 stages each)</th><th>Est. time left</th></tr></thead><tbody>
      {pr.map(x => (<tr key={x.d} style={{ opacity: x.unlocked ? 1 : .55 }}><td><b style={{ color: x.color }}>{x.name}</b></td><td>{status(x)}</td>
        <td><div className="anshare" style={{ minWidth: 110 }}><i style={{ width: Math.max(x.cleared ? 3 : 0, x.cleared) + '%', background: x.color }} /></div><span className="mut small">{x.cleared} / 100</span></td>
        <td>{x.unlocked ? x.reached : '—'}</td><td>{x.unlocked ? x.left : 100}</td>
        <td><span className="actrow">{Array.from({ length: 10 }, (_, a) => { const c = Math.max(0, Math.min(10, x.cleared - a * 10)); return <i key={a} title={`Act ${a + 1}: ${c} / 10 stages cleared`} className={c >= 10 ? 'on' : c > 0 ? 'part' : ''} style={c >= 10 ? { background: x.color } : null} />; })}</span></td>
        <td>{!x.unlocked ? '—' : x.done ? 'done' : x.eta == null ? '—' : dur(x.eta)}</td></tr>))}
    </tbody></table></div>
    <p className="mut small">“Highest stage reached” is how far the game has opened stages in that difficulty; “cleared” counts the boss stages you have beaten. Time left is the same damage-only estimate as below, for the stages you have not cleared yet.</p>
  </section>);
}

export default function Analyzer(){
  const [copied, setCopied] = useState(false), [save, setSave] = useState(null), [fname, setFname] = useState(''), [err, setErr] = useState(''), [diff, setDiff] = useState(null), [interval, setInterval_] = useState(1), [drag, setDrag] = useState(false);
  const inp = useRef(null);
  async function load(f){
    setErr('');
    try {
      let t = await f.text(); if (SEAL.is(t)) t = SEAL.open(t); t = t.replace(/^﻿/, '');
      const d = JSON.parse(t); if (!d || typeof d !== 'object' || !d.monsters) throw new Error('This does not look like a TASMON save (no “monsters” field).');
      setSave(d); setFname(f.name); setDiff(null);
    } catch (e) { setSave(null); setErr('Could not read this file: ' + e.message); }
  }
  async function copyPath(){
    try { await navigator.clipboard.writeText(SAVE_DIR); } catch { const t = document.createElement('textarea'); t.value = SAVE_DIR; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch {} t.remove(); }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  }
  const res = useMemo(() => save ? AN.analyze(save, { difficulty: diff, attackInterval: interval }) : null, [save, diff, interval]);
  const col = useMemo(() => save ? collect(save, AN) : null, [save]);
  const D = res?.difficulty ?? 0;
  const worst = useMemo(() => res ? res.rows.slice().sort((a, b) => (isFinite(b.sec) ? b.sec : 1e300) - (isFinite(a.sec) ? a.sec : 1e300)).slice(0, 6) : [], [res]);
  return (<>
    <h1>Save Analyzer</h1>
    <p>Load your <code>tbm-save.json</code> and see your party’s estimated damage per second, how long each stage should take, and what to improve first. <b>Your save never leaves your browser</b>: it is read and analyzed locally and nothing is uploaded. Works with the game’s sealed save files too.</p>
    <div className={'drop' + (drag ? ' on' : '')} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) load(f); }}>
      <button className="btn" onClick={() => inp.current?.click()}>📂 Choose save file</button><span className="mut"> or drop it here{fname ? ` · loaded: ${fname}` : ''}</span>
      <input ref={inp} type="file" hidden accept=".json,.txt,application/json,*/*" onChange={e => { const f = e.target.files?.[0]; if (f) load(f); e.target.value = ''; }} />
      <div className="mut small savepath">Default save location (Windows): <code>{SAVE_DIR}</code> <button className="btn sm" onClick={copyPath}>{copied ? '✔ Copied' : '📋 Copy path'}</button></div>
      <div className="mut small">Paste it into the File Explorer address bar (or Win+R) — <code>%userprofile%</code> works for every user. Open the <code>acct-…</code> folder inside and pick <code>tbm-save.json</code>. Make a copy first if you plan to edit it.</div>
    </div>
    {err && <p className="warn">⚠ {err}</p>}
    {res && !res.ok && <p className="warn">⚠ No monsters found in this save.</p>}
    {res?.ok && res.party.length === 0 && <p className="warn">⚠ This save has no active party, so there is nothing to analyze.</p>}
    {res?.ok && <Progress res={res} />}
    {col && <Collection col={col} />}
    {res?.ok && res.party.length > 0 && (<>
      <section className="sec"><h2>Overview</h2>
        <div className="grid4">
          <div className="card stat"><div className="mut small">Estimated damage / second</div><div className="big">{fmtBig(res.dps)}</div><div className="mut small">basic {fmtBig(res.basic)} · skills {fmtBig(res.skill)}</div></div>
          <div className="card stat"><div className="mut small">Party ATK · HP</div><div className="big">{fmtBig(res.totals.atk)}</div><div className="mut small">HP {fmtBig(res.totals.hp)}</div></div>
          <div className="card stat"><div className="mut small">Crit</div><div className="big">{P1(res.P.critRate + res.P.berryCrit)}</div><div className="mut small">× {res.P.critDmg.toFixed(2)} damage → ×{res.P.critMult.toFixed(2)}</div></div>
          <div className="card stat"><div className="mut small">Attacks / second</div><div className="big">{res.P.hitsPerSec.toFixed(2)}</div><div className="mut small">speed +{P1(res.P.atkSpeed)} · CDR {P1(res.P.cdr)}</div></div>
        </div>
        <p className="mut small">Progress: difficulty <b style={{ color: PH.DIFFS[res.current.difficulty]?.color }}>{PH.DIFFS[res.current.difficulty]?.name}</b>, stage {res.current.stage}. Level cap at your progress: {res.lvCap}. Monsters in the save: {res.counts.monsters} · eggs {res.counts.eggs} · talismans in bag {res.counts.talismans}.</p>
      </section>

      <section className="sec"><h2>Your party</h2>
        <div className="scroll"><table className="tbl small"><thead><tr><th>Tasmon</th><th>Lv</th><th>Awak.</th><th>Job</th><th>Role</th><th>ATK</th><th>Max HP</th><th>Skill DPS</th><th>Share of ATK</th><th>Gear</th><th>Talisman</th><th>Free Sphere pts</th></tr></thead><tbody>
          {res.party.map(m => { const s = speciesById[m.speciesId], j = jobById[m.job], share = m.atk / res.totals.atk; return (<tr key={m.id}>
            <td><div className="row"><Img art={monArts(s)} size={40} alt={s.id} /><div>{nm(m.speciesId)}<div className="mut small"><span style={{ color: ELEM_COLOR[m.element] }}>{ELEM_EN[m.element]}</span> · {RARITY_EN[m.rarity]}</div></div></div></td>
            <td>{m.level}</td><td>{m.awakening ? 'Ⅰ Ⅱ Ⅲ Ⅳ Ⅴ Ⅵ'.split(' ')[m.awakening - 1] : '—'}</td><td>{j ? (JOB_EN[j.id] || j.id) : '—'}{m.pinnacle ? <span className="mut small"> · Pinnacle</span> : ''}</td><td>{ROLE_EN[m.role]}</td>
            <td>{fmtBig(m.atk)}</td><td>{fmtBig(m.hp)}</td><td>{m.skillDps ? fmtBig(m.skillDps) : '—'}</td>
            <td><div className="anshare"><i style={{ width: Math.max(2, share * 100) + '%' }} /></div><span className="mut small">{(share * 100).toFixed(0)}%</span></td>
            <td>{m.slots}</td><td>{m.talisman ? '✔' : '—'}</td><td>{Math.max(0, m.perkPoints - m.perkSpent)}</td></tr>); })}
        </tbody></table></div>
      </section>

      <section className="sec"><h2>Clear time per stage</h2>
        <div className="row wrap">{PH.DIFFS.map(x => <button key={x.id} className={'btn sm' + (x.id === D ? ' on' : '')} style={x.id === D ? { borderColor: x.color, color: x.color } : null} onClick={() => setDiff(x.id)}>{x.name}</button>)}</div>
        <Bars rows={res.rows} cur={D === res.current.difficulty ? res.current.stage : -1} />
        <div className="mut small">Blue = regular stage (30 kills), orange = boss, purple = challenge stage. Log scale.</div>
        <div className="grid2" style={{ marginTop: 10 }}><div>
          <h3>By act</h3>
          <table className="tbl small"><thead><tr><th>Act</th><th>Average / stage</th><th>Slowest stage</th><th>Whole act</th></tr></thead><tbody>{res.acts.map(a => <tr key={a.act}><td>{a.act}</td><td>{dur(a.avg)}</td><td>{dur(a.worst)}</td><td>{dur(a.total)}</td></tr>)}</tbody></table>
        </div><div>
          <h3>Slowest stages</h3>
          <table className="tbl small"><thead><tr><th>Stage</th><th>Enemy</th><th>Time</th></tr></thead><tbody>{worst.map(r => <tr key={r.st}><td>{r.st}{r.boss ? ' ☠' : ''}</td><td style={{ color: ELEM_COLOR[r.elem] }}><Img art={elemArts(r.elem)} size={14} alt="" className="mini" /> {ELEM_EN[r.elem]}{r.gim ? ` · ${r.gim}` : ''}</td><td>{dur(r.sec)}</td></tr>)}</tbody></table>
          <p className="mut small">Whole difficulty ({PH.DIFFS[D].name}): <b>{dur(res.acts.reduce((a, x) => a + x.total, 0))}</b> of pure damage time.</p>
        </div></div>
      </section>

      <section className="sec"><h2>What to improve</h2>
        <ul className="advice">{res.suggestions.map((s, i) => <li key={i} className={'sev' + s.sev}><span className="tag">{SEV[s.sev]}</span> {advice(s)}</li>)}</ul>
        <h3>What-if: estimated DPS change</h3>
        <table className="tbl small"><thead><tr><th>Change</th><th>DPS</th></tr></thead><tbody>{res.sens.map(x => <tr key={x.key}><td>{WHAT[x.key]}</td><td>{x.gain > 0.0005 ? '+' + (x.gain * 100).toFixed(1) + '%' : 'already maxed'}</td></tr>)}</tbody></table>
      </section>

      <section className="sec"><h2>How this is estimated</h2>
        <label className="fld"><span>Seconds per basic attack (base)</span><input type="number" min=".2" max="5" step=".1" value={interval} onChange={e => setInterval_(Math.max(.2, +e.target.value || 1))} /></label>
        <ul className="bul small">
          <li>Per-Tasmon ATK and HP follow the game’s own formulas: level growth, IV, rarity, awakening, job, Pinnacle, Plus, gear (including set bonuses and the game’s enhancement caps), Sphere nodes, Talisman and Elemental Berries.</li>
          <li>Party damage per second = total ATK × attacks per second × crit multiplier, plus the damage of equipped attack skills (ATK × skill power ÷ cooldown). Skills are treated as single-target.</li>
          <li>Time per stage = enemy HP ÷ DPS: 30 regular kills, or one kill for bosses and challenge walls. Element advantage (×1.5 / ×0.55) and elemental-trial penalties are applied per Tasmon.</li>
          <li><b>Not included:</b> species passives, DEX bonus, Hero Growth, party buffs and heals, spawn delays and the time enemies need to reach you. Real runs are usually slower than the estimate, and survival is not checked. The base 1 s per basic attack is an assumption (the game’s offline-progress estimate also uses one attack per second) — change it above if you measured a different value. The numbers are best used to compare changes, not as an exact stopwatch.</li>
        </ul>
        <p className="mut small">See also the <Link to="/stages">Stages</Link> page for enemy values and the Tasmon <b>Simulator</b> for single-Tasmon gear experiments.</p>
      </section>
    </>)}
  </>);
}
