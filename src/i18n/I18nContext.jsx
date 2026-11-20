import { createContext, useContext, useEffect, useState } from 'react';
import en from '../data/cv/en.json';
import es from '../data/cv/es.json';
import de from '../data/cv/de.json';
import fr from '../data/cv/fr.json';
import { DEFAULT_LANG, LANGUAGES, UI } from './ui.js';

const CV = { en, es, de, fr };
const I18nContext = createContext(null);

const initialLang = () => {
  try {
    const saved = localStorage.getItem('lang');
    if (LANGUAGES.some((l) => l.code === saved)) return saved;
  } catch { /* storage unavailable */ }
  return DEFAULT_LANG;
};

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('lang', lang); } catch { /* storage unavailable */ }
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: UI[lang], cv: CV[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
