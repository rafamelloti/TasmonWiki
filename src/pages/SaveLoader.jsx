import React, { useRef, useState } from 'react';
import { SEAL } from '../lib/seal.js';
import { setSaved } from '../lib/savestore.js';

export const SAVE_DIR = '%userprofile%\\AppData\\Roaming\\Taskbar Monsters\\cloud\\';
// Reads a save file (plain or sealed) in the browser. Nothing is uploaded.
export async function readSave(f){
  let t = await f.text(); if (SEAL.is(t)) t = SEAL.open(t); t = t.replace(/^﻿/, '');
  const d = JSON.parse(t); if (!d || typeof d !== 'object' || !d.monsters) throw new Error('This does not look like a TASMON save (no “monsters” field).');
  return d;
}
export default function SaveLoader({ fname, onLoad }){
  const [copied, setCopied] = useState(false), [err, setErr] = useState(''), [drag, setDrag] = useState(false), inp = useRef(null);
  async function load(f){ setErr(''); try { const d = await readSave(f); setSaved(d, f.name); onLoad(d, f.name); } catch (e) { setErr('Could not read this file: ' + e.message); } }
  async function copyPath(){
    try { await navigator.clipboard.writeText(SAVE_DIR); } catch { const t = document.createElement('textarea'); t.value = SAVE_DIR; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch {} t.remove(); }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  }
  return (<>
    <div className={'drop' + (drag ? ' on' : '')} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) load(f); }}>
      <button className="btn" onClick={() => inp.current?.click()}>📂 Choose save file</button><span className="mut"> or drop it here{fname ? ` · loaded: ${fname}` : ''}</span>
      <input ref={inp} type="file" hidden accept=".json,.txt,application/json,*/*" onChange={e => { const f = e.target.files?.[0]; if (f) load(f); e.target.value = ''; }} />
      <div className="mut small savepath">Default save location (Windows): <code>{SAVE_DIR}</code> <button className="btn sm" onClick={copyPath}>{copied ? '✔ Copied' : '📋 Copy path'}</button></div>
      <div className="mut small">Paste it into the File Explorer address bar (or Win+R) — <code>%userprofile%</code> works for every user. Open the <code>acct-…</code> folder inside and pick <code>tbm-save.json</code>. Make a copy first if you plan to edit it.</div>
    </div>
    {err && <p className="warn">⚠ {err}</p>}
  </>);
}
