'use client';

import { useState } from 'react';

const UserLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="p-8 bg-base-charcoal/80 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-primary-text">User Login</h2>
        <div className="mb-4">
          <label className="block text-secondary-text mb-2" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-primary-text focus:outline-none focus:ring-2 focus:ring-accent-crimson"
          />
        </div>
        <div className="mb-6">
          <label className="block text-secondary-text mb-2" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-primary-text focus:outline-none focus:ring-2 focus:ring-accent-crimson"
          />
        </div>
        <button type="submit" className="w-full py-2 bg-crimson-gradient text-primary-text font-bold rounded-md hover:opacity-90 transition-opacity">
          Login
        </button>
      </form>
    </div>
  );
};

export default UserLoginPage;
