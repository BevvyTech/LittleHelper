import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'auto';
export type ButtonShape = 'pill' | 'rounded';

const THEME_STORAGE_KEY = 'littlehelper-theme';
const BUTTON_SHAPE_STORAGE_KEY = 'littlehelper-button-shape';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [buttonShape, setButtonShapeState] = useState<ButtonShape>('rounded');

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const savedButtonShape = localStorage.getItem(BUTTON_SHAPE_STORAGE_KEY) as ButtonShape | null;

    if (savedTheme) {
      setThemeState(savedTheme);
      document.documentElement.dataset['theme'] = savedTheme;
    }

    if (savedButtonShape) {
      setButtonShapeState(savedButtonShape);
      document.documentElement.dataset['buttonShape'] = savedButtonShape;
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    document.documentElement.dataset['theme'] = newTheme;
  }, []);

  const setButtonShape = useCallback((newShape: ButtonShape) => {
    setButtonShapeState(newShape);
    localStorage.setItem(BUTTON_SHAPE_STORAGE_KEY, newShape);
    document.documentElement.dataset['buttonShape'] = newShape;
  }, []);

  return {
    theme,
    setTheme,
    buttonShape,
    setButtonShape,
  };
}
