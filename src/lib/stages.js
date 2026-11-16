// Stage tables: ported from the game's difficulty / stage curves (mob values as the in-game tooltip shows them).
export const PH = (() => {
  const HP_A = [[1,30],[5,190],[10,550],[30,2300],[60,8500],[100,22e3],[130,29500],[160,103e3],[200,139e3],[250,263e3],[300,337e3],[350,65e4],[400,761e3]];
  const ATK_A = [[1,7],[10,30],[30,90],[60,350],[100,1100],[130,2600],[160,5200],[200,6200],[250,13400],[300,14900],[350,19900],[400,20500]];
  const BASE_REC = 35424, STAGES_PER = 100, BASE_COUNT = 4, STAGES_PER_ACT = 10, KILLS = 30;
  const LADDER = [['normal','Normal','ノーマル','#8ab8ff',null,2e9],['nightmare','Nightmare','ナイトメア','#b08aff',null,4e9],['hell','Hell','ヘル','#ff8a5a',null,8e9],['torment','Torment','トーメント','#ff5a8a',null,12e9],['abyss','Abyss','アビス','#6ad8ff',1123e3,16e9],['catastrophe','Catastrophe','カタストロフ','#ffd76a',3552e3,2e10],['inferno','Inferno','インフェルノ','#ff7a3a',11234e3,24e9],['apocalypse','Apocalypse','アポカリプス','#c86aff',3553e4,28e9],['armageddon','Armageddon','アルマゲドン','#ff4a4a',188494e3,35e9],['oblivion','Oblivion','オブリビオン','#9aa0ff',1e9,45e9]];
  const MARK = ['Ⅰ','Ⅱ'], T2_RELEASED = 4;
  const DIFFS = [];
  for (let t = 0; t < 2; t++) { const len = t === 0 ? LADDER.length : Math.min(LADDER.length, T2_RELEASED);
    for (let i = 0; i < len; i++) { const L = LADDER[i]; DIFFS.push({ id: DIFFS.length, tier: t, slot: i, name: L[1] + ' ' + MARK[t], jp: L[2] + MARK[t], color: L[3], clear: t === 0 ? L[4] : L[5] }); } }
  const tierAnchors = (bv, br) => { const o = []; for (const d of DIFFS) if (d.clear > 0) o.push([(d.id + 1) * STAGES_PER, Math.round(bv * (d.clear / br))]); return o; };
  HP_A.push(...tierAnchors(HP_A[HP_A.length - 1][1], BASE_REC)); ATK_A.push(...tierAnchors(ATK_A[ATK_A.length - 1][1], BASE_REC));
  function curve(a, stage){ const s = Math.max(1, stage); let [s0, v0] = a[0]; if (s <= s0) return v0;
    for (let i = 1; i < a.length; i++) { const [s1, v1] = a[i]; if (s <= s1) { const g = Math.pow(v1 / v0, 1 / (s1 - s0)); return v0 * Math.pow(g, s - s0); } [s0, v0] = a[i]; }
    const [sa, va] = a[a.length - 2], [sb, vb] = a[a.length - 1]; const g = Math.pow(vb / va, 1 / (sb - sa)); return vb * Math.pow(g, s - sb); }
  const hpOf = e => Math.round(curve(HP_A, e)), atkOf = e => Math.round(curve(ATK_A, e));
  const GOLD_A = [[1,5],[10,16],[30,60],[60,220],[100,700],[130,1e3],[160,2600],[200,4e3],[250,12e3],[300,17e3],[350,24e3],[400,28e3]], EXP_A = [[1,1],[10,2],[30,4],[60,8],[100,20],[130,40],[160,90],[200,200],[250,500],[300,1e3],[350,2e3],[400,5e3]];
  const goldOf = e => Math.round(curve(GOLD_A, e)), expOf = e => Math.max(1, Math.round(curve(EXP_A, e) * 0.856));
  const ORDER = ['dark','wind','water','light','fire','earth'], DARK_ACTS = 3;
  const elemOf = st => { const act = Math.floor((st - 1) / STAGES_PER_ACT); return act < DARK_ACTS ? 'dark' : ORDER[(act - DARK_ACTS + 1) % ORDER.length]; };
  const ADV = { fire:'wind', wind:'earth', earth:'water', water:'fire', light:'dark', dark:'light' };
  const counterOf = el => Object.keys(ADV).find(a => ADV[a] === el) || null;
  const GM = { 1:{25:'storm',35:'trial',75:'wall'}, 2:{15:'trial',25:'storm',35:'trial',55:'abyss',75:'wall',85:'storm'}, 3:{15:'trial',25:'storm',35:'trial',45:'wall',55:'abyss',75:'wall',85:'storm',95:'abyss'} };
  const GS = { 1:{trial:{off:.5,tk:2},storm:{tk:2.2},wall:{hp:25,atk:1.6,gold:30,exp:26,tk:1.2}}, 2:{trial:{off:.45,tk:2.3},storm:{tk:2.7},wall:{hp:30,atk:1.75,gold:36,exp:31,tk:1.4},abyss:{off:.25,tk:3}}, 3:{trial:{off:.2,tk:2.6},storm:{tk:3.2},wall:{hp:38,atk:1.9,gold:46,exp:40,tk:1.6},abyss:{off:.18,tk:3.8}} };
  const gimmick = (d, st) => { if (d < 1) return null; const kind = (GM[d] || GM[3])[st]; if (!kind) return null; return { kind, ...(GS[d] || GS[3])[kind] }; };
  const ATK_BAND = { 6:[15e5,18e5], 7:[18e5,21e5], 8:[21e5,25e5], 9:[25e5,3e6] }, HP_SCALE = { 6:3, 7:3, 8:5, 9:5 };
  const T = 1e12, M = 1e6;
  const T2_HP = { 0:[150*T,300*T],1:[400*T,1e3*T],2:[1200*T,2e3*T],3:[2200*T,35e3*T] }, T2_ATK = { 0:[8*M,15*M],1:[17*M,22*M],2:[23*M,29*M],3:[30*M,36*M] };
  const bandAt = (b, st) => { const act = Math.max(1, Math.min(10, Math.ceil(st / 10))); return Math.round(b[0] + (b[1] - b[0]) * ((act - 1) / 9)); };
  const tierOf = e => Math.max(0, Math.min(3, Math.floor((e - 1) / 30)));
  function stage(d, st){   // d = id da dificuldade, st = 1..100
    const D = DIFFS[d], eff = d * STAGES_PER + st, extra = d >= BASE_COUNT, mobScale = extra ? 1.5 : 1, gim = gimmick(d, st), boss = st % 10 === 0, wall = gim && gim.kind === 'wall';
    const baseHp = hpOf(eff), baseAtk = atkOf(eff), r = { d, st, eff, elem: elemOf(st), tier: tierOf(eff), gim, boss, wall: !!wall, act: Math.ceil(st / 10), n: ((st - 1) % 10) + 1 };
    r.mob = { hp: baseHp, atk: baseAtk }; r.mobScale = mobScale;   // valores do tooltip do jogo (sem o ×1,5 de combate das dificuldades extras)
    r.gold = goldOf(eff); r.exp = expOf(eff);
    const bossAtk = () => {   // actBossAtkOf + bossAtkMult do jogo
      if (D.tier === 1) return Math.round(bandAt(T2_ATK[D.slot], st));
      if (D.tier === 0 && ATK_BAND[D.slot]) return bandAt(ATK_BAND[D.slot], st);
      let m; if (wall) m = gim.atk; else if (boss) { const skill = D.tier >= 1 || D.slot >= 6; m = (extra ? (skill ? 3 * 1.2 : 3) : 2) * (extra ? .7 : 1); } else m = 1.5;
      return Math.round(baseAtk * m); };
    const bossHp = () => {
      if (wall) return Math.round(baseHp * gim.hp);
      if (boss && D.tier === 1) return bandAt(T2_HP[D.slot], st);
      const scale = D.tier === 0 ? (HP_SCALE[D.slot] || 1) : 1;
      return Math.round(baseHp * (boss ? (extra ? 18 * 3 * scale : 6) : 3)); };
    if (boss || wall) r.big = { hp: bossHp(), atk: bossAtk() }; else r.mini = { hp: bossHp(), atk: bossAtk() };
    return r;
  }
  return { DIFFS, stage, elemOf, counterOf, goldOf, expOf, KILLS, STAGES_PER, BASE_COUNT, tierOf, hpOf, atkOf };
})();
export const TIER_EN = ['Soldier', 'Beast', 'Giant', 'Dragon'];
export const GIM_EN = { trial: ['⚠', 'Elemental Trial'], storm: ['☈', 'Elemental Storm'], wall: ['⚠', 'Wall'], abyss: ['☠', 'Abyssal'] };
export function gimmickText(g, counterEl){
  if (!g) return null; const cut = Math.round((1 - (g.off ?? 1)) * 100), up = Math.round(((g.tk ?? 1) - 1) * 100);
  if (g.kind === 'trial') return `Damage dealt by any element other than ${counterEl} is reduced by ${cut}%. A team with the counter element is required.`;
  if (g.kind === 'storm') return `Damage taken +${up}%. A sturdy team or elemental defense (engraving) is required.`;
  if (g.kind === 'abyss') return `Damage dealt by any element other than ${counterEl} is reduced by ${cut}% and damage taken +${up}%. Impossible without the counter-element attackers and elemental defense.`;
  return `A single, extremely tough enemy (HP ×${g.hp}). Needs a boss-focused team; the reward counts as 1 stage.`;
}
