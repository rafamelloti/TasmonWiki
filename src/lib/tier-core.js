// Tasmon tier list core. Pure functions with no imports, so the wiki and the save editor use the same code.
// Every Tasmon is judged inside its own nature (Attacker / Tank / Healer / Buffer) at the same conditions:
// Lv 150, neutral IV, no awakening, no gear. Tiers come from how far its score sits above or below the average of its nature.
export const TIER_ORDER = ['SS', 'S', 'A', 'B', 'C', 'D', 'E', 'F'];
export function buildTiers(D){
  const { species, skills, meta } = D;
  const GROWTH = { atk: .1, hp: .12 }, FOCUS_FROM = 125, OFF_FOCUS = .5, TANK_HP = 1.3, LV = 150, WINDOW = 30;   // WINDOW: seconds of fighting used to value shields
  const ratios = species.map(s => s.atk / s.hp).filter(Boolean).sort((a, b) => a - b), MEDIAN = ratios[Math.floor(ratios.length / 2)] ?? .15;
  const focusOf = s => (s.atk / s.hp >= MEDIAN ? 'atk' : 'hp');
  const lvMult = (s, stat) => { const per = GROWTH[stat], plain = 1 + (LV - 1) * per; if (focusOf(s) === stat) return plain; return 1 + (FOCUS_FROM - 1) * per + (LV - FOCUS_FROM) * per * OFF_FOCUS; };
  const rarMult = r => { const st = meta.rarity[r]?.stars ?? 1; return st <= 5 ? 1 + (st - 1) * .045 : 1.42 + (st - 6) * .16; };
  const KF = { aoe: 1.35, execute: 1.15, drain: 1.1, single: 1.1 };   // aoe: hits several foes; execute/drain/single: extra effects
  const best = sk => { const t = sk.tiers && sk.tiers.length ? sk.tiers[sk.tiers.length - 1] : null; return { power: t?.power ?? sk.power, cooldown: t?.cooldown ?? sk.cooldown }; };
  const hitsOf = sk => { const m = /hits (\d+) times/i.exec(sk.desc || ''); return m ? +m[1] : 1; };
  const list = species.map(s => {
    const ids = [s.skill, ...(s.extraSkills || [])].filter(id => skills[id]), ss = ids.map(id => ({ id, sk: skills[id], ...best(skills[id]) }));
    let am = 1, hm = 1; for (const x of ss) { am *= x.sk.passive?.atkMult ?? 1; hm *= x.sk.passive?.hpMult ?? 1; }
    const role = s.role, A = s.atk * lvMult(s, 'atk') * rarMult(s.rarity) * am, H = s.hp * (role === 'guard' ? TANK_HP : 1) * lvMult(s, 'hp') * rarMult(s.rarity) * hm;
    let score = 0, metric = '', parts = [];
    if (role === 'nuke') {
      let k = 0; for (const x of ss) if (x.sk.type === 'nuke' && x.cooldown) k += x.power * (x.sk.kind === 'multi' ? hitsOf(x.sk) : 1) * (KF[x.sk.kind] || 1) / x.cooldown;
      score = A * (1 + k); metric = 'Damage / second'; parts = [['ATK', A], ['Skill damage per second', A * k]];
    } else if (role === 'guard') {
      let f = 1; for (const x of ss) { const sk = x.sk; if (sk.type !== 'guard' || !x.cooldown) continue; const up = Math.min(1, (sk.duration || 0) / x.cooldown), p = x.power;
        let g = 1;
        if (sk.kind === 'shield') g = 1 + p * WINDOW / x.cooldown;
        else if (sk.kind === 'taunt') g = 1.25;
        else if (sk.kind === 'single') g = 1.2 / Math.max(.2, 1 - p * up);
        else g = 1 / Math.max(.2, 1 - p * up);
        if (sk.unique && (sk.unique.kind === 'instantrise' || sk.unique.kind === 'deathward')) g *= 1.1;
        f *= g; }
      score = H * f; metric = 'Effective HP'; parts = [['Max HP', H], ['Skill durability bonus', H * (f - 1)]];
    } else if (role === 'heal') {
      let hps = 0, ward = 1; for (const x of ss) { if (x.sk.type !== 'heal' || !x.cooldown) continue; hps += x.power / x.cooldown; if (x.sk.unique && (x.sk.unique.kind === 'deathward' || x.sk.unique.kind === 'revive')) ward = 1.15; if (x.sk.kind === 'revive') ward = 1.15; }
      score = hps * ward; metric = 'Party HP healed / second'; parts = [['Heal per second', hps]];
    } else {
      let u = 0; for (const x of ss) { const sk = x.sk; if (sk.type !== 'buff' || !x.cooldown) continue; const up = Math.min(1, (sk.duration || 0) / x.cooldown);
        let v = x.power * up; if (sk.kind === 'haste' || sk.kind === 'basic') v *= .5; else if (sk.kind === 'critup') v *= .5;
        if (/shield/i.test(sk.desc || '')) v += .03 * up; u += v; }
      score = u + (am - 1) * .25; metric = 'Party damage boost'; parts = [['Average uptime boost', u]];
    }
    return { id: s.id, role, rarity: s.rarity, element: s.element, group: s.group, score: Math.max(1e-6, score), metric, parts, A, H, skillIds: ids };
  });
  // Tiers are assigned inside each nature. SS = far above everyone else (log-score z >= 2.3). The rest are split by position
  // (S top 8%, A next 12%, B 20%, C 24%, D 18%, E 12%, F last 6%); Tasmons with the same score always share a tier.
  const by = {}; for (const e of list) (by[e.role] = by[e.role] || []).push(e);
  const BANDS = [['S', .08], ['A', .20], ['B', .40], ['C', .64], ['D', .82], ['E', .94], ['F', 1.01]];
  for (const arr of Object.values(by)) {
    const ls = arr.map(e => Math.log(e.score)), mean = ls.reduce((a, b) => a + b, 0) / ls.length, sd = Math.sqrt(ls.reduce((a, b) => a + (b - mean) ** 2, 0) / ls.length) || 1;
    arr.forEach((e, i) => { e.z = (ls[i] - mean) / sd; });
    arr.sort((a, b) => b.score - a.score);
    const rest = arr.filter(e => e.z < 2.3).length; let seen = 0, i = 0;
    arr.forEach((e, k) => { e.rank = k + 1; e.of = arr.length; });
    for (const e of arr) if (e.z >= 2.3) e.tier = 'SS';
    const tail = arr.filter(e => e.z < 2.3);
    while (i < tail.length) { let j = i; const key = tail[i].score.toPrecision(4); while (j < tail.length && tail[j].score.toPrecision(4) === key) j++;
      const frac = i / Math.max(1, rest), tier = (BANDS.find(b => frac < b[1]) || BANDS[BANDS.length - 1])[0]; for (let q = i; q < j; q++) tail[q].tier = tier; i = j; }
  }
  return { list, by, byId: Object.fromEntries(list.map(e => [e.id, e])) };
}
