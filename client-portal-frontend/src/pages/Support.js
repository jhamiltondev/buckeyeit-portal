import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaTimes, FaTag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Remove mockTickets, will use real data
// Mock ticket and KB data for scaffolding
// const mockTickets = [
//   { id: 101, subject: 'Cannot access email', status: 'Open', urgency: 'High', type: 'Access', created: '2024-07-01', updated: '2024-07-03', newReply: true },
//   { id: 102, subject: 'Printer not working', status: 'Needs Info', urgency: 'Medium', type: 'Hardware', created: '2024-06-28', updated: '2024-07-02', newReply: false },
//   { id: 103, subject: 'VPN setup', status: 'Open', urgency: 'Low', type: 'Network', created: '2024-06-25', updated: '2024-07-01', newReply: false },
//   { id: 104, subject: 'Password reset', status: 'Resolved', urgency: 'Medium', type: 'Account', created: '2024-06-20', updated: '2024-06-21', newReply: false },
//   { id: 105, subject: 'Software install', status: 'Resolved', urgency: 'Low', type: 'Software', created: '2024-06-15', updated: '2024-06-16', newReply: false },
// ];
const mockKB = [
  { id: 1, title: 'How to reset your password', keywords: ['password', 'reset', 'account'] },
  { id: 2, title: 'Setting up VPN access', keywords: ['vpn', 'network', 'remote'] },
  { id: 3, title: 'Troubleshooting printer issues', keywords: ['printer', 'hardware'] },
];

function getStatusColor(status) {
  switch (status) {
    case 'Open': return 'bg-blue-100 text-blue-700';
    case 'Resolved': return 'bg-green-100 text-green-700';
    case 'Needs Info': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}
function getUrgencyColor(urgency) {
  switch (urgency) {
    case 'High': return 'bg-red-100 text-red-700';
    case 'Medium': return 'bg-yellow-100 text-yellow-700';
    case 'Low': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export default function Support() {
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [showSubmit, setShowSubmit] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch('/api/support/tickets/')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setTickets(data.tickets || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load tickets');
        setLoading(false);
      });
  }, []);

  // Filtered tickets for dashboard
  const filteredTickets = tickets.filter(t =>
    t.summary?.toLowerCase().includes(search.toLowerCase()) ||
    t.id?.toString().includes(search)
  );
  console.log('filteredTickets', filteredTickets);
  // Defensive: only tickets with a valid id
  const safeTickets = filteredTickets.filter(t => t && (typeof t.id === 'string' || typeof t.id === 'number'));
  const openTickets = safeTickets.filter(t => t.status?.name === 'Open' || t.status?.name === 'Needs Info');
  const closedTickets = safeTickets.filter(t => t.status?.name === 'Resolved' || t.status?.name === 'Closed');

  // AI/keyword-matched KB suggestions
  const suggestedArticles = search
    ? mockKB.filter(a => a.keywords.some(k => search.toLowerCase().includes(k)))
    : mockKB.slice(0, 2);

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-6">
      {/* Submit a Ticket */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Support</h1>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => setShowSubmit(true)}
        >
          <FaPlus /> Submit a Ticket
        </button>
      </div>

      {/* Open/Closed Ticket Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-5">
          <div className="font-semibold text-lg mb-2">Open Tickets</div>
          {openTickets.slice(0, 3).map((t, idx) => (
            <div key={t.id || idx} className="flex items-center justify-between border-b last:border-b-0 py-2 cursor-pointer hover:bg-blue-50 rounded" onClick={() => setSelectedTicket(t)}>
              <div>
                <span className="font-medium">{t.summary}</span>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getStatusColor(t.status?.name)}`}>{t.status?.name}</span>
                {t.newReply && <span className="ml-2 bg-green-200 text-green-800 text-xs rounded px-2 py-0.5">New!</span>}
              </div>
              <div className="text-xs text-gray-500">{t.updated}</div>
            </div>
          ))}
          {openTickets.length > 3 && <div className="mt-2 text-right"><button className="text-blue-600 hover:underline text-sm">See all open tickets</button></div>}
          {openTickets.length === 0 && <div className="text-gray-400 text-sm">No open tickets</div>}
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <div className="font-semibold text-lg mb-2">Closed Tickets</div>
          {closedTickets.slice(0, 3).map((t, idx) => (
            <div key={t.id || idx} className="flex items-center justify-between border-b last:border-b-0 py-2 cursor-pointer hover:bg-green-50 rounded" onClick={() => setSelectedTicket(t)}>
              <div>
                <span className="font-medium">{t.summary}</span>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getStatusColor(t.status?.name)}`}>{t.status?.name}</span>
              </div>
              <div className="text-xs text-gray-500">{t.updated}</div>
            </div>
          ))}
          {closedTickets.length > 3 && <div className="mt-2 text-right"><button className="text-blue-600 hover:underline text-sm">See all closed tickets</button></div>}
          {closedTickets.length === 0 && <div className="text-gray-400 text-sm">No closed tickets</div>}
        </div>
      </div>

      {/* Ticket Dashboard/Table */}
      <div className="bg-white rounded-xl shadow p-5 mb-8">
        <div className="flex items-center mb-4 gap-2">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets by subject or ID..."
            className="w-full px-3 py-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          {/* Debug: Wrap table rendering in try/catch */}
          {(() => {
            try {
              return (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-4">ID</th>
                      <th className="py-2 pr-4">Subject</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Urgency</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Created</th>
                      <th className="py-2 pr-4">Last Updated</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeTickets.length === 0 && (
                      <tr><td colSpan={8} className="text-center text-gray-400 py-6">No tickets found</td></tr>
                    )}
                    {safeTickets.slice(0, 5).map((t, idx) => {
                      const key = t.id || idx;
                      console.log('Rendering ticket row', { key, t });
                      return (
                        <tr key={key} className="border-b hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedTicket(t)}>
                          <td className="py-2 pr-4 font-mono">{t.id}</td>
                          <td className="py-2 pr-4 font-medium">{t.summary} {t.newReply && <span className="ml-2 bg-green-200 text-green-800 text-xs rounded px-2 py-0.5">New!</span>}</td>
                          <td className="py-2 pr-4"><span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(t.status?.name)}`}>{t.status?.name}</span></td>
                          <td className="py-2 pr-4"><span className={`px-2 py-0.5 rounded text-xs ${getUrgencyColor(t.urgency)}`}>{t.urgency}</span></td>
                          <td className="py-2 pr-4"><span className="inline-flex items-center gap-1"><FaTag className="text-gray-400" />{t.type}</span></td>
                          <td className="py-2 pr-4">{t.created}</td>
                          <td className="py-2 pr-4">{t.updated}</td>
                          <td></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            } catch (err) {
              console.error('Error rendering ticket table:', err);
              return <tr><td colSpan={8} className="text-red-500">Error rendering tickets: {err.message}</td></tr>;
            }
          })()}
        </div>
        {safeTickets.length > 5 && (
          <div className="mt-2 text-right">
            <button className="text-blue-600 hover:underline text-sm" onClick={() => navigate('/tickets')}>See all tickets</button>
          </div>
        )}
      </div>

      {/* Smart Support / Suggestions */}
      <div className="bg-white rounded-xl shadow p-5 mb-8">
        <div className="font-semibold text-lg mb-2">Smart Support</div>
        <div className="mb-3 text-gray-600">Have a question? Try searching our Knowledge Base.</div>
        <div className="flex items-center mb-4 gap-2">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search knowledge base..."
            className="w-full px-3 py-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestedArticles.length === 0 && <div className="text-gray-400 text-sm">No suggested articles</div>}
          {suggestedArticles.map(a => (
            <div key={a.id} className="bg-blue-50 rounded p-3">
              <div className="font-medium">{a.title}</div>
              <div className="text-xs text-gray-500 mt-1">Keywords: {a.keywords.join(', ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setSelectedTicket(null)}><FaTimes size={20} /></button>
            <div className="mb-2 text-lg font-bold">Ticket #{selectedTicket.id}</div>
            <div className="mb-1 text-gray-700 font-medium">{selectedTicket.summary}</div>
            <div className="mb-2 text-xs text-gray-500">Status: <span className={`px-2 py-0.5 rounded ${getStatusColor(selectedTicket.status?.name)}`}>{selectedTicket.status?.name}</span></div>
            <div className="mb-4 text-xs text-gray-500">Created: {selectedTicket.created} | Last Updated: {selectedTicket.updated}</div>
            <div className="mb-4">
              <div className="font-semibold mb-1">Communication</div>
              <div className="bg-gray-50 rounded p-2 h-32 overflow-y-auto text-xs text-gray-700 mb-2">(Conversation thread here...)</div>
              <form className="flex gap-2" onSubmit={e => { e.preventDefault(); setReply(''); }}>
                <input
                  type="text"
                  className="flex-1 px-3 py-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
                  placeholder="Type your reply..."
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Send</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Submit Ticket Modal (placeholder) */}
      {showSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={() => setShowSubmit(false)}><FaTimes size={20} /></button>
            <div className="mb-2 text-lg font-bold">Submit a Ticket</div>
            <div className="mb-4 text-gray-600">(Ticket submission form goes here...)</div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition" onClick={() => setShowSubmit(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
} 