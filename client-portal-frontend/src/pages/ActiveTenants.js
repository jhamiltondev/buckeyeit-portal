import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';

const STATUS_OPTIONS = ['All', 'Active', 'Suspended', 'Inactive'];

export default function ActiveTenants() {
  const [tenants, setTenants] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'Active', industry: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', domain: '', main_poc_name: '', main_poc_email: '', industry: '', status: 'Active' });

  useEffect(() => { fetchTenants(); /* eslint-disable-next-line */ }, [filters, page, sort, sortDir]);

  const fetchTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters.industry) params.append('industry', filters.industry);
      params.append('page', page);
      params.append('ordering', (sortDir === 'desc' ? '-' : '') + sort);
      const res = await fetch(`/adminpanel/api/tenants/?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch tenants');
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

  const handleAddTenant = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/adminpanel/api/tenants/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTenant),
      });
      if (!res.ok) throw new Error('Failed to add tenant');
      setShowAddModal(false);
      setNewTenant({ name: '', domain: '', main_poc_name: '', main_poc_email: '', industry: '', status: 'Active' });
      fetchTenants();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Active Tenants</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold" onClick={() => setShowAddModal(true)}>+ Add Tenant</button>
        </div>
        {/* Filter/Search Bar */}
        <div className="flex flex-wrap gap-4 mb-4 items-end">
          <div>
            <label className="block text-sm font-semibold mb-1">Search</label>
            <input type="text" className="bg-white rounded shadow px-3 py-2 outline-none" placeholder="Name, domain, or ID" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Status</label>
            <select className="bg-white rounded shadow px-3 py-2" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              {STATUS_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
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
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('domain')}>Primary Domain</th>
                <th className="p-3 text-left">Admin Contact</th>
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('status')}>Status</th>
                <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('created_at')}>Created On</th>
                <th className="p-3 text-left"># Users</th>
                <th className="p-3 text-left"># Tickets</th>
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
                <tr><td colSpan={8} className="text-center text-gray-500 py-8">No active tenants found.</td></tr>
              )}
              {tenants.map(tenant => (
                <tr key={tenant.id} className="border-b hover:bg-blue-50 cursor-pointer">
                  <td className="p-3 font-semibold text-blue-700 hover:underline"><a href={`#`}>{tenant.name}</a></td>
                  <td className="p-3">{tenant.domain}</td>
                  <td className="p-3">{tenant.main_poc_name}<br /><span className="text-xs text-gray-400">{tenant.main_poc_email}</span></td>
                  <td className="p-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${tenant.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{tenant.status === 'Active' && <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1" />} {tenant.status}</span></td>
                  <td className="p-3">{tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : ''}</td>
                  <td className="p-3">{tenant.user_count}</td>
                  <td className="p-3">{tenant.ticket_count}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:underline">View</button>
                      <button className="text-yellow-700 hover:underline">Edit</button>
                      <button className="text-red-600 hover:underline">Suspend</button>
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
        {/* Add Tenant Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl" onClick={() => setShowAddModal(false)}>&times;</button>
              <h3 className="text-xl font-bold mb-4">Add Tenant</h3>
              <form onSubmit={handleAddTenant} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Tenant Name</label>
                  <input required className="w-full bg-gray-100 rounded px-3 py-2 outline-none" value={newTenant.name} onChange={e => setNewTenant(t => ({ ...t, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Primary Domain</label>
                  <input className="w-full bg-gray-100 rounded px-3 py-2 outline-none" value={newTenant.domain} onChange={e => setNewTenant(t => ({ ...t, domain: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Admin Contact Name</label>
                  <input className="w-full bg-gray-100 rounded px-3 py-2 outline-none" value={newTenant.main_poc_name} onChange={e => setNewTenant(t => ({ ...t, main_poc_name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Admin Contact Email</label>
                  <input type="email" className="w-full bg-gray-100 rounded px-3 py-2 outline-none" value={newTenant.main_poc_email} onChange={e => setNewTenant(t => ({ ...t, main_poc_email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Industry</label>
                  <input className="w-full bg-gray-100 rounded px-3 py-2 outline-none" value={newTenant.industry} onChange={e => setNewTenant(t => ({ ...t, industry: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Status</label>
                  <select className="w-full bg-gray-100 rounded px-3 py-2 outline-none" value={newTenant.status} onChange={e => setNewTenant(t => ({ ...t, status: e.target.value }))}>
                    {STATUS_OPTIONS.filter(opt => opt !== 'All').map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-semibold" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">Add Tenant</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
} 