import { useThemeSettings } from '@littlehelper/ui';

const options = [
  { value: 'light', label: '☀️' },
  { value: 'dark', label: '🌙' },
  { value: 'auto', label: '✨' },
];

export function ThemeToggle() {
  const { theme, setTheme, buttonShape, setButtonShape } = useThemeSettings();

  return (
    <div className="theme-toggle" aria-label="Theme controls">
      <div className="theme-toggle__modes" role="group" aria-label="Theme preference">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
          className={`theme-toggle__button ${theme === option.value ? 'is-active' : ''}`}
          aria-pressed={theme === option.value}
          onClick={() => setTheme(option.value as typeof theme)}
        >
          <span aria-hidden="true">{option.label}</span>
          <span className="theme-toggle__label">{option.value}</span>
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
