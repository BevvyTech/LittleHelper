import { ButtonShape, ThemePreference, useThemeSettings } from '@littlehelper/ui';

const themeOptions: { value: ThemePreference; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'auto', label: 'Auto', icon: '✨' },
];

export function ThemeToggle() {
  const { theme, setTheme, buttonShape, setButtonShape } = useThemeSettings();

  return (
    <div className="theme-toggle" aria-label="Theme settings">
      <div className="theme-toggle__modes" role="group" aria-label="Theme preference">
        {themeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`theme-toggle__button ${
              theme === option.value ? 'is-active' : ''
            }`}
            aria-pressed={theme === option.value}
            onClick={() => setTheme(option.value)}
          >
            <span aria-hidden="true">{option.icon}</span>
            <span className="theme-toggle__label">{option.label}</span>
          </button>
        ))}
      </div>

      <div className="theme-toggle__shape" role="group" aria-label="Button shape">
        <button
          type="button"
          className={`theme-toggle__pill ${buttonShape === 'rounded' ? 'is-active' : ''}`}
          aria-pressed={buttonShape === 'rounded'}
          onClick={() => setButtonShape('rounded')}
        >
          Rounded
        </button>
        <button
          type="button"
          className={`theme-toggle__pill ${buttonShape === 'pill' ? 'is-active' : ''}`}
          aria-pressed={buttonShape === 'pill'}
          onClick={() => setButtonShape('pill')}
        >
          Pill
        </button>
      </div>
    </div>
  );
}
