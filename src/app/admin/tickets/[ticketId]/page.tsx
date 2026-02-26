'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// These types should eventually be moved to a shared types file
interface ConversationEntry {
  authorId: string;
  authorName: string;
  authorRole: string;
  message: string;
  isInternalNote: boolean;
  timestamp: string;
}

interface Ticket {
  _id: string;
  subject: string;
  status: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  conversation: ConversationEntry[];
}

interface AssignableUser {
  _id: string;
  email: string;
}

export default function ViewTicketPage() {
  const params = useParams();
  const { ticketId } = params;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [newStatus, setNewStatus] = useState('');
  const [reply, setReply] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTicket = async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/tickets/${ticketId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ticket');
      }
      const data = await response.json();
      setTicket(data);
      setNewStatus(data.status); // Initialize status dropdown
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      // Filter for users who can be assigned tickets
      setAssignableUsers(data.filter((u: { _id: string, email: string, roleInfo: { name: string } }) => ['Admin', 'Dev Lead', 'Owner'].includes(u.roleInfo.name)));
    } catch (err: any) {
      setError(err.message); // Can reuse the same error state
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchUsers();
  }, [ticketId]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setIsSubmitting(true);
    setError('');

    try {
      // In a real app, this data would come from a global state/context holding the logged-in user's info
      const currentUser = {
        authorId: '60d5ec49a4d8f5e3a8a9a8b1', // Placeholder Admin ID
        authorName: 'Admin User', // Placeholder Admin Name
        authorRole: 'Admin', // Placeholder Admin Role
      };

      const response = await fetch(`/api/tickets/${ticketId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...currentUser,
            message: reply,
            isInternalNote: isInternalNote,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to post reply');
      }

      setReply('');
      await fetchTicket(); // Refresh the ticket data to show the new reply

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p className="text-secondary">Loading ticket...</p>;
  if (error) return <p className="text-red-400">Error: {error}</p>;
  if (!ticket) return <p className="text-secondary">Ticket not found.</p>;

  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo || '');

  const handleStatusChange = async () => {
    try {
      const payload: { status?: string; assignedTo?: string } = {};
      if (newStatus !== ticket.status) {
        payload.status = newStatus;
      }
      if (assignedTo !== ticket.assignedTo) {
        payload.assignedTo = assignedTo;
      }

      if (Object.keys(payload).length === 0) return; // Nothing to update

      const response = await fetch(`/api/tickets/${ticketId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update ticket');
      }
      // Refresh data to show the new status/assignment
      await fetchTicket();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <div className="mb-6">
          <Link href="/admin/tickets" className="text-accent-red hover:underline">← Back to all tickets</Link>
          <h1 className="text-3xl font-bold mt-2">{ticket.subject}</h1>
        </div>

        {/* Conversation Thread */}
        <div className="space-y-6">
          {ticket.conversation.map((entry, index) => (
            <div key={index} className={`p-4 rounded-lg ${entry.isInternalNote ? 'bg-yellow-900/30 border border-yellow-700/50' : entry.authorRole === 'User' ? 'bg-gray-700/30' : 'bg-accent-red/10'}`}>
              <div className="flex justify-between items-center">
                <p className="font-bold text-primary">{entry.authorName} <span className="text-xs font-normal text-secondary">({entry.authorRole})</span>
                  {entry.isInternalNote && <span className="ml-2 text-xs font-bold text-yellow-400">[INTERNAL]</span>}
                </p>
                <p className="text-xs text-secondary">{new Date(entry.timestamp).toLocaleString()}</p>
              </div>
              <p className="mt-2 text-secondary whitespace-pre-wrap">{entry.message}</p>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Reply</h2>
          <form onSubmit={handleReplySubmit}>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 text-primary bg-gray-700/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-red"
              placeholder="Type your reply here..."
            />
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center">
                <input
                  id="internal-note"
                  type="checkbox"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-accent-red focus:ring-accent-red"
                />
                <label htmlFor="internal-note" className="ml-2 block text-sm text-secondary">Internal Note (visible to admins only)</label>
              </div>
              <button type="submit" className="px-6 py-2 font-bold text-white bg-accent-red rounded-lg hover:bg-accent-red/80" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Post Reply'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Sidebar for Ticket Properties */}
      <div className="w-72 flex-shrink-0">
        <div className="bg-gray-800/30 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4">Ticket Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-primary bg-gray-700/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-red"
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Waiting on User</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary">Assigned To</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-primary bg-gray-700/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-red"
              >
                <option value="">Unassigned</option>
                {assignableUsers.map(user => (
                  <option key={user._id} value={user._id}>{user.email}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleStatusChange}
              className="w-full py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-600 rounded-md"
            >
              Save Changes
            </button>
            <div className="text-xs text-secondary">
              <p>Category: {ticket.category}</p>
              <p>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
