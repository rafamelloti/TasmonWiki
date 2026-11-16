import React, { useState, useEffect } from 'react';
// Images live in /public/img (copy them there with `npm run assets`). Paths mirror the game's own folders.
const BASE = (import.meta.env.BASE_URL || './') + 'img/';
const CUSTOM = (import.meta.env.BASE_URL || './') + 'custom/';
// 'custom/…' = icons drawn for this wiki (they replace game icon files that ship cut off at the edges)
export const imgUrl = p => p.startsWith('custom/') ? CUSTOM + p.slice(7) : BASE + p;
// Shiny look = hue rotation of the sprite (the game applies SHINY_HUE). Value taken from the game (150°).
export const SHINY_HUE = 150;
export const SEASON_ONLY = new Set(['s1_alicia','s1_sharka','s1_jester','s1_crimson','s1_eggbaron','s1_aquaworm','s1_clubknight','s1_heartknight','s1_noblerab','s1_moonrabbit','s2_candle','s2_ginger','s2_reindeer','s2_penguin','s2_holly','s2_cake','s2_snowking','s2_polarbear','s2_santa','s2_bell']);
export function monArts(sp, { evo = 0, variant = '' } = {}){
  const ids = [sp.id, sp.fb].filter(Boolean), base = id => SEASON_ONLY.has(id) ? `season/cast/${id}.png` : `monsters/${id}.png`, out = [];
  if (variant) ids.forEach(id => out.push(`monsters-variant/${variant}/${id}_s${evo + 1}.png`));
  if (evo > 0) ids.forEach(id => { if (evo >= 2) out.push(`monsters/evolved/${id}_e2.png`); out.push(`monsters/evolved/${id}_e1.png`); });
  ids.forEach(id => out.push(base(id)));
  return out;
}
export const jobArts = (id, evo = 0) => evo >= 2 ? [`jobs/evolved/${id}_e2.png`] : evo === 1 ? [`jobs/evolved/${id}_e1.png`] : [`jobs/${id}.png`, `jobs/evolved/${id}_e1.png`];
export const RAR = ['common','rare','ultra','legend','immortal','arcana','beyond','century','cosmic','celestial'];
export const gearKindArts = (kind, rar) => { const i = RAR.indexOf(rar) + 1; return [`ui/items/${kind}_r${i}.png`, `items/${kind}_${rar}.png`, `custom/equip/${kind}.svg`]; };
export const eggArts = rar => [`icons/egg/${rar}.png`];
export const elemArts = e => [`custom/element/${e}.svg`];
export const roleArts = r => [`icons/role/${r}.png`];
// <Img art={[...]}/> tries each path in order; if none loads it shows a neutral placeholder (site still works without images).
export function Img({ art, alt = '', size = 56, className = '', label, shiny = false }){
  const list = Array.isArray(art) ? art : [art]; const key = list.join('|');
  const [i, setI] = useState(0);
  useEffect(() => { setI(0); }, [key]);
  if (i >= list.length) return <span className={'ph ' + className} style={{ width: size, height: size }} aria-label={alt}>{(label || alt || '?').slice(0, 2)}</span>;
  return <img className={'pic ' + className} style={shiny ? { filter: `hue-rotate(${SHINY_HUE}deg)` } : undefined} src={imgUrl(list[i])} alt={alt} width={size} height={size} loading="lazy" onError={() => setI(i + 1)} />;
}
// public/img/manifest.json (written by `npm run assets`) lists every image that exists; lets pages hide skins that do not exist.
let _m; export function useAssets(){
  const [set, setSet] = useState(_m || null);
  useEffect(() => { if (_m) return; fetch(BASE + 'manifest.json').then(r => r.ok ? r.json() : null).then(a => { if (a) { _m = new Set(a); setSet(_m); } }).catch(() => {}); }, []);
  return set;
}
