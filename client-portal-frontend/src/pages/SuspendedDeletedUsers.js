import React, { useState, useEffect } from "react";

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
    <div>
      <div className="header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Suspended & Deleted Users</h2>
        <div>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{ marginRight: 8, fontWeight: tab === t.key ? 'bold' : 'normal', background: tab === t.key ? '#eee' : 'transparent' }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ margin: '16px 0', display: 'flex', gap: 12 }}>
        <input placeholder="Search by name/email" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
        {/* Add more filters here as needed */}
      </div>
      {loading && <div>Loading users...</div>}
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Tenant</th>
            <th>{tab === 'suspended' ? 'Suspended' : 'Deleted'} Date</th>
            <th>Reason</th>
            <th>Actioned By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.first_name} {user.last_name}</td>
              <td>{user.email}</td>
              <td>{user.support_role}</td>
              <td>{user.tenant ? user.tenant.name : ''}</td>
              <td>{tab === 'suspended' ? (user.suspended_at ? new Date(user.suspended_at).toLocaleString() : '') : (user.deleted_at ? new Date(user.deleted_at).toLocaleString() : '')}</td>
              <td>{tab === 'suspended' ? user.suspension_reason : user.deletion_reason}</td>
              <td>{tab === 'suspended' ? (user.suspended_by ? `${user.suspended_by.first_name} ${user.suspended_by.last_name}` : '') : (user.deleted_by ? `${user.deleted_by.first_name} ${user.deleted_by.last_name}` : '')}</td>
              <td>
                <button onClick={() => { setSelectedUser(user); setModal('details'); }}>View</button>{' '}
                {tab === 'suspended' && <button onClick={() => handleRestore(user)}>Restore</button>}
                {tab === 'deleted' && <button onClick={() => handleRestore(user)}>Restore</button>}
                {tab === 'deleted' && <button onClick={() => handlePermanentDelete(user)} style={{ color: '#c00' }}>Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Placeholder modals */}
      {modal === 'details' && selectedUser && (
        <div className="modal-backdrop" style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.2)', zIndex: 1000 }}>
          <div className="modal" style={{ background: '#fff', maxWidth: 480, margin: '60px auto', padding: 32, borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}>
            <h3>User Details</h3>
            <div><strong>Name:</strong> {selectedUser.first_name} {selectedUser.last_name}</div>
            <div><strong>Email:</strong> {selectedUser.email}</div>
            <div><strong>Role:</strong> {selectedUser.support_role}</div>
            <div><strong>Tenant:</strong> {selectedUser.tenant ? selectedUser.tenant.name : ''}</div>
            <div><strong>Status:</strong> {selectedUser.is_active ? 'Active' : (selectedUser.is_deleted ? 'Deleted' : 'Suspended')}</div>
            <div><strong>Suspended At:</strong> {selectedUser.suspended_at ? new Date(selectedUser.suspended_at).toLocaleString() : ''}</div>
            <div><strong>Suspension Reason:</strong> {selectedUser.suspension_reason}</div>
            <div><strong>Deleted At:</strong> {selectedUser.deleted_at ? new Date(selectedUser.deleted_at).toLocaleString() : ''}</div>
            <div><strong>Deletion Reason:</strong> {selectedUser.deletion_reason}</div>
            <button onClick={() => setModal(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuspendedDeletedUsers; 