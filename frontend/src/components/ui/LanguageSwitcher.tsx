'use client';

import { useI18n, useTranslation } from '@/lib/i18n';
import { LANGUAGE_LABELS, type Language } from '@/lib/i18n';

const LANGUAGES: Language[] = ['en', 'fr', 'ar'];

export function LanguageSwitcher({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const { lang, setLang } = useI18n();

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700 p-0.5">
        {LANGUAGES.map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
              lang === l
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {LANGUAGE_LABELS[l]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {LANGUAGES.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
            lang === l
              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          {LANGUAGE_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
