import React from "react";

const GroupTable = ({ groups, onView, onEdit, onDelete }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 24 }}>
    <thead>
      <tr>
        <th>Group Name</th>
        <th>Description</th>
        <th>Roles</th>
        <th>Members</th>
        <th>Tenant</th>
        <th>Last Modified</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {groups.map(group => (
        <tr key={group.id}>
          <td>
            <a href="#" onClick={e => { e.preventDefault(); onView(group); }}>{group.name}</a>
            {group.is_default && <span style={{ marginLeft: 8, background: '#eee', color: '#c00', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>Default</span>}
          </td>
          <td>{group.description}</td>
          <td>{group.roles && group.roles.map(role => (
            <span key={role.id} style={{ background: '#f0f0f0', borderRadius: 4, padding: '2px 6px', marginRight: 4, fontSize: 12 }}>{role.name}</span>
          ))}</td>
          <td>{group.users ? group.users.length : 0}</td>
          <td>{group.tenant ? group.tenant.name : "Global"}</td>
          <td>{new Date(group.updated_at).toLocaleString()}</td>
          <td>
            <button onClick={() => onView(group)}>View</button>{' '}
            <button onClick={() => onEdit(group)}>Edit</button>{' '}
            <button onClick={() => onDelete(group)} style={{ color: '#c00' }}>Delete</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default GroupTable; 