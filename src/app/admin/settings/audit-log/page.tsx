'use client';

import { useState, useEffect } from 'react';

interface LogEntry {
  _id: string;
  actorId: string;
  action: string;
  details: any;
  timestamp: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/admin/auditlog');
        if (!response.ok) {
          throw new Error('Failed to fetch audit logs');
        }
        const data = await response.json();
        setLogs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Audit Log</h1>
      <p className="text-secondary mb-6">Showing the 100 most recent actions taken by admins.</p>

      {loading && <p className="text-secondary">Loading logs...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-gray-800/30 rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Actor ID</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-t border-gray-700/50">
                  <td className="p-4 text-secondary">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 font-medium text-primary">{log.action}</td>
                  <td className="p-4 text-secondary font-mono text-xs">{log.actorId}</td>
                  <td className="p-4 text-secondary font-mono text-xs">{JSON.stringify(log.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
