import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { species, meta, RARITIES, RARITY_EN, RARITY_COLOR } from '../lib/data.js';
import { Img, monArts, useAssets } from '../lib/img.jsx';
import { ROLE_EN } from '../lib/data.js';
import { TasmonName, ElemTag, RarTag, ArtViewer } from '../components.jsx';
const STAT_EN = { atk: 'ATK', hp: 'Max HP', gold: 'Gold', drop: 'Egg drop', exp: 'EXP' };
const MILE_EN = [['10%', 'Gold +5%'], ['25%', 'Egg drop +0.5%'], ['50%', 'EXP +10%'], ['75%', 'ATK +3%'], ['100% (complete)', 'ATK +5% · Max HP +5%']];
const pctTxt = v => { const p = v * 100; for (const d of [2, 3, 4, 5]) { const r = Number(p.toFixed(d)); if (r > 0) return r + '%'; } return p.toExponential(1) + '%'; };
export default function Dex(){
  const assets = useAssets();
  const list = useMemo(() => species.filter(s => s.dex), []);
  const [shiny, setShiny] = useState(false), [stat, setStat] = useState(''), [rar, setRar] = useState(''), [sort, setSort] = useState('rarity');
  const rows = list.filter(s => (!stat || s.dex.stat === stat) && (!rar || s.rarity === rar))
    .sort((a, b) => sort === 'value' ? b.dex.value - a.dex.value : RARITIES.indexOf(b.rarity) - RARITIES.indexOf(a.rarity) || a.id.localeCompare(b.id));
  const sum = {}; list.forEach(s => { sum[s.dex.stat] = (sum[s.dex.stat] || 0) + s.dex.value; });
  return (<>
    <h1>DEX</h1>
    <p>The DEX records every Tasmon you have owned. Each collectable species gives a small permanent buff, and completion milestones give bigger ones. Hero Series, Season cast, Halloween, and invite-partner Tasmons are not part of the DEX and give no buff.</p>
    <div className="grid3">
      <div className="card tile"><h3>Collectable species</h3><div className="big">{list.length}</div><p>Standard + Expedition egg species.</p></div>
      <div className="card tile"><h3>Buff caps</h3><div className="big sm">{Object.entries(meta.dexCaps).filter(([, v]) => v != null).map(([k, v]) => `${STAT_EN[k]} ${pctTxt(v)}`).join(' · ')}</div><p>Egg drop has no cap.</p></div>
      <div className="card tile"><h3>Total if everything is collected</h3><div className="big sm">{Object.entries(sum).map(([k, v]) => `${STAT_EN[k]} ${pctTxt(v)}`).join(' · ')}</div><p>Before caps and milestones.</p></div>
    </div>
    <h2>Completion milestones</h2>
    <table className="tbl"><thead><tr><th>Collected</th><th>Reward</th></tr></thead><tbody>{MILE_EN.map(([a, b]) => <tr key={a}><td>{a}</td><td>{b}</td></tr>)}</tbody></table>
    <h2>Buff per species</h2>
    <p className="mut small">Click a name for the full page (skills, passives, stats calculator, skins). Each species rolls one stat. Value scales with rarity stars and a fixed per-species factor.</p>
    <div className="filters">
      <label className="fld"><span>Stat</span><select value={stat} onChange={e => setStat(e.target.value)}><option value="">All</option>{Object.entries(STAT_EN).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <label className="fld"><span>Rarity</span><select value={rar} onChange={e => setRar(e.target.value)}><option value="">All</option>{RARITIES.filter(r => list.some(s => s.rarity === r)).map(r => <option key={r} value={r}>{RARITY_EN[r]}</option>)}</select></label>
      <label className="fld"><span>Sort</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="rarity">Rarity</option><option value="value">Buff value</option></select></label>
      <label className="fld chk"><input type="checkbox" checked={shiny} onChange={e => setShiny(e.target.checked)} /> <span>Show Shiny versions</span></label>
      <span className="mut small">{rows.length} species</span>
    </div>
    <div className="scroll"><table className="tbl"><thead><tr><th>Tasmon</th><th>Art (click a thumbnail)</th><th>Rarity</th><th>Element</th><th>Role</th><th>Base ATK / HP</th><th>Buff</th></tr></thead><tbody>
      {rows.map(s => <tr key={s.id}><td><Link to={`/tasmons/${s.id}`}><TasmonName s={s} /></Link></td><td><ArtViewer getArt={(e, v) => { const a = monArts(s, { evo: e, variant: v }); return v ? a.filter(p => p.includes('monsters-variant/')) : e ? a.filter(p => p.includes('/evolved/')) : a; }} fallback={monArts(s)} assets={assets} shiny={shiny} dark label={s.id} /></td><td><RarTag r={s.rarity} /></td><td><ElemTag e={s.element} /></td><td>{ROLE_EN[s.role]}</td><td>{s.atk} / {s.hp}</td><td>{STAT_EN[s.dex.stat]} +{pctTxt(s.dex.value)}</td></tr>)}
    </tbody></table></div>
  </>);
}
