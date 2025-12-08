import { clsx } from 'clsx';
import { type InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, hint, id, ...props }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className={clsx('input-wrapper', error && 'input-wrapper--error', className)}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx('input', error && 'input--error')}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="input-hint">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="input-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
