'use client';

import { useState } from 'react';

const CreateUserPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(`Success: ${data.message}`);
      setEmail('');
      setPassword('');
      setRole('user');
    } else {
      setMessage(`Error: ${data.message}`);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Create New User</h1>
      <form onSubmit={handleSubmit} className="p-8 bg-base-charcoal/80 backdrop-blur-sm border border-white/10 rounded-lg w-full max-w-lg">
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
        <div className="mb-4">
          <label className="block text-secondary-text mb-2" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-primary-text focus:outline-none focus:ring-2 focus:ring-accent-crimson"
          />
        </div>
        <div className="mb-6">
          <label className="block text-secondary-text mb-2" htmlFor="role">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 bg-white/5 border border-white/10 rounded-md text-primary-text focus:outline-none focus:ring-2 focus:ring-accent-crimson"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="w-full py-2 bg-crimson-gradient text-primary-text font-bold rounded-md hover:opacity-90 transition-opacity">
          Create User
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default CreateUserPage;
