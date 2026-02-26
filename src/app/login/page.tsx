'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      // On successful login, redirect to the admin dashboard
      router.push('/admin');
    } else {
      const data = await response.json();
      setError(data.message || 'An unknown error occurred.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800/20 rounded-lg shadow-lg">
        <div className="text-center">
          {/* You can place the logo here */}
          <h1 className="text-3xl font-bold text-primary">Admin Login</h1>
          <p className="text-secondary">After Hours Studios</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-primary bg-gray-700/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-red"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 text-primary bg-gray-700/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-red"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 font-bold text-white bg-accent-red rounded-md hover:bg-accent-red/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent-red"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
