import en from '@/content/i18n/en.json';
import hi from '@/content/i18n/hi-IN.json';
import es from '@/content/i18n/es.json';

export type Locale = 'en' | 'hi-IN' | 'es';

const dictionaries: Record<Locale, Record<string, unknown>> = {
  en,
  'hi-IN': hi,
  es,
};

const DEFAULT_LOCALE: Locale =
  (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as Locale) || 'en';

export function getDefaultLocale(): Locale {
  return DEFAULT_LOCALE;
}

export function listLocales() {
  return Object.keys(dictionaries) as Locale[];
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

function resolvePath(source: Record<string, unknown>, path: string) {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

export function t(path: string, locale: Locale = DEFAULT_LOCALE) {
  const dictionary = getDictionary(locale);
  const value = resolvePath(dictionary, path);
  if (typeof value === 'string') return value;
  return path;
}

export type Translator = (path: string) => string;

export function createTranslator(locale: Locale): Translator {
  return (path: string) => t(path, locale);
}


