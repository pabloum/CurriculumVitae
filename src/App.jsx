import { useEffect, useState } from 'react';
import AccordionSection from './components/Accordion.jsx';
import { ContactBar, ContactIcons } from './components/Contact.jsx';
import { Education, Experience, Languages, Portfolio, Skills, Summary } from './components/Sections.jsx';
import { DownloadIcon, MoonIcon, PinIcon, SunIcon } from './components/Icons.jsx';
import { generateCvPdf } from './pdf/generateCvPdf.js';
import { useI18n } from './i18n/I18nContext.jsx';
import { LANGUAGES } from './i18n/ui.js';

const SECTIONS = [
  { id: 'summary', icon: '✦', render: (cv) => <Summary text={cv.profile.summary} /> },
  { id: 'experience', icon: '◆', render: (cv) => <Experience jobs={cv.experience} /> },
  { id: 'skills', icon: '⌘', render: (cv) => <Skills skills={cv.skills} /> },
  { id: 'portfolio', icon: '▣', render: (cv) => <Portfolio projects={cv.portfolio} /> },
  { id: 'languages', icon: '◎', render: (cv) => <Languages languages={cv.languages} /> },
  { id: 'education', icon: '◇', render: (cv) => <Education education={cv.education} volunteer={cv.volunteer} /> },
];

function LanguagePicker() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="lang-picker" role="group" aria-label={t.language}>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          className={`lang-picker__btn ${l.code === lang ? 'lang-picker__btn--active' : ''}`}
          aria-pressed={l.code === lang}
          title={l.name}
          lang={l.code}
          onClick={() => setLang(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch { /* storage unavailable */ }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}

export default function App() {
  const { cv, t, lang } = useI18n();
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
      await generateCvPdf(cv, { ...t.pdf, client: t.client }, lang);
    } finally {
      setGenerating(false);
    }
  };

  const initials = cv.profile.name.split(' ').slice(0, 2).map((w) => w[0]).join('');

  return (
    <>
      <div className="page">
        <header className="hero">
          <div className="hero__top">
            <LanguagePicker />
            <button className="icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? t.toLight : t.toDark} title={t.toggleTheme}>
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
              <DownloadIcon /> {generating ? t.generating : t.downloadPdf}
            </button>
            <ContactIcons />
          </div>
        </header>

        <nav className="toc" aria-label={t.sections.summary[0]}>
          {SECTIONS.map((s) => (
            <button key={s.id} className={`chip ${open.has(s.id) ? 'chip--active' : ''}`} onClick={() => jumpTo(s.id)}>
              {t.sections[s.id][0]}
            </button>
          ))}
          <button className="chip chip--plain" onClick={toggleAll}>{allOpen ? t.collapseAll : t.expandAll}</button>
        </nav>

        <main className="sections">
          {SECTIONS.map((s) => (
            <AccordionSection key={s.id} id={s.id} title={t.sections[s.id][1]} icon={s.icon} open={open.has(s.id)} onToggle={() => toggle(s.id)}>
              {s.render(cv)}
            </AccordionSection>
          ))}
        </main>

        <footer className="footer">
          © {new Date().getFullYear()} {cv.profile.name}
        </footer>
      </div>

      <footer className="site-footer">
        <ContactBar />
      </footer>
    </>
  );
}
