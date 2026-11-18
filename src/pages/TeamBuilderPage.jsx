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
  const [save, setSave] = useState(() => getSaved()?.save || null), [fname, setFname] = useState(() => getSaved()?.fname || '');
  return (<>
    <h1>Team Builder</h1>
    <p>Load your save and build the strongest team from the Tasmons you own: <b>best DPS</b> or <b>best for PvP</b>, filtered by element, rarity and level, with the <b>best skills to equip</b> on each Tasmon — including skills you can inherit from other Tasmons. <b>Your save never leaves your browser.</b> A save you already loaded in the Save Analyzer is reused here.</p>
    <SaveLoader fname={fname} onLoad={(d, n) => { setSave(d); setFname(n); }} />
    {save && Object.keys(save.monsters || {}).length > 0 ? <section className="sec"><TeamBuilder save={save} AN={AN} /></section> : save ? <p className="warn">⚠ No Tasmons found in this save.</p> : <p className="mut">Choose your save file to start.</p>}
  </>);
}
