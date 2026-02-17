'use client';

import { useState, useEffect } from 'react';

interface Ticket {
  _id: string;
  subject: string;
  category: string;
  status: string;
  createdAt: string;
}

export default function AdminTicketsPage() {
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
      case 'Open': return 'bg-blue-500';
      case 'In Progress': return 'bg-yellow-500';
      case 'Resolved': return 'bg-green-500';
      case 'Closed': return 'bg-gray-500';
      default: return 'bg-gray-700';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Ticket Management</h1>

      {loading && <p>Loading tickets...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}

      {!loading && !error && (
        <div className="bg-base-charcoal/50 rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-black/30">
              <tr>
                <th className="p-4">Subject</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Created</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket._id} className="border-t border-white/10 hover:bg-black/20">
                  <td className="p-4 font-semibold">{ticket.subject}</td>
                  <td className="p-4 text-secondary-text">{ticket.category}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-4 text-secondary-text">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <button className="text-secondary-text hover:text-primary-text">View</button>
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
