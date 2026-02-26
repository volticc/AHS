'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Permission {
  _id: string;
  name: string;
  description: string;
}

interface Role {
  _id: string;
  name: string;
  permissions: Permission[];
}

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRolesAndPermissions = async () => {
      try {
        // We will update the /api/admin/roles endpoint to support this rich data
        const response = await fetch('/api/admin/roles?includePermissions=true');
        if (!response.ok) {
          throw new Error('Failed to fetch roles and permissions');
        }
        const data = await response.json();
        setRoles(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRolesAndPermissions();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Roles & Permissions</h1>
        {/* We will add a button to create roles later */}
      </div>

      {loading && <p className="text-secondary">Loading roles...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && !error && (
        <div className="space-y-8">
          {roles.map((role) => (
            <div key={role._id} className="bg-gray-800/30 p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-accent-red">{role.name}</h2>
                <button className="text-secondary hover:text-primary">Edit</button>
              </div>
              <p className="mt-4 text-secondary">This role has the following permissions:</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {role.permissions.map((permission) => (
                  <div key={permission._id} className="bg-gray-700/40 p-3 rounded-md">
                    <p className="font-semibold text-primary">{permission.name}</p>
                    <p className="text-xs text-secondary">{permission.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
