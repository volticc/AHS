'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
}

export default function ProjectManagementPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/admin/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Management</h1>
        <Link href="/admin/projects/create" className="px-4 py-2 bg-accent-red text-white font-semibold rounded-lg hover:bg-accent-red/80 transition-colors">
          + Create Project
        </Link>
      </div>

      {loading && <p className="text-secondary">Loading projects...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-gray-800/30 rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Created</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id} className="border-t border-gray-700/50 hover:bg-gray-700/20">
                  <td className="p-4 font-medium text-primary">{project.title}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs font-semibold bg-gray-700 rounded-full">
                      {project.status}
                    </span>
                  </td>
                  <td className="p-4 text-secondary">{new Date(project.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <Link href={`/admin/projects/${project._id}`} className="text-accent-red hover:underline">Edit</Link>
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
