import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { species, RARITIES, RARITY_EN, ELEMENTS, ELEM_EN, ROLES, ROLE_EN, GROUP_EN, nameOf } from '../lib/data.js';
import { romaji } from '../lib/text.js';
import { TasmonCard } from '../components.jsx';
export default function Tasmons(){
  const [sp, setSp] = useSearchParams(); const [limit, setLimit] = useState(60), [shiny, setShiny] = useState(false);
  const f = { q: sp.get('q') || '', rarity: sp.get('rarity') || '', element: sp.get('element') || '', role: sp.get('role') || '', group: sp.get('group') || '', sort: sp.get('sort') || 'rarity' };
  const set = (k, v) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); setSp(n, { replace: true }); setLimit(60); };
  const list = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    let a = species.filter(s => (!f.rarity || s.rarity === f.rarity) && (!f.element || s.element === f.element) && (!f.role || s.role === f.role) && (!f.group || s.group === f.group)
      && (!q || s.id.includes(q) || s.jp.toLowerCase().includes(q) || romaji(s.jp).toLowerCase().includes(q) || (nameOf(s) || '').toLowerCase().includes(q) || (s.title || '').includes(q)));
    const R = r => RARITIES.indexOf(r);
    const cmp = { rarity: (x, y) => R(y.rarity) - R(x.rarity) || x.id.localeCompare(y.id), atk: (x, y) => y.atk - x.atk, hp: (x, y) => y.hp - x.hp, name: (x, y) => x.id.localeCompare(y.id) }[f.sort];
    return a.sort(cmp);
  }, [sp]);
  const Sel = ({ k, label, opts }) => <label className="fld"><span>{label}</span><select value={f[k]} onChange={e => set(k, e.target.value)}><option value="">All</option>{opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label>;
  return (<>
    <h1>Tasmons <small>{list.length} of {species.length}</small></h1>
    <div className="filters">
      <label className="fld grow"><span>Search</span><input value={f.q} placeholder="Name, ID or reading…" onChange={e => set('q', e.target.value)} /></label>
      <Sel k="rarity" label="Rarity" opts={RARITIES.map(r => [r, RARITY_EN[r]])} /><Sel k="element" label="Element" opts={ELEMENTS.map(e => [e, ELEM_EN[e]])} />
      <Sel k="role" label="Role" opts={ROLES.map(r => [r, ROLE_EN[r]])} /><Sel k="group" label="Type" opts={Object.entries(GROUP_EN)} />
      <label className="fld"><span>Sort</span><select value={f.sort} onChange={e => set('sort', e.target.value)}><option value="rarity">Rarity</option><option value="atk">Base ATK</option><option value="hp">Base HP</option><option value="name">ID</option></select></label>
      <label className="fld chk"><input type="checkbox" checked={shiny} onChange={e => setShiny(e.target.checked)} /> <span>Show Shiny versions</span></label>
    </div>
    <div className="grid">{list.slice(0, limit).map(s => <TasmonCard key={s.id} s={s} shiny={shiny} />)}</div>
    {limit < list.length && <p className="center"><button className="btn" onClick={() => setLimit(limit + 120)}>Show more ({list.length - limit} left)</button></p>}
    {!list.length && <p className="mut">No Tasmon matches these filters.</p>}
  </>);
}
