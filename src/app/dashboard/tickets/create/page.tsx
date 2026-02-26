'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateTicketPage() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // In a real app, the userId would come from a client-side session/context
    // For now, we'll hardcode a placeholder user ID.
    const placeholderUserId = '60d5ec49a4d8f5e3a8a9a8b2'; // Replace with a real user ID from your DB for testing

    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: placeholderUserId, subject, category, message }),
    });

    const data = await response.json();
    if (response.ok) {
      setSuccess('Ticket submitted successfully! Redirecting...');
      // Redirect to a page where the user can see their tickets
      setTimeout(() => router.push('/dashboard/tickets'), 2000);
    } else {
      setError(data.message || 'Failed to submit ticket.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Submit a Ticket</h1>
      <p className="text-secondary mb-6">Describe your issue below and our team will get back to you as soon as possible.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-secondary">Subject</label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
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
            <option>General Inquiry</option>
            <option>Technical Support</option>
            <option>Bug Report</option>
            <option>Account Issue</option>
            <option>Feedback</option>
          </select>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-secondary">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={8}
            className="w-full px-3 py-2 mt-1 text-primary bg-gray-700/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-red"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">{success}</p>}
        <button
          type="submit"
          className="w-full py-3 font-bold text-white bg-accent-red rounded-lg hover:bg-accent-red/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-accent-red"
        >
          Submit Ticket
        </button>
      </form>
    </div>
  );
}
