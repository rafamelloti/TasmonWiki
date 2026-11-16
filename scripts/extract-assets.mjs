// Copies the game's images out of app.asar into public/img (same sub-folders the site expects) and writes public/img/manifest.json.
// Usage:  npm run assets -- "<path to app.asar, or to the game folder>" [--skip=bg,monsters-anim]
// Typical Windows path: D:\SteamLibrary\steamapps\common\TASMON Taskbar Monsters
// Self-contained asar reader (no dependency on the asar library's path handling, which breaks on Windows).
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const args = process.argv.slice(2), pos = args.filter(a => !a.startsWith('--')), skipArg = args.find(a => a.startsWith('--skip='));
const skip = new Set((skipArg ? skipArg.slice(7) : '').split(',').filter(Boolean));
if (!pos.length) { console.error('Usage: npm run assets -- "<path to app.asar or game folder>" [--skip=bg,monsters-anim]'); process.exit(1); }
let file = pos.join(' ');   // works even if the path was typed without quotes
if (fs.existsSync(file) && fs.statSync(file).isDirectory()) { const c = [path.join(file, 'resources', 'app.asar'), path.join(file, 'app.asar')].find(p => fs.existsSync(p)); if (!c) { console.error('app.asar not found inside that folder.'); process.exit(1); } file = c; }
if (!fs.existsSync(file)) { console.error('File not found: ' + file); process.exit(1); }
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'img'), PFX = 'src/assets/', EXT = /\.(png|webp|jpe?g|gif|svg)$/i;
const fd = fs.openSync(file, 'r'), head = Buffer.alloc(16); fs.readSync(fd, head, 0, 16, 0);
const pickleSize = head.readUInt32LE(4), jsonLen = head.readUInt32LE(12);
if (jsonLen <= 0) { console.error('This does not look like an .asar file.'); process.exit(1); }
const hb = Buffer.alloc(jsonLen); fs.readSync(fd, hb, 0, jsonLen, 16);
const header = JSON.parse(hb.toString('utf8')), base = 8 + pickleSize, entries = [];
(function walk(node, p){ for (const [name, v] of Object.entries(node.files || {})) { const q = p ? p + '/' + name : name; if (v.files) walk(v, q); else if (v.size !== undefined) entries.push({ path: q, size: v.size, offset: v.offset === undefined ? null : base + Number(v.offset), unpacked: !!v.unpacked }); } })(header, '');
const BRAND = new Set(['build/icon.ico']);   // the game's own app icon (used as the site logo / favicon)
const relOf = e => e.path.startsWith(PFX) ? e.path.slice(PFX.length) : e.path;
const wanted = entries.filter(e => BRAND.has(e.path) || (e.path.startsWith(PFX) && EXT.test(e.path) && !skip.has(e.path.slice(PFX.length).split('/')[0])));
function icoToPng(b){ // largest PNG frame inside an .ico (returns null if frames are BMP)
  try { const n = b.readUInt16LE ? b.readUInt16LE(4) : new DataView(b.buffer, b.byteOffset).getUint16(4, true); let best = null;
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    for (let i = 0; i < dv.getUint16(4, true); i++) { const o = 6 + i * 16, w = dv.getUint8(o) || 256, size = dv.getUint32(o + 8, true), off = dv.getUint32(o + 12, true);
      if (dv.getUint32(off, false) === 0x89504e47 && (!best || w > best.w)) best = { w, size, off }; }
    return best ? b.subarray(best.off, best.off + best.size) : null; } catch { return null; }
}
const unpackedDir = file + '.unpacked', manifest = [], failed = []; let bytes = 0;
for (const e of wanted) {
  const rel = relOf(e), dest = path.join(OUT, ...rel.split('/'));
  try {
    let buf;
    if (e.unpacked) buf = fs.readFileSync(path.join(unpackedDir, ...e.path.split('/')));
    else { buf = Buffer.alloc(e.size); fs.readSync(fd, buf, 0, e.size, e.offset); }
    fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, buf); bytes += buf.length; manifest.push(rel);
    if (rel === 'build/icon.ico') { const png = icoToPng(buf); if (png) { fs.writeFileSync(path.join(path.dirname(dest), 'icon.png'), png); manifest.push('build/icon.png'); } }
  } catch (err) { failed.push(rel); }
}
fs.closeSync(fd);
fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest));
if (failed.length) console.log(`Skipped ${failed.length} file(s) that could not be read: ${failed.slice(0, 8).join(', ')}${failed.length > 8 ? ', …' : ''}`);
console.log(`Found ${wanted.length} images in the archive.\nDone: ${manifest.length} images (${(bytes / 1048576).toFixed(1)} MB) -> ${OUT}`);
