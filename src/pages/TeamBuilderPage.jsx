import React, { useState } from 'react';
import { speciesById, skills, jobById, meta, sphPerks } from '../lib/data.js';
import setsArr from '../data/sets.json';
import { PH } from '../lib/stages.js';
import { createAnalyzer } from '../lib/analyzer-core.js';
import { getSaved } from '../lib/savestore.js';
import SaveLoader from './SaveLoader.jsx';
import { TeamBuilder } from './TeamBuilder.jsx';

const AN = createAnalyzer({ species: speciesById, skills, jobs: jobById, meta, sets: Object.fromEntries(setsArr.map(s => [s.id, s])), perks: sphPerks, PH });
export default function TeamBuilderPage(){
  const [source, setSource] = useState(null), [save, setSave] = useState(() => getSaved()?.save || null), [fname, setFname] = useState(() => getSaved()?.fname || '');
  const has = save && Object.keys(save.monsters || {}).length > 0;
  return (<>
    <h1>Team Builder</h1>
    {!source ? (<>
      <p>Which Tasmons should the Team Builder use?</p>
      <div className="grid2">
        <button className="card srcpick" onClick={() => setSource('db')}><div className="srcemoji">🌍</div><h3>Every Tasmon in the game</h3><p className="mut small">Compare all collectable Tasmons at a theoretical maximum: Lv 150, max awakening and the best possible gear. Great for planning what to chase.</p></button>
        <button className="card srcpick" onClick={() => setSource('save')}><div className="srcemoji">📂</div><h3>My save</h3><p className="mut small">Load your save file and build the best team from the Tasmons, levels and gear you already have{has ? ` (already loaded: ${fname})` : ''}. Your save never leaves your browser.</p></button>
      </div></>) : (<>
      <p className="row" style={{ gap: 10 }}><span>Source: <b>{source === 'db' ? 'Every Tasmon in the game (max build)' : 'My save'}</b></span><button className="btn sm" onClick={() => setSource(null)}>Change</button></p>
      {source === 'save' && <SaveLoader fname={fname} onLoad={(d, n) => { setSave(d); setFname(n); }} />}
      {source === 'db' || has ? <section className="sec"><TeamBuilder key={source} save={save} AN={AN} source={source} /></section> : save ? <p className="warn">⚠ No Tasmons found in this save.</p> : <p className="mut">Choose your save file to start.</p>}</>)}
  </>);
}
