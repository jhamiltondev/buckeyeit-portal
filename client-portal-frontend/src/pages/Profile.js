import React, { useState, useEffect } from 'react';
import { FaUser, FaBuilding, FaEnvelope, FaPhone, FaUserTie, FaStar, FaKey, FaLock, FaHistory, FaCheckCircle, FaTimesCircle, FaEdit, FaSync, FaSignOutAlt, FaTrash, FaBell, FaMoon, FaSun, FaNewspaper } from 'react-icons/fa';
import { useUser } from '../context/UserContext';

export default function Profile() {
  const { user, loading } = useUser();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [supportRole, setSupportRole] = useState(user?.support_role || '');
  const [theme, setTheme] = useState(user?.theme || 'System');
  const [emailNotifications, setEmailNotifications] = useState(user?.email_notifications ?? true);
  const [showTechNews, setShowTechNews] = useState(user?.show_tech_news ?? true);
  const [saveStatus, setSaveStatus] = useState('');
  const [savingPref, setSavingPref] = useState('');

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setSupportRole(user.support_role || '');
      setTheme(user.theme || 'System');
      setEmailNotifications(user.email_notifications ?? true);
      setShowTechNews(user.show_tech_news ?? true);
    }
  }, [user]);

  if (loading) {
    return <div className="max-w-3xl mx-auto py-8 px-2 md:px-6">Loading...</div>;
  }
  if (!user) {
    return <div className="max-w-3xl mx-auto py-8 px-2 md:px-6">User not found.</div>;
  }

  const tenant = user.tenant || {};

  const hasChanges = () =>
    phone !== (user.phone || '') ||
    supportRole !== (user.support_role || '') ||
    theme !== (user.theme || 'System') ||
    emailNotifications !== (user.email_notifications ?? true) ||
    showTechNews !== (user.show_tech_news ?? true);

  async function handleSave() {
    setSaveStatus('');
    const payload = {};
    if (phone !== (user.phone || '')) payload.phone = phone;
    if (supportRole !== (user.support_role || '')) payload.support_role = supportRole;
    if (theme !== (user.theme || 'System')) payload.theme = theme;
    if (emailNotifications !== (user.email_notifications ?? true)) payload.email_notifications = emailNotifications;
    if (showTechNews !== (user.show_tech_news ?? true)) payload.show_tech_news = showTechNews;
    if (Object.keys(payload).length === 0) return;
    const res = await fetch('/api/user/update/', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setSaveStatus('Saved!');
      setEditing(false);
    } else {
      setSaveStatus('Error saving changes');
    }
  }

  async function handlePrefChange(field, value) {
    setSavingPref(field);
    const res = await fetch('/api/user/update/', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      if (field === 'email_notifications') setEmailNotifications(value);
      if (field === 'show_tech_news') setShowTechNews(value);
      setSavingPref('');
    } else {
      setSavingPref('');
      // Optionally show error feedback
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-2 md:px-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      {/* Basic Info Panel */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="mb-4">
          <div className="text-xl font-semibold">{user.first_name} {user.last_name}</div>
          <div className="text-gray-500">Username: {user.username}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><span className="font-medium">Email:</span> {user.email}</div>
          <div><span className="font-medium">Phone:</span> {editing ? (
            <input className="border rounded px-2 py-1 text-sm" value={phone} onChange={e => setPhone(e.target.value)} />
          ) : (
            phone || <span className="text-gray-400">Not set</span>
          )}</div>
          <div><span className="font-medium">Support Role:</span> {editing ? (
            <input className="border rounded px-2 py-1 text-sm" value={supportRole} onChange={e => setSupportRole(e.target.value)} />
          ) : (
            supportRole || <span className="text-gray-400">Not set</span>
          )}</div>
        </div>
        <div className="mt-4 text-right">
          {editing ? (
            <>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2" onClick={handleSave} disabled={!hasChanges()}>Save</button>
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg" onClick={() => setEditing(false)}>Cancel</button>
              {saveStatus && <span className="ml-4 text-green-600 font-semibold">{saveStatus}</span>}
            </>
          ) : (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={() => setEditing(true)}>Edit</button>
          )}
        </div>
      </div>

      {/* Company Info Panel */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="font-semibold text-lg mb-2">Company Info</div>
        {user.tenant ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><span className="font-medium">Company Name:</span> {tenant.name}</div>
            <div><span className="font-medium">VIP:</span> {tenant.vip ? 'Yes' : 'No'}</div>
            <div><span className="font-medium">Address:</span> {tenant.address || <span className="text-gray-400">Not set</span>}</div>
            <div><span className="font-medium">Phone:</span> {tenant.phone || <span className="text-gray-400">Not set</span>}</div>
            <div><span className="font-medium">Website:</span> {tenant.website ? <a href={tenant.website} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{tenant.website}</a> : <span className="text-gray-400">Not set</span>}</div>
            {tenant.logo && <div><span className="font-medium">Logo:</span> <img src={tenant.logo} alt="Company Logo" className="h-10 inline ml-2" /></div>}
          </div>
        ) : <div className="text-gray-400">No company info available.</div>}
      </div>

      {/* Security & Access Panel */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="font-semibold text-lg mb-2">Security & Access</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><span className="font-medium">Last Password Change:</span> <span className="text-gray-400">(not available)</span></div>
          <div><span className="font-medium">MFA Enabled:</span> <span className="text-gray-400">(not available)</span></div>
          <div><span className="font-medium">Last Login Location:</span> <span className="text-gray-400">(not available)</span></div>
          <div><span className="font-medium">Azure Role:</span> <span className="text-gray-400">(not available)</span></div>
        </div>
        <div className="flex gap-4 mt-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Reset My Password</button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">View Login History</button>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="font-semibold text-lg mb-2">Activity Overview</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><span className="font-medium">Tickets Submitted:</span> <span className="text-gray-400">(not available)</span></div>
          <div><span className="font-medium">Forms Submitted:</span> <span className="text-gray-400">(not available)</span></div>
          <div><span className="font-medium">Last Portal Activity:</span> <span className="text-gray-400">(not available)</span></div>
          <div><span className="font-medium">Avg. Response Time:</span> <span className="text-gray-400">(not available)</span></div>
        </div>
      </div>

      {/* Preferences Panel */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="font-semibold text-lg mb-2">Preferences</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <span className="font-medium">Email Notifications:</span>
            <input
              type="checkbox"
              className="ml-2"
              checked={!!emailNotifications}
              onChange={e => handlePrefChange('email_notifications', e.target.checked)}
              disabled={savingPref === 'email_notifications'}
            />
            {savingPref === 'email_notifications' && <span className="ml-2 text-xs text-gray-400">Saving...</span>}
          </div>
          <div><span className="font-medium">Default Company View:</span> {tenant.name || <span className="text-gray-400">(not available)</span>}</div>
          <div><span className="font-medium">Theme:</span>
            {editing ? (
              <select className="ml-2 border rounded px-2 py-1 text-sm" value={theme} onChange={e => setTheme(e.target.value)}>
                <option>Light</option>
                <option>Dark</option>
                <option>System</option>
              </select>
            ) : (
              theme === null ? <span className="text-gray-400">(not available)</span> : theme
            )}
          </div>
          <div>
            <span className="font-medium">Show Tech News Widget:</span>
            <input
              type="checkbox"
              className="ml-2"
              checked={!!showTechNews}
              onChange={e => handlePrefChange('show_tech_news', e.target.checked)}
              disabled={savingPref === 'show_tech_news'}
            />
            {savingPref === 'show_tech_news' && <span className="ml-2 text-xs text-gray-400">Saving...</span>}
          </div>
        </div>
      </div>

      {/* Actions / Quick Links */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg min-w-[180px]" type="button">Reset My Password</button>
        <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg min-w-[180px]" type="button" disabled>Edit Contact Info</button>
        <button className="bg-red-100 text-red-700 px-6 py-2 rounded-lg min-w-[180px]" type="button" disabled>Request Account Deletion</button>
        <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg min-w-[180px]" type="button" disabled>Log Out of All Devices</button>
      </div>
    </div>
  );
} 