import { useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'auto';
export type ButtonShape = 'rounded' | 'pill';

const THEME_KEY = 'theme-preference';
const BUTTON_SHAPE_KEY = 'button-shape';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function readStoredTheme(): ThemePreference {
  if (!isBrowser()) return 'light';
  const value = localStorage.getItem(THEME_KEY) as ThemePreference | null;
  if (value === 'dark' || value === 'auto' || value === 'light') {
    return value;
  }
  return 'light';
}

export function readStoredButtonShape(): ButtonShape {
  if (!isBrowser()) return 'rounded';
  const value = localStorage.getItem(BUTTON_SHAPE_KEY) as ButtonShape | null;
  return value === 'pill' ? 'pill' : 'rounded';
}

function setCookie(name: string, value: string) {
  if (!isBrowser()) return;
  document.cookie = `${name}=${value};path=/;max-age=${COOKIE_MAX_AGE}`;
}

export function applyThemePreference(preference: ThemePreference) {
  if (!isBrowser()) return;

  const root = document.documentElement;
  root.dataset.theme = preference;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.themeResolved =
    preference === 'auto' ? (prefersDark ? 'dark' : 'light') : preference;

  localStorage.setItem(THEME_KEY, preference);
  setCookie('theme', preference);
}

export function applyButtonShape(shape: ButtonShape) {
  if (!isBrowser()) return;

  const root = document.documentElement;
  root.dataset.buttonShape = shape;
  localStorage.setItem(BUTTON_SHAPE_KEY, shape);
}

export function useThemeSettings() {
  const [theme, setTheme] = useState<ThemePreference>(readStoredTheme);
  const [buttonShape, setButtonShape] = useState<ButtonShape>(readStoredButtonShape);

  useEffect(() => {
    applyThemePreference(theme);
    if (theme === 'auto') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyThemePreference(theme);
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }
    return undefined;
  }, [theme]);

  useEffect(() => {
    applyButtonShape(buttonShape);
  }, [buttonShape]);

  return {
    theme,
    setTheme,
    buttonShape,
    setButtonShape,
  };
}
