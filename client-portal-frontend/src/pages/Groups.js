import React, { useState, useEffect } from "react";
import GroupTable from "../components/GroupTable";
import GroupFilters from "../components/GroupFilters";
import GroupModal from "../components/GroupModal";
import GroupDetailsDrawer from "../components/GroupDetailsDrawer";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [roles, setRoles] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [filters, setFilters] = useState({ role: "", tenant: "", search: "" });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState({ groups: false, roles: false, tenants: false });
  const [error, setError] = useState({ groups: null, roles: null, tenants: null });

  useEffect(() => {
    fetchRoles();
    fetchTenants();
    loadGroups();
    // eslint-disable-next-line
  }, [filters]);

  const fetchRoles = async () => {
    setLoading(l => ({ ...l, roles: true }));
    setError(e => ({ ...e, roles: null }));
    try {
      const res = await fetch("/api/roles/");
      if (!res.ok) throw new Error("Failed to fetch roles");
      setRoles(await res.json());
    } catch (err) {
      setError(e => ({ ...e, roles: err.message }));
    } finally {
      setLoading(l => ({ ...l, roles: false }));
    }
  };
  const fetchTenants = async () => {
    setLoading(l => ({ ...l, tenants: true }));
    setError(e => ({ ...e, tenants: null }));
    try {
      const res = await fetch("/api/tenants/");
      if (!res.ok) throw new Error("Failed to fetch tenants");
      setTenants(await res.json());
    } catch (err) {
      setError(e => ({ ...e, tenants: err.message }));
    } finally {
      setLoading(l => ({ ...l, tenants: false }));
    }
  };
  const loadGroups = async () => {
    setLoading(l => ({ ...l, groups: true }));
    setError(e => ({ ...e, groups: null }));
    try {
      let url = "/api/user-groups/";
      const params = [];
      if (filters.role) params.push(`role=${filters.role}`);
      if (filters.tenant) params.push(`tenant=${filters.tenant}`);
      if (filters.search) params.push(`search=${filters.search}`);
      if (params.length) url += `?${params.join("&")}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch groups");
      setGroups(await res.json());
    } catch (err) {
      setError(e => ({ ...e, groups: err.message }));
    } finally {
      setLoading(l => ({ ...l, groups: false }));
    }
  };

  return (
    <div>
      <div className="header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>User Groups</h2>
        <div>
          <button onClick={() => setModalOpen(true)}>+ Create New Group</button>
          <span style={{ marginLeft: 16 }}>{groups.length} Groups</span>
        </div>
      </div>
      {loading.roles || loading.tenants ? <div>Loading filters...</div> : null}
      {error.roles && <div style={{ color: 'red' }}>Error loading roles: {error.roles}</div>}
      {error.tenants && <div style={{ color: 'red' }}>Error loading tenants: {error.tenants}</div>}
      <GroupFilters roles={roles} tenants={tenants} filters={filters} setFilters={setFilters} />
      {loading.groups ? <div>Loading groups...</div> : null}
      {error.groups && <div style={{ color: 'red' }}>Error loading groups: {error.groups}</div>}
      <GroupTable
        groups={groups}
        onView={group => { setSelectedGroup(group); setDrawerOpen(true); }}
        onEdit={group => { setSelectedGroup(group); setModalOpen(true); }}
        onDelete={group => {}}
      />
      {modalOpen && (
        <GroupModal
          group={selectedGroup}
          roles={roles}
          tenants={tenants}
          onClose={() => { setModalOpen(false); setSelectedGroup(null); }}
          onSaved={loadGroups}
        />
      )}
      {drawerOpen && (
        <GroupDetailsDrawer
          group={selectedGroup}
          onClose={() => setDrawerOpen(false)}
          onEdit={() => { setDrawerOpen(false); setModalOpen(true); }}
          onUserRemove={userId => {}}
        />
      )}
    </div>
  );
};

export default Groups; 