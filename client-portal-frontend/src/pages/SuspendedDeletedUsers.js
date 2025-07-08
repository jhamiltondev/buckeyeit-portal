import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';

const TABS = [
  { key: "suspended", label: "Suspended Users" },
  { key: "deleted", label: "Deleted Users" },
];

const SuspendedDeletedUsers = () => {
  const [tab, setTab] = useState("suspended");
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: "", tenant: "", role: "", admin: "", start: "", end: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modal, setModal] = useState(null); // 'details', 'restore', 'delete'

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line
  }, [tab, filters]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    let url = tab === "suspended" ? "/api/users/suspended/" : "/api/users/deleted/";
    const params = [];
    if (filters.search) params.push(`name=${filters.search}`);
    if (filters.tenant) params.push(`tenant=${filters.tenant}`);
    if (filters.role) params.push(`role=${filters.role}`);
    if (filters.admin) params.push(`admin=${filters.admin}`);
    if (filters.start) params.push(`start=${filters.start}`);
    if (filters.end) params.push(`end=${filters.end}`);
    if (params.length) url += `?${params.join("&")}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch users");
      setUsers(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async user => {
    if (!window.confirm("Restore this user to active status?")) return;
    setLoading(true);
    const res = await fetch(`/api/users/${user.id}/restore/`, { method: "POST" });
    setLoading(false);
    if (res.ok) loadUsers();
    else alert("Failed to restore user");
  };

  const handlePermanentDelete = async user => {
    if (!window.confirm("Permanently delete this user? This cannot be undone.")) return;
    setLoading(true);
    const res = await fetch(`/api/users/${user.id}/permanent_delete/`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) loadUsers();
    else alert("Failed to delete user");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Suspended & Deleted Users</h1>
          <div className="flex gap-2">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded font-semibold transition-colors ${tab === t.key ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
        <div className="flex flex-wrap gap-4 mb-4 items-center">
          <input placeholder="Search by name/email" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} className="bg-white rounded shadow px-3 py-2 outline-none" />
        {/* Add more filters here as needed */}
      </div>
        {loading && <div className="text-gray-500 mb-2">Loading users...</div>}
        {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded px-4 py-2 mb-2 font-semibold flex items-center"><span className="mr-2">⚠️</span>Error: {error}</div>}
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full bg-white">
        <thead>
              <tr className="bg-gray-50 text-gray-700 text-sm">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Tenant</th>
                <th className="p-3 text-left">{tab === 'suspended' ? 'Suspended' : 'Deleted'} Date</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Actioned By</th>
                <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
                <tr key={user.id} className="border-b hover:bg-blue-50 cursor-pointer">
                  <td className="p-3">{user.first_name} {user.last_name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.support_role}</td>
                  <td className="p-3">{user.tenant ? user.tenant.name : ''}</td>
                  <td className="p-3">{tab === 'suspended' ? (user.suspended_at ? new Date(user.suspended_at).toLocaleString() : '') : (user.deleted_at ? new Date(user.deleted_at).toLocaleString() : '')}</td>
                  <td className="p-3">{tab === 'suspended' ? user.suspension_reason : user.deletion_reason}</td>
                  <td className="p-3">{tab === 'suspended' ? (user.suspended_by ? `${user.suspended_by.first_name} ${user.suspended_by.last_name}` : '') : (user.deleted_by ? `${user.deleted_by.first_name} ${user.deleted_by.last_name}` : '')}</td>
                  <td className="p-3">
                    <button onClick={() => { setSelectedUser(user); setModal('details'); }} className="text-blue-600 hover:underline mr-2">View</button>
                    <button onClick={() => handleRestore(user)} className="text-green-700 hover:underline mr-2">Restore</button>
                    {tab === 'deleted' && <button onClick={() => handlePermanentDelete(user)} className="text-red-600 hover:underline">Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
      {/* Placeholder modals */}
      {modal === 'details' && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl" onClick={() => setModal(null)}>&times;</button>
              <h3 className="text-xl font-bold mb-4">User Details</h3>
              <div className="mb-2"><strong>Name:</strong> {selectedUser.first_name} {selectedUser.last_name}</div>
              <div className="mb-2"><strong>Email:</strong> {selectedUser.email}</div>
              <div className="mb-2"><strong>Role:</strong> {selectedUser.support_role}</div>
              <div className="mb-2"><strong>Tenant:</strong> {selectedUser.tenant ? selectedUser.tenant.name : ''}</div>
              <div className="mb-2"><strong>Status:</strong> {selectedUser.is_active ? 'Active' : (selectedUser.is_deleted ? 'Deleted' : 'Suspended')}</div>
              <div className="mb-2"><strong>Suspended At:</strong> {selectedUser.suspended_at ? new Date(selectedUser.suspended_at).toLocaleString() : ''}</div>
              <div className="mb-2"><strong>Suspension Reason:</strong> {selectedUser.suspension_reason}</div>
              <div className="mb-2"><strong>Deleted At:</strong> {selectedUser.deleted_at ? new Date(selectedUser.deleted_at).toLocaleString() : ''}</div>
              <div className="mb-2"><strong>Deletion Reason:</strong> {selectedUser.deletion_reason}</div>
              <button onClick={() => setModal(null)} className="mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded font-semibold">Close</button>
          </div>
        </div>
      )}
    </div>
    </motion.div>
  );
};

export default SuspendedDeletedUsers; 