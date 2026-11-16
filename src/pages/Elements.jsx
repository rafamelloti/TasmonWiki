import React from 'react';
import { meta, ELEMENTS, ELEM_EN, ELEM_COLOR, ROLES, ROLE_EN, species } from '../lib/data.js';
import { Img, elemArts, roleArts } from '../lib/img.jsx';
import { Link } from 'react-router-dom';
export default function Elements(){
  const adv = meta.elemAdv;
  return (<>
    <h1>Elements & roles</h1>
    <h2>Element chart</h2>
    <p>Attacking with the strong element deals <b>×{meta.elemAdvMult}</b> damage; attacking into a resisting element deals <b>×{meta.elemDisMult}</b>.</p>
    <div className="scroll"><table className="tbl chart"><thead><tr><th>Attacker ↓ / Defender →</th>{ELEMENTS.map(e => <th key={e} style={{ color: ELEM_COLOR[e] }}><Img art={elemArts(e)} size={20} alt="" className="mini" /> {ELEM_EN[e]}</th>)}</tr></thead>
      <tbody>{ELEMENTS.map(a => <tr key={a}><th style={{ color: ELEM_COLOR[a] }}><Img art={elemArts(a)} size={20} alt="" className="mini" /> {ELEM_EN[a]}</th>{ELEMENTS.map(d => { const strong = adv[a] === d, weak = adv[d] === a; return <td key={d} className={strong ? 'ok' : weak ? 'bad' : ''}>{strong ? `×${meta.elemAdvMult}` : weak ? `×${meta.elemDisMult}` : '×1'}</td>; })}</tr>)}</tbody></table></div>
    <p className="mut small">Cycle: Fire beats Wind, Wind beats Earth, Earth beats Water, Water beats Fire. Light and Dark beat each other.</p>
    <div className="grid3">{ELEMENTS.map(e => <Link key={e} to={`/tasmons?element=${e}`} className="card tile" style={{ borderColor: ELEM_COLOR[e] }}><Img art={elemArts(e)} size={48} alt={ELEM_EN[e]} /><h3 style={{ color: ELEM_COLOR[e] }}>{ELEM_EN[e]}</h3><p>Strong against {ELEM_EN[adv[e]]} · weak to {ELEM_EN[ELEMENTS.find(x => adv[x] === e)]}</p><p className="mut small">{species.filter(s => s.element === e).length} Tasmons</p></Link>)}</div>
    <h2>Roles</h2>
    <p>Role advantage multiplier: <b>×{meta.roleAdvMult ?? 1}</b> in this version.</p>
    <div className="grid3">{ROLES.map(r => <Link key={r} to={`/tasmons?role=${r}`} className="card tile"><Img art={roleArts(r)} size={48} alt={ROLE_EN[r]} /><h3>{ROLE_EN[r]}</h3><p>Strong against {ROLE_EN[meta.roleAdv[r]]}</p><p className="mut small">{species.filter(s => s.role === r).length} Tasmons</p></Link>)}</div>
  </>);
}
