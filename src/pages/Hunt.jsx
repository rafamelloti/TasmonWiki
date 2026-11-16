import React from 'react';
import { Link } from 'react-router-dom';
import { species } from '../lib/data.js';
import { TasmonCard } from '../components.jsx';
const heroes = species.filter(s => s.group === 'hero');
// Vol.1 base stages (recommended power is the Death-mode value; Normal mode scales it so stage 7 = 200,000)
const BASE = [
  [1, 'Hero’s Return 1', 'No gimmick', 180, 4.7e6, 'Just checks whether you can wear it down in time.'],
  [2, 'Hero’s Return 2', 'Attacks', 120, 11.7e6, 'It hits back; a war of attrition.'],
  [3, 'Hero’s Return 3', 'Hardening', 120, 17.5e6, 'Gets tougher over time (−0.8%/s damage, up to −60%). Long fights lose.'],
  [4, 'Hero’s Return 4', 'Element + role', 120, 23.3e6, 'One element does extra damage (×1.1, others ×0.7). Needs a specific role in the party.'],
  [5, 'Hero’s Return 5', 'Element + tank', 120, 35e6, 'Element rule plus a tank-focused party (other roles ×0.7).'],
  [6, 'Hero’s Return 6', 'Reflect', 120, 46.7e6, 'Part of your damage is reflected back (35% in Normal, 10% in Death). All-out attack loses.'],
  [7, 'Hero’s Return 7', 'All gimmicks', 90, 58.3e6, 'Has every earlier gimmick (reflect 25% / 15% in Death). The final wall.']];
const NORMAL_SCALE = 2e5 / 58.3e6;
const M = n => n >= 1e9 ? (n / 1e9).toFixed(n % 1e9 ? 1 : 0) + 'B' : n >= 1e6 ? +(n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : n;
const EL = { fire: 'Fire', water: 'Water', wind: 'Wind', earth: 'Earth', light: 'Light', dark: 'Dark' };
// Death-mode element / weakness / requirement per hero for stages 4, 5, 7
const VAR = [
  ['Sigilfox', 'earth', 'Wind', 'Healer in party', 'water', 'Earth', 'Tank-focused', 'fire'],
  ['Crimsonlord', 'fire', 'Water', 'Attacker in party', 'wind', 'Fire', 'Buffer-focused', 'earth'],
  ['Glacial Queen', 'water', 'Earth', 'Buffer in party', 'earth', 'Wind', 'Healer-focused', 'dark'],
  ['Umbral Fenrir', 'wind', 'Fire', 'Healer in party', 'fire', 'Water', 'Attacker-focused', 'light']];
const VOLS = [
  ['Vol.1', 'Sigilfox / Crimsonlord', 'Two fallen knights. Pick one as your partner.', 'Available from the start of the Hero window (unlocked late game).', 'Stages 1–7 · Normal and Death'],
  ['Vol.2', 'Glacial Queen / Umbral Fenrir', 'No reflect, but very long fights (regeneration and hardening).', 'Needs Torment difficulty cleared.', 'Stages 1–7 · Death mode has very large HP'],
  ['Vol.3', 'Stellar Eden / Prism Carbuncle', 'A healing pair; you win by not falling. HP drains every second, fallen allies do not return.', 'Needs Torment difficulty cleared.', 'Stages 1–6 · stage 6 is a 2-boss fight'],
  ['Vol.4', 'Sea Siren / Thunder Ramuh', 'Songstress and sage, each with a paired god. Same rules as Vol.3, ×1.5 stronger.', 'Needs Torment difficulty cleared.', 'Stages 1–6 · stage 6 is a 2-boss fight']];
const V34 = [
  [1, 'No gimmick', 'First step; earns a proof.'], [2, 'Attacks', 'It hits back.'], [3, 'Hardening', 'Gets tougher over time (−0.6%/s, up to −50%).'],
  [4, 'Boss skill', 'HP drains every second — keep healing. The boss casts a skill every 10 s.'], [5, 'Stun skill', 'HP drains every second, fallen allies stay down. The boss stuns for 3 s every 5 s.'],
  [6, 'Two bosses', 'Click a boss to choose your target. Drain, hardening and boss skills; one boss attacks/AoEs, the other heals.']];
const DROPS = [[1, '2–4', '1.25%'], [2, '2–4', '1.25%'], [3, '4–6', '2.5%'], [4, '4–6', '2.5%'], [5, '6–8', '5%'], [6, '7–9', '7.5%'], [7, '8–12', '10%']];
const ACH = [['Hero Challenge', 'Clear stage 1 with a hero'], ['Hero: Stage 4', 'Clear up to stage 4'], ['Hero: Stage 7 cleared', 'Clear up to stage 7 and fully awaken the partner'], ['Hero of Death', 'Clear stage 7 in Death mode']];
export default function Hunt(){
  const isHero = n => s => s.group === 'hero' && !s.id.endsWith('_n') === n;
  return (<>
    <h1>Hero Hunt</h1>
    <p>The <b>Hero window</b> (🎯 tab at the bottom of the game, unlocked late game) lets you challenge the Hero Series bosses. Each stage is a timed boss fight with its own gimmick. Clearing a stage lets you recruit that volume’s hero as a partner, and winning stages in Death mode gives materials for <Link to="/mechanics#hero">Hero Growth</Link>. The related achievements are named “HUNT”.</p>
    <div className="chips">{[['vols', 'Volumes'], ['modes', 'Modes & rewards'], ['stages', 'Vol.1–2 stages'], ['pair', 'Vol.3–4 stages'], ['drops', 'Daily materials'], ['ach', 'Achievements'], ['heroes', 'Heroes']].map(([k, t]) => <a key={k} className="chip" href={'#/hunt#' + k} onClick={e => { e.preventDefault(); document.getElementById(k)?.scrollIntoView({ behavior: 'smooth' }); }}>{t}</a>)}</div>
    <section className="sec" id="vols"><h2>Volumes</h2>
      <table className="tbl small"><thead><tr><th>Volume</th><th>Heroes (pick one)</th><th>Theme</th><th>Unlock</th><th>Stages</th></tr></thead><tbody>{VOLS.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody></table>
      <p className="mut small">You choose one hero per volume as your partner; the other one (and its look change: dark / awakened) comes with that volume’s Hero Pack (DLC). Vol.3 and Vol.4 heroes arrive together with a paired god (Stellar Eden + Crimson Phoenix, Prism Carbuncle + Obsidian Titan, Sea Siren + Gravity Diabolos, Thunder Ramuh + Ironodin).</p></section>
    <section className="sec" id="modes"><h2>Modes & rewards</h2>
      <table className="tbl small"><thead><tr><th>Mode</th><th>Partner you get (Vol.1–2)</th><th>Fixed IVs</th><th>Notes</th></tr></thead><tbody>
        <tr><td>Normal</td><td>Rare version</td><td>100%</td><td>Power requirement scaled down (stage 7 ≈ 200K).</td></tr>
        <tr><td>Death</td><td>Arcana version</td><td>115%</td><td>Full difficulty. Clearing stage 7 on Death unlocks Hero Growth and gives daily materials.</td></tr></tbody></table>
      <p className="mut small">The “Hero Development Support” DLC now also gives a Vol.1 (Death) hero egg for each Vol.1 hero you unlocked in Death mode (Sigilfox / Crimsonlord); it is delivered when an egg slot is free, and it also works for owners who already had the DLC. Useful to recover a hero used as material.</p>
      <p className="mut small">In Vol.3–4 the Normal partner is Arcana and the Death partner is Century. Partner IVs are always fixed at the mode’s value.</p></section>
    <section className="sec" id="stages"><h2>Vol.1–2 stages</h2>
      <div className="scroll"><table className="tbl small"><thead><tr><th>#</th><th>Stage</th><th>Gimmick</th><th>Time</th><th>Rec. power (Death)</th><th>Rec. power (Normal)</th><th>What to expect</th></tr></thead><tbody>
        {BASE.map(r => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}s</td><td>{M(r[4])}</td><td>{M(Math.round(r[4] * NORMAL_SCALE / 100) * 100)}</td><td>{r[5]}</td></tr>)}</tbody></table></div>
      <p className="mut small">In Normal mode the stage 4 / 5 / 7 enemies are Wind (needs a Buffer, Fire is strong), Earth (tank-focused party, Wind is strong) and Water. In Death mode stage 1 also attacks, and the element/role rules depend on the hero (table below).</p>
      <p className="mut small">Vol.2 uses the same 7 stages with different rules: much longer timers (210–300 s), boss regeneration (0.6–1.1%/s) instead of reflect, a hit cap of 18% of boss HP, and the partner must be in your party from stage 2.</p>
      <h3>Death mode: element & role rules by hero</h3>
      <div className="scroll"><table className="tbl small"><thead><tr><th>Hero</th><th>Stage 4 enemy</th><th>Strong against it</th><th>Requirement</th><th>Stage 5 enemy</th><th>Strong against it</th><th>Requirement</th><th>Stage 7 enemy</th></tr></thead><tbody>
        {VAR.map(r => <tr key={r[0]}><td>{r[0]}</td><td>{EL[r[1]]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{EL[r[4]]}</td><td>{r[5]}</td><td>{r[6]}</td><td>{EL[r[7]]}</td></tr>)}</tbody></table></div></section>
    <section className="sec" id="pair"><h2>Vol.3–4 stages</h2>
      <table className="tbl small"><thead><tr><th>#</th><th>Gimmick</th><th>What to expect</th></tr></thead><tbody>{V34.map(r => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody></table>
      <p className="mut small">All stages have a 210 s limit and a hit cap of 18% of boss HP. Elements play the same ×1.1 / ×0.7 role as in Vol.1.</p></section>
    <section className="sec" id="drops"><h2>Daily materials</h2>
      <p>Winning a Vol.1 or Vol.2 stage on <b>Death</b> gives enhancement materials once per stage per day (shared by both heroes). Each win rolls once (twice with Hero Growth Support). They are claimed from each stage’s box in the Hero window and spent in <Link to="/mechanics#hero">Hero Growth</Link>. Materials are separate for each volume; Rebuild Tomes are shared.</p>
      <table className="tbl small"><thead><tr><th>Stage</th><th>Materials per roll</th><th>Rare bonus chance (+60)</th></tr></thead><tbody>{DROPS.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody></table></section>
    <section className="sec" id="ach"><h2>Achievements</h2>
      <table className="tbl small"><tbody>{ACH.map(r => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td></tr>)}</tbody></table></section>
    <section className="sec" id="heroes"><h2>Heroes</h2><p>Hero Series Tasmons. They are not part of the DEX and give no DEX buff.</p>
      <div className="grid">{heroes.map(s => <TasmonCard key={s.id} s={s} />)}</div></section>
  </>);
}
