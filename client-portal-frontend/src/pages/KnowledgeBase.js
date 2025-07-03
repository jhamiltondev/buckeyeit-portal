import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserShield, FaLaptop, FaEnvelope, FaGlobe, FaTools, FaUserTie, FaQuestionCircle, FaStar, FaChevronUp } from 'react-icons/fa';

const categories = [
  { key: 'account', label: 'Account & Access', icon: <FaUserShield />, desc: 'Login issues, MFA, password reset, user onboarding' },
  { key: 'devices', label: 'Devices & Printers', icon: <FaLaptop />, desc: 'Printer setup, scanner issues, device enrollment' },
  { key: 'email', label: 'Email & Outlook', icon: <FaEnvelope />, desc: 'Outlook setup, shared mailboxes, email encryption' },
  { key: 'vpn', label: 'VPN & Remote Access', icon: <FaGlobe />, desc: 'FortiClient, Duo, RDP setup' },
  { key: 'm365', label: 'Microsoft 365', icon: <FaTools />, desc: 'Teams, OneDrive, SharePoint, Licensing' },
  { key: 'admin', label: 'Admin Tools', icon: <FaUserTie />, desc: 'New user creation, licensing, offboarding guides', vip: true },
  { key: 'faqs', label: 'General FAQs', icon: <FaQuestionCircle />, desc: 'What is Buckeye IT, response times, escalation policy' },
];

export default function KnowledgeBase() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showScroll, setShowScroll] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/knowledge_base_articles/')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load articles');
        setLoading(false);
      });
  }, []);

  // Filter articles by search and category
  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || (a.excerpt || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Trending: top 3 by rating, then by updated_at
  const trending = [...articles]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0) || new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 3);

  // Scroll-to-top button
  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 200);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-6">
      {/* Search Bar */}
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-2xl font-bold mb-4">Knowledge Base</h1>
        <div className="w-full max-w-xl flex items-center gap-2 mb-2">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-lg"
            placeholder="Search articles, guides, or how-tos…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="text-gray-500 text-sm">Try keywords like "VPN", "printer", "email setup"…</div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {categories.map(cat => (
          <button
            key={cat.key}
            className={`flex flex-col items-center p-4 rounded-xl shadow transition hover:shadow-lg border-2 ${selectedCategory === cat.key ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white'}`}
            onClick={() => setSelectedCategory(selectedCategory === cat.key ? null : cat.key)}
          >
            <span className="text-3xl mb-2">{cat.icon}</span>
            <span className="font-semibold mb-1">{cat.label}</span>
            <span className="text-xs text-gray-500 text-center">{cat.desc}</span>
          </button>
        ))}
      </div>

      {/* Smart Suggestions / Trending */}
      <div className="mb-8">
        <div className="font-semibold text-lg mb-2">Popular This Week</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading && <div className="text-gray-400 text-sm col-span-3">Loading...</div>}
          {error && <div className="text-red-400 text-sm col-span-3">{error}</div>}
          {!loading && !error && trending.map(a => (
            <div key={a.id} className="bg-yellow-50 rounded-xl p-4 shadow hover:shadow-lg transition">
              <div className="font-medium mb-1">{a.title}</div>
              <div className="text-xs text-gray-500 mb-2">Updated {Math.round((Date.now() - new Date(a.updated_at)) / (1000*60*60*24))} days ago</div>
              <div className="text-sm text-gray-700 mb-2">{a.excerpt}</div>
              <div className="flex items-center gap-1 text-yellow-500 mb-2">
                {[...Array(5)].map((_, i) => <FaStar key={i} className={i < (a.rating || 0) ? '' : 'opacity-30'} />)}
              </div>
              <button className="text-blue-600 hover:underline text-sm">Read More</button>
            </div>
          ))}
        </div>
      </div>

      {/* Article Cards */}
      <div className="mb-8">
        <div className="font-semibold text-lg mb-2">Articles</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading && <div className="text-gray-400 text-sm col-span-3">Loading...</div>}
          {error && <div className="text-red-400 text-sm col-span-3">{error}</div>}
          {!loading && !error && filteredArticles.length === 0 && <div className="text-gray-400 text-sm col-span-3">No articles found</div>}
          {!loading && !error && filteredArticles.map(a => (
            <div key={a.id} className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition flex flex-col">
              <div className="font-medium mb-1">{a.title}</div>
              <div className="text-xs text-gray-500 mb-2">Updated {Math.round((Date.now() - new Date(a.updated_at)) / (1000*60*60*24))} days ago</div>
              <div className="text-sm text-gray-700 mb-2">{a.excerpt}</div>
              <div className="flex items-center gap-1 text-yellow-500 mb-2">
                {[...Array(5)].map((_, i) => <FaStar key={i} className={i < (a.rating || 0) ? '' : 'opacity-30'} />)}
              </div>
              <button className="text-blue-600 hover:underline text-sm mt-auto">Read More</button>
            </div>
          ))}
        </div>
      </div>

      {/* Fallback Help Panel */}
      <div className="bg-blue-50 rounded-xl p-6 flex flex-col items-center mb-8">
        <div className="font-semibold text-lg mb-2">Couldn't find what you were looking for?</div>
        <div className="mb-3 text-gray-600">Submit a ticket or contact support and we'll help you out.</div>
        <div className="flex gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">Submit a Ticket</button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-300 transition">Contact Support</button>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScroll && (
        <button
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <FaChevronUp size={20} />
        </button>
      )}
    </div>
  );
} 