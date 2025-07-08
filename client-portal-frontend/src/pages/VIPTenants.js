import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

const VIP_LEVELS = ['All', 'Gold', 'Platinum', 'Silver', 'Custom'];

export default function VIPTenants() {
  const [tenants, setTenants] = useState([]);
  const [filters, setFilters] = useState({ search: '', vip_level: 'All', industry: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => { fetchTenants(); /* eslint-disable-next-line */ }, [filters, page, sort, sortDir]);

  const fetchTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('vip', 'true');
      if (filters.search) params.append('search', filters.search);
      if (filters.vip_level && filters.vip_level !== 'All') params.append('vip_level', filters.vip_level);
      if (filters.industry) params.append('industry', filters.industry);
      params.append('page', page);
      params.append('ordering', (sortDir === 'desc' ? '-' : '') + sort);
      const res = await fetch(`/adminpanel/api/tenants/?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch VIP tenants');
      const data = await res.json();
      setTenants(Array.isArray(data.results) ? data.results : []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err.message);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sort === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSort(field); setSortDir('asc'); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-6"><FaStar className="text-yellow-400" /> VIP Tenants</h1>
        {/* Filter/Search Bar */}
        <div className="flex flex-wrap gap-4 mb-4 items-end">
          <div>
            <label className="block text-sm font-semibold mb-1">Search</label>
            <input type="text" className="bg-white rounded shadow px-3 py-2 outline-none" placeholder="Name, domain, or VIP tag" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">VIP Level</label>
            <select className="bg-white rounded shadow px-3 py-2" value={filters.vip_level} onChange={e => setFilters(f => ({ ...f, vip_level: e.target.value }))}>
              {VIP_LEVELS.map(opt => <option key={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Industry</label>
            <input type="text" className="bg-white rounded shadow px-3 py-2 outline-none" placeholder="Industry" value={filters.industry} onChange={e => setFilters(f => ({ ...f, industry: e.target.value }))} />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold h-10 mt-6" onClick={() => { setPage(1); fetchTenants(); }}>Apply Filters</button>
        </div>
        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm">
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('name')}>Tenant Name</th>
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('vip_level')}>VIP Status</th>
                <th className="p-3 text-left">Primary Contact</th>
                <th className="p-3 text-left"># Users</th>
                <th className="p-3 text-left"># Open Tickets</th>
                <th className="p-3 text-left">Account Manager</th>
                <th className="p-3 text-left">Priority Notes</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="text-center text-gray-400 py-8">Loading...</td></tr>
              )}
              {error && (
                <tr><td colSpan={8} className="text-center text-red-500 py-8">{error}</td></tr>
              )}
              {!loading && !error && tenants.length === 0 && (
                <tr><td colSpan={8} className="text-center text-gray-500 py-8">No VIP tenants found. You can assign VIP status from the Tenant Details page.</td></tr>
              )}
              {tenants.map(tenant => (
                <tr key={tenant.id} className="border-b hover:bg-yellow-50 cursor-pointer">
                  <td className="p-3 font-semibold text-blue-700 hover:underline flex items-center gap-2"><FaStar className="text-yellow-400" /> <a href={`#`}>{tenant.name}</a></td>
                  <td className="p-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${tenant.vip_level === 'Gold' ? 'bg-yellow-100 text-yellow-700' : tenant.vip_level === 'Platinum' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>{tenant.vip_level}</span></td>
                  <td className="p-3">{tenant.main_poc_name}<br /><span className="text-xs text-gray-400">{tenant.main_poc_email}</span></td>
                  <td className="p-3">{tenant.user_count}</td>
                  <td className="p-3 font-bold text-red-600">{tenant.ticket_count}</td>
                  <td className="p-3">{tenant.account_manager ? `${tenant.account_manager.first_name} ${tenant.account_manager.last_name}` : ''}</td>
                  <td className="p-3">{tenant.priority_notes ? <span title={tenant.priority_notes}>{tenant.priority_notes.length > 30 ? tenant.priority_notes.slice(0, 30) + '…' : tenant.priority_notes}</span> : ''}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:underline">View VIP Profile</button>
                      <button className="text-yellow-700 hover:underline">Adjust VIP</button>
                      <button className="text-green-700 hover:underline">Assign Manager</button>
                      <button className="text-purple-700 hover:underline">View Tickets</button>
                    </div>
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
      </div>
    </motion.div>
  );
} 