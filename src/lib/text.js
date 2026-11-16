// Hepburn-style kana -> romaji so Japanese names are readable in English. Kanji stay as they are (official names).
const K = { あ:'a',い:'i',う:'u',え:'e',お:'o',か:'ka',き:'ki',く:'ku',け:'ke',こ:'ko',さ:'sa',し:'shi',す:'su',せ:'se',そ:'so',た:'ta',ち:'chi',つ:'tsu',て:'te',と:'to',な:'na',に:'ni',ぬ:'nu',ね:'ne',の:'no',は:'ha',ひ:'hi',ふ:'fu',へ:'he',ほ:'ho',ま:'ma',み:'mi',む:'mu',め:'me',も:'mo',や:'ya',ゆ:'yu',よ:'yo',ら:'ra',り:'ri',る:'ru',れ:'re',ろ:'ro',わ:'wa',を:'o',ん:'n',が:'ga',ぎ:'gi',ぐ:'gu',げ:'ge',ご:'go',ざ:'za',じ:'ji',ず:'zu',ぜ:'ze',ぞ:'zo',だ:'da',ぢ:'ji',づ:'zu',で:'de',ど:'do',ば:'ba',び:'bi',ぶ:'bu',べ:'be',ぼ:'bo',ぱ:'pa',ぴ:'pi',ぷ:'pu',ぺ:'pe',ぽ:'po',ゔ:'vu' };
const KY = { き:'ky',し:'sh',ち:'ch',に:'ny',ひ:'hy',み:'my',り:'ry',ぎ:'gy',じ:'j',ぢ:'j',び:'by',ぴ:'py' };
const YO = { ゃ:'a',ゅ:'u',ょ:'o' };
const SM = { ぁ:'a',ぃ:'i',ぅ:'u',ぇ:'e',ぉ:'o' };
const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
export function romaji(src){
  if (!src || !/[぀-ヿ]/.test(src)) return '';
  const s = toHira(src); let out = '', i = 0, dbl = false;
  while (i < s.length) {
    const c = s[i], n = s[i + 1];
    if (c === 'っ') { dbl = true; i++; continue; }
    if (c === 'ー') { const l = out.slice(-1); if ('aiueo'.includes(l)) out += l; i++; continue; }
    let r = null, adv = 1;
    if (KY[c] && YO[n]) { r = KY[c] + (c === 'し' || c === 'ち' || c === 'じ' || c === 'ぢ' ? '' : '') + YO[n]; if ('しちじぢ'.includes(c) && n === 'ゃ') r = KY[c] + 'a'; adv = 2; }
    else if ((c === 'て' || c === 'で') && n && 'ぃぇゃゅょ'.includes(n)) { r = (c === 'て' ? 't' : 'd') + (SM[n] || ('y' + YO[n])); adv = 2; }
    else if ((c === 'ふ' || c === 'ゔ') && SM[n]) { r = (c === 'ふ' ? 'f' : 'v') + SM[n]; adv = 2; }
    else if ((c === 'う') && n === 'ぃ') { r = 'wi'; adv = 2; }
    else if (c === 'し' && n === 'ぇ') { r = 'she'; adv = 2; }
    else if (c === 'ち' && n === 'ぇ') { r = 'che'; adv = 2; }
    else if (c === 'じ' && n === 'ぇ') { r = 'je'; adv = 2; }
    else if (K[c]) r = K[c];
    else r = c;
    if (dbl && /^[a-z]/.test(r)) { r = (r.startsWith('ch') ? 't' : r[0]) + r; dbl = false; } else dbl = false;
    out += r; i += adv;
  }
  return out.replace(/n(?=[bmp])/g, 'm').replace(/(^|[^a-z])([a-z])/g, (m, a, b) => a + b.toUpperCase()).replace(/([a-z])(?=[A-Z])/g, '$1');
}
export const fmtNum = n => (Math.abs(n) >= 1000 ? Math.round(n).toLocaleString('en-US') : String(Math.round(n * 100) / 100));
export function fmtBig(n){ if (n < 1e6) return Math.round(n).toLocaleString('en-US'); for (const [v, s] of [[1e15, 'Qa'], [1e12, 'T'], [1e9, 'B'], [1e6, 'M']]) if (n >= v) return String(+(n / v).toFixed(2)) + s; return String(n); }
export const pct = (v, d = 1) => (Math.round(v * 100 * 10 ** d) / 10 ** d) + '%';
export const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;

// Display name: English (or romanized reading) is the headline, the Japanese original is the small text.
const KANJI = /[\u4e00-\u9fff]/;
export function dispName(en, jp){
  if (en) return [en, jp];
  const rj = romaji(jp);
  if (rj && !KANJI.test(jp)) return [rj, jp];
  return [jp, ''];
}
