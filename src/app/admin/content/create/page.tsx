'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateDevLogPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Update');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const response = await fetch('/api/admin/devlogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, category }),
    });

    const data = await response.json();
    if (response.ok) {
      setSuccess('Dev log created successfully! Redirecting...');
      setTimeout(() => router.push('/admin/content'), 2000);
    } else {
      setError(data.message || 'Failed to create dev log.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Dev Log</h1>
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-secondary">Title</label>
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
          <label htmlFor="category" className="block text-sm font-medium text-secondary">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 text-primary bg-gray-700/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-red"
          >
            <option>Update</option>
            <option>Announcement</option>
            <option>Behind the Scenes</option>
            <option>Fix</option>
          </select>
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-secondary">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={15}
            className="w-full px-3 py-2 mt-1 text-primary bg-gray-700/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-red"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">{success}</p>}
        <button
          type="submit"
          className="px-6 py-2 font-bold text-white bg-accent-red rounded-lg hover:bg-accent-red/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent-red"
        >
          Publish Dev Log
        </button>
      </form>
    </div>
  );
}
