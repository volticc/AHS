'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Role {
  _id: string;
  name: string;
}

export default function CreateUserPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Fetch the available roles to populate the dropdown
    const fetchRoles = async () => {
      // We will create this API endpoint next
      const response = await fetch('/api/admin/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
        if (data.length > 0) {
          setRoleId(data[0]._id); // Default to the first role
        }
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, roleId, actorId: '60d5ec49a4d8f5e3a8a9a8b1' }), // Placeholder actorId
    });

    const data = await response.json();
    if (response.ok) {
      setSuccess('User created successfully! Redirecting...');
      setTimeout(() => router.push('/admin/users'), 2000);
    } else {
      setError(data.message || 'Failed to create user.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New User</h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-secondary">Email Address</label>
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
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-secondary">Role</label>
          <select
            id="role"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 text-primary bg-gray-700/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-red"
          >
            {roles.map((role) => (
              <option key={role._id} value={role._id}>{role.name}</option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">{success}</p>}
        <button
          type="submit"
          className="px-6 py-2 font-bold text-white bg-accent-red rounded-lg hover:bg-accent-red/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent-red"
        >
          Create User
        </button>
      </form>
    </div>
  );
}
