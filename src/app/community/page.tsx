'use client';

import { useState, useEffect } from 'react';

// Simplified Suggestion type for the client
interface Suggestion {
  _id: string;
  title: string;
  description: string;
  upvotes: number;
  status: string;
  isStudioPick: boolean;
}

export default function CommunityPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  const fetchSuggestions = async () => {
    const response = await fetch('/api/suggestions');
    if (response.ok) {
      setSuggestions(await response.json());
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // The authorId would come from a user session in a real app
    const response = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, authorId: 'placeholder_user_id' }),
    });

    if (response.ok) {
      setTitle('');
      setDescription('');
      fetchSuggestions(); // Refresh list
    } else if (response.status === 401) {
      // If user is not authenticated, redirect to login page
      router.push('/login');
    } else {
      setError('Failed to submit suggestion.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-primary mb-4">Community Suggestions</h1>
      <p className="text-secondary mb-8">Have a great idea for a game or a feature? Share it with the community!</p>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800/30 p-6 rounded-lg mb-12 space-y-4">
        <h2 className="text-2xl font-bold">Submit Your Idea</h2>
        <input type="text" placeholder="Suggestion Title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 bg-gray-700/50 rounded-md" />
        <textarea placeholder="Describe your idea..." value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="w-full p-2 bg-gray-700/50 rounded-md" />
        <button type="submit" className="px-6 py-2 bg-accent-red text-white font-semibold rounded-lg">Submit</button>
        {error && <p className="text-red-400">{error}</p>}
      </form>

      {/* Suggestion List */}
      <div className="space-y-6">
        {suggestions.map(suggestion => (
          <div key={suggestion._id} className="bg-gray-800/30 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-primary">{suggestion.title}</h3>
            <p className="text-secondary mt-2">{suggestion.description}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm font-bold text-accent-red">Upvotes: {suggestion.upvotes}</span>
              <span className="text-sm font-semibold text-yellow-400">Status: {suggestion.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
