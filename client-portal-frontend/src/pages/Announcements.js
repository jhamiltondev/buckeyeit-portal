import React, { useEffect, useState } from 'react';

const CATEGORY_COLORS = {
  general: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  tips: 'bg-gray-100 text-gray-800',
  critical: 'bg-red-100 text-red-800',
};

function getCategoryColor(category) {
  if (category === 'maintenance') return CATEGORY_COLORS.maintenance;
  if (category === 'tips') return CATEGORY_COLORS.tips;
  if (category === 'critical') return CATEGORY_COLORS.critical;
  return CATEGORY_COLORS.general;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/announcements/', { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(setAnnouncements)
      .catch(() => setError('Could not load announcements.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center text-lg">Loading...</div>;
  if (error) return <div className="py-12 text-center text-red-600">{error}</div>;

  // Filter and sort
  let filtered = announcements.filter(a =>
    (category === 'all' || a.category === category) &&
    (a.title.toLowerCase().includes(search.toLowerCase()) || a.message.toLowerCase().includes(search.toLowerCase()))
  );
  if (sort === 'newest') filtered = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (sort === 'oldest') filtered = filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const pinned = filtered.filter(a => a.pinned);
  const feed = filtered.filter(a => !a.pinned);
  const categories = ['all', ...Array.from(new Set(announcements.map(a => a.category)))];

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 md:px-6">
      <h1 className="text-2xl font-bold mb-6">Announcements</h1>

      {/* Filter/Search Bar */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <input
          type="text"
          placeholder="Search announcements..."
          className="border rounded px-3 py-2 text-sm flex-1 min-w-[180px]"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="border rounded px-2 py-2 text-sm" value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
        <select className="border rounded px-2 py-2 text-sm" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* 1. Pinned Announcements */}
      {pinned.length > 0 && (
        <div className="mb-8">
          <div className="font-semibold text-lg mb-2">Pinned Announcements</div>
          <div className="space-y-4">
            {pinned.map(a => (
              <div key={a.id} className={`border-l-4 p-4 bg-white rounded shadow-sm ${getCategoryColor(a.category)}`.replace('bg-', 'border-')}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(a.category)}`}>{a.category.charAt(0).toUpperCase() + a.category.slice(1)}</span>
                  <span className="text-xs text-gray-500 ml-2">{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
                <div className="font-semibold">{a.title}</div>
                <div className="text-gray-700 text-sm mt-1 line-clamp-2">{a.message.length > 120 ? a.message.slice(0, 120) + '...' : a.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Recent Announcements Feed */}
      <div className="mb-8">
        <div className="font-semibold text-lg mb-2">Recent Announcements</div>
        <div className="space-y-4">
          {feed.length === 0 && <div className="text-gray-400">No announcements found.</div>}
          {feed.map(a => (
            <div key={a.id} className="bg-white rounded shadow-sm p-4 border border-gray-100 hover:shadow-md transition cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(a.category)}`}>{a.category.charAt(0).toUpperCase() + a.category.slice(1)}</span>
                <span className="text-xs text-gray-500 ml-2">{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
              <div className="font-semibold">{a.title}</div>
              <div className="text-gray-700 text-sm mt-1 line-clamp-2">{a.message.length > 120 ? a.message.slice(0, 120) + '...' : a.message}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Archive / History Section (Optional) */}
      <div className="text-right">
        <a href="#" className="text-blue-600 underline text-sm">View Archive</a>
      </div>
    </div>
  );
} 