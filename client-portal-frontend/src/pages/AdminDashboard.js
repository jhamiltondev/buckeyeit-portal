import React, { useState, useEffect } from 'react';
import { FaUser, FaUsers, FaBuilding, FaUserShield, FaUserTimes, FaBook, FaBullhorn, FaCogs, FaChartBar, FaChevronDown, FaChevronUp, FaHome, FaCog, FaList, FaArchive, FaEye, FaLock, FaKey, FaEnvelope, FaBell, FaPalette, FaShieldAlt, FaRobot, FaChartPie, FaCheckCircle, FaExclamationTriangle, FaClock, FaSearch, FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaGroup, FaSitemap, FaStar, FaSync, FaFileAlt, FaCommentDots, FaUserEdit, FaUsersCog, FaUserCheck, FaUserSlash, FaUserSecret, FaUserFriends, FaUserTag, FaUserCircle, FaUserGraduate, FaUserNinja, FaUserMd, FaUserTie, FaUserAlt, FaUserAstronaut, FaUserInjured, FaUserLock, FaUserMinus, FaUserPlus, FaUserTimes as FaUserTimesAlt, FaTicketAlt } from 'react-icons/fa';
import { NavLink, Routes, Route, useLocation } from 'react-router-dom';
import ActiveUsers from './ActiveUsers';
import Groups from './Groups';

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
    <aside className="w-64 bg-gradient-to-b from-red-100 via-white to-gray-100 border-r h-screen flex flex-col shadow-lg">
      <div className="p-6 font-bold text-xl text-red-700 flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-400 text-white shadow">
        <FaChartBar className="text-2xl" /> Buckeye IT Admin
      </div>
      <nav className="flex-1 overflow-y-auto py-4 pr-2">
        <ul>
          <li>
            <NavLink to="/adminpanel/users/active" className={({ isActive }) => isActive ? 'text-red-700 font-bold' : ''}>Active Users</NavLink>
          </li>
          <li>
            <NavLink to="/adminpanel/groups" className={({ isActive }) => isActive ? 'text-red-700 font-bold' : ''}>Groups</NavLink>
          </li>
        </ul>
      </nav>
      <div className="p-4 text-xs text-gray-400">© {new Date().getFullYear()} Buckeye IT</div>
    </aside>
  );
}

function Topbar({ onSignOut }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <header className="h-16 bg-gradient-to-r from-red-100 via-white to-gray-100 border-b flex items-center justify-between px-8 shadow-sm relative">
      <div className="font-bold text-lg text-red-700">Admin Center</div>
      <div className="flex items-center gap-4 relative">
        <span className="text-gray-600">admin@buckeyeit.com</span>
        <button onClick={() => setDropdownOpen(v => !v)} className="focus:outline-none">
          <img src="/static/portal/react/buckeyeit-logo-white.png" alt="Buckeye IT Logo" className="w-8 h-8 rounded-full shadow border-2 border-red-200" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 top-12 bg-white rounded shadow-lg py-2 w-40 z-50 animate-fadeInSlow">
            <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-gray-700" onClick={onSignOut}>Sign out</button>
          </div>
        )}
      </div>
    </header>
  );
}

const AdminDashboard = () => {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar onSignOut={() => { window.location.href = '/adminpanel/login/'; }} />
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes location={location}>
            <Route path="/adminpanel/users/active" element={<ActiveUsers />} />
            <Route path="/adminpanel/groups" element={<Groups />} />
            {/* Add more admin routes here as needed */}
            <Route path="*" element={<div>Welcome to the Admin Center</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 