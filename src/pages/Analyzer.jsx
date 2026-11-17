import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { nameOf, speciesById, skills, jobById, meta, sphPerks, ELEM_EN, ELEM_COLOR, RARITY_EN, ROLE_EN, JOB_EN } from '../lib/data.js';
import setsArr from '../data/sets.json';
import { PH } from '../lib/stages.js';
import { createAnalyzer } from '../lib/analyzer-core.js';
import { SEAL } from '../lib/seal.js';
import { Img, monArts, elemArts } from '../lib/img.jsx';
import { TasmonName } from '../components.jsx';
import { fmtBig, romaji } from '../lib/text.js';

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

export default function Analyzer(){
  const [save, setSave] = useState(null), [fname, setFname] = useState(''), [err, setErr] = useState(''), [diff, setDiff] = useState(null), [interval, setInterval_] = useState(1), [drag, setDrag] = useState(false);
  const inp = useRef(null);
  async function load(f){
    setErr('');
    try {
      let t = await f.text(); if (SEAL.is(t)) t = SEAL.open(t); t = t.replace(/^﻿/, '');
      const d = JSON.parse(t); if (!d || typeof d !== 'object' || !d.monsters) throw new Error('This does not look like a TASMON save (no “monsters” field).');
      setSave(d); setFname(f.name); setDiff(null);
    } catch (e) { setSave(null); setErr('Could not read this file: ' + e.message); }
  }
  const res = useMemo(() => save ? AN.analyze(save, { difficulty: diff, attackInterval: interval }) : null, [save, diff, interval]);
  const D = res?.difficulty ?? 0;
  const worst = useMemo(() => res ? res.rows.slice().sort((a, b) => (isFinite(b.sec) ? b.sec : 1e300) - (isFinite(a.sec) ? a.sec : 1e300)).slice(0, 6) : [], [res]);
  return (<>
    <h1>Save Analyzer</h1>
    <p>Load your <code>tbm-save.json</code> and see your party’s estimated damage per second, how long each stage should take, and what to improve first. <b>Your save never leaves your browser</b>: it is read and analyzed locally and nothing is uploaded. Works with the game’s sealed save files too.</p>
    <div className={'drop' + (drag ? ' on' : '')} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) load(f); }}>
      <button className="btn" onClick={() => inp.current?.click()}>📂 Choose save file</button><span className="mut"> or drop it here{fname ? ` · loaded: ${fname}` : ''}</span>
      <input ref={inp} type="file" hidden accept=".json,.txt,application/json,*/*" onChange={e => { const f = e.target.files?.[0]; if (f) load(f); e.target.value = ''; }} />
      <div className="mut small">The file is usually in the game’s save folder (the same <code>tbm-save.json</code> the editor opens).</div>
    </div>
    {err && <p className="warn">⚠ {err}</p>}
    {res && !res.ok && <p className="warn">⚠ No monsters found in this save.</p>}
    {res?.ok && res.party.length === 0 && <p className="warn">⚠ This save has no active party, so there is nothing to analyze.</p>}
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
