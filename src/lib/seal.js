// Sealed save (TASMONS1) reader: same algorithm as the game's save-seal.js. Runs entirely in the browser.
export const SEAL = (() => {
  const MAGIC = 'TASMONS1', KEY = 'tbm-save-seal-2026-11', enc = new TextEncoder(), dec = new TextDecoder('utf-8', { fatal: true });
  const K = new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
  const rr = (x, n) => (x >>> n) | (x << (32 - n));
  function sha256Hex(bytes){
    const total = ((bytes.length + 9 + 63) >> 6) << 6, buf = new Uint8Array(total); buf.set(bytes); buf[bytes.length] = 0x80;
    const dv = new DataView(buf.buffer); const bits = bytes.length * 8;
    dv.setUint32(total - 8, Math.floor(bits / 4294967296)); dv.setUint32(total - 4, bits >>> 0);
    let h = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]; const w = new Uint32Array(64);
    for (let off = 0; off < total; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
      for (let i = 16; i < 64; i++) { const s0 = rr(w[i-15],7) ^ rr(w[i-15],18) ^ (w[i-15] >>> 3), s1 = rr(w[i-2],17) ^ rr(w[i-2],19) ^ (w[i-2] >>> 10); w[i] = (w[i-16] + s0 + w[i-7] + s1) >>> 0; }
      let [a,b,c,d,e,f,g,hh] = h;
      for (let i = 0; i < 64; i++) {
        const S1 = rr(e,6) ^ rr(e,11) ^ rr(e,25), ch = (e & f) ^ (~e & g), t1 = (hh + S1 + ch + K[i] + w[i]) >>> 0;
        const S0 = rr(a,2) ^ rr(a,13) ^ rr(a,22), mj = (a & b) ^ (a & c) ^ (b & c), t2 = (S0 + mj) >>> 0;
        hh = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      h = [a,b,c,d,e,f,g,hh].map((v, i) => (h[i] + v) >>> 0);
    }
    return h.map(v => v.toString(16).padStart(8, '0')).join('');
  }
  const SEED = (parseInt(sha256Hex(enc.encode(KEY)).slice(0, 8), 16) >>> 0) || 2654435769;
  function mask(bytes){ const out = new Uint8Array(bytes.length); let x = SEED; for (let i = 0; i < bytes.length; i++) { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; out[i] = bytes[i] ^ (x & 255); } return out; }
  function sign(body){ const k = enc.encode(KEY + '|' + MAGIC + '|'), all = new Uint8Array(k.length + body.length); all.set(k); all.set(body, k.length); return sha256Hex(all).slice(0, 40); }
  const toB64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 32768)); return btoa(s); };
  const fromB64 = str => { const bin = atob(str), out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; };
  return {
    is: raw => typeof raw === 'string' && raw.replace(/^﻿/, '').startsWith(MAGIC + '.'),
    seal(json){ const body = mask(enc.encode(json)); return `${MAGIC}.${sign(body)}.${toB64(body)}`; },
    open(raw){
      raw = raw.replace(/^﻿/, '').trim();
      const a = raw.indexOf('.', MAGIC.length + 1); if (a < 0) throw new Error('formato selado inválido');
      const body = fromB64(raw.slice(a + 1));
      if (sign(body) !== raw.slice(MAGIC.length + 1, a)) throw new Error('assinatura não confere (arquivo alterado/corrompido ou a chave do jogo mudou)');
      return dec.decode(mask(body));
    }, sha256Hex
  };
})();
