'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('In Development');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const response = await fetch(`/api/admin/projects/${id}`);
          if (!response.ok) throw new Error('Failed to fetch project data.');
          const data = await response.json();
          setTitle(data.title);
          setDescription(data.description);
          setStatus(data.status);
        } catch (err: any) {
          setError(err.message);
        }
      };
      fetchProject();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const actorId = '60d5ec49a4d8f5e3a8a9a8b1'; // Placeholder

    const response = await fetch(`/api/admin/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, status, actorId }),
    });

    if (response.ok) {
      setSuccess('Project updated successfully!');
    } else {
      const data = await response.json();
      setError(data.message || 'Failed to update project.');
    }
  };

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this project?')) return;
    const actorId = '60d5ec49a4d8f5e3a8a9a8b1'; // Placeholder

    const response = await fetch(`/api/admin/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actorId }),
    });

    if (response.ok) {
      router.push('/admin/projects');
    } else {
      const data = await response.json();
      setError(data.message || 'Failed to archive project.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Project</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Form fields are the same as create page */}
        <div>
          <label htmlFor="title">Project Title</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full mt-1 p-2 bg-gray-700/50 rounded-md" />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} className="w-full mt-1 p-2 bg-gray-700/50 rounded-md" />
        </div>
        <div>
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} required className="w-full mt-1 p-2 bg-gray-700/50 rounded-md">
            <option>In Development</option>
            <option>Live</option>
            <option>On Hold</option>
            <option>Archived</option>
          </select>
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
