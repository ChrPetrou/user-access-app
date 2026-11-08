import type { ButtonHTMLAttributes, ReactNode } from 'react';

export const Container = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`w-full px-6 ${className}`}>{children}</div>
);

export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <div className="mb-5 flex items-end justify-between gap-4">
    <div>
      <h1 className="text-2xl font-semibold text-text">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-lg bg-surface p-5 shadow-sm ${className}`}>{children}</div>
);

const BADGE_TONES = {
  success: 'border-success/30 bg-success/10 text-success',
  danger: 'border-danger/30 bg-danger/10 text-danger',
  neutral: 'border-border bg-page text-muted'
};

export const Badge = ({ tone = 'neutral', children }: { tone?: keyof typeof BADGE_TONES; children: ReactNode }) => (
  <span className={`rounded border px-2 py-0.5 text-xs ${BADGE_TONES[tone]}`}>{children}</span>
);

const BUTTON_VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'border border-border bg-surface text-text hover:bg-page',
  danger: 'bg-danger text-white hover:bg-danger-hover'
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof BUTTON_VARIANTS };

export const Button = ({ variant = 'primary', type = 'button', className = '', ...props }: ButtonProps) => (
  <button
    type={type}
    className={`rounded cursor-pointer w-full px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${className}`}
    {...props}
  />
);
