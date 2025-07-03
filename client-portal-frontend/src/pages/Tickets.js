import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaTag, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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

const PAGE_SIZE = 10;

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('updated');
  const [sortDir, setSortDir] = useState('desc');
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

  // Filtering
  const filteredTickets = tickets.filter(t =>
    t.summary?.toLowerCase().includes(search.toLowerCase()) ||
    t.id?.toString().includes(search)
  );

  // Sorting
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case 'id':
        aVal = a.id; bVal = b.id; break;
      case 'status':
        aVal = a.status?.name || ''; bVal = b.status?.name || ''; break;
      case 'created':
        aVal = a.created; bVal = b.created; break;
      case 'updated':
      default:
        aVal = a.updated; bVal = b.updated; break;
    }
    if (aVal === undefined || bVal === undefined) return 0;
    if (sortDir === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedTickets.length / PAGE_SIZE);
  const pagedTickets = sortedTickets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(col) {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
    setPage(1);
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Tickets</h1>
        <button className="text-blue-600 hover:underline text-sm" onClick={() => navigate(-1)}>Back to Support</button>
      </div>
      <div className="bg-white rounded-xl shadow p-5 mb-8">
        <div className="flex items-center mb-4 gap-2">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets by subject or ID..."
            className="w-full px-3 py-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4 cursor-pointer" onClick={() => handleSort('id')}>ID {sortBy === 'id' ? (sortDir === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort className="inline" />}</th>
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4 cursor-pointer" onClick={() => handleSort('status')}>Status {sortBy === 'status' ? (sortDir === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort className="inline" />}</th>
                <th className="py-2 pr-4">Urgency</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4 cursor-pointer" onClick={() => handleSort('created')}>Created {sortBy === 'created' ? (sortDir === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort className="inline" />}</th>
                <th className="py-2 pr-4 cursor-pointer" onClick={() => handleSort('updated')}>Last Updated {sortBy === 'updated' ? (sortDir === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort className="inline" />}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="text-center text-gray-400 py-6">Loading...</td></tr>
              )}
              {error && (
                <tr><td colSpan={8} className="text-center text-red-400 py-6">{error}</td></tr>
              )}
              {!loading && !error && pagedTickets.length === 0 && (
                <tr><td colSpan={8} className="text-center text-gray-400 py-6">No tickets found</td></tr>
              )}
              {pagedTickets.map(t => (
                <tr key={t.id} className="border-b hover:bg-blue-50 cursor-pointer" onClick={() => setSelectedTicket(t)}>
                  <td className="py-2 pr-4 font-mono">{t.id}</td>
                  <td className="py-2 pr-4 font-medium">{t.summary}</td>
                  <td className="py-2 pr-4"><span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(t.status?.name)}`}>{t.status?.name}</span></td>
                  <td className="py-2 pr-4"><span className={`px-2 py-0.5 rounded text-xs ${getUrgencyColor(t.urgency)}`}>{t.urgency}</span></td>
                  <td className="py-2 pr-4"><span className="inline-flex items-center gap-1"><FaTag className="text-gray-400" />{t.type}</span></td>
                  <td className="py-2 pr-4">{t.created}</td>
                  <td className="py-2 pr-4">{t.updated}</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-4">
            <button
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <button
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
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
    </div>
  );
} 