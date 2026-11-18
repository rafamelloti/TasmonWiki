import React from 'react';
import { Link } from 'react-router-dom';
import { species, skills, passives, jobs, RARITIES, RARITY_EN, RARITY_COLOR } from '../lib/data.js';
import { TasmonCard } from '../components.jsx';
import { MENU, MenuIcon } from '../lib/menu.jsx';
export default function Home(){
  const count = g => species.filter(s => s.group === g).length;
  const top = species.filter(s => s.rarity === 'celestial' || s.rarity === 'cosmic').slice(0, 8);
  const tiles = [
    ['/tasmons', 'Tasmons', `${species.length} species`, 'Every Tasmon with stats, skills, passives and how to get it.'],
    ['/skills', 'Skills', `${Object.keys(skills).length} skills`, 'Active skills, awakening tiers and species-exclusive skills.'],
    ['/passives', 'Passives', `${Object.keys(passives).length} species with passives`, 'Species passives and Ranked-only passives.'],
    ['/jobs', 'Jobs', `${jobs.length} jobs`, 'Rare and Hidden jobs with their bonuses and unique skills.'],
    ['/equipment', 'Equipment', '6 parts · 10 rarities', 'Maximum stats by part, rarity and level; engraving and talismans.'],
    ['/elements', 'Elements & roles', '6 elements · 4 roles', 'Type chart and role advantages.'],
    ['/dex', 'DEX', `${count('normal')} collectable`, 'DEX buffs and collection milestones.'],
    ['/events', 'Events', 'Seasons · Halloween', 'Limited-time Tasmons, season skills and the completion bonus.'],
    ['/mechanics', 'Mechanics', 'Eggs · awakening', 'Egg odds, awakening, expeditions and invite partners.'],
    ['/tiers', 'Tasmon Tier List', 'Best Tasmons', 'SS to F rankings for attackers, tanks, healers and buffers.'],
    ['/analyzer', 'Save Analyzer', 'Upload your save', 'Estimated DPS, clear time per stage and what to improve — all in your browser.'],
    ['/team-builder', 'Team Builder', 'Best DPS and PvP teams', 'Build the strongest team from your save, with the best skills to inherit for each Tasmon.'],
    ['/tower', 'Elemental Tower', '6 towers · 50 floors', 'Talismans, elemental fruits, eggs and the DLC pass.'],
    ['/hunt', 'Hero Hunt', '4 volumes', 'Hero challenge stages, modes and rewards.'],
    ['/updates', 'Latest update', 'Patch notes', 'What changed in the newest game update.'],
    ['/stages', 'Stages', '14 difficulties', 'Enemies, HP, ATK, rewards and special challenges.'] ];
  return (<>
    <section className="hero-home"><h1>TASMON Taskbar Monsters <span>Database</span></h1>
      <p>Everything about the game in one place: Tasmons, skills, passives, jobs, equipment, stages and mechanics.</p></section>
    <div className="grid3">{tiles.map(([to, t, n, d]) => { const m = MENU.find(x => x.to === to) || MENU[0]; return <Link key={to} to={to} className="card tile gtile" style={{ '--mc': m.c }}><div className="ticon"><MenuIcon m={m} size={64} /></div><h3>{t}</h3><div className="big">{n}</div><p>{d}</p></Link>; })}</div>
    <h2>Rarities</h2><div className="row wrap">{RARITIES.map(r => <Link key={r} to={`/tasmons?rarity=${r}`} className="tag" style={{ borderColor: RARITY_COLOR[r], color: RARITY_COLOR[r] }}>{RARITY_EN[r]} · {species.filter(s => s.rarity === r).length}</Link>)}</div>
    <h2>Highest rarity Tasmons</h2><div className="grid">{top.map(s => <TasmonCard key={s.id} s={s} />)}</div>
  </>);
}
