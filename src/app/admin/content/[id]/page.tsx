'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditDevLogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Update');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      const fetchDevLog = async () => {
        try {
          const response = await fetch(`/api/admin/devlogs/${id}`);
          if (!response.ok) throw new Error('Failed to fetch dev log data.');
          const data = await response.json();
          setTitle(data.title);
          setContent(data.content);
          setCategory(data.category);
        } catch (err: any) {
          setError(err.message);
        }
      };
      fetchDevLog();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const actorId = '60d5ec49a4d8f5e3a8a9a8b1'; // Placeholder

    const response = await fetch(`/api/admin/devlogs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, category, actorId }),
    });

    if (response.ok) {
      setSuccess('Dev log updated successfully!');
    } else {
      const data = await response.json();
      setError(data.message || 'Failed to update dev log.');
    }
  };

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this dev log?')) return;
    const actorId = '60d5ec49a4d8f5e3a8a9a8b1'; // Placeholder

    const response = await fetch(`/api/admin/devlogs/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorId }),
    });

    if (response.ok) {
      router.push('/admin/content');
    } else {
      const data = await response.json();
      setError(data.message || 'Failed to archive dev log.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Dev Log</h1>
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Form fields are the same as create page */}
        <div>
          <label htmlFor="title">Title</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full mt-1 p-2 bg-gray-700/50 rounded-md" />
        </div>
        <div>
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full mt-1 p-2 bg-gray-700/50 rounded-md">
            <option>Update</option>
            <option>Announcement</option>
            <option>Behind the Scenes</option>
            <option>Fix</option>
          </select>
        </div>
        <div>
          <label htmlFor="content">Content</label>
          <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required rows={15} className="w-full mt-1 p-2 bg-gray-700/50 rounded-md" />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">{success}</p>}
        <div className="flex justify-between">
          <button type="submit" className="px-6 py-2 font-bold text-white bg-accent-red rounded-lg">Save Changes</button>
          <button type="button" onClick={handleArchive} className="px-6 py-2 font-bold text-white bg-gray-600 rounded-lg">Archive</button>
        </div>
      </form>
    </div>
  );
}
