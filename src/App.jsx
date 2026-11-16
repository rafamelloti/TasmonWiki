import React from 'react';
import { NavLink, Route, Routes, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Tasmons from './pages/Tasmons.jsx';
import TasmonDetail from './pages/TasmonDetail.jsx';
import Skills from './pages/Skills.jsx';
import Passives from './pages/Passives.jsx';
import Jobs from './pages/Jobs.jsx';
import Equipment from './pages/Equipment.jsx';
import Elements from './pages/Elements.jsx';
import Dex from './pages/Dex.jsx';
import Mechanics from './pages/Mechanics.jsx';
import Stages from './pages/Stages.jsx';
import Events from './pages/Events.jsx';
import Hunt from './pages/Hunt.jsx';
import Tower from './pages/Tower.jsx';
import Updates from './pages/Updates.jsx';
import Simulator from './pages/Simulator.jsx';
import { MENU, MenuIcon, BANNER, BrandLogo } from './lib/menu.jsx';
import { imgUrl } from './lib/img.jsx';
const NAV_OLD = [['/tasmons', 'Tasmons'], ['/skills', 'Skills'], ['/passives', 'Passives'], ['/jobs', 'Jobs'], ['/equipment', 'Equipment'], ['/elements', 'Elements'], ['/dex', 'DEX'], ['/mechanics', 'Mechanics'], ['/events', 'Events'], ['/stages', 'Stages']];
export default function App(){
  const loc = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  return (<>
    <header className="top" style={{ '--bn': `url("${imgUrl(BANNER[Object.keys(BANNER).find(k => loc.pathname.startsWith(k))] || 'bg/plains/backdrop.png')}")` }}><div className="wrap bar">
      <Link to="/" className="brand"><BrandLogo /><b>TASMON</b><em>Taskbar Monsters · Database</em></Link>
      <nav className="gnav">{MENU.map(m => <NavLink key={m.to} to={m.to} style={{ '--mc': m.c }} className={({ isActive }) => 'gi' + (isActive ? ' on' : '')}><MenuIcon m={m} /><span>{m.t}</span></NavLink>)}</nav>
    </div></header>
    <main className="wrap">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasmons" element={<Tasmons />} />
        <Route path="/tasmons/:id" element={<TasmonDetail />} />
        <Route path="/tasmons/:id/sim" element={<Simulator />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/passives" element={<Passives />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/elements" element={<Elements />} />
        <Route path="/dex" element={<Dex />} />
        <Route path="/mechanics" element={<Mechanics />} />
        <Route path="/stages" element={<Stages />} />
        <Route path="/events" element={<Events />} />
        <Route path="/hunt" element={<Hunt />} />
        <Route path="/tower" element={<Tower />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </main>
    <footer className="wrap foot">Unofficial fan-made database for TASMON Taskbar Monsters. All game content, names and images belong to their respective owners. Data reflects the game version this site was built from.<br />Made by <b>RafaMelloTI</b> · <a href="https://steamcommunity.com/id/RafaMelloTI/" target="_blank" rel="noopener noreferrer">Steam profile</a></footer>
  </>);
}
