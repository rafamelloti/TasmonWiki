import React from 'react';
import { Link } from 'react-router-dom';
import { Img, monArts, elemArts, roleArts, eggArts, jobArts, useAssets } from './lib/img.jsx';
import { ELEM_EN, ELEM_COLOR, RARITY_EN, RARITY_COLOR, ROLE_EN, GROUP_EN, nameOf, availability } from './lib/data.js';
import { romaji, dispName } from './lib/text.js';
export const ElemTag = ({ e }) => <span className="tag" style={{ borderColor: ELEM_COLOR[e], color: ELEM_COLOR[e] }}><Img art={elemArts(e)} size={14} alt={ELEM_EN[e]} className="mini" />{ELEM_EN[e]}</span>;
export const RarTag = ({ r }) => <span className="tag" style={{ borderColor: RARITY_COLOR[r], color: RARITY_COLOR[r] }}>{RARITY_EN[r]}</span>;
export const RoleTag = ({ r }) => <span className="tag"><Img art={roleArts(r)} size={14} alt="" className="mini" />{ROLE_EN[r]}</span>;
export const GroupTag = ({ g }) => g === 'normal' ? null : <span className="tag grp">{GROUP_EN[g]}</span>;
export function AvailTag({ s }){ const a = availability(s); if (!a.limited && !a.text) return null;
  const cls = a.state === 'open' ? 'ok' : a.state === 'ended' ? 'bad' : a.state === 'soon' ? 'soon' : 'grp'; const label = a.state === 'open' && (s.group === 'season' || s.group === 'halloween') ? '⏳ Limited time' : a.state === 'ended' ? '🚫 No longer obtainable' : a.state === 'soon' ? '⏳ Coming soon' : '';
  return <span className={'tag ' + cls} title={a.text}>{label ? label + ' · ' : ''}{a.text}</span>; }
export const TasmonName = ({ s, big }) => { const [a, b] = dispName(nameOf(s), s.jp); return <span className={big ? 'nm big' : 'nm'}><b>{a}</b>{b ? <small> {b}</small> : null}</span>; };
export const monGetArt = s => (e, v) => { const a = monArts(s, { evo: e, variant: v }); return v ? a.filter(p => p.includes('monsters-variant/')) : e ? a.filter(p => p.includes('/evolved/')) : a; };
export function TasmonCard({ s, shiny = false }){
  const assets = useAssets();
  return (<div className="card tc" style={{ '--rc': RARITY_COLOR[s.rarity] }}>
    <ArtViewer getArt={monGetArt(s)} fallback={monArts(s)} assets={assets} shiny={shiny} size={84} thumb={34} dark label={s.id} />
    <Link to={`/tasmons/${s.id}`} className="meta"><TasmonName s={s} /><div className="row"><ElemTag e={s.element} /><RoleTag r={s.role} /></div>
      <div className="row mut"><span>{RARITY_EN[s.rarity]}</span><span>ATK {s.atk}</span><span>HP {s.hp}</span></div>{s.group !== 'normal' && <GroupTag g={s.group} />}</Link>
  </div>);
}
export const SpeciesChip = ({ s }) => <Link to={`/tasmons/${s.id}`} className="chip"><Img art={monArts(s)} size={28} alt={s.jp} label={s.id} /><span>{dispName(nameOf(s), s.jp)[0]}</span></Link>;
export function Section({ title, children, right, id }){ return <section className="sec" id={id}><div className="sh"><h2>{title}</h2>{right}</div>{children}</section>; }
export function Field({ label, children }){ return <label className="fld"><span>{label}</span>{children}</label>; }
export function useQueryState(key, init){ const [v, setV] = React.useState(() => { try { return sessionStorage.getItem('q:' + key) ?? init; } catch { return init; } }); const set = x => { setV(x); try { sessionStorage.setItem('q:' + key, x); } catch {} }; return [v, set]; }

const STAGES = [['Base', 0], ['Evolved I', 1], ['Evolved II', 2]];
// Selected stage large on top; the other stages as small thumbnails below (click to bring one to the top). Dark checkbox only when a dark variant really exists.
export function ArtViewer({ getArt, fallback, assets, shiny, size = 112, thumb = 44, dark: allowDark = false, label = '' }){
  const [sel, setSel] = React.useState(0), [dark, setDark] = React.useState(false);
  const ok = (evo, v) => { const a = getArt(evo, v); return a.length > 0 && (!assets || a.some(p => assets.has(p))); };
  const hasDark = allowDark && STAGES.some(([, e]) => ok(e, 'dark'));
  const v = dark && hasDark ? 'dark' : '';
  const avail = STAGES.filter(([, e]) => e === 0 || ok(e, v));
  const cur = avail.some(([, e]) => e === sel) ? sel : 0;
  const art = (e) => { const a = getArt(e, v); return a.length ? a : fallback; };
  return (<div className="viewer">
    <Img art={art(cur)} size={size} alt={label} label={label} shiny={shiny} />
    <div className="mut small">{STAGES[cur][0]}{v ? ' · Dark' : ''}</div>
    <div className="thumbs">{avail.filter(([, e]) => e !== cur).map(([t, e]) => <button key={e} className="thumb" title={t} onClick={() => setSel(e)}><Img art={art(e)} size={thumb} alt={t} label={'E' + e} shiny={shiny} /><span>{t}</span></button>)}</div>
    {hasDark && <label className="small"><input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} /> Dark</label>}
  </div>);
}

// Job picker with a small thumbnail per job (a native <select> cannot show images).
export function JobPicker({ value, onChange, jobs, label }){
  const [open, setOpen] = React.useState(false), [alignRight, setAlignRight] = React.useState(false), ref = React.useRef(null);
  const toggle = () => { if (!open && ref.current) { const r = ref.current.getBoundingClientRect(); setAlignRight(r.left + 340 > window.innerWidth && r.right - 340 > 0); } setOpen(!open); };
  React.useEffect(() => { if (!open) return; const f = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener('mousedown', f); return () => document.removeEventListener('mousedown', f); }, [open]);
  const cur = jobs.find(j => j.id === value);
  const row = j => <><Img art={j ? jobArts(j.id) : []} size={28} alt="" label={j ? j.id : ''} />{j ? <span>{label(j)}</span> : <span>None</span>}</>;
  return (<div className="jpick" ref={ref}>
    <button type="button" className="jbtn" onClick={toggle}>{row(cur)}<span className="caret">▾</span></button>
    {open && <div className={'jlist' + (alignRight ? ' right' : '')}>{[null, ...jobs].map(j => <button type="button" key={j ? j.id : 'none'} className={'jopt' + ((j ? j.id : '') === value ? ' on' : '')} onClick={() => { onChange(j ? j.id : ''); setOpen(false); }}>{row(j)}</button>)}</div>}
  </div>);
}
