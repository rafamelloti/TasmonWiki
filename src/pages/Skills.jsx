import React, { useMemo, useState } from 'react';
import { skills, RARITIES } from '../lib/data.js';
import { SkillCard } from '../cards.jsx';
import { romaji } from '../lib/text.js';
const TYPES = [['nuke', 'Attack'], ['heal', 'Heal'], ['guard', 'Guard'], ['buff', 'Support']];
export default function Skills(){
  const [q, setQ] = useState(''), [type, setType] = useState(''), [scope, setScope] = useState(''), [stars, setStars] = useState(''), [limit, setLimit] = useState(40);
  const all = useMemo(() => Object.values(skills), []);
  const list = useMemo(() => all.filter(k => (!type || k.type === type) && (!stars || (stars === 'none' ? !k.stars : k.stars === +stars)) && (!scope || (scope === 'excl' ? k.speciesOnly : scope === 'sig' ? k.signature : scope === 'season' ? k.id.startsWith('s1_') || k.id.startsWith('s2_') : !k.speciesOnly))
    && (!q || (k.id + ' ' + k.jp + ' ' + (k.en || '') + ' ' + romaji(k.jp) + ' ' + k.desc).toLowerCase().includes(q.toLowerCase()))).sort((a, b) => a.id.localeCompare(b.id)), [q, type, scope, stars, all]);
  return (<>
    <h1>Skills <small>{list.length} of {all.length}</small></h1>
    <div className="filters">
      <label className="fld grow"><span>Search</span><input value={q} onChange={e => { setQ(e.target.value); setLimit(40); }} placeholder="Name, ID or effect text…" /></label>
      <label className="fld"><span>Type</span><select value={type} onChange={e => setType(e.target.value)}><option value="">All</option>{TYPES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label>
      <label className="fld"><span>Star rarity</span><select value={stars} onChange={e => setStars(e.target.value)}><option value="">All</option>{[6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}<option value="none">No stars</option></select></label>
      <label className="fld"><span>Group</span><select value={scope} onChange={e => setScope(e.target.value)}><option value="">All</option><option value="sig">Awakening-tier (signature) skills</option><option value="excl">Species-exclusive</option><option value="season">Season cast</option></select></label>
    </div>
    <div className="stack">{list.slice(0, limit).map(k => <SkillCard key={k.id} id={k.id} />)}</div>
    {limit < list.length && <p className="center"><button className="btn" onClick={() => setLimit(limit + 60)}>Show more</button></p>}
  </>);
}
