import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { en } from './translations/en';
import { fr } from './translations/fr';
import { ar } from './translations/ar';
import type { TranslationKeys, Language } from './types';

const translations: Record<Language, TranslationKeys> = { en, fr, ar };

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationKeys;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = 'biostor-lang';

function getInitialLang(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'fr' || stored === 'ar') return stored;
  } catch {}
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getInitialLang);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const value: I18nContextValue = {
    lang,
    setLang,
    t: translations[lang],
    dir: lang === 'ar' ? 'rtl' : 'ltr',
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return { lang: 'en', setLang: () => {}, t: translations.en, dir: 'ltr' };
  }
  return ctx;
}

export function useTranslation() {
  return useI18n();
}
