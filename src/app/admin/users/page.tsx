'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  _id: string;
  email: string;
  createdAt: string;
  roleInfo: {
    name: string;
  };
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Link href="/admin/users/create" className="px-4 py-2 bg-accent-red text-white font-semibold rounded-lg hover:bg-accent-red/80 transition-colors">
          + Create User
        </Link>
      </div>

      {loading && <p className="text-secondary">Loading users...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-gray-800/30 rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Date Created</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t border-gray-700/50 hover:bg-gray-700/20">
                  <td className="p-4 font-medium text-primary">{user.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs font-semibold bg-gray-700 rounded-full">
                      {user.roleInfo.name}
                    </span>
                  </td>
                  <td className="p-4 text-secondary">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <button className="text-secondary hover:text-primary">Edit</button>
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
