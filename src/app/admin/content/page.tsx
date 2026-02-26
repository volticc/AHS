'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DevLog {
  _id: string;
  title: string;
  category: string;
  createdAt: string;
}

export default function ContentManagementPage() {
  const [devLogs, setDevLogs] = useState<DevLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevLogs = async () => {
      try {
        const response = await fetch('/api/admin/devlogs');
        if (!response.ok) {
          throw new Error('Failed to fetch dev logs');
        }
        const data = await response.json();
        setDevLogs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDevLogs();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <Link href="/admin/content/create" className="px-4 py-2 bg-accent-red text-white font-semibold rounded-lg hover:bg-accent-red/80 transition-colors">
          + Create Dev Log
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-4">Dev Logs</h2>
      {loading && <p className="text-secondary">Loading dev logs...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-gray-800/30 rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date Created</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devLogs.map((log) => (
                <tr key={log._id} className="border-t border-gray-700/50 hover:bg-gray-700/20">
                  <td className="p-4 font-medium text-primary">{log.title}</td>
                  <td className="p-4 text-secondary">{log.category}</td>
                  <td className="p-4 text-secondary">{new Date(log.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <Link href={`/admin/content/${log._id}`} className="text-accent-red hover:underline">Edit</Link>
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
