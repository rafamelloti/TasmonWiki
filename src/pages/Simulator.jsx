import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { speciesById, jobs, jobById, meta, enhance, skills, RARITY_EN, RARITY_COLOR, ROLE_EN } from '../lib/data.js';
import { statsOf, roleOf, LEVEL_CAP, IV_MIN, IV_MAX_BRED, PLUS_CAP, jobName } from '../lib/game.js';
import { useAssets, Img, gearKindArts } from '../lib/img.jsx';
import { TasmonName, JobPicker, ArtViewer, monGetArt, RarTag } from '../components.jsx';
import { monArts } from '../lib/img.jsx';
import { LINES, STAT_EN, NORMAL_POOL, UNIQUE_POOL, STAT_BASE, VALUE_MULT, PCT, BASE_BY_PART, ROLE_SUB_POOL, ROLE_TRAIT_POOL, ROLE_WEAPONS, CHARM_BASE_POOL, CHARM_SLOT_UNLOCK, EQUIP_LV_TIERS, lvMult, lvMultFor, flatValue, fmtStat } from '../lib/gear.js';
import setsData from '../data/sets.json';
import equipData from '../data/equipment.json';
import talData from '../data/talisman.json';
import { elemArts } from '../lib/img.jsx';
const TAL_COUNT = { common: 3, rare: 3, ultra: 3, legend: 3, immortal: 4, arcana: 4, beyond: 4, century: 4, cosmic: 5, celestial: 5 };
const TAL_STATS = Object.keys(talData);
const talVal = (stat, rar, q) => { const r = talData[stat]?.[rar]; return r ? Math.round((r[0] + (r[1] - r[0]) * q) * 1e4) / 1e4 : 0; };
const BERRY = [['hpFlat', 'Max HP', true, 5e5, 2e5, 1e5], ['atkFlat', 'ATK', true, 1e5, 8e4, 5e4], ['defPct', 'Damage reduction', false, 1, 1, 1], ['critRate', 'Crit rate', false, .05, .05, .05], ['critDmg', 'Crit damage', false, 2, 1.5, 1], ['singleSkillPct', 'Single-target skill power', false, 2, 1.5, 1], ['aoeSkillPct', 'Area skill power', false, 2, 1.5, 1]];
const berryCap = (b, rar) => rar === 'celestial' ? b[3] : rar === 'cosmic' ? b[4] : b[5];
const r3 = v => Math.round(v * 1e3) / 1e3;
const SLOTS = [['weapon', 'Weapon'], ['sub', 'Sub weapon'], ['armor', 'Armor'], ['helm', 'Helm'], ['boots', 'Boots'], ['charm1', 'Accessory 1'], ['charm2', 'Accessory 2'], ['charm3', 'Accessory 3']];
const PART_OF = id => id.startsWith('charm') ? 'charm' : id;
const UNIQ_TIERS = ['legend', 'immortal', 'arcana', 'beyond', 'century', 'cosmic', 'celestial'];
const CAPS = { atkSpeed: .6, bossDmg: 1, expBonus: 1, lifesteal: .25 };
const ENH_CAP = { hpPct: 1, soulVessel: .33 };
const ENH_CAT = part => (part === 'weapon' || part === 'sub') ? 'offense' : part === 'charm' ? 'utility' : 'defense';
const GRADE_EN = { basic: 'Basic', advanced: 'Advanced', element: 'Elemental', mythic: 'Mythic', skill: 'Skill' };
const KIND_EN = { adorn: 'Adorn', inscribe: 'Inscribe', carve: 'Carve' }, KIND_ICON = { adorn: '💠', inscribe: '📜', carve: '⚔️' };
const TIER_EN = { normal: 'Normal', fine: 'Fine', master: 'Masterwork', god: 'Divine' };
const enhPool = (kind, part) => enhance.POOLS[ENH_CAT(part)].filter(e => kind === 'carve' || e.grade !== 'skill');
const enhKey = e => e.skill ? 'skill:' + e.skill : e.stat + ':' + e.grade;
const enhLabel = e => e.skill ? 'Skill · ' + (skills[e.skill]?.en || skills[e.skill]?.name || e.skill) : `${GRADE_EN[e.grade]} · ${STAT_EN[e.stat] || e.stat}`;
const enhRange = (e, kind, tier) => { const k = enhance.KIND_MULT[kind] ?? 1, t = enhance.TIERS[tier]?.mult ?? 1; return [e.range[0] * k * t, e.range[1] * k * t]; };
const r4 = v => Math.round(v * 1e4) / 1e4;
// value of a main stat / trait line at quality q (0 = worst roll, 1 = best roll)
function mainVal(def, rar, lv, q){
  const stat = def.stat, [lo, hi] = def.range, mid = (lo + hi) / 2, frac = lo + (mid - lo) * q, m = equipData.META[stat];
  if (stat === 'skillAoe') return Math.min(1, equipData.AOE_MEAN[rar]);
  if (m.flat) return flatValue(stat, frac, rar, lv);
  const v = r3(frac * VALUE_MULT[rar] * lvMultFor(stat, lv)); return typeof m.cap === 'number' ? Math.min(m.cap, v) : v;
}
function traitVal(stat, rar, lv, q){
  const m = equipData.META[stat]; if (!m || stat === 'skillAoe') return 0; const [lo, hi] = m.base, frac = lo + (hi - lo) * q;
  if (m.flat) return flatValue(stat, frac, rar, lv);
  const mult = UNIQUE_POOL.includes(stat) ? lvMultFor(stat, lv) : VALUE_MULT[rar] * lvMultFor(stat, lv); const v = r3(frac * mult); return typeof m.cap === 'number' ? Math.min(m.cap, v) : v;
}
const charmPool = rar => CHARM_BASE_POOL.filter(d => !['dropBonus', 'chestBonus'].includes(d.stat) || RAR_ORDER.indexOf(rar) >= RAR_ORDER.indexOf('arcana'));
const RAR_ORDER = ['common', 'rare', 'ultra', 'legend', 'immortal', 'arcana', 'beyond', 'century', 'cosmic', 'celestial'];
const kindOf = (slot, role) => slot === 'weapon' ? ROLE_WEAPONS[role].weapon.toLowerCase() : slot === 'sub' ? ROLE_WEAPONS[role].sub.toLowerCase() : slot.startsWith('charm') ? ['ring', 'earring', 'necklace'][+slot.slice(5) - 1] : slot;
const mainDef = (slot, role, it) => PART_OF(slot) === 'charm' ? (charmPool(it.rar)[it.base ?? 0] || charmPool(it.rar)[0]) : slot === 'sub' ? ROLE_SUB_POOL[role][Math.min(it.base ?? 0, ROLE_SUB_POOL[role].length - 1)] : BASE_BY_PART[slot];
// trait options for line i: legend+ always has one unique line (line 1); the others come from the normal pool, never repeating the base stat or another line
const traitOptions = (it, base, i) => { const uq = UNIQ_TIERS.includes(it.rar); if (uq && i === 0) return UNIQUE_POOL.filter(x => x !== base); const taken = it.lines.map((l, j) => j !== i && l ? l.stat : null); return NORMAL_POOL.filter(x => x !== base && !taken.includes(x)); };
const newItem = (slot, rar = 'celestial', lv = 150) => ({ rar, lv, set: '', base: 0, mq: 1, lines: [], enh: [] });
const num = v => (Number.isFinite(+v) ? +v : 0);
export default function Simulator(){
  const { id } = useParams(); const s = speciesById[id]; const assets = useAssets();
  const [c, setC] = useState({ lv: LEVEL_CAP, iv: 1, aw: 0, plus: 0, pin: false, job: '', dexAtk: 0, dexHp: 0, perkAtk: 0, perkHp: 0 });
  const [gear, setGear] = useState({});
  const [tal, setTal] = useState(null);
  const [berry, setBerry] = useState({});
  if (!s) return <p>Tasmon not found. <Link to="/tasmons">Back to the list</Link></p>;
  const role = roleOf(s, c.job), setC1 = (k, v) => setC({ ...c, [k]: v });
  const upd = (slot, fn) => setGear(g => { const it = g[slot]; if (!it) return g; const n = { ...it }; fn(n); return { ...g, [slot]: n }; });
  const roleSets = setsData.filter(x => x.role === role);
  const calc = useMemo(() => {
    const sum = {}, add = (st, v) => { sum[st] = (sum[st] || 0) + v; }, enh = {}, parts = {};
    const items = SLOTS.map(([k]) => [k, gear[k]]).filter(([, it]) => it);
    for (const [k, it] of items) {
      const def = mainDef(k, role, it); add(def.stat, mainVal(def, it.rar, it.lv, it.mq));
      it.lines.slice(0, LINES[it.rar]).forEach(l => add(l.stat, traitVal(l.stat, it.rar, it.lv, l.q)));
      (enhance.LADDER[it.rar] || []).forEach((kind, i) => { const e = it.enh[i]; if (!e) return; const en = enhPool(kind, PART_OF(k)).find(x => enhKey(x) === e.opt); if (!en || !en.range) return; const [a, b] = enhRange(en, kind, e.tier); enh[en.stat] = (enh[en.stat] || 0) + a + (b - a) * e.q; });
      if (it.set && PART_OF(k) !== 'charm') (parts[it.set] ||= new Set()).add(k);
    }
    if (tal) tal.lines.slice(0, TAL_COUNT[tal.rar]).forEach(l => { if (l) add(l.stat, talVal(l.stat, tal.rar, l.q)); });
    for (const b of BERRY) { const v = Math.min(berryCap(b, s.rarity), Math.max(0, num(berry[b[0]]))); if (v) add(b[0], v); }
    const setInfo = [];
    for (const [sid, ps] of Object.entries(parts)) { const d = setsData.find(x => x.id === sid), n = ps.size; if (!d) continue;
      if (n >= 2) d.two.forEach(o => add(o.stat, o.value)); if (n >= 4) d.four.forEach(o => add(o.stat, o.value)); setInfo.push({ d, n }); }
    for (const [st, v] of Object.entries(enh)) add(st, ENH_CAP[st] != null ? Math.min(ENH_CAP[st], v) : v);
    const jm = jobById[c.job]?.stat || {}; const fromJob = { ...jm };
    const base = statsOf(s, { lv: c.lv, iv: c.iv, aw: c.aw, plus: c.plus, pinnacle: c.pin, job: c.job });
    const pk = (sum.atkPct || 0), ph = (sum.hpPct || 0), da = 1 + c.dexAtk / 100, dh = 1 + c.dexHp / 100, ka = Math.pow(1.01, c.perkAtk), kh = Math.pow(1.011, c.perkHp);
    const atk = base.atk * (1 + pk) * ka * da + (sum.atkFlat || 0) * da, hp = base.hp * (1 + ph) * kh * dh + (sum.hpFlat || 0) * dh;
    const base0 = { atk: base.atk * ka * da, hp: base.hp * kh * dh };
    const other = {}; for (const [st, v] of Object.entries(sum)) if (!['atkFlat', 'hpFlat', 'atkPct', 'hpPct'].includes(st)) other[st] = v;
    for (const [st, v] of Object.entries(fromJob)) other[st] = (other[st] || 0) + v;
    return { atk, hp, base0, other, setInfo, sum };
  }, [gear, c, s, role, tal, berry]);
  const fill = () => {
    const g = {}; const best = roleSets.filter(x => x.rarity === 'celestial')[0] || roleSets[roleSets.length - 1];
    const favEnh = { offense: ['atkPct:basic', 'critDmg:basic'], defense: ['hpPct:advanced', 'hpPct:basic'], utility: ['atkSpeed:mythic', 'cdr:advanced'] };
    for (const [k] of SLOTS) { const it = newItem(k, best?.rarity || 'celestial', 150); it.set = !k.startsWith('charm') && best ? best.id : '';
      const base = mainDef(k, role, it).stat, order = [...ROLE_TRAIT_POOL[role], ...NORMAL_POOL].filter((x, i, a) => a.indexOf(x) === i);
      it.lines = Array.from({ length: LINES[it.rar] }, (_, i) => { const opts = traitOptions({ ...it, lines: it.lines }, base, i); const used = new Set(it.lines.filter(Boolean).map(l => l.stat)); const st = i === 0 && UNIQ_TIERS.includes(it.rar) ? (opts.includes('skillPower') && role === 'heal' ? 'skillPower' : opts.includes('atkSpeed') ? 'atkSpeed' : opts[0]) : order.find(x => opts.includes(x) && !used.has(x)); const l = st ? { stat: st, q: 1 } : undefined; it.lines[i] = l; return l; });
      it.enh = (enhance.LADDER[it.rar] || []).map((kind, i) => { const pool = enhPool(kind, PART_OF(k)), want = favEnh[ENH_CAT(PART_OF(k))]; const e = pool.find(x => x.stat && want.includes(x.stat + ':' + x.grade)) || pool.find(x => x.stat); return { opt: enhKey(e), tier: 'god', q: 1 }; });
      g[k] = it; }
    setGear(g);
  };
  const g = x => x.toLocaleString('en-US', { maximumFractionDigits: 0 });
  const pctGain = (a, b) => b > 0 ? '+' + Math.round((a / b - 1) * 1000) / 10 + '%' : '';
  const SetOpt = ({ list }) => list.map((o, i) => <span key={i} className="tag">{STAT_EN[o.stat] || o.stat} {fmtStat(o.stat, o.value)}</span>);
  return (<>
    <p className="crumb"><Link to={'/tasmons/' + s.id}>← Back to {s.id}</Link></p>
    <h1>Simulator · <TasmonName s={s} /></h1>
    <p>Set the Tasmon’s level, awakening, job and equipment to see its final ATK and HP, using the same formulas as the game. Gear values follow the game’s roll ranges; “Roll quality” goes from the worst possible roll (0%) to the best (100%). Species passives and Hero Growth are not included.</p>
    <div className="simgrid">
    <div className="simleft">
    <section className="card"><h2>Tasmon</h2>
      <div className="grid2s">
        <label className="fld"><span>Level {c.lv}</span><input type="range" min="1" max={LEVEL_CAP} value={c.lv} onChange={e => setC1('lv', +e.target.value)} /></label>
        <label className="fld"><span>IV {Math.round(c.iv * 100)}%</span><input type="range" min={IV_MIN * 100} max={IV_MAX_BRED * 100} value={c.iv * 100} onChange={e => setC1('iv', +e.target.value / 100)} /></label>
        <label className="fld"><span>Awakening</span><select value={c.aw} onChange={e => setC1('aw', +e.target.value)}>{[0, 1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n === 0 ? 'None' : '★'.repeat(n)}</option>)}</select></label>
        <label className="fld"><span>Plus (+{c.plus})</span><input type="range" min="0" max={PLUS_CAP} value={c.plus} onChange={e => setC1('plus', +e.target.value)} /></label>
        <label className="fld chk"><input type="checkbox" checked={c.pin} onChange={e => setC1('pin', e.target.checked)} /> <span>Pinnacle “Solid” (×1.15)</span></label>
        <label className="fld"><span>DEX bonus ATK % (max 12)</span><input type="number" min="0" max="12" step="0.1" value={c.dexAtk} onChange={e => setC1('dexAtk', Math.max(0, Math.min(12, num(e.target.value))))} /></label>
        <label className="fld"><span>DEX bonus HP % (max 12)</span><input type="number" min="0" max="12" step="0.1" value={c.dexHp} onChange={e => setC1('dexHp', Math.max(0, Math.min(12, num(e.target.value))))} /></label>
        <label className="fld"><span>Sphere ATK nodes (×1.01 each)</span><input type="number" min="0" max="60" value={c.perkAtk} onChange={e => setC1('perkAtk', Math.max(0, Math.min(60, Math.round(num(e.target.value)))))} /></label>
        <label className="fld"><span>Sphere HP nodes (×1.011 each)</span><input type="number" min="0" max="60" value={c.perkHp} onChange={e => setC1('perkHp', Math.max(0, Math.min(60, Math.round(num(e.target.value)))))} /></label>
      </div>
      <label className="fld"><span>Job</span><JobPicker value={c.job} onChange={v => setC1('job', v)} jobs={jobs} label={j => `${jobName(j)} · T${j.tier}${j.rare ? ' · Rare' : ''}${j.hidden ? ' · Hidden' : ''}`} /></label>
      <p className="mut small">Role used for gear: <b>{ROLE_EN[role]}</b> (follows the job).</p>
    </section>
    <section className="card"><div className="row sb"><h2>Equipment</h2><span><button className="btn sm" onClick={fill}>Fill with best gear</button> <button className="btn sm" onClick={() => setGear({})}>Clear</button></span></div>
      {SLOTS.map(([k, label], si) => { const it = gear[k], part = PART_OF(k), def = it ? mainDef(k, role, it) : null, unl = part === 'charm' ? CHARM_SLOT_UNLOCK[+k.slice(5) - 1] : null;
        return (<div key={k} className="slot" style={it ? { '--rc': RARITY_COLOR[it.rar] } : undefined}>
          <div className="row sb"><b className="slotname"><Img art={gearKindArts(kindOf(k, role), it?.rar || 'celestial')} size={44} alt={label} className="mini" /> {label}{it && k === 'weapon' || it && k === 'sub' ? <span className="mut small"> · {ROLE_WEAPONS[role][k]}</span> : null}</b>{unl && <span className="mut small">slot unlocks at Lv {unl}</span>}
            {it ? <button className="btn sm" onClick={() => setGear(g => { const n = { ...g }; delete n[k]; return n; })}>Remove</button> : <button className="btn sm" onClick={() => setGear(g => ({ ...g, [k]: newItem(k) }))}>+ Add item</button>}</div>
          {it && <>
            <div className="grid2s">
              <label className="fld"><span>Rarity</span><select value={it.rar} onChange={e => upd(k, n => { n.rar = e.target.value; n.lines = n.lines.slice(0, LINES[n.rar]); n.enh = n.enh.slice(0, (enhance.LADDER[n.rar] || []).length); n.base = 0; if (n.set && setsData.find(x => x.id === n.set)?.rarity !== n.rar) n.set = ''; })}>{Object.keys(VALUE_MULT).map(r => <option key={r} value={r}>{RARITY_EN[r]}</option>)}</select></label>
              <label className="fld"><span>Item level</span><select value={it.lv} onChange={e => upd(k, n => { n.lv = +e.target.value; })}>{EQUIP_LV_TIERS.map(l => <option key={l} value={l}>{l}</option>)}</select></label>
              {(k === 'sub' || part === 'charm') && <label className="fld"><span>Base stat</span><select value={it.base} onChange={e => upd(k, n => { n.base = +e.target.value; n.lines = n.lines.map(l => l && l.stat === mainDef(k, role, n).stat ? undefined : l); })}>{(k === 'sub' ? ROLE_SUB_POOL[role] : charmPool(it.rar)).map((d, i) => <option key={i} value={i}>{STAT_EN[d.stat]}</option>)}</select></label>}
              {part !== 'charm' && <label className="fld"><span>Set</span><select value={it.set} onChange={e => upd(k, n => { n.set = e.target.value; const d = setsData.find(x => x.id === n.set); if (d) { n.rar = d.rarity; n.lines = n.lines.slice(0, LINES[n.rar]); n.enh = n.enh.slice(0, (enhance.LADDER[n.rar] || []).length); } })}><option value="">None</option>{roleSets.map(x => <option key={x.id} value={x.id}>{x.en} ({RARITY_EN[x.rarity]})</option>)}</select></label>}
            </div>
            <label className="fld"><span>Base stat: {STAT_EN[def.stat]} <b>{fmtStat(def.stat, mainVal(def, it.rar, it.lv, it.mq))}</b> · roll {Math.round(it.mq * 100)}%</span><input type="range" min="0" max="100" value={it.mq * 100} onChange={e => upd(k, n => { n.mq = +e.target.value / 100; })} /></label>
            <div className="small"><b>Trait lines</b> <span className="mut">({LINES[it.rar]} at {RARITY_EN[it.rar]}{UNIQ_TIERS.includes(it.rar) ? ' · line 1 is always a unique trait' : ''})</span></div>
            {LINES[it.rar] === 0 ? <p className="mut small">Common gear has no trait lines.</p> : Array.from({ length: LINES[it.rar] }, (_, i) => { const l = it.lines[i], opts = traitOptions(it, def.stat, i);
              return (<div key={i} className="row line"><span className="mut small">{i === 0 && UNIQ_TIERS.includes(it.rar) ? 'Unique' : 'Trait'}</span><select value={l?.stat || ''} onChange={e => upd(k, n => { n.lines = [...n.lines]; n.lines[i] = e.target.value ? { stat: e.target.value, q: n.lines[i]?.q ?? 1 } : undefined; })}><option value="">— empty —</option>{opts.map(st => <option key={st} value={st}>{STAT_EN[st]}</option>)}{l && !opts.includes(l.stat) && <option value={l.stat}>{STAT_EN[l.stat]}</option>}</select>
                {l && <><input type="range" min="0" max="100" value={l.q * 100} onChange={e => upd(k, n => { n.lines = [...n.lines]; n.lines[i] = { ...n.lines[i], q: +e.target.value / 100 }; })} /><b>{fmtStat(l.stat, traitVal(l.stat, it.rar, it.lv, l.q))}</b></>}</div>); })}
            {(enhance.LADDER[it.rar] || []).length > 0 ? <>
              <div className="small"><b>Enhancements</b> <span className="mut">({enhance.LADDER[it.rar].length} slots at {RARITY_EN[it.rar]} · {{ offense: 'attack pool', defense: 'defense pool', utility: 'utility pool' }[ENH_CAT(part)]})</span></div>
              {enhance.LADDER[it.rar].map((kind, i) => { const pool = enhPool(kind, part), e = it.enh[i], en = e && pool.find(x => enhKey(x) === e.opt), rg = en?.range ? enhRange(en, kind, e.tier) : null;
                return (<div key={i} className="row line"><span className="small" title={KIND_EN[kind]}>{KIND_ICON[kind]} {KIND_EN[kind]}</span>
                  <select value={e?.opt || ''} onChange={ev => upd(k, n => { n.enh = [...n.enh]; n.enh[i] = ev.target.value ? { opt: ev.target.value, tier: n.enh[i]?.tier || 'normal', q: n.enh[i]?.q ?? 1 } : undefined; })}><option value="">— empty —</option>{pool.map(x => <option key={enhKey(x)} value={enhKey(x)}>{enhLabel(x)}{x.range ? ` (${fmtStat(x.stat, r4(enhRange(x, kind, 'normal')[0]))}–${fmtStat(x.stat, r4(enhRange(x, kind, 'normal')[1]))})` : ''}</option>)}</select>
                  {e && en?.range && <><select value={e.tier} onChange={ev => upd(k, n => { n.enh = [...n.enh]; n.enh[i] = { ...n.enh[i], tier: ev.target.value }; })}>{Object.entries(enhance.TIERS).map(([t, d]) => <option key={t} value={t}>{TIER_EN[t]} ×{d.mult}</option>)}</select>
                    <input type="range" min="0" max="100" value={e.q * 100} onChange={ev => upd(k, n => { n.enh = [...n.enh]; n.enh[i] = { ...n.enh[i], q: +ev.target.value / 100 }; })} /><b>{fmtStat(en.stat, r4(rg[0] + (rg[1] - rg[0]) * e.q))}</b></>}
                  {e && en && !en.range && <span className="mut small">Grants this skill to the Tasmon wearing the item.</span>}</div>); })}</> : <p className="mut small">Enhancement slots start at Legend rarity.</p>}
          </>}
        </div>); })}
    </section>
    <section className="card"><div className="row sb"><h2><Img art={elemArts(s.element)} size={34} alt={s.element} /> Talisman</h2>{tal ? <button className="btn sm" onClick={() => setTal(null)}>Remove</button> : <button className="btn sm" onClick={() => setTal({ rar: 'celestial', lines: [] })}>+ Add talisman</button>}</div>
      <p className="mut small">One talisman per Tasmon, always of its own element ({s.element}). Each line is a different stat; the number of lines depends on rarity.</p>
      {tal && <><label className="fld"><span>Rarity</span><select value={tal.rar} onChange={e => setTal({ ...tal, rar: e.target.value, lines: tal.lines.slice(0, TAL_COUNT[e.target.value]) })}>{Object.keys(TAL_COUNT).map(r => <option key={r} value={r}>{RARITY_EN[r]} ({TAL_COUNT[r]} lines)</option>)}</select></label>
        {Array.from({ length: TAL_COUNT[tal.rar] }, (_, i) => { const l = tal.lines[i], taken = tal.lines.map((x, j) => j !== i && x ? x.stat : null), opts = TAL_STATS.filter(st => !taken.includes(st) && talData[st][tal.rar]);
          return (<div key={i} className="row line"><select value={l?.stat || ''} onChange={e => { const n = [...tal.lines]; n[i] = e.target.value ? { stat: e.target.value, q: l?.q ?? 1 } : undefined; setTal({ ...tal, lines: n }); }}><option value="">— empty —</option>{opts.map(st => <option key={st} value={st}>{STAT_EN[st] || st}</option>)}</select>
            {l && <><input type="range" min="0" max="100" value={l.q * 100} onChange={e => { const n = [...tal.lines]; n[i] = { ...l, q: +e.target.value / 100 }; setTal({ ...tal, lines: n }); }} /><b>{fmtStat(l.stat, talVal(l.stat, tal.rar, l.q))}</b></>}</div>); })}</>}
    </section>
    <section className="card"><div className="row sb"><h2>{[1, 2, 3, 4, 5].map(g => <Img key={g} art={['ui/berry/' + s.element + '_' + g + '.png']} size={30} alt={'berry ' + g} />)} Elemental berries</h2><span><button className="btn sm" onClick={() => setBerry(Object.fromEntries(BERRY.map(b => [b[0], berryCap(b, s.rarity)])))}>Max all</button> <button className="btn sm" onClick={() => setBerry({})}>Clear</button></span></div>
      <p className="mut small">Berries of the Tasmon’s element add a little to these stats, each with a cap that depends on rarity ({RARITY_EN[s.rarity]} here). Enter the total bonus from berries already used on it.</p>
      <div className="grid2s">{BERRY.map(b => { const cap = berryCap(b, s.rarity), pct = !b[2]; return (<label key={b[0]} className="fld"><span>{b[1]} <span className="mut small">(cap {pct ? +(cap * 100) + '%' : cap.toLocaleString('en-US')})</span></span>
        <input type="number" min="0" step={pct ? 0.1 : 100} value={berry[b[0]] == null ? '' : pct ? +(berry[b[0]] * 100).toFixed(2) : berry[b[0]]} placeholder="0" onChange={e => { const v = Math.max(0, num(e.target.value)) / (pct ? 100 : 1); setBerry({ ...berry, [b[0]]: Math.min(cap, v) }); }} /></label>); })}</div>
    </section>
    </div>
    <aside className="simright"><section className="card simres">
      <div className="pv"><ArtViewer getArt={monGetArt(s)} fallback={monArts(s)} assets={assets} size={140} thumb={44} label={s.id} /></div>
      <h2>Result</h2>
      <table className="tbl small"><thead><tr><th></th><th>No gear</th><th>With gear</th></tr></thead><tbody>
        <tr><td><b>ATK</b></td><td>{g(calc.base0.atk)}</td><td><b>{g(calc.atk)}</b> <span className="mut">{pctGain(calc.atk, calc.base0.atk)}</span></td></tr>
        <tr><td><b>Max HP</b></td><td>{g(calc.base0.hp)}</td><td><b>{g(calc.hp)}</b> <span className="mut">{pctGain(calc.hp, calc.base0.hp)}</span></td></tr></tbody></table>
      <h3>Gear totals</h3>
      <div className="small">{['atkPct', 'hpPct', 'atkFlat', 'hpFlat'].filter(k => calc.sum[k]).map(k => <div key={k} className="row sb"><span>{STAT_EN[k]}</span><b>{fmtStat(k, calc.sum[k])}</b></div>)}</div>
      <h3>Other stats</h3>
      <div className="small">{Object.entries(calc.other).filter(([, v]) => v).map(([k, v]) => { const cap = CAPS[k], over = cap != null && v > cap; return <div key={k} className="row sb"><span>{STAT_EN[k] || k}</span><b>{fmtStat(k, over ? cap : v)}{over && <span className="mut"> (capped; raw {fmtStat(k, v)})</span>}</b></div>; })}
        {Object.keys(calc.other).length === 0 && <span className="mut">None yet.</span>}</div>
      {calc.setInfo.length > 0 && <><h3>Set bonuses</h3>{calc.setInfo.map(({ d, n }) => (<div key={d.id} className="small"><b>{d.en}</b> <span className="mut">· {n} piece{n === 1 ? '' : 's'}</span>
        <div>{n >= 2 ? <SetOpt list={d.two} /> : <span className="mut">2 pieces: {d.two.map(o => STAT_EN[o.stat] + ' ' + fmtStat(o.stat, o.value)).join(', ')}</span>}</div>
        <div>{n >= 4 ? <><SetOpt list={d.four} /><div>✦ {d.special.desc}</div></> : <span className="mut">4 pieces: {d.four.map(o => STAT_EN[o.stat] + ' ' + fmtStat(o.stat, o.value)).join(', ')} + special</span>}</div></div>))}</>}
      <p className="mut small">Enhancements: HP % is capped at 100% and Soul Vessel at 33% by the game. The game’s party-wide caps for attack speed, boss damage, EXP and lifesteal are applied per Tasmon here; other stats are shown uncapped, and later difficulty tiers lift some caps.</p>
    </section></aside>
    </div>
  </>);
}
