'use client';

import { useState, useEffect } from 'react';

export default function EditHomepageContentPage() {
  const [headline, setHeadline] = useState('');
  const [subtext, setSubtext] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content/homepage');
        const data = await response.json();
        if (response.ok) {
          setHeadline(data.headline);
          setSubtext(data.subtext);
        }
      } catch (error) {
        setStatusMessage('Failed to load content.');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('Saving...');

    const response = await fetch('/api/content/homepage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ headline, subtext }),
    });

    const data = await response.json();
    setStatusMessage(data.message);
  };

  if (loading) {
    return <div className="p-8">Loading content editor...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Homepage Content</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label htmlFor="headline" className="block text-sm font-medium text-secondary-text mb-2">Headline</label>
          <input
            type="text"
            id="headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full bg-base-charcoal/60 border border-white/20 rounded-lg p-3 focus:ring-accent-crimson focus:border-accent-crimson"
          />
        </div>
        <div>
          <label htmlFor="subtext" className="block text-sm font-medium text-secondary-text mb-2">Subtext</label>
          <textarea
            id="subtext"
            value={subtext}
            onChange={(e) => setSubtext(e.target.value)}
            rows={4}
            className="w-full bg-base-charcoal/60 border border-white/20 rounded-lg p-3 focus:ring-accent-crimson focus:border-accent-crimson"
          ></textarea>
        </div>
        <button type="submit" className="bg-accent-crimson hover:bg-accent-crimson-light text-white font-bold py-3 px-4 rounded-lg transition duration-300">
          Save Changes
        </button>
      </form>
      {statusMessage && <p className="mt-4 text-sm text-gray-300">{statusMessage}</p>}
    </div>
  );
}
