import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import guides from '../data/guides.json';
import { speciesById, JOB_EN, ROLE_EN } from '../lib/data.js';
import { Img, monArts, jobArts } from '../lib/img.jsx';
import { TIERS, JOBTIERS, TIER_COLOR } from './Tiers.jsx';
import { WIDGETS } from './GuideWidgets.jsx';

const NAT = ['nuke', 'guard', 'heal', 'buff'];
// Live picks from the tier lists, so the guide never goes out of date with the data.
function TopPicks(){
  return (<div className="grid2">{NAT.map(n => { const mons = (TIERS.by[n] || []).slice(0, 6), jobs = (JOBTIERS.by[n] || []).filter(j => j.rare || j.hidden).slice(0, 3);
    return (<div key={n} className="card"><h3>{ROLE_EN[n]} — top picks</h3>
      <div className="row wrap" style={{ gap: 6 }}>{mons.map(e => <Link key={e.id} to={`/tasmons/${e.id}`} className="tchip" title={`${speciesById[e.id].jp} · tier ${e.tier}`} style={{ borderColor: TIER_COLOR[e.tier] }}><Img art={monArts(speciesById[e.id])} size={44} alt={e.id} label={e.id} /></Link>)}</div>
      <div className="small mut" style={{ marginTop: 6 }}>Rare / Hidden jobs: {jobs.map((j, i) => <span key={j.id}>{i ? ', ' : ''}<b>{JOB_EN[j.id] || j.id}</b> ({j.hidden ? 'Hidden' : 'Rare'}, tier {j.tier2})</span>)}</div></div>); })}
    <p className="mut small" style={{ gridColumn: '1 / -1' }}>Picks come straight from the <Link to="/tiers">Tasmon Tier List</Link> (base power at Lv 150). Your own gear, awakening and team matter too — test it in the <Link to="/team-builder">Team Builder</Link>.</p></div>);
}
const Block = ({ b }) => {
  if (b.t === 'p') return <p>{b.en}</p>;
  if (b.t === 'h') return <h3>{b.en}</h3>;
  if (b.t === 'ul') return <ul className="bul">{b.items.map((i, k) => <li key={k}>{i.en}</li>)}</ul>;
  if (b.t === 'ol') return <ol className="bul">{b.items.map((i, k) => <li key={k}>{i.en}</li>)}</ol>;
  if (b.t === 'tip') return <div className="advice">💡 {b.en}</div>;
  if (b.t === 'warn') return <div className="card" style={{ borderLeft: '3px solid #e5484d', margin: '6px 0' }}>⚠ {b.en}</div>;
  if (b.t === 'widget') { const C = WIDGETS[b.id]; return C ? <C /> : null; }
  if (b.t === 'links') return <div className="row wrap">{b.items.map(l => <Link key={l.to} className="chip" to={l.to}>{l.en}</Link>)}</div>;
  return null;
};
export default function Guides(){
  const hash = (window.location.hash.split('?')[1] || '').replace(/^s=/, ''), [id, setId] = useState(guides.some(g => g.id === hash) ? hash : guides[0].id), g = guides.find(x => x.id === id);
  return (<>
    <h1>Guides</h1>
    <p>Practical advice for new players who want to become advanced ones: how to progress, how to build each Tasmon, how to spend resources and which mistakes to avoid. “Recommendation” items are our own advice based on the game’s data, not official rules.</p>
    <div className="row wrap">{guides.map(x => <button key={x.id} className={'btn' + (x.id === id ? ' on' : '')} onClick={() => setId(x.id)}>{x.en}</button>)}</div>
    <section className="sec"><h2>{g.en}</h2>{g.blocks.map((b, i) => <Block key={i} b={b} />)}{g.id === 'builds' && <><h3>Top picks right now</h3><TopPicks /></>}</section>
    <p className="center"><button className="btn sm" onClick={() => { const i = guides.findIndex(x => x.id === id); setId(guides[(i + 1) % guides.length].id); window.scrollTo(0, 0); }}>Next: {guides[(guides.findIndex(x => x.id === id) + 1) % guides.length].en} →</button></p>
  </>);
}
