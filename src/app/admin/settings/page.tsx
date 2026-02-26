'use client';

import { useState, useEffect } from 'react';

export default function SiteSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        if (response.ok) {
          setMaintenanceMode(data.maintenanceMode);
        }
      } catch (err) {
        setError('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = async () => {
    try {
      // Placeholder for the actor ID, would come from session
      const actorId = '60d5ec49a4d8f5e3a8a9a8b1'; 
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenanceMode: !maintenanceMode, actorId }),
      });

      const data = await response.json();
      if (response.ok) {
        setMaintenanceMode(!maintenanceMode);
      } else {
        throw new Error(data.message || 'Failed to update settings');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Site Settings</h1>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <div className="bg-gray-800/30 p-6 rounded-lg max-w-md">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-primary">Maintenance Mode</h2>
            <p className="text-sm text-secondary">Redirect all public traffic to a maintenance page.</p>
          </div>
          <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded-lg font-semibold ${maintenanceMode ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
            {maintenanceMode ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
    </div>
  );
}
