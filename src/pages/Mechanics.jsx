import React from 'react';
import { Link } from 'react-router-dom';
import { meta, RECIPE_LIST, BREED_SUCCESS, REF_STEPS, speciesById, RARITY_EN, SEASONS, HALLOWEEN, species } from '../lib/data.js';
import { Img, monArts } from '../lib/img.jsx';
import { SpeciesChip } from '../components.jsx';
import { pct } from '../lib/text.js';
const day = t => new Date(t).toISOString().slice(0, 10);
const HG_COSTS = [['Points 1–5', 2], ['Points 6–10', 6], ['Points 11–20', 20], ['Points 21–40', 48]];
const HG_CAPS = [['Stage 1', 5, 0, 0], ['Stage 2', 10, 0, 0], ['Stage 3', 10, 6, 0], ['Stage 4', 20, 6, 0], ['Stage 5', 20, 6, 1], ['Stage 6', 20, 12, 1], ['Stage 7', 40, 20, 2]];
const HG_STATS = [['ATK', '+1% per point', 20], ['Max HP', '+1% per point', 30], ['Skill power', '+1% per point', 20], ['Crit rate', '+1% per point', 20], ['Crit damage', '+2% per point', 20]];
const HG_SPH = [['ATK sphere', 'ATK ×1.01'], ['HP sphere', 'Max HP ×1.011'], ['Skill sphere', 'Skill power +0.9%']];
const HG_KEY = [['Conqueror’s Blade (覇者の刃)', 'ATK ×1.35'], ['Unyielding Oath (不屈の誓い)', 'Max HP ×1.5'], ['Book of Revelation (天啓の書)', 'Skill power +50%'], ['Eye of Execution (必殺の眼)', 'Crit rate +20% · Crit damage +60%'], ['Hero’s Soul (英雄の魂)', 'ATK ×1.15 · Skill power +30%']];
export default function Mechanics(){
  const aw = meta.awakening, ref = species.filter(s => s.group === 'ref');
  return (<>
    <h1>Mechanics</h1>
    <nav className="chips">{['eggs', 'awakening', 'jobs', 'pinnacle', 'expedition', 'invite', 'hero'].map(k => <a key={k} href={`#/mechanics#${k}`} onClick={e => { e.preventDefault(); document.getElementById(k)?.scrollIntoView({ behavior: 'smooth' }); }} className="chip">{k[0].toUpperCase() + k.slice(1)}</a>)}</nav>

    <section className="sec" id="eggs"><h2>Eggs & drops</h2>
      <p>Every defeated monster has a base <b>{pct(meta.eggDropChance, 2)}</b> chance to drop an egg. The chance is multiplied by several factors:</p>
      <table className="tbl"><thead><tr><th>Factor</th><th>Value</th></tr></thead><tbody>
        <tr><td>Beginner phase (1 monster/egg owned)</td><td>×25</td></tr><tr><td>Beginner phase (until the starter team is complete)</td><td>×3</td></tr><tr><td>Normal phase</td><td>×0.22</td></tr>
        <tr><td>Early-game bonus (until all stages of difficulty 1 are cleared)</td><td>×1.5</td></tr>
        <tr><td>DEX buffs and milestone (25%: +0.5%)</td><td>added to the team bonus</td></tr>
        <tr><td>Team bonus (equipment, passives, awakening, perks, jobs, talismans)</td><td>1 + sum of all “egg drop” bonuses</td></tr></tbody></table>
      <p className="mut small">Final chance = base × phase × early bonus × (1 + team bonus) × season bonus (see <Link to="/events">Events</Link>). The in-game odds window shows the breakdown.</p>
    </section>

    <section className="sec" id="awakening"><h2>Awakening</h2>
      <p>Wild awakening chance: <b>{pct(aw.chanceWild, 1)}</b>. Double awakening: {pct(aw.doubleChance, 0)}; triple: {pct(aw.tripleChance, 0)}. Maximum awakening: {meta.awakenMax}.</p>
      <div className="scroll"><table className="tbl"><thead><tr><th>Awakening</th><th>ATK</th><th>Max HP</th><th>Skill power</th><th>Skill cooldown</th><th>Egg drop</th><th>Gold</th><th>Min. IV</th></tr></thead><tbody>
        {Object.keys(aw.mult).map(k => <tr key={k}><td>{'Ⅰ Ⅱ Ⅲ Ⅳ Ⅴ Ⅵ'.split(' ')[k - 1]}</td><td>×{aw.mult[k].atk}</td><td>×{aw.mult[k].hp}</td><td>×{aw.skill[k].power}</td><td>×{aw.skill[k].cooldown}</td><td>+{pct(aw.dropBonus[k])}</td><td>+{pct(aw.goldBonus[k], 0)}</td><td>×{aw.ivFloor[k]}</td></tr>)}</tbody></table></div>
      <p className="mut small">Gold bonus from awakening is capped at +{pct(aw.goldBonusCap, 0)}.</p>
    </section>

    <section className="sec" id="jobs"><h2>Evolution & jobs</h2>
      <p>A Tasmon can evolve at <b>Lv30</b> (first evolution) and <b>Lv60</b> (second evolution). Each evolution gives it a job and a new look, and offers two choices: the job of its own role line, or a <b>Random</b> job. See the <Link to="/jobs">Jobs</Link> page for the full list.</p>
      <h3>Cost</h3>
      <p>Gold = stars × 120,000 × 1.35<sup>(stars−1)</sup> × 10<sup>stage</sup> (stage 0 = first evolution, 1 = second). A Random evolution costs <b>×4</b> gold. Every evolution also needs one Evolution Stone: a role stone (Attacker, Tank, Healer or Buffer) for the normal choice, a Random stone for the Random choice.</p>
      <h3>Random evolution odds</h3>
      <p>The Random result is decided per Tasmon (it does not change if you reopen the menu).</p>
      <table className="tbl small"><thead><tr><th>Evolution</th><th>Result</th><th>Chance</th></tr></thead><tbody>
        <tr><td rowSpan="4">1st (Lv30)</td><td>Hidden job</td><td>{pct(meta.hiddenJob, 1)}</td></tr>
        <tr><td>Rare job</td><td>{pct(meta.rareJob, 1)}</td></tr>
        <tr><td>Skip to a tier-3 job</td><td>{pct(meta.skipJob, 0)}</td></tr>
        <tr><td>Standard tier-2 job of a different role</td><td>{pct(1 - meta.hiddenJob - meta.rareJob - meta.skipJob, 1)}</td></tr>
        <tr><td rowSpan="2">2nd (Lv60)</td><td>Hidden job</td><td>{pct(meta.hiddenJob * 2, 1)}</td></tr>
        <tr><td>Tier-3 job of a different role</td><td>{pct(1 - meta.hiddenJob * 2, 1)}</td></tr></tbody></table>
      <p><b>Failure:</b> a Random evolution fails <b>25%</b> of the time. The gold and the stone are lost and that evolution step can no longer be attempted for that Tasmon. Rare Job and Hidden Job stones guarantee that result and never fail.</p>
      <h3>Evolution Stone drops</h3>
      <table className="tbl small"><thead><tr><th>Source</th><th>Role stone (random role)</th><th>Random stone</th></tr></thead><tbody>
        <tr><td>Normal kill</td><td>0.06%</td><td>0.004%</td></tr><tr><td>Act boss stage</td><td>{pct(meta.evoStoneBoss, 0)}</td><td>3%</td></tr></tbody></table>
      <p className="mut small">Crafting: 3 role stones of other roles make a role stone of the role you choose; 5 role stones make a Random stone.</p>
    </section>

    <section className="sec" id="pinnacle"><h2>Pinnacle ritual</h2>
      <p>Once a Tasmon is on its <b>final evolution</b> and its job reaches <b>Lv90</b>, it can perform the Pinnacle ritual — <b>one time only</b>. Cost: stars × 9,000 gold. Choose one option:</p>
      <ul className="bul"><li><b>Solid:</b> guaranteed <b>ATK ×1.15</b> and <b>Max HP ×1.15</b>. This is where the Pinnacle boost used by the max-stat calculators comes from.</li>
        <li><b>Gamble:</b> Hidden job (top-tier job of its role) <b>2%</b> · Awakening +1 <b>10%</b> · <b>Shiny 10%</b> (a Shiny that was not yet awakened also becomes Awakening I) · nothing <b>78%</b>.</li></ul>
      <p className="mut small">Shiny does not come from the evolution choices themselves; it comes from hatching (wild chance 0.5%) and from the Pinnacle gamble.</p>
    </section>

    <section className="sec" id="expedition"><h2>Expeditions</h2>
      <table className="tbl"><thead><tr><th>Duration</th><th>EXP multiplier</th><th>Stage bonus</th><th>Egg chance</th></tr></thead><tbody>
        {Object.entries(meta.expeditionPlans).map(([h, p]) => <tr key={h}><td>{h} h{p.legacy ? ' (legacy)' : ''}</td><td>×{p.expMult}</td><td>+{p.stageBonus}</td><td>{pct(p.eggChance, 0)}</td></tr>)}</tbody></table>
      <p className="mut small">Expedition eggs hatch only Expedition-exclusive species. Gear worn by Tasmons on an expedition cannot be swapped until they return. Returned items go to the Items or Storage tab, and the return screen shows where each item went.</p>
    </section>

    <section className="sec" id="invite"><h2>Invite a friend (partner egg)</h2>
      <ul className="bul">
        <li>Steam only. Up to 5 invitees; an invite code is valid for 7 days.</li>
        <li>The inviter receives a partner egg that hatches one of {ref.length} invite-only Tasmons; the invitee also receives a Legend egg.</li>
        <li>Rarity rises with the friend’s play time (max 12 hours counted per day):</li></ul>
      <div className="row wrap">{REF_STEPS.map(([r, h]) => <span key={r} className="tag">{RARITY_EN[r]} · {h} h</span>)}</div>
      <ul className="bul"><li>Invite partners cannot be released, used as material, or listed for sale.</li></ul>
      <div className="grid">{ref.map(s => <SpeciesChip key={s.id} s={s} />)}</div>
    </section>

    <section className="sec" id="hero"><h2>Hero Growth</h2>
      <p>Unlocked after clearing stage 7 in Death mode with a Hero Series Vol.1 hero (Sigilfox or Crimsonlord). Limits grow with the number of cleared stages.</p>
      <div className="grid2"><div>
        <h3>Limits by cleared stage</h3>
        <table className="tbl small"><thead><tr><th>Stage</th><th>Points</th><th>Spheres</th><th>Keystones</th></tr></thead><tbody>{HG_CAPS.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody></table>
        <h3>Point cost (materials)</h3>
        <table className="tbl small"><tbody>{HG_COSTS.map(([a, b]) => <tr key={a}><td>{a}</td><td>{b} each</td></tr>)}</tbody></table>
      </div><div>
        <h3>Stat points</h3>
        <table className="tbl small"><thead><tr><th>Stat</th><th>Effect</th><th>Max points</th></tr></thead><tbody>{HG_STATS.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody></table>
        <h3>Spheres</h3>
        <table className="tbl small"><tbody>{HG_SPH.map(r => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td></tr>)}</tbody></table>
      </div></div>
      <h3>Keystone spheres</h3>
      <table className="tbl small"><tbody>{HG_KEY.map(r => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td></tr>)}</tbody></table>
      <p className="mut small">Slot 1 opens with 20 points used and 6 spheres chosen; slot 2 with 40 points and 20 spheres. A Hero Rebuild Tome lets you redistribute everything (the Battle Pass level 36 gives 1 free, 2 premium). Keystone names are translated from the Japanese originals.</p>
    </section>

  </>);
}
