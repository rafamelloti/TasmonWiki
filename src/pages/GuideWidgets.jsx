import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { nameOf, meta, species, speciesById, skills, ELEMENTS, ELEM_EN, ELEM_COLOR, RARITIES, RARITY_EN, ROLES, ROLE_EN } from '../lib/data.js';
import { Img, monArts, elemArts, roleArts, gearKindArts } from '../lib/img.jsx';
import { romaji } from '../lib/text.js';
import { STAT_EN } from '../lib/gear.js';
import { BEST } from '../lib/maxbuild.js';
import { TIERS } from './Tiers.jsx';

const nm = id => { const s = speciesById[id]; return s ? (nameOf(s) || romaji(s.jp)) : id; };
const fmt = n => Math.round(n).toLocaleString('en-US');
const store = { get(k, d){ try { return JSON.parse(localStorage.getItem('tasmon-guide-' + k)) ?? d; } catch { return d; } }, set(k, v){ try { localStorage.setItem('tasmon-guide-' + k, JSON.stringify(v)); } catch {} } };
const W = ({ title, hint, children }) => (<div className="card gw" style={{ margin: '10px 0' }}><div className="row sb"><h3 style={{ margin: 0 }}>🎮 {title}</h3>{hint && <span className="mut small">{hint}</span>}</div>{children}</div>);
const Bar = ({ v, max = 1, color = '#7affb0', label }) => (<div style={{ background: '#ffffff14', borderRadius: 6, height: 18, position: 'relative', overflow: 'hidden', margin: '3px 0' }}><div style={{ width: Math.max(2, Math.min(100, v / max * 100)) + '%', height: '100%', background: color, transition: 'width .25s' }} /><span className="small" style={{ position: 'absolute', left: 8, top: 0, lineHeight: '18px', color: '#fff', textShadow: '0 1px 2px #000' }}>{label}</span></div>);

// 1) element matchups
export function ElementWheel(){
  const [a, setA] = useState('fire'), [d, setD] = useState('wind'), adv = meta.elemAdv;
  const mult = a === d ? 1 : adv[a] === d ? meta.elemAdvMult : adv[d] === a ? meta.elemDisMult : 1;
  const verdict = mult > 1 ? ['Advantage', '#4ac08c'] : mult < 1 ? ['Disadvantage', '#e5484d'] : ['Neutral', '#aab'];
  const Pick = ({ v, set }) => <div className="row wrap" style={{ gap: 6 }}>{ELEMENTS.map(e => <button key={e} className={'tchip' + (v === e ? ' on' : '')} onClick={() => set(e)} title={ELEM_EN[e]} style={{ borderColor: ELEM_COLOR[e], flexDirection: 'column', width: 64 }}><Img art={elemArts(e)} size={32} alt={e} /><span className="small">{ELEM_EN[e]}</span></button>)}</div>;
  return (<W title="Try an element matchup" hint="Click an attacker and a defender">
    <b className="small">Attacker</b><Pick v={a} set={setA} /><b className="small">Defender</b><Pick v={d} set={setD} />
    <div className="card" style={{ marginTop: 8, borderColor: verdict[1] }}><div className="row" style={{ gap: 12 }}><Img art={elemArts(a)} size={40} alt={a} /><b style={{ fontSize: 22 }}>→</b><Img art={elemArts(d)} size={40} alt={d} />
      <div><b style={{ color: verdict[1] }}>{verdict[0]} · ×{mult}</b><div className="small mut">A 1,000-damage hit becomes <b>{fmt(1000 * mult)}</b>.</div></div></div>
      <Bar v={mult} max={1.6} color={verdict[1]} label={`damage ×${mult}`} /></div>
    <p className="mut small">The wheel: Fire → Wind → Earth → Water → Fire. Light and Dark beat each other. {ELEM_EN[a]} beats {adv[a] ? ELEM_EN[adv[a]] : '—'} and loses to {ELEM_EN[Object.keys(adv).find(k => adv[k] === a)] || '—'}.</p></W>);
}

// 2) awakening explorer
export function AwakeningExplorer(){
  const [n, setN] = useState(3), aw = meta.awakening, base = speciesById.seraphdrake || species[0], m = n ? aw.mult[n] : { atk: 1, hp: 1 }, sk = n ? aw.skill[n] : { power: 1, cooldown: 1 };
  return (<W title="What awakening does" hint="Slide from Awakening 0 to Ⅵ">
    <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}><Img art={monArts(base)} size={96} alt={base.id} label={base.id} />
      <div style={{ flex: 1, minWidth: 220 }}><input type="range" min="0" max={meta.awakenMax} value={n} onChange={e => setN(+e.target.value)} style={{ width: '100%' }} /><div className="row sb small"><span>none</span>{[1, 2, 3, 4, 5, 6].map(i => <b key={i}>{'ⅠⅡⅢⅣⅤⅥ'[i - 1]}</b>)}</div>
        <Bar v={m.atk} max={6} color="#ff7a59" label={`ATK ×${m.atk}`} /><Bar v={m.hp} max={6} color="#4ac08c" label={`Max HP ×${m.hp}`} /><Bar v={sk.power} max={6} color="#c08cff" label={`Skill power ×${sk.power}`} />
        <div className="small mut">Skill cooldown ×{sk.cooldown}{n ? ` · Minimum IV ×${aw.ivFloor[n]}` : ''}</div></div></div>
    <p className="mut small">Numbers are multipliers on the Tasmon’s own stats (shown with {nm(base.id)} as the example). Awakening Ⅵ is the biggest single boost in the game.</p></W>);
}

// 3) evolution cost + random evolution simulator
export function EvolutionLab(){
  const [stars, setStars] = useState(4), [stage, setStage] = useState(0), [runs, setRuns] = useState(null);
  const base = stars * 120000 * Math.pow(1.35, stars - 1) * Math.pow(10, stage), rnd = base * 4;
  const roll = () => { const r = Array.from({ length: 10 }, () => Math.random() < 0.25 ? 'fail' : 'ok'); setRuns(r); };
  const fails = runs ? runs.filter(x => x === 'fail').length : 0;
  return (<W title="Evolution cost and the Random gamble" hint="Pick a rarity and an evolution step">
    <div className="filters"><label className="fld"><span>Rarity (stars)</span><select value={stars} onChange={e => setStars(+e.target.value)}>{RARITIES.map(r => <option key={r} value={meta.rarity[r].stars}>{RARITY_EN[r]} ({meta.rarity[r].stars}★)</option>)}</select></label>
      <label className="fld"><span>Evolution</span><select value={stage} onChange={e => setStage(+e.target.value)}><option value={0}>1st (Lv 30)</option><option value={1}>2nd (Lv 60)</option></select></label></div>
    <div className="grid2"><div className="card"><b>Normal evolution</b><div style={{ fontSize: 22 }}>🪙 {fmt(base)}</div><div className="small mut">+ 1 role Evolution Stone · never fails</div></div>
      <div className="card"><b>Random evolution</b><div style={{ fontSize: 22 }}>🪙 {fmt(rnd)}</div><div className="small mut">+ 1 Random stone · <b style={{ color: '#e5484d' }}>25% failure</b></div></div></div>
    <div className="row" style={{ margin: '8px 0' }}><button className="btn" onClick={roll}>🎲 Try 10 Random evolutions</button>{runs && <span>{fails} failed → you would lose <b style={{ color: '#e5484d' }}>🪙 {fmt(fails * rnd)}</b> and {fails} stones</span>}</div>
    {runs && <div className="row wrap" style={{ gap: 4 }}>{runs.map((r, i) => <span key={i} className="tag" style={{ background: r === 'fail' ? '#e5484d55' : '#4ac08c55' }}>{r === 'fail' ? '✖ failed' : '✔ ok'}</span>)}</div>}
    <p className="mut small">Gold = stars × 120,000 × 1.35^(stars−1) × 10^stage; Random costs ×4. A failed Random evolution loses the gold and the stone and that step can never be retried on that Tasmon. Rare Job and Hidden Job stones never fail.</p></W>);
}

// 4) stone crafting
export function StoneCalc(){
  const [c, setC] = useState({ nuke: 0, guard: 0, heal: 0, buff: 0 }), tot = Object.values(c).reduce((a, b) => a + b, 0);
  return (<W title="How many stones can I craft?" hint="Type how many role stones you have">
    <div className="row wrap" style={{ gap: 10 }}>{ROLES.map(r => <label key={r} className="fld" style={{ width: 110 }}><span className="row" style={{ gap: 4 }}><Img art={roleArts(r)} size={20} alt={r} />{ROLE_EN[r]}</span><input type="number" min="0" value={c[r]} onChange={e => setC({ ...c, [r]: Math.max(0, +e.target.value || 0) })} /></label>)}</div>
    <div className="grid2" style={{ marginTop: 8 }}>{ROLES.map(r => { const others = tot - c[r]; return <div key={r} className="card small"><b>{ROLE_EN[r]} stone</b> from the others: <b>{Math.floor(others / 3)}</b> <span className="mut">(3 stones of other roles each)</span></div>; })}
      <div className="card small"><b>Random stone</b> from all role stones: <b>{Math.floor(tot / 5)}</b> <span className="mut">(5 role stones each)</span></div></div>
    <p className="mut small">Crafting: 3 role stones of other roles → 1 stone of the role you pick; 5 role stones → 1 Random stone. Remember a Random evolution can fail.</p></W>);
}

// 5) pinnacle odds
export function PinnacleOdds(){
  const [res, setRes] = useState(null);
  const O = [['Nothing', 78, '#8890a0'], ['Awakening +1', 10, '#c08cff'], ['Shiny', 10, '#f2c94c'], ['Hidden job', 2, '#ff7a59']];
  const roll = n => { const t = { Nothing: 0, 'Awakening +1': 0, Shiny: 0, 'Hidden job': 0 }; for (let i = 0; i < n; i++) { const r = Math.random() * 100; t[r < 78 ? 'Nothing' : r < 88 ? 'Awakening +1' : r < 98 ? 'Shiny' : 'Hidden job']++; } setRes({ n, t }); };
  return (<W title="Pinnacle ritual: Solid or Gamble?" hint="One time only per Tasmon">
    <div className="card" style={{ borderColor: '#4ac08c' }}><b>Solid</b> — guaranteed <b>ATK ×{meta.pinnacle.atk}</b> and <b>Max HP ×{meta.pinnacle.hp}</b></div>
    <b className="small">Gamble outcomes</b>{O.map(([k, p, c]) => <Bar key={k} v={p} max={100} color={c} label={`${k} · ${p}%`} />)}
    <div className="row" style={{ margin: '6px 0' }}><button className="btn sm" onClick={() => roll(1)}>🎲 Gamble once</button><button className="btn sm" onClick={() => roll(100)}>🎲 100 Tasmons gamble</button></div>
    {res && <p className="small">{res.n === 1 ? `Result: ${Object.entries(res.t).find(([, v]) => v)[0]}` : `Out of 100: ${Object.entries(res.t).map(([k, v]) => `${k} ${v}`).join(' · ')}`}</p>}
    <p className="mut small">Recommendation: take Solid on your main damage dealer; gamble only on Tasmons you can afford to lose the guaranteed boost on.</p></W>);
}

// 6) DEX milestones
export function DexSlider(){
  const total = species.filter(s => s.dex).length, [p, setP] = useState(25), got = Math.round(total * p / 100);
  const text = m => [m.gold && `Gold +${m.gold * 100}%`, m.drop && `Egg drops +${m.drop * 100}%`, m.exp && `EXP +${m.exp * 100}%`, m.atk && `ATK +${m.atk * 100}%`, m.hp && `Max HP +${m.hp * 100}%`].filter(Boolean).join(' · ');
  return (<W title="DEX milestones" hint="Drag to see what each % unlocks">
    <input type="range" min="0" max="100" value={p} onChange={e => setP(+e.target.value)} style={{ width: '100%' }} /><div className="small"><b>{p}%</b> of the DEX ≈ <b>{got}</b> of {total} species</div>
    {meta.dexMilestones.map(m => { const on = p >= m.pct * 100; return <div key={m.pct} className="card small" style={{ opacity: on ? 1 : .45, borderColor: on ? '#4ac08c' : undefined, margin: '4px 0' }}>{on ? '✅' : '🔒'} <b>{Math.round(m.pct * 100)}%</b> — {text(m)} <span className="mut">(needs {Math.ceil(total * m.pct)} species)</span></div>; })}
    <p className="mut small">Bonuses are permanent for your whole account. <Link to="/dex">Open the DEX</Link>.</p></W>);
}

// 7) build a team and get feedback
const ROLE_NOTE = { nuke: 'damage', guard: 'survival', heal: 'sustain', buff: 'team boost' };
export function TeamCheck(){
  const pool = useMemo(() => ROLES.flatMap(r => (TIERS.by[r] || []).slice(0, 5)), []), [team, setTeam] = useState([]);
  const toggle = id => setTeam(t => t.includes(id) ? t.filter(x => x !== id) : t.length < 3 ? [...t, id] : t);
  const ms = team.map(id => speciesById[id]), roles = ROLES.filter(r => ms.some(s => s.role === r)), els = [...new Set(ms.map(s => s.element))], adv = meta.elemAdv;
  const beats = new Set(els.map(e => adv[e]).filter(Boolean)), weak = new Set(Object.keys(adv).filter(k => els.includes(adv[k])).concat(els.includes('light') ? ['dark'] : els.includes('dark') ? ['light'] : []));
  const tips = []; if (ms.length) {
    const n = r => ms.filter(s => s.role === r).length;
    if (!n('nuke')) tips.push(['warn', 'No Attacker: clears will be slow.']); if (n('nuke') === 3) tips.push(['info', 'Glass cannon: highest damage, but nothing keeps the team alive.']);
    if (!n('guard') && !n('heal')) tips.push(['warn', 'No Tank or Healer: bosses and hard stages may wipe you.']); else tips.push(['ok', 'You have sustain (Tank or Healer).']);
    if (n('buff')) tips.push(['ok', 'A Buffer boosts the whole team’s damage.']);
    if (els.length === 1 && ms.length > 1) tips.push(['warn', `All ${ELEM_EN[els[0]]}: one enemy element will hurt the whole team.`]);
    if (ms.length === 3) tips.push(['info', 'Next step: load your save in the Team Builder to see the best skills for this team.']); }
  return (<W title="Build a team and get feedback" hint="Pick 3 of the top Tasmons of each nature">
    {ROLES.map(r => <div key={r} className="row" style={{ gap: 6, margin: '4px 0' }}><span className="row" style={{ width: 90, gap: 4 }}><Img art={roleArts(r)} size={22} alt={r} /><b className="small">{ROLE_EN[r]}</b></span><div className="row wrap" style={{ gap: 6 }}>{(TIERS.by[r] || []).slice(0, 5).map(e => <button key={e.id} className={'tchip' + (team.includes(e.id) ? ' on' : '')} onClick={() => toggle(e.id)} title={`${nm(e.id)} · ${ELEM_EN[e.element]}`} style={{ borderColor: ELEM_COLOR[e.element] }}><Img art={monArts(speciesById[e.id])} size={44} alt={e.id} label={e.id} /></button>)}</div></div>)}
    <div className="card" style={{ marginTop: 8 }}><b>Your team ({team.length}/3)</b>
      <div className="row wrap" style={{ gap: 8, margin: '6px 0' }}>{ms.map(s => <span key={s.id} className="tag" style={{ borderColor: ELEM_COLOR[s.element] }}>{nm(s.id)} · {ROLE_EN[s.role]} · {ELEM_EN[s.element]}</span>)}{!ms.length && <span className="mut small">Click Tasmons above.</span>}</div>
      {ms.length > 0 && <><div className="small">Roles: {ROLES.map(r => <span key={r} className="tag" style={{ opacity: roles.includes(r) ? 1 : .35, marginRight: 4 }}>{ROLE_EN[r]}</span>)}</div>
        <div className="small" style={{ marginTop: 4 }}>Strong against: {[...beats].map(e => ELEM_EN[e]).join(', ') || '—'} · Weak against: {[...weak].map(e => ELEM_EN[e]).join(', ') || '—'}</div>
        {tips.map(([k, t], i) => <div key={i} className="small" style={{ color: k === 'warn' ? '#e5484d' : k === 'ok' ? '#4ac08c' : undefined, marginTop: 3 }}>{k === 'warn' ? '⚠' : k === 'ok' ? '✔' : 'ℹ'} {t}</div>)}</>}</div>
    <p className="mut small">Quick rule-of-thumb check, not a simulation. For real numbers use the <Link to="/team-builder">Team Builder</Link>.</p></W>);
}

// 8) gear stat priority per nature
export function StatPriority(){
  const [r, setR] = useState('nuke'), kinds = ['weapon', 'sub', 'armor', 'helm', 'boots', 'ring'];
  const why = { atkPct: 'More damage from every hit', critDmg: 'Crits hit much harder', critRate: 'Crit more often', atkSpeed: 'More attacks per second', skillPower: 'Skills and heals hit harder', basicAtkPct: 'Boosts basic attacks', atkFlat: 'Flat ATK', hpPct: 'More survivability', defPct: 'Takes less damage', cdr: 'Skills come back sooner (more shields, heals and buff uptime)', hpFlat: 'Flat HP', healPower: 'Stronger heals' };
  return (<W title="Gear stat priority" hint="Pick a nature">
    <div className="row wrap">{ROLES.map(x => <button key={x} className={'btn sm' + (x === r ? ' on' : '')} onClick={() => setR(x)}>{ROLE_EN[x]}</button>)}</div>
    <div className="row wrap" style={{ gap: 6, margin: '8px 0' }}>{kinds.map(k => <Img key={k} art={gearKindArts(k, 'legend')} size={40} alt={k} />)}</div>
    <ol className="bul">{(BEST[r] || []).slice(0, 6).map(s => <li key={s}><b>{STAT_EN[s] || s}</b> <span className="mut">— {why[s] || ''}</span></li>)}</ol>
    <p className="mut small">Recommendation based on the game’s formulas. Put the first stats on as many pieces as you can.</p></W>);
}

// 9) skill inheritance walkthrough
export function InheritFlow(){
  const [i, setI] = useState(0), donor = speciesById.flamewolf || species[0], rec = speciesById.aquafox || species[1], sk = skills[donor.skill] || {}, steps = [
    ['Find a donor', `A Tasmon that already knows the skill you want — here ${nm(donor.id)} knows “${sk.en || sk.jp || donor.skill}”.`, donor],
    ['Feed it', `Feed the donor to ${nm(rec.id)} using the inheritance feature. Signature skills cannot be inherited.`, rec],
    ['Equip 2 skills', `A Tasmon equips only 2 skills: choose the pair that fits its nature (the Team Builder tests every pair).`, rec],
    ['Rare/Hidden job = 3rd skill', 'A Tasmon holding a Rare or Hidden job also gets that job’s own skill as a 3rd skill.', rec]];
  const [t, d, s] = steps[i];
  return (<W title="How skill inheritance works" hint="Step through it">
    <div className="row" style={{ gap: 6, margin: '4px 0' }}>{steps.map((x, k) => <button key={k} className={'btn sm' + (k === i ? ' on' : '')} onClick={() => setI(k)}>{k + 1}. {x[0]}</button>)}</div>
    <div className="card row" style={{ gap: 14 }}><Img art={monArts(s)} size={80} alt={s.id} label={s.id} /><div><b>{t}</b><p style={{ margin: '4px 0' }}>{d}</p></div></div>
    <p className="mut small">Example Tasmons are illustrative. <Link to="/skills">Browse all skills</Link>.</p></W>);
}

// 10) progression checklist (saved in this browser)
const STEPS = [['Fill a team of 3 and hatch eggs', '/tasmons'], ['Clear Difficulty 1', '/stages'], ['Pick your core three Tasmons', '/tiers'], ['Evolve them at Lv30 and Lv60', '/mechanics#jobs'], ['Equip your best gear on the core team', '/equipment'], ['Spend Sphere points', '/mechanics'], ['Reach the next level cap by clearing more stages', '/stages'], ['Awaken your main Attacker and get a Rare/Hidden job', '/jobs'], ['Pinnacle ritual at Lv90', '/mechanics#pinnacle'], ['Complete the DEX', '/dex']];
export function Checklist(){
  const [done, setDone] = useState(() => store.get('steps', [])), tick = i => { const n = done.includes(i) ? done.filter(x => x !== i) : [...done, i]; setDone(n); store.set('steps', n); };
  return (<W title="My progression checklist" hint="Saved in this browser only">
    <Bar v={done.length} max={STEPS.length} label={`${done.length} / ${STEPS.length}`} />
    {STEPS.map(([t, to], i) => <label key={i} className="row small" style={{ gap: 8, margin: '4px 0', textDecoration: done.includes(i) ? 'line-through' : 'none', opacity: done.includes(i) ? .6 : 1 }}><input type="checkbox" checked={done.includes(i)} onChange={() => tick(i)} />{i + 1}. {t} <Link to={to}>→</Link></label>)}</W>);
}

export const WIDGETS = { elements: ElementWheel, awakening: AwakeningExplorer, evolution: EvolutionLab, stones: StoneCalc, pinnacle: PinnacleOdds, dex: DexSlider, team: TeamCheck, stats: StatPriority, inherit: InheritFlow, checklist: Checklist };
