'use client';

import { useState } from 'react';

export default function CreateTicketPage() {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('Submitting...');

    // In a real app, you would get the userId from a client-side session/context
    // For now, we'll hardcode it for demonstration.
    const userId = 'HARDCODED_USER_ID'; // Replace with actual logged-in user ID

    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, subject, category, message }),
    });

    const data = await response.json();

    if (response.ok) {
      setStatusMessage('Ticket submitted successfully!');
      setSubject('');
      setCategory('General Inquiry');
      setMessage('');
    } else {
      setStatusMessage(`Error: ${data.message}`);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Submit a New Ticket</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-secondary-text mb-2">Subject</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full bg-base-charcoal/60 border border-white/20 rounded-lg p-3 focus:ring-accent-crimson focus:border-accent-crimson"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-secondary-text mb-2">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-base-charcoal/60 border border-white/20 rounded-lg p-3 focus:ring-accent-crimson focus:border-accent-crimson"
          >
            <option>General Inquiry</option>
            <option>Technical Support</option>
            <option>Billing Question</option>
            <option>Feedback</option>
          </select>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-secondary-text mb-2">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={6}
            className="w-full bg-base-charcoal/60 border border-white/20 rounded-lg p-3 focus:ring-accent-crimson focus:border-accent-crimson"
          ></textarea>
        </div>
        <button type="submit" className="w-full bg-accent-crimson hover:bg-accent-crimson-light text-white font-bold py-3 px-4 rounded-lg transition duration-300">
          Submit Ticket
        </button>
      </form>
      {statusMessage && <p className="mt-4 text-center text-sm text-gray-300">{statusMessage}</p>}
    </div>
  );
}
