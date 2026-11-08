import type { ReactNode } from 'react';

export const inputClass =
  'w-full rounded border border-border px-3 py-2 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary-light focus:outline-none';

export const FormField = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
  <label className="flex flex-col gap-1 text-sm font-medium text-text">
    {label}
    {children}
    {error && <span className="text-xs font-normal text-danger">{error}</span>}
  </label>
);
