export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ko', 'pt'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
  pt: 'Português',
};

export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export function getLocaleName(locale: SupportedLocale): string {
  return LOCALE_NAMES[locale];
}
