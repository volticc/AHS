'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.push('/dashboard');
        router.refresh(); // Ensures the page reloads with user session
      } else {
        const data = await response.json();
        setError(data.message || 'An unknown error occurred. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-deep-charcoal">
      <div className="w-full max-w-md p-8 space-y-6 bg-card-bg rounded-lg shadow-lg border border-glow-red/20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Login</h1>
          <p className="text-secondary">After Hours Studios</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-primary bg-surface-elevated border border-glow-red/30 rounded-md focus:outline-none focus:ring-2 focus:ring-rich-blood-red"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-primary bg-surface-elevated border border-glow-red/30 rounded-md focus:outline-none focus:ring-2 focus:ring-rich-blood-red"
            />
          </div>

          {error && (
            <p className="text-sm text-status-error text-center font-semibold">{error}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 font-bold text-white bg-dark-crimson rounded-lg hover:bg-rich-blood-red focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card-bg focus:ring-rich-blood-red disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-secondary">
          Don't have an account? {' '}
          <Link href="/register" className="font-medium text-dark-crimson hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
