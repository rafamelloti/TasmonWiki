// Save analyzer core. Pure functions, no imports: the wiki passes its data in, and the same source is inlined into the save editor.
// Formulas follow the game's own code (monsterAtk, equipStat, partyCritRate, partyCdr, killsPerSecFromAtk, elementMult ...).
// Anything the game does not expose in the files we have is marked ASSUMPTION below.
export function createAnalyzer(D){
  const { species, skills, jobs, meta, sets, perks, PH } = D;
  const sp = species, jb = jobs, KILLS = 30, MAX_PARTY = 3;
  const GROWTH = { atk: .1, hp: .12 }, FOCUS_FROM = 125, OFF_FOCUS = .5, PLUS_PER = .02, TANK_HP = 1.3, LEVEL_CAP = 150;
  const ratios = Object.values(sp).map(s => s.atk / s.hp).filter(Boolean).sort((a, b) => a - b), MEDIAN = ratios[Math.floor(ratios.length / 2)] ?? .15;
  const focusOf = s => (s.atk / s.hp >= MEDIAN ? 'atk' : 'hp');
  const levelMult = (s, stat, lv) => { const per = GROWTH[stat], plain = 1 + (lv - 1) * per; if (lv <= FOCUS_FROM || focusOf(s) === stat) return plain; return 1 + (FOCUS_FROM - 1) * per + (lv - FOCUS_FROM) * per * OFF_FOCUS; };
  const rarMult = r => { const st = meta.rarity[r]?.stars ?? 1; return st <= 5 ? 1 + (st - 1) * .045 : 1.42 + (st - 6) * .16; };
  const awMult = (aw, k) => aw > 0 ? (meta.awakening.mult[aw]?.[k] ?? 1) : 1;
  const ENH_CAPS = { hpPct: 1, soulVessel: .33 };
  const LEVEL_STEPS = [[400, 100], [600, 115], [800, 120], [1000, 125], [1400, 135], [2000, 150]];
  const levelCapAt = eff => { for (const [end, v] of LEVEL_STEPS) if (eff <= end) return v; return 150; };
  const num = v => (Number.isFinite(+v) ? +v : 0);
  const elemMult = (a, d) => !a || !d ? 1 : meta.elemAdv[a] === d ? meta.elemAdvMult : meta.elemAdv[d] === a ? meta.elemDisMult : 1;
  const BERRY_BASE = ['hpFlat', 'atkFlat'], BERRY_CRIT_CAP = .05;

  // ---- per Tasmon ----
  function gearOf(m){
    const items = (m.equipment || []).filter(Boolean), add = {}, put = (k, v) => { add[k] = (add[k] || 0) + num(v); };
    for (const it of items) for (const o of it.opts || []) put(o.stat, o.value);
    const cnt = {}, seen = {};
    for (const it of items) if (it.setId) { const k = it.setId + '|' + it.part; if (!seen[k]) { seen[k] = 1; cnt[it.setId] = (cnt[it.setId] || 0) + 1; } }
    for (const [id, n] of Object.entries(cnt)) { const d = sets[id]; if (!d) continue; if (n >= 2) for (const o of d.two || []) put(o.stat, o.value); if (n >= 4) for (const o of d.four || []) put(o.stat, o.value); }
    const enh = {};
    for (const it of items) for (const e of it.enhances || []) if (e && e.stat) enh[e.stat] = (enh[e.stat] || 0) + num(e.value);
    for (const [k, v] of Object.entries(enh)) put(k, ENH_CAPS[k] != null ? Math.min(ENH_CAPS[k], v) : v);
    return { add, items, sets: cnt };
  }
  function perksOf(m){
    const add = {}; let atk = 1, hp = 1;
    for (const p of m.perks || []) { const d = perks[p.id]; if (!d) continue; atk *= d[1].atk ?? 1; hp *= d[1].hp ?? 1; for (const [k, v] of Object.entries(d[2] || {})) add[k] = (add[k] || 0) + v; }
    return { add, atk, hp };
  }
  function talOf(m){
    const add = {}, t = m.talisman;
    if (t && Array.isArray(t.opts)) for (const o of t.opts) if (o && o.stat) add[o.stat] = (add[o.stat] || 0) + num(o.value);
    for (const [k, v] of Object.entries(m.berry || {})) if (!BERRY_BASE.includes(k)) add[k] = (add[k] || 0) + Math.max(0, num(v));
    return add;
  }
  function monster(m){
    const s = sp[m.speciesId]; if (!s) return null;
    const g = gearOf(m), pk = perksOf(m), tl = talOf(m), job = jb[m.job], jm = job?.mult || {}, jst = job?.stat || {};
    const iv = m.iv || {}, lv = num(m.level) || 1, aw = num(m.awakening), plus = 1 + PLUS_PER * num(m.plus);
    const pin = m.pinnacle === 'solid' ? meta.pinnacle : {}, pas = skills[s.skill]?.passive || {};
    const role = job?.role ?? s.role;
    const berryAtk = Math.max(0, num(m.berry?.atkFlat)), berryHp = Math.max(0, num(m.berry?.hpFlat));
    const baseAtk = s.atk * levelMult(s, 'atk', lv) * (iv.atk ?? 1) * rarMult(s.rarity) * (pas.atkMult ?? 1) * awMult(aw, 'atk') * (jm.atk ?? 1) * (pin.atk ?? 1);
    const baseHp = s.hp * (role === 'guard' ? TANK_HP : 1) * levelMult(s, 'hp', lv) * (iv.hp ?? 1) * rarMult(s.rarity) * (pas.hpMult ?? 1) * awMult(aw, 'hp') * (jm.hp ?? 1) * (pin.hp ?? 1);
    const A = k => (g.add[k] || 0), T = k => (tl[k] || 0);
    const atk = (baseAtk + berryAtk) * (1 + A('atkPct') + T('atkPct')) * pk.atk * plus + A('atkFlat') + T('atkFlat');
    const hp = (baseHp + berryHp) * (1 + A('hpPct') + T('hpPct')) * pk.hp * plus + A('hpFlat') + T('hpFlat');
    const crit = A('critRate') + (pk.add.critRate || 0) + (jst.critRate || 0), critD = A('critDmg') + (pk.add.critDmg || 0);
    const skp = A('skillPower') + (pk.add.skillPower || 0) + (jst.skillPower || 0) + T('skillPower'), cdr = A('cdr') + (pk.add.cdr || 0) + (jst.cdr || 0);
    const spd = A('atkSpeed') + (pk.add.atkSpeed || 0) + (jst.atkSpeed || 0);
    const dpsGame = atk * (1 + Math.max(0, crit * (iv.crit ?? 1)) * Math.max(0, critD)) * (1 + Math.max(0, skp) / 2) * (1 + Math.max(0, cdr) / 2);   // the game's monDpsEstimate
    return { id: m.id, speciesId: m.speciesId, name: s.id, rarity: s.rarity, element: s.element, role, job: m.job || '', level: lv, awakening: aw, plus: num(m.plus), pinnacle: m.pinnacle || '',
      iv, atk, hp, power: atk + hp / 10, dpsGame, crit, critD, skp, cdr, spd, g, pk, tl, talisman: !!m.talisman, berry: m.berry || {}, skillsEq: m.equippedSkills || [],
      perkPoints: Math.floor(lv * 1.5), perkSpent: m.perkSpent != null ? num(m.perkSpent) : (m.perks?.length ?? 0), slots: g.items.length, raw: m };
  }

  // ---- party ----
  function party(ms, opt){
    const interval = opt.attackInterval || 1;     // ASSUMPTION: base attack interval 1 s (the game's own idle model uses 1 attack per second)
    const n = ms.length || 1, avgIv = k => ms.reduce((a, m) => a + (m.iv?.[k] ?? 1), 0) / n;
    const sum = (f) => ms.reduce((a, m) => a + f(m), 0);
    const eq = k => sum(m => m.g.add[k] || 0), pk = k => sum(m => m.pk.add[k] || 0), jbs = k => sum(m => jb[m.job]?.stat?.[k] || 0), tal = k => sum(m => m.tl[k] || 0);
    const critBase = (.05 + eq('critRate') + pk('critRate') + jbs('critRate')) * avgIv('crit');
    const critRate = Math.min(.5, critBase), berryCrit = Math.min(BERRY_CRIT_CAP, Math.max(0, tal('critRate')));
    const critDmg = Math.min(3, 1.5 + eq('critDmg') + pk('critDmg')) + tal('critDmg');
    const critMult = 1 + (critRate + berryCrit) * (critDmg - 1);
    const spdBase = Math.min(.6, eq('atkSpeed') + pk('atkSpeed') + jbs('atkSpeed')), atkSpeed = spdBase + tal('atkSpeed');
    const hitsPerSec = (1 + atkSpeed) * avgIv('spd') / interval;
    const cdr = Math.min(.5, eq('cdr') + pk('cdr') + jbs('cdr'));
    const PCT = { aoe: Math.min(.6, eq('aoeSkillPct') + tal('aoeSkillPct')), dot: Math.min(.6, eq('dotSkillPct') + tal('dotSkillPct')), single: Math.min(.6, eq('singleSkillPct') + tal('singleSkillPct')) };
    const basicPct = Math.min(.6, eq('basicAtkPct')) + tal('basicAtkPct');
    return { interval, critRate, critBase, berryCrit, critDmg, critMult, spdBase, atkSpeed, hitsPerSec, cdr, PCT, basicPct, avgSpd: avgIv('spd'), avgCrit: avgIv('crit') };
  }
  function skillDps(m, P){   // ASSUMPTION: damaging skills deal ATK x power per cast (the skill's listed total), once per cooldown, single target
    let tot = 0; const list = [];
    for (const id of m.skillsEq) {
      const sk = skills[id]; if (!sk || sk.type !== 'nuke' || !sk.power) continue;
      const aws = meta.awakening.skill[m.awakening] || { power: 1, cooldown: 1 };
      const pct = P.PCT[sk.kind] || 0, cd = Math.max(.5, (sk.cooldown || 1) * (aws.cooldown || 1) * (1 - P.cdr));
      const dmg = m.atk * sk.power * (aws.power || 1) * (1 + Math.max(0, m.skp) + pct) * P.critMult;
      const d = dmg / cd; tot += d; list.push({ id, dps: d });
    }
    return { total: tot, list };
  }
  function dpsVs(ms, P, elem, gim){   // damage per second against an enemy element, with the elemental-trial penalty when it applies
    const counter = elem ? PH.counterOf(elem) : null; let basic = 0, skill = 0;
    for (const m of ms) {
      let f = elemMult(m.element, elem); if (gim && gim.off != null && m.element !== counter) f *= gim.off;
      basic += m.atk * (1 + P.basicPct) * f; skill += skillDps(m, P).total * f;
    }
    return { basic: basic * P.hitsPerSec * P.critMult, skill };
  }

  // ---- stage times ----
  function stageTimes(ms, P, d, opt){
    const rows = []; let mob = opt.killsPerStage || KILLS;
    for (let st = 1; st <= 100; st++) {
      const r = PH.stage(d, st), scale = r.mobScale || 1, big = r.big || null;
      const e = dpsVs(ms, P, r.elem, r.gim), dps = e.basic + e.skill;
      const hp = (r.boss || r.wall) ? big.hp * scale : r.mob.hp * scale * mob;
      rows.push({ st, elem: r.elem, boss: r.boss, wall: r.wall, gim: r.gim?.kind || '', hp, dps, sec: dps > 0 ? hp / dps : Infinity });
    }
    return rows;
  }

  // ---- main ----
  function analyze(save, opt = {}){
    const out = { ok: false };
    if (!save || !save.monsters) return out;
    const all = Object.values(save.monsters), mons = all.map(monster).filter(Boolean), byId = Object.fromEntries(mons.map(m => [m.id, m]));
    const ids = (save.party || []).filter(id => byId[id]), ms = ids.map(id => byId[id]);
    const dcur = Math.max(0, Math.min(PH.DIFFS.length - 1, num(save.difficulty))), dsel = opt.difficulty != null ? opt.difficulty : dcur;
    const P = party(ms, opt), per = ms.map(m => ({ m, sk: skillDps(m, P) }));
    const basic = P.hitsPerSec * P.critMult * ms.reduce((a, m) => a + m.atk * (1 + P.basicPct), 0);
    const skill = per.reduce((a, x) => a + x.sk.total, 0), dps = basic + skill;
    const rows = ms.length ? stageTimes(ms, P, dsel, opt) : [];
    const acts = Array.from({ length: 10 }, (_, a) => { const rs = rows.slice(a * 10, a * 10 + 10), fin = rs.every(r => isFinite(r.sec)); return { act: a + 1, avg: fin ? rs.reduce((x, r) => x + r.sec, 0) / rs.length : Infinity, total: fin ? rs.reduce((x, r) => x + r.sec, 0) : Infinity, worst: fin ? Math.max(...rs.map(r => r.sec)) : Infinity }; });
    const maxEff = (() => { let b = dcur * 100 + num(save.stage || 1); const md = save.maxStageD || []; for (let d = 0; d < md.length; d++) b = Math.max(b, d * 100 + num(md[d])); return b; })();
    const lvCap = Math.min(LEVEL_CAP, Math.max(100, levelCapAt(maxEff)));
    const counts = { monsters: mons.length, eggs: (save.eggs || []).length, items: (save.items || []).length + (save.storage || []).length, talismans: (save.talismans || []).length };
    const berries = save.berries || {}; let berryTotal = 0; for (const v of Object.values(berries)) for (const n of v || []) berryTotal += num(n);
    // stage progress per difficulty: reached = highest stage opened, cleared = boss stages beaten (a difficulty opens when the previous one's stage 100 is cleared)
    const bc = save.bossClearedD || [], md = save.maxStageD || [];
    const progress = PH.DIFFS.map((df, d) => {
      const cleared = Math.max(0, Math.min(100, num(bc[d]))), reached = Math.max(0, Math.min(100, Math.max(num(md[d]), d === dcur ? num(save.stage) : 0)));
      const unlocked = d === 0 || num(bc[d - 1]) >= 100 || cleared > 0 || reached > 1;
      let eta = null; if (ms.length && unlocked && cleared < 100) { const r = stageTimes(ms, P, d, opt); eta = r.filter(x => x.st > cleared).reduce((a, x) => a + x.sec, 0); }
      return { d, id: df.id, name: df.name, color: df.color, unlocked, reached, cleared, done: cleared >= 100, openStages: Math.max(0, reached - cleared), left: 100 - cleared, eta, current: d === dcur };
    });
    const sens = ms.length ? sensitivity(ms, P, dsel, opt, dps) : [];
    const sug = ms.length ? suggestions({ ms, per, P, dps, basic, skill, rows, lvCap, counts, berryTotal, dsel, dcur, save, mons, byId, sens }) : [];
    return { ok: true, progress, difficulty: dsel, current: { difficulty: dcur, stage: num(save.stage || 1), maxEff }, lvCap, party: per.map(x => ({ ...x.m, skillDps: x.sk.total, skillList: x.sk.list })), P, basic, skill, dps, rows, acts, counts, berryTotal, sens, suggestions: sug,
      totals: { atk: ms.reduce((a, m) => a + m.atk, 0), hp: ms.reduce((a, m) => a + m.hp, 0), power: ms.reduce((a, m) => a + m.power, 0), game: ms.reduce((a, m) => a + m.dpsGame, 0) } };
  }
  function sensitivity(ms, P0, d, opt, dps0){
    const E = (mutP, mutM) => { const P = { ...P0, PCT: { ...P0.PCT } }; if (mutP) mutP(P); const list = mutM ? ms.map(m => { const c = { ...m }; mutM(c); return c; }) : ms;
      return P.hitsPerSec * P.critMult * list.reduce((a, m) => a + m.atk * (1 + P.basicPct), 0) + list.reduce((a, m) => a + skillDps(m, P).total, 0); };
    const rel = v => dps0 > 0 ? v / dps0 - 1 : 0, cm = P => { P.critMult = 1 + (P.critRate + P.berryCrit) * (P.critDmg - 1); };
    return [
      { key: 'atk10', gain: rel(E(null, m => { m.atk *= 1.1; })) },
      { key: 'crit', gain: P0.critRate < .5 ? rel(E(P => { P.critRate = .5; cm(P); })) : 0, room: .5 - P0.critRate },
      { key: 'critdmg', gain: rel(E(P => { P.critDmg += .5; cm(P); })) },
      { key: 'spd', gain: P0.spdBase < .6 ? rel(E(P => { P.atkSpeed += .6 - P.spdBase; P.hitsPerSec = (1 + P.atkSpeed) * P.avgSpd / P.interval; })) : 0, room: .6 - P0.spdBase },
      { key: 'cdr', gain: P0.cdr < .5 ? rel(E(P => { P.cdr = .5; })) : 0, room: .5 - P0.cdr },
      { key: 'skill', gain: rel(E(null, m => { m.skp += .5; })) },
    ];
  }
  function suggestions(c){
    const { ms, per, P, rows, lvCap, counts, berryTotal, dcur, save, sens } = c, S = [];
    const add = (sev, key, a = {}) => S.push({ sev, key, ...a });
    if (ms.length < MAX_PARTY) add(3, 'party-small', { n: ms.length, max: MAX_PARTY });
    const low = ms.filter(m => m.level < lvCap);
    if (low.length) add(2, 'level', { cap: lvCap, names: low.map(m => m.name), n: low.length });
    const sphere = ms.filter(m => m.perkPoints - m.perkSpent > 0);
    if (sphere.length) add(2, 'sphere', { names: sphere.map(m => m.name), pts: sphere.reduce((a, m) => a + m.perkPoints - m.perkSpent, 0) });
    const slots = ms.map(m => ({ m, max: 5 + (m.level >= 30 ? 1 : 0) + (m.level >= 45 ? 1 : 0) + (m.level >= 60 ? 1 : 0) })).filter(x => x.m.slots < x.max);
    if (slots.length) add(3, 'slots', { names: slots.map(x => x.m.name), missing: slots.reduce((a, x) => a + x.max - x.m.slots, 0) });
    const noTal = ms.filter(m => !m.talisman);
    if (noTal.length && counts.talismans > 0) add(2, 'talisman', { names: noTal.map(m => m.name), bag: counts.talismans });
    if (berryTotal > 0) add(1, 'berries', { n: berryTotal });
    if (P.critRate < .5) add(1, 'crit', { cur: P.critRate });
    if (P.spdBase < .6) add(1, 'speed', { cur: P.spdBase });
    const worst = per.slice().sort((a, b) => a.m.power - b.m.power)[0];
    if (ms.length > 1 && worst && worst.m.power < ms.reduce((a, m) => a + m.power, 0) / ms.length * .5) add(1, 'weak', { name: worst.m.name });
    const roles = new Set(ms.map(m => m.role));
    if (ms.length >= 3 && !roles.has('guard') && !roles.has('heal')) add(1, 'no-support');
    const sk0 = ms.filter(m => !m.skillsEq.length); if (sk0.length) add(2, 'noskill', { names: sk0.map(m => m.name) });
    const aw = ms.filter(m => m.awakening < (meta.awakenMax ?? 6)); if (aw.length && ms.some(m => m.awakening === 0)) add(1, 'awaken', { names: ms.filter(m => m.awakening === 0).map(m => m.name) });
    const top = sens.filter(x => x.gain > .005).sort((a, b) => b.gain - a.gain)[0]; if (top) add(0, 'top-gain', { what: top.key, gain: top.gain });
    const cur = rows[Math.max(0, num(save.stage || 1) - 1)];
    if (cur && cur.elem && ms.length) { const counter = PH.counterOf(cur.elem), has = ms.some(m => m.element === counter); if (!has && counter) add(1, 'element', { stageElem: cur.elem, counter }); }
    return S.sort((a, b) => b.sev - a.sev);
  }

  // ---- team builder ----
  // teamInfo: everything about one 3-Tasmon team. dps = estimated damage per second (same model as the analyzer).
  // pvp = a heuristic ranked-match rating: sqrt(offence x durability) with healing, shields, damage reduction, buffs, element spread and ranked passives.
  function teamInfo(ms, opt = {}){
    const P = party(ms, opt), e = dpsVs(ms, P, opt.enemyElem || null, null), dps = e.basic + e.skill;
    let hpSum = 0, hps = 0, shield = 0, dr = 0, buff = 0;
    for (const m of ms) {
      hpSum += m.hp; const aws = meta.awakening.skill[m.awakening] || { cooldown: 1 };
      for (const id of m.skillsEq) {
        const sk = skills[id]; if (!sk || !sk.cooldown || !sk.power) continue; const cd = Math.max(.5, sk.cooldown * (aws.cooldown || 1) * (1 - P.cdr)), up = Math.min(1, (sk.duration || 0) / cd);
        if (sk.type === 'heal') hps += sk.power / cd;
        else if (sk.type === 'guard') { if (sk.kind === 'shield') shield += m.hp * sk.power * 30 / cd; else if (sk.kind !== 'taunt') dr += sk.power * up; }
        else if (sk.type === 'buff') { let v = sk.power * up; if (sk.kind === 'haste' || sk.kind === 'basic' || sk.kind === 'critup') v *= .5; buff += v; }
      }
    }
    dr = Math.min(.6, dr);
    const ehp = (hpSum + shield) * (1 + 30 * hps) / (1 - dr), cov = 1 + .05 * (new Set(ms.map(m => m.element)).size - 1), pv = opt.pvp || {};
    const passives = ms.filter(m => pv[m.speciesId]).map(m => m.speciesId);
    const rating = Math.sqrt(dps * (1 + buff) * ehp) * cov * (1 + .04 * passives.length);
    const cost = ms.reduce((a, m) => a + ((opt.cost && opt.cost[m.rarity]) || 0), 0);
    return { ids: ms.map(m => m.id), cost, dps, dpsB: dps * (1 + buff), basic: e.basic, skill: e.skill, hp: hpSum, ehp, hps, shield, dr, buff, cov, passives, rating, P };
  }

  // ---- skill loadouts (game rules: 2 equipped skills; any non-signature skill can be inherited from a Tasmon that knows it) ----
  function skillPool(m, opt = {}){
    const own = sp[m.speciesId], native = new Set([own?.skill, ...(own?.extraSkills || []), ...(m.raw?.learnedSkills || [])].filter(Boolean)), out = [];
    for (const id of Object.keys(skills)) { const k = skills[id]; if (!k || !k.cooldown || !k.power || !k.type) continue;
      if (native.has(id)) { out.push(id); continue; }
      if (opt.transfer === false || k.signature || JOBSK.has(id)) continue;
      if (opt.only && !opt.only.has(id)) continue;
      if (k.speciesOnly && k.speciesOnly !== m.speciesId && opt.exclusive === false) continue;
      out.push(id); }
    return out;
  }
  const withSk = (m, ids) => ({ ...m, skillsEq: ids });
  const scoreOf = (t, mode) => mode === 'pvp' ? t.rating : t.dpsB;
  // Best 2 skills for one Tasmon on its own, then refined inside the team (coordinate descent), so buffs/heals are valued by the party they serve.
  function soloLoadout(m, opt){
    const mode = opt.mode || 'dps', pool = skillPool(m, opt), sc = {};
    for (const id of pool) sc[id] = scoreOf(teamInfo([withSk(m, [id])], opt), mode);
    const top = {}; for (const id of pool) { const t = skills[id].type; (top[t] = top[t] || []).push(id); }
    const cand = []; for (const t of Object.keys(top)) cand.push(...top[t].sort((a, b) => sc[b] - sc[a]).slice(0, 6));
    return { cand, pool, sc };
  }
  // Rare / Hidden jobs hand their job skill to the Tasmon as a 3rd skill. Job skills are therefore not offered as ordinary inheritable skills.
  const RJ = Object.values(jb).filter(j => (j.rare || j.hidden) && j.skill && skills[j.skill]), JOBSK = new Set(RJ.map(j => j.skill));
  const jobSkillOf = id => (id && jb[id] && (jb[id].rare || jb[id].hidden) && skills[jb[id].skill]) ? jb[id].skill : null;
  const remake = (m, job) => { const r = monster({ ...m.raw, job }); return r ? { ...r, id: m.id } : m; };
  function tuneTeam(ms, opt = {}){
    const mode = opt.mode || 'dps', useJobs = !!opt.jobs && mode !== 'pvp', info = ms.map(m => soloLoadout(m, opt));
    const mk = (m, pair) => { const js = jobSkillOf(m.job); return { ...m, jobSkill: js, skillsEq: js ? [...pair, js] : pair }; };
    let cur = ms.map((m, i) => { const c = info[i].cand.slice().sort((a, b) => info[i].sc[b] - info[i].sc[a]); return mk(m, c.slice(0, 2)); });
    const pairOf = m => m.jobSkill ? m.skillsEq.slice(0, -1) : m.skillsEq;
    for (let pass = 0; pass < 3; pass++) { let changed = false;
      for (let i = 0; i < cur.length; i++) {
        let best = scoreOf(teamInfo(cur, opt), mode), pick = cur[i];
        const jobs = useJobs ? [cur[i].job || '', ...RJ.map(j => j.id).filter(id => id !== (cur[i].job || ''))] : [cur[i].job || ''];
        for (const J of jobs) { const same = J === (cur[i].job || ''), base = same ? cur[i] : remake(cur[i], J), c = same ? info[i].cand : info[i].cand.slice().sort((a, b) => info[i].sc[b] - info[i].sc[a]).slice(0, 10);
          const mkJ = (pair) => mk({ ...base, job: J }, pair);
          for (let x = 0; x < c.length; x++) for (let y = x + 1; y < c.length; y++) { const cand = mkJ([c[x], c[y]]), t = cur.slice(); t[i] = cand; const v = scoreOf(teamInfo(t, opt), mode); if (v > best * 1.00001) { best = v; pick = cand; } } }
        if (pick !== cur[i]) { cur[i] = pick; changed = true; } }
      if (!changed) break; }
    return { mons: cur, info: teamInfo(cur, opt) };
  }
  function bestTeams(pool, opt = {}){
    if (opt.tune && !opt._tuned) { const o2 = { ...opt, _tuned: 1, tune: false }; pool = pool.map(m => { const si = soloLoadout(m, opt), c = si.cand.slice().sort((a, b) => si.sc[b] - si.sc[a]); return withSk(m, c.slice(0, 2)); });
      const res = bestTeams(pool, o2); return res.map(t => { const byId = Object.fromEntries(pool.map(m => [m.id, m])), r = tuneTeam(t.ids.map(i => byId[i]), opt); return { ...r.info, loadout: r.mons.map(m => ({ id: m.id, skills: m.skillsEq, job: m.job, jobSkill: m.jobSkill })) }; }).sort((a, b) => scoreOf(b, opt.mode || 'dps') - scoreOf(a, opt.mode || 'dps')); }
    const size = opt.size || 3, top = opt.top || 5, mode = opt.mode || 'dps', key = mode === 'pvp' ? 'rating' : 'dpsB';
    const pick = (f, n) => pool.slice().sort((a, b) => f(b) - f(a)).slice(0, n), set = new Map();
    const heal = m => m.skillsEq.reduce((a, id) => { const k = skills[id]; return a + (k && k.type === 'heal' && k.cooldown ? k.power / k.cooldown : 0); }, 0), buffv = m => m.skillsEq.reduce((a, id) => { const k = skills[id]; return a + (k && k.type === 'buff' && k.cooldown ? k.power * Math.min(1, (k.duration || 0) / k.cooldown) : 0); }, 0);
    for (const m of pick(m => m.dpsGame, mode === 'pvp' ? 22 : 38)) set.set(m.id, m);
    if (mode === 'pvp') { for (const m of pick(m => m.hp, 14)) set.set(m.id, m); for (const m of pick(heal, 8)) set.set(m.id, m); for (const m of pick(buffv, 8)) set.set(m.id, m); }
    const cost = opt.cost || null, cap = opt.cap || Infinity, cOf = m => (cost && cost[m.rarity]) || 0;
    if (cost && isFinite(cap)) for (const k of new Set(pool.map(cOf))) for (const m of pick(m => (m.dpsGame || 0), 8).concat(pool.filter(m => cOf(m) === k).sort((a, b) => b.dpsGame - a.dpsGame).slice(0, 10), pool.filter(m => cOf(m) === k).sort((a, b) => b.hp - a.hp).slice(0, 5))) set.set(m.id, m);
    const c = [...set.values()], out = [];
    const push = t => { out.push(t); if (out.length > top * 6) { out.sort((a, b) => b[key] - a[key]); out.length = top * 3; } };
    const n = c.length, o = { ...opt };
    if (n <= size) { const t = n ? teamInfo(c, o) : null; return t && t.cost <= cap ? [t] : []; }
    const rec = (start, cur, sum) => { if (cur.length === size) { push(teamInfo(cur, o)); return; } for (let i = start; i < n; i++) { const w = sum + cOf(c[i]); if (w > cap) continue; cur.push(c[i]); rec(i + 1, cur, w); cur.pop(); } };
    rec(0, [], 0);
    out.sort((a, b) => b[key] - a[key]); return out.slice(0, top);
  }
  // Ranked match: everyone is Lv 60 with no gear and stats come from the species alone (as shown on the game's ranked cards),
  // so the pool is one entry per owned species at Lv 60, neutral IV, no awakening/job, with the best 2 of its skills equipped.
  function rankedPool(ms){
    const seen = {}, out = [];
    for (const m of ms) { const id = m.speciesId, sp = species[id]; if (!sp || seen[id]) continue; seen[id] = 1;
      const ids = [sp.skill, ...(sp.extraSkills || [])].filter(k => skills[k] && skills[k].cooldown && skills[k].power).sort((a, b) => skills[b].power / skills[b].cooldown - skills[a].power / skills[a].cooldown).slice(0, 2);
      const r = monster({ id: 'r_' + id, speciesId: id, level: 60, equippedSkills: ids }); if (r) { r.id = 'r_' + id; out.push(r); } }
    return out;
  }
  return { analyze, monster, party, elemMult, levelCapAt, PH, teamInfo, bestTeams, rankedPool, skillPool, tuneTeam };
}
