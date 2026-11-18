import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { JOB_EN, jobs, jobSpecials, jobIslands, meta, ROLE_EN, skills } from '../lib/data.js';
import { Img, jobArts, useAssets } from '../lib/img.jsx';
import { RoleTag, ArtViewer } from '../components.jsx';
import { SkillCard } from '../cards.jsx';
import { romaji, dispName, pct } from '../lib/text.js';
const STAT_EN = { atkSpeed:'Attack speed', critRate:'Crit rate', critDmg:'Crit damage', defCut:'Damage taken', skillPower:'Skill power', cdr:'Cooldown', goldBonus:'Gold', expBonus:'EXP', dropBonus:'Egg drop', hpPct:'Max HP', atkPct:'ATK' };
export const jobBonusText = j => {
  const out = []; if (j.mult.atk) out.push(`ATK ${j.mult.atk >= 1 ? '+' : ''}${pct(j.mult.atk - 1, 0)}`); if (j.mult.hp) out.push(`Max HP ${j.mult.hp >= 1 ? '+' : ''}${pct(j.mult.hp - 1, 0)}`);
  for (const [k, v] of Object.entries(j.stat || {})) out.push(k === 'defCut' ? `Damage taken -${pct(v, 0)}` : k === 'cdr' ? `Cooldown -${pct(v, 0)}` : `${STAT_EN[k] || k} +${pct(v, 0)}`);
  return out;
};
export default function Jobs(){
  const [tab, setTab] = useState('rare'), [shiny, setShiny] = useState(false), assets = useAssets();
  const groups = { rare: jobs.filter(j => j.rare), hidden: jobs.filter(j => j.hidden) };
  const sp = Object.fromEntries(jobIslands.map(x => [x.job, jobSpecials[x.special]]));
  return (<>
    <h1>Jobs</h1>
    <p className="mut">Jobs multiply a Tasmon’s ATK/HP and add bonuses. Chance when a job is rolled: Rare {pct(meta.rareJob, 1)} · Hidden {pct(meta.hiddenJob, 1)} · Skip {pct(meta.skipJob, 0)}. At Lv90 on the final evolution, the <Link to="/mechanics#pinnacle">Pinnacle ritual</Link> gives ATK/HP ×1.15 or a gamble for Hidden job, Awakening or Shiny.</p>
    <div className="row">{[['rare', 'Rare'], ['hidden', 'Hidden']].map(([k, t]) => <button key={k} className={'btn' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>{t} ({groups[k].length})</button>)}</div>
    <label className="fld chk"><input type="checkbox" checked={shiny} onChange={e => setShiny(e.target.checked)} /> <span>Show Shiny versions</span></label>
    <div className="grid2">{groups[tab].map(j => (<div key={j.id} className="card jb">
      <div className="row"><ArtViewer getArt={e => e ? jobArts(j.id, e) : [`jobs/${j.id}.png`]} fallback={jobArts(j.id)} assets={assets} shiny={shiny} size={88} label={j.id} /><div><b>{dispName(JOB_EN[j.id], j.jp)[0]}</b>{dispName(JOB_EN[j.id], j.jp)[1] && <small> {dispName(JOB_EN[j.id], j.jp)[1]}</small>}{j.charName && <div className="mut small">Character: {romaji(j.charName)}</div>}<div className="row"><RoleTag r={j.role} /><span className="tag">Tier {j.tier}</span></div></div></div>
      <ul className="bul">{jobBonusText(j).map(t => <li key={t}>{t}</li>)}{sp[j.id] && <li key="sp"><b>{sp[j.id].label}</b> (special): {jobBonusText({ mult: sp[j.id].mult || {}, stat: sp[j.id].stat || {} }).join(', ')}</li>}</ul>
      {j.skill && skills[j.skill] && <SkillCard id={j.skill} showUsers={false} />}
    </div>))}</div>
  </>);
}
