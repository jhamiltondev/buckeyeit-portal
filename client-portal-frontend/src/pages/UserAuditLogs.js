import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';

const ACTION_TYPES = [
  'All Actions',
  'Login',
  'Password Reset',
  'User Created',
  'Suspended',
  'Role Changed',
];

export default function UserAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    action: 'All Actions',
    user: '',
    search: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [filters, page]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.action && filters.action !== 'All Actions') params.append('action', filters.action);
      if (filters.user) params.append('user', filters.user);
      if (filters.search) params.append('search', filters.search);
      params.append('page', page);
      params.append('ordering', '-timestamp');
      const res = await fetch(`/adminpanel/api/user-audit-logs/?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const data = await res.json();
      setLogs(Array.isArray(data.results) ? data.results : []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">User Audit Logs</h1>
        {/* Filters/Search Bar */}
        <div className="flex flex-wrap gap-4 mb-4 items-end">
          {/* Date Range Picker (stub) */}
          <div>
            <label className="block text-sm font-semibold mb-1">From</label>
            <input type="date" className="bg-white rounded shadow px-3 py-2 outline-none" value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">To</label>
            <input type="date" className="bg-white rounded shadow px-3 py-2 outline-none" value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
          </div>
          {/* Action Type Dropdown */}
          <div>
            <label className="block text-sm font-semibold mb-1">Action Type</label>
            <select className="bg-white rounded shadow px-3 py-2" value={filters.action} onChange={e => setFilters(f => ({ ...f, action: e.target.value }))}>
              {ACTION_TYPES.map(type => <option key={type}>{type}</option>)}
            </select>
          </div>
          {/* User Search Input (stub) */}
          <div>
            <label className="block text-sm font-semibold mb-1">User</label>
            <input type="text" className="bg-white rounded shadow px-3 py-2 outline-none" placeholder="Search by name or email" value={filters.user} onChange={e => setFilters(f => ({ ...f, user: e.target.value }))} />
          </div>
          {/* Search Input */}
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1">Keyword</label>
            <input type="text" className="bg-white rounded shadow px-3 py-2 outline-none w-full" placeholder="Search logs" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold h-10 mt-6" onClick={() => { setPage(1); fetchLogs(); }}>Apply Filters</button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-semibold h-10 mt-6 ml-2">Export to CSV</button>
        </div>
        {/* Logs Table */}
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm">
                <th className="p-3 text-left">Timestamp</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Action Type</th>
                <th className="p-3 text-left">Performed By</th>
                <th className="p-3 text-left">IP Address</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="text-center text-gray-400 py-8">Loading...</td></tr>
              )}
              {error && (
                <tr><td colSpan={7} className="text-center text-red-500 py-8">{error}</td></tr>
              )}
              {!loading && !error && logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-8">No user activity logs found for the selected filters.</td>
                </tr>
              )}
              {logs.map(log => (
                <tr key={log.id} className="border-b hover:bg-blue-50 cursor-pointer">
                  <td className="p-3">{log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}</td>
                  <td className="p-3">{log.user_name} <span className="text-xs text-gray-400">{log.user_email}</span></td>
                  <td className="p-3">{log.action_type}</td>
                  <td className="p-3">{log.performed_by_name}</td>
                  <td className="p-3">{log.ip_address}</td>
                  <td className="p-3">{log.description}</td>
                  <td className="p-3">
                    <button onClick={() => setSelectedLog(log)} className="text-blue-600 hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-gray-500 text-sm">Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded font-semibold" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
            <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded font-semibold" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        </div>
        {/* Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl" onClick={() => setSelectedLog(null)}>&times;</button>
              <h3 className="text-xl font-bold mb-4">Log Details</h3>
              <pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto max-h-96">{JSON.stringify(selectedLog, null, 2)}</pre>
              <button onClick={() => setSelectedLog(null)} className="mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded font-semibold">Close</button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
} 