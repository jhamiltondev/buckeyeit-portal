import React from "react";

const GroupTable = ({ groups, onView, onEdit, onDelete }) => (
  <table className="min-w-full bg-white">
    <thead>
      <tr className="bg-gray-50 text-gray-700 text-sm">
        <th className="p-3 text-left">Group Name</th>
        <th className="p-3 text-left">Description</th>
        <th className="p-3 text-left">Roles</th>
        <th className="p-3 text-left">Members</th>
        <th className="p-3 text-left">Tenant</th>
        <th className="p-3 text-left">Last Modified</th>
        <th className="p-3 text-left">Actions</th>
      </tr>
    </thead>
    <tbody>
      {groups.map(group => (
        <tr key={group.id} className="border-b hover:bg-blue-50 cursor-pointer">
          <td className="p-3">
            <a href="#" onClick={e => { e.preventDefault(); onView(group); }} className="text-blue-700 hover:underline font-semibold">{group.name}</a>
            {group.is_default && <span className="ml-2 bg-gray-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold">Default</span>}
          </td>
          <td className="p-3">{group.description}</td>
          <td className="p-3">{group.roles && group.roles.map(role => (
            <span key={role.id} className="bg-gray-200 rounded px-2 py-0.5 mr-1 text-xs font-semibold">{role.name}</span>
          ))}</td>
          <td className="p-3">{group.users ? group.users.length : 0}</td>
          <td className="p-3">{group.tenant ? group.tenant.name : "Global"}</td>
          <td className="p-3">{new Date(group.updated_at).toLocaleString()}</td>
          <td className="p-3">
            <button onClick={() => onView(group)} className="text-blue-600 hover:underline mr-2">View</button>
            <button onClick={() => onEdit(group)} className="text-yellow-700 hover:underline mr-2">Edit</button>
            <button onClick={() => onDelete(group)} className="text-red-600 hover:underline">Delete</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default GroupTable; 