import React from "react";

const GroupFilters = ({ roles, tenants, filters, setFilters }) => (
  <div style={{ display: 'flex', gap: 16, margin: '24px 0' }}>
    <input
      placeholder="Search by name"
      value={filters.search}
      onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
      style={{ flex: 1, minWidth: 180 }}
    />
    <select
      value={filters.role}
      onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}
    >
      <option value="">All Roles</option>
      {roles.map(role => (
        <option key={role.id} value={role.name}>{role.name}</option>
      ))}
    </select>
    <select
      value={filters.tenant}
      onChange={e => setFilters(f => ({ ...f, tenant: e.target.value }))}
    >
      <option value="">All Tenants</option>
      {tenants.map(tenant => (
        <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
      ))}
    </select>
  </div>
);

export default GroupFilters; 