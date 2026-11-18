import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { meta, speciesById, skills, species, jobById, JOB_EN, nameOf, ELEM_EN, ELEM_COLOR, RARITY_EN, ROLE_EN, RARITIES, ELEMENTS, ROLES } from '../lib/data.js';
import pvpPassives from '../data/pvp-passives.json';
import setsArr from '../data/sets.json';
import { STAT_EN, fmtStat } from '../lib/gear.js';
import { Img, monArts, gearKindArts } from '../lib/img.jsx';
import { RarTag } from '../components.jsx';
import { fmtBig, romaji } from '../lib/text.js';
import { maxMonster } from '../lib/maxbuild.js';

const SETS = Object.fromEntries(setsArr.map(s => [s.id, s]));
const PART_EN = { weapon: 'Weapon', sub: 'Sub weapon', armor: 'Armor', helm: 'Helm', boots: 'Boots', charm: 'Accessory' };
const kindOf = it => it.part === 'charm' ? (it.charmKind || 'ring') : it.part;
const nmOf = id => { const s = speciesById[id]; return s ? (nameOf(s) || romaji(s.jp)) : id; };
const lines = l => (l || []).filter(o => o && o.stat).map((o, i) => <div key={i}>{STAT_EN[o.stat] || o.stat} <b>{fmtStat(o.stat, Number(o.value) || 0)}</b></div>);

// ---------- clickable gear viewer (equipped, bag, storage) ----------
export function GearViewer({ save }){
  const [src, setSrc] = useState('equipped'), [rar, setRar] = useState(''), [part, setPart] = useState(''), [sel, setSel] = useState(null), [lim, setLim] = useState(80);
  const all = useMemo(() => {
    const eq = []; for (const m of Object.values(save.monsters || {})) for (const it of (m.equipment || [])) if (it) eq.push({ it, by: m.speciesId });
    const arr = x => Array.isArray(x) ? x : x && typeof x === 'object' ? Object.values(x) : [];
    return { equipped: eq, bag: arr(save.items).filter(it => it && it.part).map(it => ({ it })), storage: arr(save.storage).filter(it => it && it.part).map(it => ({ it })) };
  }, [save]);
  const list = all[src].filter(x => (!rar || x.it.rarity === rar) && (!part || x.it.part === part)).sort((a, b) => RARITIES.indexOf(b.it.rarity) - RARITIES.indexOf(a.it.rarity) || (b.it.lv || 0) - (a.it.lv || 0));
  const cur = sel != null && list[sel] ? list[sel] : null, it = cur?.it, set = it?.setId ? SETS[it.setId] : null;
  return (<>
    <div className="filters">
      <label className="fld"><span>Where</span><select value={src} onChange={e => { setSrc(e.target.value); setSel(null); setLim(80); }}><option value="equipped">Equipped ({all.equipped.length})</option><option value="bag">Bag ({all.bag.length})</option><option value="storage">Storage ({all.storage.length})</option></select></label>
      <label className="fld"><span>Rarity</span><select value={rar} onChange={e => { setRar(e.target.value); setSel(null); }}><option value="">All</option>{RARITIES.map(r => <option key={r} value={r}>{RARITY_EN[r]}</option>)}</select></label>
      <label className="fld"><span>Type</span><select value={part} onChange={e => { setPart(e.target.value); setSel(null); }}><option value="">All</option>{Object.entries(PART_EN).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <span className="mut small">{list.length} items. Click one to see its image and stats.</span></div>
    <div className="row wrap" style={{ gap: 6 }}>{list.slice(0, lim).map((x, i) => <button key={i} className={'tchip' + (sel === i ? ' on' : '')} onClick={() => setSel(i)} title={`${x.it.name || PART_EN[x.it.part]} · ${RARITY_EN[x.it.rarity] || ''} · Lv ${x.it.lv ?? '?'}`}><Img art={gearKindArts(kindOf(x.it), x.it.rarity)} size={44} alt={x.it.part} label={PART_EN[x.it.part]} /></button>)}</div>
    {lim < list.length && <p className="center"><button className="btn sm" onClick={() => setLim(lim + 120)}>Show more</button></p>}
    {it && (<div className="card" style={{ marginTop: 10 }}><div className="row"><Img art={gearKindArts(kindOf(it), it.rarity)} size={72} alt={it.part} />
      <div><h3 style={{ margin: 0 }}>{it.name || PART_EN[it.part]}</h3><div className="row wrap small"><RarTag r={it.rarity} /><span className="tag">{PART_EN[it.part] || it.part}</span>{it.role && <span className="tag">{ROLE_EN[it.role]}</span>}{it.lv != null && <span className="tag">Lv {it.lv}</span>}</div>
        {cur.by && <div className="mut small">Equipped on <Link to={`/tasmons/${cur.by}`}>{nmOf(cur.by)}</Link></div>}</div></div>
      <div className="grid2 small" style={{ marginTop: 8 }}><div><b>Stats</b>{lines(it.opts)}{!(it.opts || []).length && <div className="mut">No stat lines</div>}</div>
        <div>{(it.enhances || []).length > 0 && <><b>Enhancements</b>{lines(it.enhances)}</>}{set && <><b>Set: {set.en || set.name || set.id}</b><div className="mut">2 pieces: {(set.two || []).map(o => `${STAT_EN[o.stat] || o.stat} ${fmtStat(o.stat, o.value)}`).join(', ') || '—'}</div><div className="mut">4 pieces: {(set.four || []).map(o => `${STAT_EN[o.stat] || o.stat} ${fmtStat(o.stat, o.value)}`).join(', ') || '—'}</div></>}</div></div>
      <p className="mut small">More on <Link to="/equipment">Equipment</Link>.</p></div>)}
  </>);
}

// ---------- team builder ----------
const COST0 = Object.fromEntries(Object.entries(meta.rarity).map(([k, v]) => [k, v.stars]));   // default: points = rarity stars (editable, the real PvP table is not confirmed)
const MonLink = ({ id }) => { const sp = speciesById[id]; if (!sp) return <span>{id}</span>; const nat = [sp.skill, ...(sp.extraSkills || [])].filter(k => skills[k]).map(k => skills[k].en || skills[k].jp).slice(0, 3).join(', ');
  return (<span className="montip"><Link to={`/tasmons/${id}`}>{nmOf(id)}</Link><span className="tipbox"><span className="row" style={{ gap: 8 }}><Img art={monArts(sp)} size={48} alt={id} label={id} /><span><b>{nmOf(id)}</b><br /><span className="small">{ELEM_EN[sp.element]} · {RARITY_EN[sp.rarity]} · {ROLE_EN[sp.role]}</span></span></span>{nat && <span className="small mut" style={{ display: 'block', marginTop: 4 }}>Skills: {nat}</span>}<span className="small" style={{ display: 'block' }}>Click to open its page</span></span></span>); };
const skName = id => skills[id]?.en || skills[id]?.jp || id;
const TYPE_EN = { nuke: 'Attack', guard: 'Defense', heal: 'Heal', buff: 'Buff' };
const TYPE_COLOR = { nuke: '#ff7a59', guard: '#4a8cf0', heal: '#4ac08c', buff: '#c08cff' };
const OWNERS = {}; for (const s of species) for (const id of [s.skill, ...(s.extraSkills || [])]) if (id) (OWNERS[id] = OWNERS[id] || []).push(s.id);

export function TeamBuilder({ save, AN, source = 'save' }){
  const [mode, setMode] = useState('dps'), [el, setEl] = useState(''), [rar, setRar] = useState(''), [role, setRole] = useState(''), [minLv, setMinLv] = useState(1), [enemy, setEnemy] = useState(''), [picked, setPicked] = useState([]), [found, setFound] = useState(null), [q, setQ] = useState('');
  const [cost, setCost] = useState(COST0), [cap, setCap] = useState(10), [lim, setLim] = useState(null), [tune, setTune] = useState(true), [excl, setExcl] = useState(true), [useJobs, setUseJobs] = useState(true), [gearRar, setGearRar] = useState('celestial'), [onlyKnown, setOnlyKnown] = useState(false);
  const db = source === 'db';
  const owned = useMemo(() => db ? species.filter(sp => sp.dex).map(sp => maxMonster(sp, meta, { rarity: gearRar })) : Object.values(save?.monsters || {}).concat(Object.values(save?.parkedMonsters || {})).filter(m => m && m.speciesId), [save, db, gearRar]);
  const own = useMemo(() => owned.map(m => AN.monster(m)).filter(Boolean), [owned, AN]), ranked = useMemo(() => AN.rankedPool(owned), [owned, AN]);
  const pool = mode === 'pvp' ? ranked : own;
  const byId = useMemo(() => Object.fromEntries(pool.map(m => [m.id, m])), [pool]);
  // who in the save already knows each skill (donors for the game's skill inheritance)
  const knows = useMemo(() => { const k = {}; if (db) return k; for (const m of owned) for (const id of (m.learnedSkills || [])) (k[id] = k[id] || []).push(m); return k; }, [owned, db]);
  const ok = m => (!el || m.element === el) && (!rar || m.rarity === rar) && (!role || m.role === role) && (mode === 'pvp' || m.level >= minLv);
  const filtered = pool.filter(ok), shown = filtered.filter(m => !q || (nmOf(m.speciesId) + m.speciesId).toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.dpsGame - a.dpsGame);
  const useLim = lim == null ? mode === 'pvp' : lim;
  const only = useMemo(() => onlyKnown ? new Set(Object.keys(knows)) : undefined, [onlyKnown, knows]);
  const opt = { mode, enemyElem: enemy || null, pvp: pvpPassives, cost, cap: useLim ? cap : Infinity, transfer: tune, exclusive: excl, only, jobs: useJobs };
  const mine = useMemo(() => { const ms = picked.map(i => byId[i]).filter(Boolean); if (!ms.length) return null; if (!tune) return AN.teamInfo(ms, opt); const r = AN.tuneTeam(ms, opt); return { ...r.info, loadout: r.mons.map(m => ({ id: m.id, skills: m.skillsEq, job: m.job, jobSkill: m.jobSkill })) }; }, [picked, byId, mode, enemy, cost, cap, lim, tune, excl, onlyKnown, useJobs]);
  const run = () => setFound(AN.bestTeams(filtered, { ...opt, top: 5, tune }));
  const toggle = id => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : p.length < 3 ? [...p, id] : p);
  const over = useLim && mine && mine.cost > cap;
  const how = (m, id) => {   // where this Tasmon gets the skill from: [label, color, Tasmon ids]
    const sp = speciesById[m.speciesId], nat = [sp.skill, ...(sp.extraSkills || [])].includes(id);
    if (nat) return ['Native', '#4ac08c', []];
    if (db) return ['Inherit — known natively by', '#f2c94c', (OWNERS[id] || []).slice(0, 4)];
    const mine = owned.filter(o => o.speciesId === m.speciesId && (o.learnedSkills || []).includes(id));
    if (mine.length) return ['Already learned', '#4ac08c', []];
    const d = [...new Set((knows[id] || []).filter(o => o.speciesId !== m.speciesId).map(o => o.speciesId))];
    if (d.length) return ['Inherit from', '#f2c94c', d.slice(0, 4)];
    const own = (OWNERS[id] || []).slice(0, 4);
    return ['Not in your save — known natively by', '#e5484d', own];
  };
  const Links = ({ ids }) => ids.map((i, n) => <span key={i}>{n ? ', ' : ' '}<MonLink id={i} /></span>);
  const SkillChip = ({ m, id, job }) => { const k = skills[id], [t, c, ids] = job ? ['', '#c08cff', []] : how(m, id); return (<div className="small" style={{ borderLeft: `3px solid ${job ? '#c08cff' : TYPE_COLOR[k.type] || '#888'}`, padding: '2px 8px', margin: '3px 0' }}>
    <b>{skName(id)}</b> <span className="mut">· {TYPE_EN[k.type] || k.type}{k.signature ? ' · Signature' : ''}{k.speciesOnly ? ' · Exclusive' : ''}{k.cooldown ? ` · ${k.cooldown}s cooldown` : ''}</span>
    {k.desc && <div className="mut">{k.desc}</div>}
    {job ? <div style={{ color: c }}>3rd skill — comes with the <b>{JOB_EN[job] || job}</b> job (Rare/Hidden). Change the Tasmon to that job to get it.</div> : <div style={{ color: c }}>{t}{ids.length > 0 && <Links ids={ids} />}</div>}</div>); };
  const names = (ids, n) => ids.slice(0, n).map(i => nmOf(i)).join(', ') + (ids.length > n ? ` +${ids.length - n}` : '');
  const TeamRow = ({ t, label }) => (<div className="card" style={{ marginBottom: 8 }}>
    <div className="row sb" style={{ alignItems: 'flex-start' }}><div className="stack" style={{ flex: 1 }}>{t.ids.map(id => { const m = byId[id], s = speciesById[m.speciesId], L = t.loadout?.find(l => l.id === id), all = L?.skills || m.skillsEq, lo = L?.jobSkill ? all.slice(0, -1) : all, jb = L?.jobSkill ? L.job : ''; const mm = L && L.job !== m.job ? { ...m, job: L.job } : m; return (<div key={id} className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
      <div className="center small" style={{ minWidth: 70 }}><Img art={monArts(s)} size={52} alt={s.id} label={s.id} /><div>{nmOf(s.id)}</div><div className="mut">Lv {m.level}</div>{jb && <div className="tag" title="Job change recommended">{JOB_EN[jb] || jb}</div>}</div>
      <div style={{ flex: 1 }}>{lo.length ? lo.map(sk => <SkillChip key={sk} m={m} id={sk} />) : <span className="mut small">No skills equipped</span>}{jb && <SkillChip m={m} id={L.jobSkill} job={jb} />}</div></div>); })}</div>
      <div className="small" style={{ textAlign: 'right', minWidth: 130 }}>{label && <div className="tag">{label}</div>}<div>DPS <b>{fmtBig(mode === 'pvp' ? t.dps : t.dpsB)}</b>{mode !== 'pvp' && t.buff > 0 ? <span className="mut"> (with buffs)</span> : ''}</div><div>HP {fmtBig(t.hp)}</div><div>Points <b style={{ color: useLim && t.cost > cap ? '#e5484d' : undefined }}>{t.cost}</b>{useLim ? ` / ${cap}` : ''}</div>{mode === 'pvp' && <><div>PvP rating <b>{fmtBig(t.rating)}</b></div><div className="mut">Effective HP {fmtBig(t.ehp)}</div></>}</div></div>
    {mode === 'pvp' && t.passives.length > 0 && <div className="small mut">Ranked passives: {t.passives.map(id => `${nmOf(id)} — ${pvpPassives[id].name}`).join(' · ')}</div>}</div>);
  return (<>
    <p>Pick up to three Tasmons yourself, or let the tool search <b>every combination</b> of {db ? 'every Tasmon in the game (theoretical max build: Lv 150, max awakening, best gear)' : 'your Tasmons'} — no restrictions on roles or species. For each Tasmon it also recommends the <b>2 best skills to equip</b>, including skills it does not know yet but could <b>inherit</b>.</p>
    <div className="filters">
      {db && <label className="fld"><span>Gear rarity</span><select value={gearRar} onChange={e => { setGearRar(e.target.value); setFound(null); setPicked([]); }}>{RARITIES.map(r => <option key={r} value={r}>{RARITY_EN[r]}</option>)}</select></label>}
      <label className="fld"><span>Goal</span><select value={mode} onChange={e => { setMode(e.target.value); setFound(null); setPicked([]); }}><option value="dps">Best DPS</option><option value="pvp">Best for PvP</option></select></label>
      <label className="fld"><span>Element</span><select value={el} onChange={e => { setEl(e.target.value); setFound(null); }}><option value="">All</option>{ELEMENTS.map(r => <option key={r} value={r}>{ELEM_EN[r]}</option>)}</select></label>
      <label className="fld"><span>Rarity</span><select value={rar} onChange={e => { setRar(e.target.value); setFound(null); }}><option value="">All</option>{RARITIES.map(r => <option key={r} value={r}>{RARITY_EN[r]}</option>)}</select></label>
      <label className="fld"><span>Nature</span><select value={role} onChange={e => { setRole(e.target.value); setFound(null); }}><option value="">All</option>{ROLES.map(r => <option key={r} value={r}>{ROLE_EN[r]}</option>)}</select></label>
      <label className="fld" style={mode === 'pvp' ? { opacity: .4 } : null}><span>Min level</span><input type="number" min="1" value={minLv} onChange={e => { setMinLv(Math.max(1, +e.target.value || 1)); setFound(null); }} style={{ width: 80 }} /></label>
      <label className="fld"><span>Enemy element</span><select value={enemy} onChange={e => { setEnemy(e.target.value); setFound(null); }}><option value="">None</option>{ELEMENTS.map(r => <option key={r} value={r}>{ELEM_EN[r]}</option>)}</select></label>
    </div>
    <div className="small" style={{ margin: '4px 0' }}>
      <label><input type="checkbox" checked={tune} onChange={e => { setTune(e.target.checked); setFound(null); }} /> Recommend the best skills (any skill that can be inherited)</label>{' · '}
      <label><input type="checkbox" checked={useJobs} disabled={mode === 'pvp'} onChange={e => { setUseJobs(e.target.checked); setFound(null); }} /> consider Rare/Hidden Jobs (their job skill is a 3rd skill)</label>{' · '}
      <label><input type="checkbox" checked={excl} disabled={!tune} onChange={e => { setExcl(e.target.checked); setFound(null); }} /> include species-exclusive skills</label>{' · '}
      <label style={db ? { display: 'none' } : null}><input type="checkbox" checked={onlyKnown} disabled={!tune} onChange={e => { setOnlyKnown(e.target.checked); setFound(null); }} /> only skills a Tasmon in my save already knows</label></div>
    <details style={{ margin: '6px 0' }}><summary>PvP point limit: {useLim ? `on (max ${cap})` : 'off'}</summary>
      <label className="small"><input type="checkbox" checked={useLim} onChange={e => { setLim(e.target.checked); setFound(null); }} /> Apply the team point limit</label> · <label className="small">Max points <input type="number" min="1" value={cap} onChange={e => { setCap(Math.max(1, +e.target.value || 10)); setFound(null); }} style={{ width: 60 }} /></label>
      <div className="row wrap small" style={{ gap: 8, marginTop: 6 }}>{Object.keys(COST0).map(r => <label key={r}>{RARITY_EN[r] || r} <input type="number" min="0" value={cost[r]} onChange={e => { setCost({ ...cost, [r]: Math.max(0, +e.target.value || 0) }); setFound(null); }} style={{ width: 48 }} /></label>)}</div>
      <p className="mut small">Each Tasmon costs points by its rarity and a team may not exceed the maximum. The defaults (points = rarity stars) are an assumption — change them to match the game’s PvP table.</p></details>
    <div className="row wrap" style={{ margin: '8px 0' }}><button className="btn" onClick={run} disabled={!filtered.length}>🔎 Find best {mode === 'pvp' ? 'PvP' : 'DPS'} team ({filtered.length} Tasmons)</button>{picked.length > 0 && <button className="btn sm" onClick={() => setPicked([])}>Clear my team</button>}</div>
    {found && (found.length ? <><h3>{db ? 'Best teams' : 'Best teams from your Tasmons'}</h3>{found.map((t, i) => <TeamRow key={i} t={t} label={i === 0 ? 'Best' : '#' + (i + 1)} />)}
      <button className="btn sm" onClick={() => setPicked(found[0].ids)}>Load the best team into “My team”</button></> : <p className="warn">⚠ No Tasmons match these filters{useLim ? ' and the point limit' : ''}.</p>)}
    <h3>My team ({picked.length}/3)</h3>
    {over && <p className="warn">⚠ This team costs {mine.cost} points, over the limit of {cap}.</p>}
    {mine ? <TeamRow t={mine} /> : <p className="mut small">Click Tasmons below to build your own team and see its estimated {mode === 'pvp' ? 'PvP rating' : 'DPS'} and the best skills to equip.</p>}
    <div className="filters"><label className="fld grow"><span>Search</span><input value={q} onChange={e => setQ(e.target.value)} placeholder="Name…" /></label><span className="mut small">{shown.length} shown, strongest first. Click to add or remove.</span></div>
    <div className="row wrap" style={{ gap: 6 }}>{shown.slice(0, 120).map(m => { const s = speciesById[m.speciesId]; return <button key={m.id} className={'tchip' + (picked.includes(m.id) ? ' on' : '')} onClick={() => toggle(m.id)} title={`${cost[m.rarity] || 0} pts · ${nmOf(s.id)} · Lv ${m.level} · ${ELEM_EN[m.element]} · ${RARITY_EN[m.rarity]} · DPS ${fmtBig(m.dpsGame)}`} style={{ borderColor: ELEM_COLOR[m.element] }}><Img art={monArts(s)} size={44} alt={s.id} label={s.id} /></button>; })}</div>
    <ul className="bul small" style={{ marginTop: 10 }}>
      <li><b>Skills:</b> a Tasmon equips 2 skills, plus a 3rd one if it holds a Rare or Hidden job (that job’s own skill). It can use its own skills or any skill it inherits by feeding it a Tasmon that already knows that skill (signature skills cannot be inherited). The recommendation tests every pair, then re-checks them with the whole team so buffs, heals and shields are valued by the party they help. Under each skill: <span style={{ color: '#4ac08c' }}>native / already learned</span>, <span style={{ color: '#f2c94c' }}>inherit from a Tasmon</span> (hover a name to see it, click to open its page){!db && <>, <span style={{ color: '#e5484d' }}>not in your save</span></>}.</li>
      <li><b>DPS</b> uses the same estimate as the Save Analyzer (gear, Sphere, Talisman, berries, element advantage vs. the enemy element you pick) plus the uptime of party buffs. Gear stays on the Tasmon that wears it now.</li>
      <li><b>PvP mode follows the Ranked Match rules:</b> every Tasmon fights at Lv 60 with no gear, stats come from the species alone (your levels, IV, awakening, gear and job do not count), so the pool is one entry per species you own, and one species can appear only once per team.</li>
      <li><b>PvP rating</b> is a heuristic, not the game’s own ranking: it blends damage, effective HP (healing, shields, damage reduction), party buffs, element variety and a small bonus per <i>[Ranked]</i> passive in the team. Real PvP also depends on targeting and the ranked rules, which are not modelled.</li></ul>
  </>);
}
