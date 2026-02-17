'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  _id: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Link href="/admin/users/create" className="bg-accent-crimson hover:bg-accent-crimson-light text-white font-bold py-2 px-4 rounded-lg transition duration-300">
          + Create New User
        </Link>
      </div>

      {loading && <p>Loading users...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-base-charcoal/50 rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-black/30">
              <tr>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Date Created</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t border-white/10 hover:bg-black/20">
                  <td className="p-4">{user.email}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-accent-crimson-dark text-white' : 'bg-gray-600 text-gray-200'}`}>{user.role}</span></td>
                  <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    {/* Action buttons (e.g., Edit, Delete) can be added here */}
                    <button className="text-secondary-text hover:text-primary-text">...</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
