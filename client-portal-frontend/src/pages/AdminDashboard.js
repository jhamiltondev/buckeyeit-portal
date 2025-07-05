import React, { useState, useEffect } from 'react';
import { FaUser, FaUsers, FaBuilding, FaUserShield, FaUserTimes, FaBook, FaBullhorn, FaCogs, FaChartBar, FaChevronDown, FaChevronUp, FaHome, FaCog, FaList, FaArchive, FaEye, FaLock, FaKey, FaEnvelope, FaBell, FaPalette, FaShieldAlt, FaRobot, FaChartPie, FaCheckCircle, FaExclamationTriangle, FaClock, FaSearch, FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaGroup, FaSitemap, FaStar, FaSync, FaFileAlt, FaCommentDots, FaUserEdit, FaUsersCog, FaUserCheck, FaUserSlash, FaUserSecret, FaUserFriends, FaUserTag, FaUserCircle, FaUserGraduate, FaUserNinja, FaUserMd, FaUserTie, FaUserAlt, FaUserAstronaut, FaUserInjured, FaUserLock, FaUserMinus, FaUserPlus, FaUserTimes as FaUserTimesAlt, FaTicketAlt } from 'react-icons/fa';
import { NavLink, Outlet } from 'react-router-dom';
import ActiveUsers from './ActiveUsers';
import Groups from './Groups';
import SuspendedDeletedUsers from './SuspendedDeletedUsers';

const sidebarSections = [
  {
    label: 'Dashboard',
    icon: <FaHome />,
    key: 'dashboard',
  },
  {
    label: 'Users',
    icon: <FaUser />,
    key: 'users',
    children: [
      { label: 'Active Users', key: 'active-users', icon: <FaUserCheck /> },
      { label: 'Groups', key: 'groups', icon: <FaUsersCog /> },
      { label: 'Suspended/Deleted Users', key: 'suspended-users', icon: <FaUserSlash /> },
      { label: 'Audit/Logs', key: 'user-logs', icon: <FaList /> },
    ],
  },
  {
    label: 'Tenants',
    icon: <FaBuilding />,
    key: 'tenants',
    children: [
      { label: 'Active Tenants', key: 'active-tenants', icon: <FaCheckCircle /> },
      { label: 'VIP Tenants', key: 'vip-tenants', icon: <FaStar /> },
      { label: 'Suspended/Deleted Tenants', key: 'suspended-tenants', icon: <FaUserTimesAlt /> },
    ],
  },
  {
    label: 'Knowledge Base',
    icon: <FaBook />,
    key: 'kb',
    children: [
      { label: 'All Articles', key: 'kb-articles', icon: <FaFileAlt /> },
      { label: 'Categories', key: 'kb-categories', icon: <FaSitemap /> },
      { label: 'Draft & Pending Review', key: 'kb-drafts', icon: <FaEdit /> },
      { label: 'Archived Articles', key: 'kb-archived', icon: <FaArchive /> },
      { label: 'Most Viewed / Popular', key: 'kb-popular', icon: <FaEye /> },
      { label: 'Tenant Access Control', key: 'kb-access', icon: <FaUserShield /> },
      { label: 'Article Feedback', key: 'kb-feedback', icon: <FaCommentDots /> },
    ],
  },
  {
    label: 'Announcements',
    icon: <FaBullhorn />,
    key: 'announcements',
    children: [
      { label: 'All Announcements', key: 'announcements-all', icon: <FaBullhorn /> },
      { label: 'Drafts', key: 'announcements-drafts', icon: <FaEdit /> },
      { label: 'Scheduled Announcements', key: 'announcements-scheduled', icon: <FaCalendarAlt /> },
      { label: 'Expired / Archived', key: 'announcements-archived', icon: <FaArchive /> },
      { label: 'Audience View Matrix', key: 'announcements-audience', icon: <FaUsers /> },
      { label: 'Analytics & Read Tracking', key: 'announcements-analytics', icon: <FaChartPie /> },
    ],
  },
  {
    label: 'Integrations',
    icon: <FaCogs />,
    key: 'integrations',
    children: [
      { label: 'All Integrations', key: 'integrations-all', icon: <FaCogs /> },
      { label: 'Available Integrations', key: 'integrations-available', icon: <FaPlus /> },
      { label: 'Connected Integrations', key: 'integrations-connected', icon: <FaCheckCircle /> },
      { label: 'Add New Integration', key: 'integrations-add', icon: <FaPlus /> },
      { label: 'Integration Log', key: 'integrations-log', icon: <FaList /> },
      { label: 'Automation Settings', key: 'integrations-automation', icon: <FaRobot /> },
      { label: 'Tenant-Level Integration Settings', key: 'integrations-tenant', icon: <FaBuilding /> },
    ],
  },
  {
    label: 'Logs',
    icon: <FaList />,
    key: 'logs',
    children: [
      { label: 'User Activity Logs', key: 'logs-user', icon: <FaUser /> },
      { label: 'Admin Actions Logs', key: 'logs-admin', icon: <FaUserShield /> },
      { label: 'Login & Access Logs', key: 'logs-login', icon: <FaLock /> },
      { label: 'Audit Trails', key: 'logs-audit', icon: <FaKey /> },
      { label: 'Integration Logs', key: 'logs-integration', icon: <FaCogs /> },
      { label: 'Automation Logs', key: 'logs-automation', icon: <FaRobot /> },
      { label: 'Email & Notification Logs', key: 'logs-email', icon: <FaEnvelope /> },
    ],
  },
  {
    label: 'Settings',
    icon: <FaCog />,
    key: 'settings',
    children: [
      { label: 'General Settings', key: 'settings-general', icon: <FaCog /> },
      { label: 'User & Authentication Settings', key: 'settings-auth', icon: <FaUserLock /> },
      { label: 'Tenant Defaults', key: 'settings-tenant', icon: <FaBuilding /> },
      { label: 'Email & Notification Settings', key: 'settings-email', icon: <FaEnvelope /> },
      { label: 'Permissions & Roles', key: 'settings-permissions', icon: <FaUserTag /> },
      { label: 'Automation Rules', key: 'settings-automation', icon: <FaRobot /> },
      { label: 'Branding & Theme', key: 'settings-branding', icon: <FaPalette /> },
      { label: 'Security Settings', key: 'settings-security', icon: <FaShieldAlt /> },
      { label: 'API Access', key: 'settings-api', icon: <FaKey /> },
    ],
  },
];

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 border-r h-[calc(100vh-4rem)] flex flex-col shadow-lg">
      <nav className="flex-1 overflow-y-auto py-4 pr-2">
        <ul className="space-y-2">
          <li>
            <NavLink 
              to="users/active" 
              className={({ isActive }) => 
                `block px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-gray-800 text-blue-500 font-semibold' : 'text-gray-200 hover:bg-gray-800'}`
              }
            >
              Active Users
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="groups" 
              className={({ isActive }) => 
                `block px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-gray-800 text-blue-500 font-semibold' : 'text-gray-200 hover:bg-gray-800'}`
              }
            >
              Groups
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="users/suspended" 
              className={({ isActive }) => 
                `block px-4 py-2 rounded-lg transition-colors ${isActive ? 'bg-gray-800 text-blue-500 font-semibold' : 'text-gray-200 hover:bg-gray-800'}`
              }
            >
              Suspended/Deleted Users
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="p-4 text-xs text-gray-500">© {new Date().getFullYear()} Buckeye IT</div>
    </aside>
  );
}

function Topbar({ onSignOut }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = window.location.assign ? (url) => window.location.assign(url) : () => {};

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    Promise.all([
      fetch(`/api/users/?search=${encodeURIComponent(search)}`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch(`/api/group/?search=${encodeURIComponent(search)}`, { credentials: 'include' }).then(r => r.ok ? r.json() : [])
    ]).then(([users, groups]) => {
      setResults([
        ...users.map(u => ({ type: 'user', id: u.id, name: u.first_name + ' ' + u.last_name, email: u.email })),
        ...groups.results ? groups.results.map(g => ({ type: 'group', id: g.id, name: g.name })) : []
      ]);
      setShowDropdown(true);
      setLoading(false);
    });
  }, [search]);

  return (
    <header className="w-full h-16 bg-gray-100 border-b flex items-center justify-between px-8 shadow-sm fixed top-0 left-0 z-40" style={{ minHeight: '4rem' }}>
      <div className="flex items-center gap-4 w-full">
        <div className="relative w-full max-w-xl">
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Search users, groups..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => search.length > 1 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />
          {showDropdown && results.length > 0 && (
            <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
              {results.map((r, i) => (
                <div
                  key={r.type + '-' + r.id}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                  onClick={() => {
                    setShowDropdown(false);
                    setSearch('');
                    if (r.type === 'user') navigate(`/adminpanel/users/active?id=${r.id}`);
                    if (r.type === 'group') navigate(`/adminpanel/groups?id=${r.id}`);
                  }}
                >
                  <span className="text-gray-500 text-sm">{r.type === 'user' ? '👤' : '👥'}</span>
                  <span className="font-medium">{r.name}</span>
                  {r.email && <span className="ml-2 text-xs text-gray-400">{r.email}</span>}
                </div>
              ))}
              {loading && <div className="px-4 py-2 text-gray-400">Searching...</div>}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 relative">
        <button className="rounded-full p-2 bg-gray-200 hover:bg-gray-300 text-gray-700" aria-label="Toggle dark mode" title="Toggle dark mode">
          <FaPalette />
        </button>
        <span className="text-gray-600">admin@buckeyeit.com</span>
        <button onClick={() => setDropdownOpen(v => !v)} className="focus:outline-none">
          <img src="/static/portal/react/buckeyeit-logo-white.png" alt="Buckeye IT Logo" className="w-8 h-8 rounded-full shadow border-2 border-gray-200" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 top-12 bg-white rounded shadow-lg py-2 w-40 z-50 animate-fadeInSlow">
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700" onClick={onSignOut}>Sign out</button>
          </div>
        )}
      </div>
    </header>
  );
}

function QuickActions() {
  return (
    <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 mb-6 flex flex-col gap-2 w-full max-w-xs ml-auto">
      <div className="font-semibold text-gray-700 mb-2">Quick Actions</div>
      <button className="bg-blue-600 text-white rounded px-3 py-2 font-semibold border border-blue-700 hover:bg-blue-700 transition">Add User</button>
      <button className="bg-gray-50 text-gray-800 rounded px-3 py-2 font-semibold border border-gray-300 hover:bg-gray-200 transition">Sync Data</button>
      <button className="bg-gray-50 text-gray-800 rounded px-3 py-2 font-semibold border border-gray-300 hover:bg-gray-200 transition">Post Announcement</button>
      <button className="bg-white text-red-600 rounded px-3 py-2 font-semibold border border-red-300 hover:bg-red-50 transition">Open Settings</button>
    </div>
  );
}

const AdminDashboard = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Topbar onSignOut={() => { window.location.href = '/adminpanel/login/'; }} />
      <div className="flex pt-16">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8 overflow-y-auto">
            <QuickActions />
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 