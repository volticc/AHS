'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateProjectPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('In Development');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const response = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, status }),
    });

    const data = await response.json();
    if (response.ok) {
      setSuccess('Project created successfully! Redirecting...');
      setTimeout(() => router.push('/admin/projects'), 2000);
    } else {
      setError(data.message || 'Failed to create project.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-secondary">Project Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 text-primary bg-gray-700/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-red"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-secondary">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="w-full px-3 py-2 mt-1 text-primary bg-gray-700/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-red"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-secondary">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 text-primary bg-gray-700/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-red"
          >
            <option>In Development</option>
            <option>Live</option>
            <option>On Hold</option>
            <option>Archived</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">{success}</p>}
        <button
          type="submit"
          className="px-6 py-2 font-bold text-white bg-accent-red rounded-lg hover:bg-accent-red/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent-red"
        >
          Create Project
        </button>
      </form>
    </div>
  );
}
