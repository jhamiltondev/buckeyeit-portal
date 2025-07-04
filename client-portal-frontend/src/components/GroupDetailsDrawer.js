import React from "react";

const GroupDetailsDrawer = ({ group, onClose, onEdit, onUserRemove }) => {
  if (!group) return null;
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, width: 400, height: '100%', background: '#fff', boxShadow: '-2px 0 16px rgba(0,0,0,0.15)', zIndex: 1001, padding: 32, overflowY: 'auto' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16 }}>✕</button>
      <h2>{group.name}</h2>
      <div style={{ color: '#888', marginBottom: 8 }}>{group.description}</div>
      <div style={{ marginBottom: 8 }}>
        <strong>Tenant:</strong> {group.tenant ? group.tenant.name : 'Global'}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Roles:</strong> {group.roles && group.roles.map(role => (
          <span key={role.id} style={{ background: '#f0f0f0', borderRadius: 4, padding: '2px 6px', marginRight: 4, fontSize: 12 }}>{role.name}</span>
        ))}
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Members:</strong> {group.users ? group.users.length : 0}
      </div>
      <table style={{ width: '100%', marginBottom: 16 }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {group.users && group.users.map(user => (
            <tr key={user.id}>
              <td>{user.first_name} {user.last_name}</td>
              <td>{user.email}</td>
              <td>{user.role || '-'}</td>
              <td>{user.is_active ? 'Active' : 'Inactive'}</td>
              <td><button onClick={() => onUserRemove(user.id)} style={{ color: '#c00' }}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onEdit}>Edit Group</button>
        <button style={{ color: '#c00' }}>Delete Group</button>
      </div>
    </div>
  );
};

export default GroupDetailsDrawer; 