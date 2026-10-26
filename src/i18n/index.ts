import { useState, useEffect, useCallback } from 'react';
import { en, type Translation } from './en';
import { hi } from './hi';
import { te } from './te';

export type Language = 'en' | 'hi' | 'te';

export const translations: Record<Language, Translation> = {
  en,
  hi,
  te,
};

export type TranslationSchema = Translation;

export function getTranslation(lang: Language = 'en'): Translation {
  return translations[lang] || translations.en;
}

const STORAGE_KEY = 'nutricheck_lang';
const listeners = new Set<(lang: Language) => void>();

function readSavedLanguage(): Language {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'hi' || saved === 'te') {
        return saved;
      }
    }
  } catch {
    // sessionStorage access may be restricted
  }
  return 'en';
}

let activeLang: Language = readSavedLanguage();

export function setLanguage(lang: Language): void {
  activeLang = lang;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(STORAGE_KEY, lang);
    }
  } catch {
    // ignore
  }
  listeners.forEach((listener) => listener(lang));
}

export function useTranslation() {
  const [lang, setLangState] = useState<Language>(() => {
    return typeof window !== 'undefined' ? readSavedLanguage() : activeLang;
  });

  useEffect(() => {
    const handleLangChange = (newLang: Language) => {
      setLangState(newLang);
    };
    listeners.add(handleLangChange);
    return () => {
      listeners.delete(handleLangChange);
    };
  }, []);

  const changeLanguage = useCallback((newLang: Language) => {
    setLanguage(newLang);
  }, []);

  const t = getTranslation(lang);

  return {
    t,
    lang,
    setLanguage: changeLanguage,
  };
}
