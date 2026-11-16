import React, { useMemo, useState } from 'react';
import { PH, TIER_EN, GIM_EN, gimmickText } from '../lib/stages.js';
import { ELEM_EN, ELEM_COLOR } from '../lib/data.js';
import { Img, elemArts } from '../lib/img.jsx';
import { fmtBig } from '../lib/text.js';
export default function Stages(){
  const [d, setD] = useState(0), [act, setAct] = useState(1), [only, setOnly] = useState(false);
  const D = PH.DIFFS[d];
  const rows = useMemo(() => Array.from({ length: 10 }, (_, i) => PH.stage(d, (act - 1) * 10 + i + 1)), [d, act]);
  const shown = only ? rows.filter(r => r.boss || r.gim) : rows;
  return (<>
    <h1>Stages</h1>
    <p>Each difficulty has 100 stages in 10 acts. Every 10th stage is a boss. Enemy values below are the numbers shown by the in-game tooltip; difficulties from id 5 onward apply an extra ×1.5 in combat. Mini-bosses have ×3 HP.</p>
    <div className="row wrap">{PH.DIFFS.map(x => <button key={x.id} className={'btn sm' + (x.id === d ? ' on' : '')} style={x.id === d ? { borderColor: x.color, color: x.color } : null} onClick={() => setD(x.id)}>{x.name}</button>)}</div>
    <div className="row wrap" style={{ marginTop: 8 }}>{Array.from({ length: 10 }, (_, i) => <button key={i} className={'btn sm' + (act === i + 1 ? ' on' : '')} onClick={() => setAct(i + 1)}>Act {i + 1}</button>)}
      <label className="fld chk"><input type="checkbox" checked={only} onChange={e => setOnly(e.target.checked)} /> <span>Bosses & challenges only</span></label></div>
    <h2 style={{ color: D.color }}>{D.name} · Act {act} <span className="mut small">({TIER_EN[PH.tierOf(d * 100 + (act - 1) * 10 + 1)]} enemies)</span></h2>
    <div className="scroll"><table className="tbl small"><thead><tr><th>Stage</th><th>Enemies</th><th>Element</th><th>Enemy HP</th><th>Enemy ATK</th><th>Mini-boss / boss HP</th><th>Mini-boss / boss ATK</th><th>Gold / kill</th><th>EXP / kill</th><th>Special</th></tr></thead><tbody>
      {shown.map(r => { const big = r.big || r.mini, c = PH.counterOf(r.elem); return (<tr key={r.st} className={r.boss ? 'boss' : ''}>
        <td><b>{r.st}</b>{r.boss ? ' ☠' : ''}</td>
        <td><div className="row"><div className="en-thumb"><Img art={[`enemies/${r.elem}_${PH.tierOf(d * 100 + r.st)}.png`]} size={44} alt={TIER_EN[PH.tierOf(d * 100 + r.st)]} label="enemy" /><span>{TIER_EN[PH.tierOf(d * 100 + r.st)]}</span></div>
          {r.boss ? <div className="en-thumb"><Img art={[`bosses/${r.elem}.png`]} size={64} alt="Boss" label="boss" /><span>Boss</span></div> : r.mini ? <div className="en-thumb"><Img art={[`enemies/${r.elem}_${PH.tierOf(d * 100 + r.st)}.png`]} size={64} alt="Mini-boss" label="mini" /><span>Mini-boss</span></div> : null}</div></td>
        <td style={{ color: ELEM_COLOR[r.elem] }}><Img art={elemArts(r.elem)} size={16} alt="" className="mini" /> {ELEM_EN[r.elem]}<div className="mut small">weak to {ELEM_EN[c]}</div></td>
        <td>{fmtBig(r.mob.hp)}</td><td>{fmtBig(r.mob.atk)}</td><td>{big ? fmtBig(big.hp) : '—'}</td><td>{big ? fmtBig(big.atk) : '—'}</td><td>{fmtBig(r.gold)}</td><td>{fmtBig(r.exp)}</td>
        <td>{r.gim ? <><b>{GIM_EN[r.gim.kind][0]} {GIM_EN[r.gim.kind][1]}</b><div className="desc">{gimmickText(r.gim, ELEM_EN[c])}</div></> : ''}</td></tr>); })}
    </tbody></table></div>
    <p className="mut small">Enemy element cycles per act: three acts of Dark, then Wind, Water, Light, Fire, Earth. Values are computed from the game’s curves and match the in-game tooltips within rounding.</p>
  </>);
}
