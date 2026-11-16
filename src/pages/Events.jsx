import React from 'react';
import { Link } from 'react-router-dom';
import { species, SEASONS, HALLOWEEN, skills } from '../lib/data.js';
import { TasmonCard } from '../components.jsx';
import { SkillCard } from '../cards.jsx';
const day = t => new Date(t).toISOString().slice(0, 10);
const state = (w, now) => now < w.from ? 'Upcoming' : now < w.to ? 'Running now' : 'Ended';
export default function Events(){
  const now = Date.now(), [shiny, setShiny] = React.useState(false);
  const hw = species.filter(s => s.group === 'halloween');
  const grid = list => <div className="grid">{list.map(s => <TasmonCard key={s.id} s={s} shiny={shiny} />)}</div>;
  return (<>
    <h1>Events</h1>
    <p>Everything tied to a limited time window: Seasons and the Halloween event. Event Tasmons can only be obtained while their window is open, and they are marked on their own pages. Dates are in UTC.</p>
    <label className="fld chk"><input type="checkbox" checked={shiny} onChange={e => setShiny(e.target.checked)} /> <span>Show Shiny versions</span></label>
    <div className="chips">{[...Object.values(SEASONS).map(w => ['s' + w.no, 'Season ' + w.no]), ['halloween', 'Halloween'], ['perk', 'Season completion bonus']].map(([k, t]) => <a key={k} className="chip" href={'#/events#' + k} onClick={e => { e.preventDefault(); document.getElementById(k)?.scrollIntoView({ behavior: 'smooth' }); }}>{t}</a>)}</div>
    {Object.entries(SEASONS).map(([key, w]) => { const cast = species.filter(s => s.group === 'season' && s.id.startsWith(key + '_')), sk = Object.values(skills).filter(k => k.id.startsWith(key + '_'));
      return (<section className="sec" key={key} id={key}><h2>Season {w.no} <span className="tag">{state(w, now)}</span></h2>
        <p>{day(w.from)} → {day(w.to - 1)} · {cast.length} cast Tasmons</p>{grid(cast)}
        {sk.length > 0 && <><h3>Season skills</h3><div className="stack">{sk.map(k => <SkillCard key={k.id} id={k.id} showUsers={false} />)}</div></>}</section>); })}
    <section className="sec" id="halloween"><h2>Halloween <span className="tag">{state(HALLOWEEN, now)}</span></h2>
      <p>{day(HALLOWEEN.from)} → {day(HALLOWEEN.to - 1)} · {hw.length} Tasmons. Each one is the Halloween version of a regular species.</p>{grid(hw)}</section>
    <section className="sec" id="perk"><h2>Season completion bonus</h2>
      <p>Owning cast members of a season in the DEX multiplies your egg drop chance:</p>
      <table className="tbl small"><thead><tr><th>Cast owned</th><th>20%</th><th>40%</th><th>60%</th><th>80%</th><th>100%</th></tr></thead><tbody><tr><td>Egg drop</td><td>×1.1</td><td>×1.2</td><td>×1.3</td><td>×1.4</td><td>×1.5</td></tr></tbody></table>
      <p className="mut small">See <Link to="/mechanics">Mechanics</Link> for the full egg drop formula.</p></section>
  </>);
}
