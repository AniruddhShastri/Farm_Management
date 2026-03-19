import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../i18n/translations';

const STORAGE_KEY = 'voneng_language';

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) return saved;
    // Auto-detect browser language
    const browser = navigator.language?.split('-')[0];
    if (browser && translations[browser]) return browser;
    return 'en';
  });

  function setLang(code) {
    setLangState(code);
    localStorage.setItem(STORAGE_KEY, code);
    // Switch font for Hindi
    document.documentElement.setAttribute('data-lang', code);
  }

  function t(key, fallback) {
    return translations[lang]?.[key] ?? translations['en']?.[key] ?? fallback ?? key;
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'es', label: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳', nativeName: 'हिंदी' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', nativeName: 'Français' },
];
