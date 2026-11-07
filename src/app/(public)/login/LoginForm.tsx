'use client';
import { Button } from '@/components/generic';
import { useRouter } from 'next/navigation';
import React from 'react';

const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get('email');
    const password = form.get('password');

    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
      .then(async response => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Login failed');
        }
        router.push('/');
        router.refresh();
      })

      .catch(error => {
        console.error('Error during login:', error);
        setError(error.message);
      });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4">
      <form className="w-full max-w-md rounded-lg bg-surface p-8 shadow-md" onSubmit={onSubmit}>
        <h1 className="mb-6 text-2xl font-bold text-text">Sign in</h1>

        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-bold text-text">
            Email
          </label>
          <input
            className="w-full rounded border border-border px-3 py-2 text-text focus:border-primary focus:ring-2 focus:ring-primary-light focus:outline-none"
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="mb-2 block text-sm font-bold text-text">
            Password
          </label>
          <div className="relative">
            <input
              className="w-full rounded border border-border py-2 pr-10 pl-3 text-text focus:border-primary focus:ring-2 focus:ring-primary-light focus:outline-none"
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
            />
            {/* type="button" so clicking the eye doesn't submit the form */}
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-text">
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10 10 0 0 1 12 5c5 0 9 4.5 10 7a11 11 0 0 1-3.2 4.2M6.1 6.1A11 11 0 0 0 2 12c1 2.5 5 7 10 7a10 10 0 0 0 4.2-.9" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <Button type="submit">Sign in</Button>
        {error && <p className="mt-4 text-sm text-danger">{error}</p>}
      </form>
    </main>
  );
};

export default LoginForm;
