import React, { useMemo, useState } from 'react';
import { passives, speciesById } from '../lib/data.js';
import { PassiveCard } from '../cards.jsx';
export default function Passives(){
  const [q, setQ] = useState(''), [kind, setKind] = useState(''), [limit, setLimit] = useState(40);
  const all = useMemo(() => { const a = []; for (const [sid, o] of Object.entries(passives)) for (const [k, p] of Object.entries(o)) a.push({ sid, kind: k, p }); return a.sort((x, y) => x.sid.localeCompare(y.sid)); }, []);
  const list = all.filter(x => (!kind || x.kind === kind) && (!q || (x.sid + ' ' + x.p.en + ' ' + x.p.jp + ' ' + x.p.desc + ' ' + x.p.mech + ' ' + x.p.cond).toLowerCase().includes(q.toLowerCase())) && speciesById[x.sid]);
  return (<>
    <h1>Passives <small>{list.length}</small></h1>
    <p className="mut">Species passives work in normal play. Ranked passives apply in Ranked matches only.</p>
    <div className="filters"><label className="fld grow"><span>Search</span><input value={q} onChange={e => { setQ(e.target.value); setLimit(40); }} placeholder="Name, effect, mechanic…" /></label>
      <label className="fld"><span>Kind</span><select value={kind} onChange={e => setKind(e.target.value)}><option value="">All</option><option value="species">Species passive</option><option value="ranked">Ranked only</option></select></label></div>
    <div className="stack">{list.slice(0, limit).map(x => <PassiveCard key={x.sid + x.kind} p={x.p} kind={x.kind} s={speciesById[x.sid]} />)}</div>
    {limit < list.length && <p className="center"><button className="btn" onClick={() => setLimit(limit + 60)}>Show more</button></p>}
  </>);
}
