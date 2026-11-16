import React from 'react';
import { Link } from 'react-router-dom';
import { RARITY_EN, RARITY_COLOR } from '../lib/data.js';
import eggs from '../data/tower-eggs.json';
import { Img, elemArts } from '../lib/img.jsx';
import { STAT_EN } from '../lib/gear.js';
import talisman from '../data/talisman.json';
const T = 1e12, B = 1e9, M = 1e6, K = 1e3;
const BANDS = [
  { f: '1–10', head: { common: 70, rare: 20, ultra: 7, legend: 3 }, tail: { common: 58, rare: 28, ultra: 9, legend: 5 }, hp: [500 * K, 10 * B], atk: [5 * K, 50 * K] },
  { f: '11–20', head: { rare: 60, ultra: 25, legend: 10, immortal: 4, arcana: 1 }, tail: { rare: 45, ultra: 30, legend: 15, immortal: 8, arcana: 2 }, hp: [100 * B, 10 * T], atk: [100 * K, 500 * K] },
  { f: '21–30', head: { ultra: 55, legend: 28, immortal: 12, arcana: 4.5, beyond: .4, century: .1 }, tail: { ultra: 40, legend: 33, immortal: 18, arcana: 8, beyond: .7, century: .3 }, hp: [50 * T, 200 * T], atk: [1 * M, 10 * M] },
  { f: '31–40', head: { legend: 55, immortal: 30, arcana: 14, beyond: .7, century: .25, cosmic: .05 }, tail: { legend: 40, immortal: 35, arcana: 23.4, beyond: 1, century: .5, cosmic: .1 }, hp: [500 * T, 5e3 * T], atk: [20 * M, 50 * M] },
  { f: '41–50', head: { immortal: 60, arcana: 38.2, beyond: 1.2, century: .5, cosmic: .09, celestial: .01 }, tail: { immortal: 50, arcana: 47.55, beyond: 1.5, century: .7, cosmic: .2, celestial: .05 }, hp: [1e4 * T, 5e4 * T], atk: [70 * M, 100 * M] }];
const ELS = ['fire', 'water', 'wind', 'earth', 'light', 'dark'], EL_EN = { fire: 'Fire', water: 'Water', wind: 'Wind', earth: 'Earth', light: 'Light', dark: 'Dark' };
const TAL_COUNT = { common: 3, rare: 3, ultra: 3, legend: 3, immortal: 4, arcana: 4, beyond: 4, century: 4, cosmic: 5, celestial: 5 };
const G = ['Lesser (1–10F)', 'Middle (11–20F)', 'Higher (21–30F)', 'Superior (31–40F)', 'Top grade (41–50F)'];
const ST = [['hpFlat', 'Max HP', true, [200, 500, 1e3, 3e3, 5e3], [5e5, 2e5, 1e5]], ['atkFlat', 'ATK', true, [100, 200, 400, 600, 1e3], [1e5, 8e4, 5e4]], ['defPct', 'Damage reduction', false, [.001, .002, .004, .006, .01], [1, 1, 1]], ['critRate', 'Crit rate', false, [1e-4, 2e-4, 4e-4, 6e-4, .001], [.05, .05, .05]], ['critDmg', 'Crit damage', false, [.001, .005, .01, .02, .04], [2, 1.5, 1]], ['singleSkillPct', 'Single-target skill power', false, [.001, .005, .01, .02, .04], [2, 1.5, 1]], ['aoeSkillPct', 'Area skill power', false, [.001, .005, .01, .02, .04], [2, 1.5, 1]]];
const RAR = ['common', 'rare', 'ultra', 'legend', 'immortal', 'arcana', 'beyond', 'century', 'cosmic', 'celestial'];
const EGG_FLOORS = [1, 5, 10, 11, 20, 21, 30, 31, 34, 40, 43, 50];
const fp = v => v >= 1 ? +v.toFixed(2) + '%' : v >= .1 ? +v.toFixed(3) + '%' : +v.toPrecision(2) + '%';
const F = n => n >= T ? +(n / T).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'T' : n >= B ? +(n / B).toFixed(1) + 'B' : n >= M ? +(n / M).toFixed(1) + 'M' : +(n / K).toFixed(1) + 'K';
const W = o => Object.entries(o).map(([r, w]) => <span key={r} className="tag" style={{ borderColor: RARITY_COLOR[r], color: RARITY_COLOR[r] }}>{RARITY_EN[r]} {w}%</span>);
export default function Tower(){
  return (<>
    <h1>Elemental Tower</h1>
    <p>Six towers, one per element (Fire, Water, Wind, Earth, Light, Dark), each with <b>50 floors</b>. Each floor is a boss fight; winning drops <b>Talismans</b> (and, since the latest update, <b>eggs</b> and <b>Elemental Berries</b>). Floors 41–50 are now open. Defeated enemies respawn after a 3-second cooldown, and the Tower runs ×1.5 faster for players who own the speed bonus. Bosses cast a skill every 10 seconds at ×1.3 power.</p>
    <section className="sec"><h2>Drops</h2>
      <table className="tbl small"><thead><tr><th>Drop</th><th>Chance per win</th><th>With the “Permanent Talisman & Fruit Pass” DLC</th><th>Notes</th></tr></thead><tbody>
        <tr><td>Talisman</td><td>0.5%</td><td>1%</td><td>Rarity depends on the floor (table below). See <Link to="/equipment">Equipment</Link>.</td></tr>
        <tr><td>Berry (elemental fruit)</td><td>2% on any floor</td><td>4%</td><td>Same element as the tower. 5 grades that change every 10 floors.</td></tr>
        <tr><td>Egg</td><td>Same chance as on the map</td><td>unchanged</td><td>The rarity depends on the floor (table below).</td></tr></tbody></table>
      <p className="mut small">Exact odds are also shown in game under “📊 Odds” in the tower panel.</p></section>
    <section className="sec"><h2>Egg rarity by floor</h2>
      <p>Egg rarity uses the map’s odds for a stage that grows with the floor (floor 10 ≈ stage 1000, 20 ≈ 1500, 30 and above ≈ 2000). From <b>floor 31</b>, every 3 floors move extra chance into the top rarities (Celestial +0.002%, Cosmic +0.005%, Century +0.03%, Beyond +0.1%, Arcana +0.3%, Immortal +0.5% per step), taken from the lower rarities.</p>
      <div className="scroll"><table className="tbl small"><thead><tr><th>Floor</th>{RAR.map(r => <th key={r} style={{ color: RARITY_COLOR[r] }}>{RARITY_EN[r]}</th>)}</tr></thead><tbody>
        {EGG_FLOORS.map(f => <tr key={f}><td>{f}F</td>{RAR.map(r => <td key={r}>{eggs[f][r] > 0 ? fp(eggs[f][r]) : '–'}</td>)}</tr>)}</tbody></table></div>
      <p className="mut small">These rows were computed from the game’s formulas; the in-game odds panel shows the same numbers.</p></section>
    <section className="sec"><h2>Elemental Berries</h2>
      <p>Berries (the “elemental fruits”) drop at <b>2% on every floor</b> (4% with the DLC pass). A berry always has the <b>element of the tower</b> and a <b>grade</b> set by the floor: floors 1–10 give Lesser, 11–20 Middle, 21–30 Higher, 31–40 Superior and 41–50 the top grade.</p>
      <p>Use a berry in the bag on a Tasmon of the <b>same element</b>. It adds the grade’s amount to <b>one random stat that is not yet at its cap</b>. A Tasmon that has every stat at the cap can no longer use berries. A Tasmon can keep berries only up to the caps below (the game trims anything above the cap).</p>
      <div className="scroll"><table className="tbl small"><thead><tr><th>Element</th>{G.map(g => <th key={g}>{g}</th>)}</tr></thead><tbody>
        {ELS.map(e => <tr key={e}><td><Img art={elemArts(e)} size={28} alt={e} /> {EL_EN[e]}</td>{[1, 2, 3, 4, 5].map(g => <td key={g}><Img art={['ui/berry/' + e + '_' + g + '.png']} size={52} alt={e + ' berry ' + g} /></td>)}</tr>)}</tbody></table></div>
      <h3>Stats and caps</h3>
      <div className="scroll"><table className="tbl small"><thead><tr><th>Stat</th>{G.map(g => <th key={g}>{g}</th>)}<th>Cap (most)</th><th>Cap (Cosmic)</th><th>Cap (others)</th></tr></thead><tbody>
        {ST.map(([k, n, flat, gain, cap]) => <tr key={k}><td>{n}</td>{gain.map((v, i) => <td key={i}>{flat ? v.toLocaleString('en-US') : +(v * 100).toFixed(2) + '%'}</td>)}{cap.map((v, i) => <td key={i}>{flat ? v.toLocaleString('en-US') : +(v * 100) + '%'}</td>)}</tr>)}</tbody></table></div>
      <p className="mut small">“Cap (most)” is for Celestial Tasmons; Cosmic and every other rarity use the next columns. The crit-rate bonus from berries also counts toward a party cap of 5%. You can hold up to 99,999 of each berry. Grade names for “Higher” and the top grade are my translation of the Japanese 上級 / 極.</p></section>
    <section className="sec" id="talismans"><h2>Talismans</h2>
      <p>Talismans (札, “ofuda”) are the Tower’s equipment. Each Tasmon can wear <b>one talisman</b>, and only one of <b>its own element</b>. They drop at 0.5% per win (1% with the DLC pass); the rarity depends on the floor (see the table above) and they are kept in a bag of up to 1,000.</p>
      <p>The number of random stat lines grows with rarity, and each line is a different stat from the pool below:</p>
      <table className="tbl small"><thead><tr><th>Rarity</th>{Object.keys(TAL_COUNT).map(r => <th key={r} style={{ color: RARITY_COLOR[r] }}>{RARITY_EN[r]}</th>)}</tr></thead><tbody><tr><td>Stat lines</td>{Object.values(TAL_COUNT).map((n, i) => <td key={i}>{n}</td>)}</tr></tbody></table>
      <p className="mut small">Possible stats: {Object.keys(talisman).map(k => STAT_EN[k] || k).join(', ')}. The value range of every stat by rarity is in the talisman table on the <Link to="/equipment">Equipment</Link> page. The “Best equipment” button in game now also equips talismans.</p></section>
    <section className="sec"><h2>Auto-advance (DLC)</h2>
      <p>The “Permanent Talisman & Fruit Pass” DLC (one-time purchase, no expiry) also adds <b>⏫ Auto-advance</b> next to Repeat: you climb one floor after every win; if you lose, it goes back to repeating the floor below. It includes an exclusive title, friend card and UI theme.</p></section>
    <section className="sec"><h2>Talisman rarity by floor</h2>
      <p className="mut small">Chance by rarity at the first and last floor of each band; floors in between are interpolated.</p>
      <div className="scroll"><table className="tbl small"><thead><tr><th>Floors</th><th>First floor of the band</th><th>Last floor of the band</th><th>Boss HP</th><th>Boss ATK</th></tr></thead><tbody>
        {BANDS.map(b => <tr key={b.f}><td>{b.f}</td><td>{W(b.head)}</td><td>{W(b.tail)}</td><td>{F(b.hp[0])} → {F(b.hp[1])}</td><td>{F(b.atk[0])} → {F(b.atk[1])}</td></tr>)}</tbody></table></div>
      <p className="mut small">The enemies’ difficulty matches the stage difficulties in <Link to="/stages">Stages</Link> (floor 1 ≈ Abyss 1, floor 50 ≈ Catastrophe 2). The tower’s boss values above are fixed per band.</p></section>
    <section className="sec"><h2>Team</h2><p>Only Tasmons of the tower’s element can enter, up to 3 on the team (a bug that sometimes blocked the third slot was fixed in the latest update).</p></section>
  </>);
}
