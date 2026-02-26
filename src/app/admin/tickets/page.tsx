'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Ticket {
  _id: string;
  subject: string;
  status: string;
  category: string;
  updatedAt: string;
}

export default function TicketManagementPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/tickets');
        if (!response.ok) {
          throw new Error('Failed to fetch tickets');
        }
        const data = await response.json();
        setTickets(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-500/50 text-blue-300';
      case 'In Progress': return 'bg-yellow-500/50 text-yellow-300';
      case 'Waiting on User': return 'bg-purple-500/50 text-purple-300';
      case 'Resolved': return 'bg-green-500/50 text-green-300';
      case 'Closed': return 'bg-gray-600/50 text-gray-400';
      default: return 'bg-gray-700';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ticket Management</h1>
        {/* Add any primary actions here, like filtering */}
      </div>

      {loading && <p className="text-secondary">Loading tickets...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-gray-800/30 rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="p-4">Subject</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Updated</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket._id} className="border-t border-gray-700/50 hover:bg-gray-700/20">
                  <td className="p-4 font-medium text-primary">{ticket.subject}</td>
                  <td className="p-4 text-secondary">{ticket.category}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-4 text-secondary">{new Date(ticket.updatedAt).toLocaleString()}</td>
                  <td className="p-4">
                    <Link href={`/admin/tickets/${ticket._id}`} className="text-accent-red hover:underline">
                      View
                    </Link>
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
