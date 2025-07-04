import React, { useState, useEffect } from "react";

const GroupModal = ({ group, roles, tenants, onClose, onSaved }) => {
  const isEdit = !!group;
  const [name, setName] = useState(group ? group.name : "");
  const [description, setDescription] = useState(group ? group.description : "");
  const [scope, setScope] = useState(group && group.tenant ? "tenant" : "global");
  const [tenant, setTenant] = useState(group && group.tenant ? group.tenant.id : "");
  const [selectedRoles, setSelectedRoles] = useState(group ? group.roles.map(r => r.id) : []);
  const [selectedUsers, setSelectedUsers] = useState(group ? group.users.map(u => u.id) : []);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch users (optionally filter by tenant)
    let url = "/api/user/";
    if (scope === "tenant" && tenant) url += `?tenant=${tenant}`;
    setLoadingUsers(true);
    setErrorUsers(null);
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then(data => setUsers(data))
      .catch(err => setErrorUsers(err.message))
      .finally(() => setLoadingUsers(false));
  }, [scope, tenant]);

  const handleSave = async () => {
    setLoading(true);
    const payload = {
      name,
      description,
      tenant: scope === "tenant" ? tenant : null,
      roles: selectedRoles,
      users: selectedUsers,
    };
    const method = isEdit ? "PUT" : "POST";
    const url = isEdit ? `/api/user-groups/${group.id}/` : "/api/user-groups/";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      onSaved();
      onClose();
    } else {
      alert("Failed to save group");
    }
  };

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.2)', zIndex: 1000 }}>
      <div className="modal" style={{ background: '#fff', maxWidth: 480, margin: '60px auto', padding: 32, borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}>
        <h3>{isEdit ? "Edit Group" : "Create New Group"}</h3>
        <div style={{ marginBottom: 16 }}>
          <label>Group Name<br/>
            <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Description<br/>
            <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%' }} />
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Scope<br/>
            <select value={scope} onChange={e => setScope(e.target.value)} style={{ width: '100%' }}>
              <option value="global">Global</option>
              <option value="tenant">Tenant-specific</option>
            </select>
          </label>
        </div>
        {scope === "tenant" && (
          <div style={{ marginBottom: 16 }}>
            <label>Tenant<br/>
              <select value={tenant} onChange={e => setTenant(e.target.value)} style={{ width: '100%' }}>
                <option value="">Select Tenant</option>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label>Assigned Roles<br/>
            <select multiple value={selectedRoles} onChange={e => setSelectedRoles(Array.from(e.target.selectedOptions, o => o.value))} style={{ width: '100%', minHeight: 60 }}>
              {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
            </select>
          </label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Assign Users<br/>
            {loadingUsers ? <div>Loading users...</div> : null}
            {errorUsers && <div style={{ color: 'red' }}>Error loading users: {errorUsers}</div>}
            <select multiple value={selectedUsers} onChange={e => setSelectedUsers(Array.from(e.target.selectedOptions, o => o.value))} style={{ width: '100%', minHeight: 60 }}>
              {users.map(user => <option key={user.id} value={user.id}>{user.first_name} {user.last_name} ({user.email})</option>)}
            </select>
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onClose} disabled={loading}>Cancel</button>
          <button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
};

export default GroupModal; 