'use client';

import { useState, useEffect } from 'react';

interface Suggestion {
  _id: string;
  title: string;
  description: string;
  status: string;
  upvotes: number;
}

export default function SuggestionManagementPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const response = await fetch('/api/suggestions');
      if (response.ok) {
        setSuggestions(await response.json());
      }
      setLoading(false);
    };
    fetchSuggestions();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    // This would call a new API endpoint: PUT /api/suggestions/[id]
    console.log(`Changing status of ${id} to ${newStatus}`);
  };

  if (loading) return <p>Loading suggestions...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Suggestion Management</h1>
      <div className="bg-gray-800/30 rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="p-4">Suggestion</th>
              <th className="p-4">Upvotes</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.map((suggestion) => (
              <tr key={suggestion._id} className="border-t border-gray-700/50">
                <td className="p-4">
                  <p className="font-bold text-primary">{suggestion.title}</p>
                  <p className="text-sm text-secondary">{suggestion.description}</p>
                </td>
                <td className="p-4 text-primary">{suggestion.upvotes}</td>
                <td className="p-4 text-primary">{suggestion.status}</td>
                <td className="p-4">
                  <select onChange={(e) => handleStatusChange(suggestion._id, e.target.value)} defaultValue={suggestion.status} className="p-2 bg-gray-700/50 rounded-md">
                    <option>New</option>
                    <option>Under Review</option>
                    <option>Approved</option>
                    <option>In Development</option>
                    <option>Declined</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
