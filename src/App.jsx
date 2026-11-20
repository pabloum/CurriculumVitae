import { useEffect, useState } from 'react';
import cv from './data/cv.json';
import AccordionSection from './components/Accordion.jsx';
import Contact from './components/Contact.jsx';
import { Education, Experience, Languages, Portfolio, Skills, Summary } from './components/Sections.jsx';
import { DownloadIcon, MoonIcon, PinIcon, SunIcon } from './components/Icons.jsx';
import { generateCvPdf } from './pdf/generateCvPdf.js';

const SECTIONS = [
  { id: 'summary', short: 'Summary', title: 'Professional Summary', icon: '✦', render: () => <Summary text={cv.profile.summary} /> },
  { id: 'experience', short: 'Experience', title: 'Experience', icon: '◆', render: () => <Experience jobs={cv.experience} /> },
  { id: 'skills', short: 'Skills', title: 'Technical Skills', icon: '⌘', render: () => <Skills skills={cv.skills} /> },
  { id: 'portfolio', short: 'Portfolio', title: 'Portfolio', icon: '▣', render: () => <Portfolio projects={cv.portfolio} /> },
  { id: 'languages', short: 'Languages', title: 'Languages', icon: '◎', render: () => <Languages languages={cv.languages} /> },
  { id: 'education', short: 'Education', title: 'Education & Volunteering', icon: '◇', render: () => <Education education={cv.education} volunteer={cv.volunteer} /> },
  { id: 'contact', short: 'Contact', title: 'Contact Me', icon: '✉', render: () => <Contact contact={cv.contact} /> },
];

function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch { /* storage unavailable */ }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [open, setOpen] = useState(() => new Set(['summary', 'experience']));
  const [generating, setGenerating] = useState(false);

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const allOpen = open.size === SECTIONS.length;
  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(SECTIONS.map((s) => s.id)));

  const jumpTo = (id) => {
    setOpen((prev) => new Set(prev).add(id));
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const downloadPdf = async () => {
    setGenerating(true);
    try {
      await generateCvPdf(cv);
    } finally {
      setGenerating(false);
    }
  };

  const initials = cv.profile.name.split(' ').slice(0, 2).map((w) => w[0]).join('');

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__top">
          <button className="icon-btn" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title="Toggle theme">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
        <div className="hero__main">
          <div className="avatar" aria-hidden="true">{initials}</div>
          <div>
            <h1 className="hero__name">{cv.profile.name}</h1>
            <p className="hero__title">{cv.profile.title}</p>
            <p className="meta"><PinIcon /> {cv.profile.location}</p>
          </div>
        </div>
        <div className="hero__actions">
          <button className="btn btn--primary" onClick={downloadPdf} disabled={generating}>
            <DownloadIcon /> {generating ? 'Generating…' : 'Download CV (PDF)'}
          </button>
          <button className="btn btn--ghost" onClick={() => jumpTo('contact')}>Get in touch</button>
        </div>
      </header>

      <nav className="toc" aria-label="Sections">
        {SECTIONS.map((s) => (
          <button key={s.id} className={`chip ${open.has(s.id) ? 'chip--active' : ''}`} onClick={() => jumpTo(s.id)}>
            {s.short}
          </button>
        ))}
        <button className="chip chip--plain" onClick={toggleAll}>{allOpen ? 'Collapse all' : 'Expand all'}</button>
      </nav>

      <main className="sections">
        {SECTIONS.map((s) => (
          <AccordionSection key={s.id} id={s.id} title={s.title} icon={s.icon} open={open.has(s.id)} onToggle={() => toggle(s.id)}>
            {s.render()}
          </AccordionSection>
        ))}
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} {cv.profile.name}
      </footer>
    </div>
  );
}
