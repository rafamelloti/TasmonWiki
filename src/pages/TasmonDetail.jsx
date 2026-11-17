import { TierBadge } from './Tiers.jsx';
import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { speciesById, species, skills, passives, jobs, jobById, meta, RARITY_EN, RARITIES, ELEM_EN, ELEM_COLOR, GROUP_HOW, RECIPE_LIST, RECIPES, BREED_SUCCESS, REF_STEPS, availability, nameOf } from '../lib/data.js';
import { statsOf, maxStatsOf, weakTo, focusOf, LEVEL_CAP, IV_MIN, IV_MAX, IV_MAX_BRED, PLUS_CAP, levelMult, rarityStatMult, jobName } from '../lib/game.js';
import { Img, monArts, useAssets, RAR } from '../lib/img.jsx';
import { ElemTag, RarTag, RoleTag, GroupTag, AvailTag, TasmonName, SpeciesChip, ArtViewer, monGetArt, JobPicker, Section, Field } from '../components.jsx';
import { SkillCard, PassiveCard } from '../cards.jsx';
import { fmtNum, fmtBig, pct } from '../lib/text.js';
const STAT_EN = { atk: 'ATK', hp: 'Max HP', gold: 'Gold', drop: 'Egg drop', exp: 'EXP' };
export default function TasmonDetail(){
  const { id } = useParams(); const s = speciesById[id]; const assets = useAssets();
  const [shiny, setShiny] = useState(false);
  const [c, setC] = useState({ lv: LEVEL_CAP, iv: IV_MAX_BRED, aw: 6, plus: 0, pin: false, job: '' });
  if (!s) return <p>Tasmon not found. <Link to="/tasmons">Back to the list</Link></p>;
  const has = p => !assets || assets.has(p);
  const out = statsOf(s, c), mx = maxStatsOf(s), a = availability(s);
  const sk = skills[s.skill], extra = s.extraSkills.filter(x => skills[x]);
  const pas = passives[s.id] || {};
  const weak = weakTo(s.element);
  const lvRows = [1, 25, 50, 75, 100, 125, 150];
  const set = (k, v) => setC({ ...c, [k]: v });
  return (<>
    <p className="crumb"><Link to="/tasmons">← All Tasmons</Link></p>
    <div className="card dh" style={{ '--rc': meta.rarity[s.rarity].color }}>
      <div className="pv"><ArtViewer getArt={monGetArt(s)} fallback={monArts(s)} assets={assets} shiny={shiny} size={200} thumb={56} dark label={s.id} />
        <label className="fld chk"><input type="checkbox" checked={shiny} onChange={e => setShiny(e.target.checked)} /> <span>Shiny version</span></label></div>
      <div className="info">
        <h1><TasmonName s={s} big /></h1>{s.title && <div className="mut">{s.title}</div>}
        <div className="row"><RarTag r={s.rarity} /><ElemTag e={s.element} /><RoleTag r={s.role} /><GroupTag g={s.group} /><AvailTag s={s} /></div>
        <div className="simlink"><TierBadge id={s.id} /> <Link className="btn" to={`/tasmons/${s.id}/sim`}>🧪 Open simulator</Link></div>
        <dl className="kv"><dt>ID</dt><dd>{s.id}</dd><dt>Base ATK</dt><dd>{s.atk}</dd><dt>Base HP</dt><dd>{s.hp}</dd><dt>Grows</dt><dd>{focusOf(s) === 'atk' ? 'ATK faster (HP grows at half rate after Lv125)' : 'HP faster (ATK grows at half rate after Lv125)'}</dd>
          <dt>Weak to</dt><dd>{weak.map(e => <span key={e} style={{ color: ELEM_COLOR[e], marginRight: 8 }}>{ELEM_EN[e]}</span>)}</dd>
          <dt>How to get</dt><dd>{GROUP_HOW[s.group]}{s.borrow ? ` (look and skill shared with ${s.borrow})` : ''}</dd>
          {a.text && <><dt>Availability</dt><dd>{a.text}</dd></>}
          {s.dex && <><dt>DEX buff</dt><dd>{STAT_EN[s.dex.stat]} +{(Math.round(s.dex.value * 1e7) / 1e5)}%</dd></>}
          {s.halloweenOf && <><dt>Halloween version of</dt><dd><SpeciesChip s={speciesById[s.halloweenOf] || s} /></dd></>}</dl>
      </div></div>

    <Section title="Stats calculator" right={<button className="btn sm" onClick={() => setC({ lv: LEVEL_CAP, iv: IV_MAX_BRED, aw: 6, plus: PLUS_CAP, pin: true, job: c.job })}>Set to maximum</button>}>
      <p className="mut small">Intrinsic stats before equipment, talismans, perks, DEX bonus and passives. Same terms as the game’s own formula: base × level growth × IV × rarity × skill passive × awakening × job × pinnacle × plus.</p>
      <div className="filters">
        <Field label={`Level ${c.lv}`}><input type="range" min="1" max={LEVEL_CAP} value={c.lv} onChange={e => set('lv', +e.target.value)} /></Field>
        <Field label={`IV ×${c.iv.toFixed(2)} (range ${IV_MIN}–${IV_MAX_BRED})`}><input type="range" min={IV_MIN} max={IV_MAX_BRED} step="0.01" value={c.iv} onChange={e => set('iv', +e.target.value)} /></Field>
        <Field label={`Awakening ★${c.aw}`}><input type="range" min="0" max="6" value={c.aw} onChange={e => set('aw', +e.target.value)} /></Field>
        <Field label={`Plus +${c.plus}`}><input type="range" min="0" max={PLUS_CAP} value={c.plus} onChange={e => set('plus', +e.target.value)} /></Field>
        <Field label="Job"><JobPicker value={c.job} onChange={v => set('job', v)} jobs={jobs} label={j => `${jobName(j)} · T${j.tier}${j.rare ? ' · Rare' : ''}${j.hidden ? ' · Hidden' : ''}`} /></Field>
        <label className="fld chk"><input type="checkbox" checked={c.pin} onChange={e => set('pin', e.target.checked)} /><span>Pinnacle (solid) ×{meta.pinnacle.atk}</span></label>
      </div>
      <div className="grid3 result"><div className="card tile"><h3>ATK</h3><div className="big">{fmtBig(out.atk)}</div></div><div className="card tile"><h3>Max HP</h3><div className="big">{fmtBig(out.hp)}</div></div>
        <div className="card tile"><h3>Theoretical maximum</h3><div className="big sm">ATK {fmtBig(mx.atk)} · HP {fmtBig(mx.hp)}</div><p className="mut small">Lv{LEVEL_CAP}, IV ×{IV_MAX_BRED}, ★6, +{PLUS_CAP}, pinnacle, no job</p></div></div>
      <table className="tbl"><thead><tr><th>Level</th><th>ATK (IV ×1.00, no awakening)</th><th>HP (IV ×1.00, no awakening)</th></tr></thead><tbody>{lvRows.map(lv => { const o = statsOf(s, { lv }); return <tr key={lv}><td>{lv}</td><td>{fmtBig(o.atk)}</td><td>{fmtBig(o.hp)}</td></tr>; })}</tbody></table>
      <p className="mut small">Rarity multiplier ×{rarityStatMult(s.rarity).toFixed(3)} · Skill passive: {sk?.passive?.atkMult ? `ATK ×${sk.passive.atkMult}` : ''}{sk?.passive?.hpMult ? ` HP ×${sk.passive.hpMult}` : ''}{!sk?.passive?.atkMult && !sk?.passive?.hpMult ? 'none' : ''}{s.role === 'guard' ? ' · Tank role: base HP ×1.3' : ''}</p>
    </Section>

    <Section title="Skill">{sk ? <SkillCard id={s.skill} showUsers={false} /> : <p className="mut">No skill data.</p>}
      {extra.length > 0 && <><h3>Exclusive skills <small className="mut">(can be drawn for this species)</small></h3><div className="stack">{extra.map(x => <SkillCard key={x} id={x} showUsers={false} />)}</div></>}</Section>

    {(pas.species || pas.ranked) && <Section title="Passives"><div className="stack">{pas.species && <PassiveCard p={pas.species} kind="species" />}{pas.ranked && <PassiveCard p={pas.ranked} kind="ranked" />}</div></Section>}


    {s.group === 'ref' && <Section title="Rarity by friend play time"><div className="row wrap">{REF_STEPS.map(([r, h]) => <span key={r} className="tag" style={{ borderColor: meta.rarity[r].color, color: meta.rarity[r].color }}>{RARITY_EN[r]} · {h} h</span>)}</div>
      <p className="mut small">Cannot be released, used as material or listed. Up to 12 h of play per day count.</p></Section>}
  </>);
}
