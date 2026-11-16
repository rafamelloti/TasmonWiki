import React from 'react';
import { Link } from 'react-router-dom';
import { skills, species, ROLE_EN } from './lib/data.js';
import { SpeciesChip } from './components.jsx';
import { romaji, dispName } from './lib/text.js';
const usersIdx = (() => { const m = {}; for (const s of species) for (const id of [s.skill, ...s.extraSkills]) (m[id] ??= []).push(s); return m; })();
export const skillUsers = id => usersIdx[id] || [];
const TYPE_EN = { nuke:'Attack', heal:'Heal', guard:'Guard', buff:'Support' };
export function SkillCard({ id, showUsers = true, max = 12 }){
  const k = skills[id]; if (!k) return <div className="card">Unknown skill {id}</div>;
  const users = skillUsers(id);
  return (<div className="card sk" id={'sk-' + id}>
    <div className="row sb"><div><b>{dispName(k.en, k.jp)[0]}</b>{dispName(k.en, k.jp)[1] ? <small> {dispName(k.en, k.jp)[1]}</small> : null}</div>
      <div className="row">{k.type && <span className="tag">{TYPE_EN[k.type] || k.type}</span>}{k.stars ? <span className="tag star">{'★'.repeat(Math.min(k.stars, 10))}</span> : null}{k.rareDraw && <span className="tag grp">Rare draw</span>}</div></div>
    <p className="desc">{k.desc}</p>
    <div className="row mut small"><span>ID {k.id}</span>{k.cooldown != null && <span>Cooldown {k.cooldown}s</span>}{k.duration != null && <span>Duration {k.duration}s</span>}{k.power != null && <span>Power {k.power}</span>}{k.speciesOnly && <span>Exclusive to {k.speciesOnly}</span>}</div>
    {k.tiers.length > 0 && <table className="tbl small"><thead><tr><th>Awakening tier</th><th>Cooldown</th><th>Power</th><th>Effect</th></tr></thead><tbody>{k.tiers.map((t, i) => <tr key={i}><td>{['Base', 'Tier II', 'Tier III'][i] || 'Tier ' + (i + 1)} <small className="mut">{t.jp}</small></td><td>{t.cooldown}s</td><td>{t.power}</td><td>{t.desc}</td></tr>)}</tbody></table>}
    {showUsers && users.length > 0 && <div className="chips">{users.slice(0, max).map(s => <SpeciesChip key={s.id} s={s} />)}{users.length > max && <span className="mut small">+{users.length - max} more</span>}</div>}
  </div>);
}
export const MECH_EN = {};
export function PassiveCard({ p, kind, s }){
  return (<div className={'card ps' + (kind === 'ranked' ? ' rk' : '')}>
    <div className="row sb"><div><b>{p.en || p.jp}</b> <small>{p.jp}</small></div><div className="row">{kind === 'ranked' && <span className="tag grp">Ranked only</span>}{p.power && <span className="tag">{p.power} power</span>}</div></div>
    <p className="desc">{p.desc}</p>
    <div className="row mut small"><span>mechanic: {p.mech}</span><span>condition: {p.cond}</span><span>value: {p.value}</span></div>
    {s && <div className="chips"><SpeciesChip s={s} /></div>}
  </div>);
}
