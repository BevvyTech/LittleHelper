import { clsx } from 'clsx';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'button',
          `button--${variant}`,
          `button--${size}`,
          loading && 'button--loading',
          className
        )}
        disabled={disabled ?? loading}
        {...props}
      >
        {loading && (
          <span className="button__spinner" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" className="button__spinner-icon">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="31.4 31.4"
              />
            </svg>
          </span>
        )}
        <span className={clsx('button__content', loading && 'button__content--hidden')}>
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
