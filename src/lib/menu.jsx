import React from 'react';
import { Img, useAssets, imgUrl } from './img.jsx';
// One entry per wiki section: route, label, accent colour (game element colours) and icon candidates taken from the game's own art.
export const MENU = [
  { to: '/tasmons',   t: 'Tasmons',   c: '#ff8a5a', art: ['icons/egg/legend.png'],        em: '🥚' },
  { to: '/skills',    t: 'Skills',    c: '#ff5a8a', art: ['icons/role/nuke.png'],         em: '⚔️' },
  { to: '/passives',  t: 'Passives',  c: '#5fd68a', art: ['custom/equip/shield.svg'],        em: '🛡️' },
  { to: '/jobs',      t: 'Jobs',      c: '#b08aff', art: ['jobs/samurai.png', 'jobs/evolved/samurai_e1.png'], em: '🎓' },
  { to: '/equipment', t: 'Equipment', c: '#ffd36a', art: ['custom/equip/sword.svg'],       em: '🗡️' },
  { to: '/elements',  t: 'Elements',  c: '#6ad8ff', art: ['custom/element/water.svg'], round: true,     em: '💧' },
  { to: '/dex',       t: 'DEX',       c: '#8ab8ff', art: ['icons/role/summoner.png', 'icons/egg/rare.png'], em: '📖' },
  { to: '/events',    t: 'Events',    c: '#ff6ad8', art: ['icons/egg/celestial.png'],     em: '🎃' },
  { to: '/hunt',      t: 'Hero Hunt', c: '#ff9a4a', art: ['monsters/sigilfox.png'],       em: '🎯' },
  { to: '/tiers',    t: 'Tier List', c: '#ffd24a', art: ['custom/equip/axe.svg'],         em: '🏆' },
  { to: '/analyzer', t: 'Save Analyzer',  c: '#7affb0', art: ['custom/equip/orb.svg'],        em: '📊' },
  { to: '/team-builder', t: 'Team Builder', c: '#ffb86b', art: ['custom/equip/sword.svg'], em: '⚔️' },
  { to: '/tower',     t: 'Tower',     c: '#7ad0ff', art: ['icons/element/wind.png'],      em: '🗼' },
  { to: '/mechanics', t: 'Mechanics', c: '#ffb86a', art: ['custom/equip/staff.svg'],        em: '⚙️' },
  { to: '/stages',    t: 'Stages',    c: '#ff5a5a', art: ['bosses/fire.png'],             em: '☠️' } ];
// Trims transparent margins and re-centres the art on a square canvas, so every menu icon sits centred and uncropped.
function Centered({ art, size, label, round }){
  const [src, setSrc] = React.useState(null), [fail, setFail] = React.useState(false), key = art.join('|');
  React.useEffect(() => {
    setSrc(null); setFail(false); let dead = false, k = 0;
    const load = () => { if (k >= art.length) { setFail(true); return; }
      const im = new Image(); im.onload = () => { if (dead) return;
        try { const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
          const id = x.getImageData(0, 0, c.width, c.height), d = id.data, W = c.width, H = c.height, A = (xx, yy) => d[(yy * W + xx) * 4 + 3];
          // 1) peel the light 1px halo that background removal left around the art
          const kill = []; for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) { const i = (y * W + xx) * 4; if (d[i + 3] > 0 && (d[i] + d[i + 1] + d[i + 2]) / 3 > 205) { const e = xx === 0 || y === 0 || xx === W - 1 || y === H - 1 || A(xx - 1, y) === 0 || A(xx + 1, y) === 0 || A(xx, y - 1) === 0 || A(xx, y + 1) === 0; if (e) kill.push(i + 3); } }
          kill.forEach(i => { d[i] = 0; });
          let x0 = W, y0 = H, x1 = -1, y1 = -1;
          for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) if (d[(y * W + xx) * 4 + 3] > 2) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
          if (x1 < 0) { setSrc(im.src); return; }
          const w = x1 - x0 + 1, h = y1 - y0 + 1;
          x.putImageData(id, 0, 0);
          const S = round ? Math.min(w, h) : Math.max(w, h), o = document.createElement('canvas'); o.width = o.height = S;
          if (round) o.getContext('2d').drawImage(c, x0 + (w - S) / 2, y0 + (h - S) / 2, S, S, 0, 0, S, S); else o.getContext('2d').drawImage(c, x0, y0, w, h, (S - w) / 2, (S - h) / 2, w, h); setSrc(o.toDataURL('image/png'));
        } catch (e) { setSrc(im.src); } };
      im.onerror = () => { k++; load(); }; im.src = imgUrl(art[k]); };
    load(); return () => { dead = true; };
  }, [key, round]);
  if (fail) return <span className="mbadge" style={{ width: size, height: size }}><Img art={art} size={size} alt="" className="micon" label={label} /></span>;
  return <span className={'mbadge' + (round ? ' round' : '')} style={{ width: size, height: size }}>{src && <img className="micon" src={src} alt="" />}</span>;
}
export function MenuIcon({ m, size = 28 }){
  const assets = useAssets(), cand = assets ? m.art.filter(p => p.startsWith('custom/') || assets.has(p)) : m.art;
  return cand.length ? <Centered art={cand} size={size} label={m.em} round={m.round} /> : <span className="memoji" style={{ fontSize: size * .8 }}>{m.em}</span>;
}
// Page banner per section (game backgrounds)
export const BANNER = { '/tiers': 'bg/cave/backdrop.png', '/analyzer': 'bg/cave/backdrop.png', '/team-builder': 'bg/cave/backdrop.png', '/tower': 'bg/snow/backdrop.png', '/updates': 'bg/plains/backdrop.png', '/hunt': 'bg/volcano/backdrop.png', '/stages': 'bg/volcano/backdrop.png', '/events': 'bg/snow/backdrop.png', '/mechanics': 'bg/cave/backdrop.png', '/elements': 'bg/cave/backdrop.png', '/dex': 'bg/plains/backdrop.png' };

// The game's own app icon (build/icon.ico) as the site logo; falls back to a "T" until the images are extracted.
export function BrandLogo(){
  // tries the game's real icon directly (png derived from the .ico first, then the .ico); shows the "T" only if none loads
  const SRC = ['build/icon.png', 'build/icon.ico'];
  const [i, setI] = React.useState(0), [ok, setOk] = React.useState(false);
  return (<>
    {!ok && <span className="logo">T</span>}
    {i < SRC.length && <img className="logo logoimg" style={ok ? undefined : { display: 'none' }} src={imgUrl(SRC[i])} alt="TASMON" width="38" height="38" onLoad={() => setOk(true)} onError={() => setI(i + 1)} />}
  </>);
}
