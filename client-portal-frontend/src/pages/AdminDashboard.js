import React, { useState, useEffect } from 'react';
import { FaUser, FaUsers, FaBuilding, FaUserShield, FaUserTimes, FaBook, FaBullhorn, FaCogs, FaChartBar, FaChevronDown, FaChevronUp, FaHome, FaCog, FaList, FaArchive, FaEye, FaLock, FaKey, FaEnvelope, FaBell, FaPalette, FaShieldAlt, FaRobot, FaChartPie, FaCheckCircle, FaExclamationTriangle, FaClock, FaSearch, FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaGroup, FaSitemap, FaStar, FaSync, FaFileAlt, FaCommentDots, FaUserEdit, FaUsersCog, FaUserCheck, FaUserSlash, FaUserSecret, FaUserFriends, FaUserTag, FaUserCircle, FaUserGraduate, FaUserNinja, FaUserMd, FaUserTie, FaUserAlt, FaUserAstronaut, FaUserInjured, FaUserLock, FaUserMinus, FaUserPlus, FaUserTimes as FaUserTimesAlt } from 'react-icons/fa';

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

function Sidebar({ activeSection, setActiveSection, openDropdowns, setOpenDropdowns }) {
  return (
    <aside className="w-64 bg-gradient-to-b from-red-100 via-white to-gray-100 border-r h-screen flex flex-col shadow-lg">
      <div className="p-6 font-bold text-xl text-red-700 flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-400 text-white shadow">
        <FaChartBar className="text-2xl" /> Buckeye IT Admin
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {sidebarSections.map(section => (
          <div key={section.key}>
            <button
              className={`w-full flex items-center gap-3 px-5 py-3 text-left rounded-lg hover:bg-red-50 transition font-medium ${activeSection === section.key ? 'bg-red-200 text-red-900 shadow-inner' : 'text-gray-700'}`}
              onClick={() => {
                if (section.children) {
                  setOpenDropdowns(prev => ({ ...prev, [section.key]: !prev[section.key] }));
                } else {
                  setActiveSection(section.key);
                }
              }}
            >
              {section.icon}
              <span>{section.label}</span>
              {section.children && (
                openDropdowns[section.key] ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />
              )}
            </button>
            {section.children && openDropdowns[section.key] && (
              <div className="ml-8 border-l-2 border-red-100 pl-2">
                {section.children.map(child => (
                  <button
                    key={child.key}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded hover:bg-red-100 transition ${activeSection === child.key ? 'bg-red-200 text-red-900 font-semibold' : 'text-gray-600'}`}
                    onClick={() => setActiveSection(child.key)}
                  >
                    {child.icon}
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="p-4 text-xs text-gray-400">© {new Date().getFullYear()} Buckeye IT</div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="h-16 bg-gradient-to-r from-red-100 via-white to-gray-100 border-b flex items-center justify-between px-8 shadow-sm">
      <div className="font-bold text-lg text-red-700">Admin Center</div>
      <div className="flex items-center gap-4">
        <span className="text-gray-600">admin@buckeyeit.com</span>
        <img src="/static/portal/react/buckeyeit-logo-white.png" alt="Buckeye IT Logo" className="w-8 h-8 rounded-full shadow" />
      </div>
    </header>
  );
}

const dashboardTiles = [
  {
    title: 'Total Users',
    value: 42,
    icon: <FaUser className="text-blue-500 text-3xl" />,
    color: 'from-blue-100 to-blue-50',
    footer: '+3 this week',
  },
  {
    title: 'Active Tenants',
    value: 7,
    icon: <FaBuilding className="text-green-500 text-3xl" />,
    color: 'from-green-100 to-green-50',
    footer: 'All healthy',
  },
  {
    title: 'KB Articles',
    value: 128,
    icon: <FaBook className="text-purple-500 text-3xl" />,
    color: 'from-purple-100 to-purple-50',
    footer: '5 drafts',
  },
  {
    title: 'Announcements',
    value: 12,
    icon: <FaBullhorn className="text-yellow-500 text-3xl" />,
    color: 'from-yellow-100 to-yellow-50',
    footer: '2 scheduled',
  },
  {
    title: 'Integrations',
    value: 4,
    icon: <FaCogs className="text-pink-500 text-3xl" />,
    color: 'from-pink-100 to-pink-50',
    footer: '1 needs attention',
  },
  {
    title: 'Automation Failures',
    value: 0,
    icon: <FaExclamationTriangle className="text-red-500 text-3xl" />,
    color: 'from-red-100 to-red-50',
    footer: 'All systems operational',
  },
];

const sectionContent = {
  dashboard: (
    <>
      <h1 className="text-3xl font-bold mb-6 text-red-700">Welcome Back, admin! <span className="text-lg font-normal text-gray-500">[Tenant: Buckeye IT]</span></h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {dashboardTiles.map((tile, i) => (
          <div key={i} className={`rounded-2xl shadow-lg p-6 bg-gradient-to-br ${tile.color} flex flex-col gap-2 hover:scale-[1.03] hover:shadow-2xl transition-transform duration-200 cursor-pointer group relative overflow-hidden`}>
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-80 rounded-full p-3 shadow group-hover:shadow-lg transition">{tile.icon}</div>
              <div>
                <div className="text-2xl font-bold text-gray-800 group-hover:text-red-700 transition">{tile.value}</div>
                <div className="text-gray-500 font-medium">{tile.title}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400 group-hover:text-gray-600 transition">{tile.footer}</div>
            {/* Sample progress bar/chart */}
            <div className="absolute bottom-2 right-2 opacity-20 group-hover:opacity-40 transition">
              <FaChartPie className="text-5xl text-gray-300" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="flex-1 min-w-[300px] bg-white rounded-2xl shadow p-6 border border-red-100">
          <h2 className="font-semibold mb-2 text-red-700">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <button className="bg-gradient-to-r from-green-400 to-green-200 text-white rounded px-3 py-2 font-semibold shadow hover:scale-105 transition">Approve New User</button>
            <button className="bg-gradient-to-r from-blue-400 to-blue-200 text-white rounded px-3 py-2 font-semibold shadow hover:scale-105 transition">Run Automation Test</button>
            <button className="bg-gradient-to-r from-red-400 to-red-200 text-white rounded px-3 py-2 font-semibold shadow hover:scale-105 transition">Post Announcement</button>
            <button className="bg-gradient-to-r from-gray-400 to-gray-200 text-white rounded px-3 py-2 font-semibold shadow hover:scale-105 transition">Open Platform Settings</button>
          </div>
        </div>
        <div className="flex-1 min-w-[300px] bg-white rounded-2xl shadow p-6 border border-red-100">
          <h2 className="font-semibold mb-2 text-red-700">Recent Admin Activity (Audit Log Preview)</h2>
          <ul className="text-gray-700 list-disc ml-6">
            <li>admin logged in at Jul/03/2025 04:06 PM EST</li>
            <li>Test User logged in at Jul/01/2025 12:43 PM EST</li>
          </ul>
        </div>
        <div className="flex-1 min-w-[300px] bg-white rounded-2xl shadow p-6 border border-red-100">
          <h2 className="font-semibold mb-2 text-red-700">System Integrations</h2>
          <ul className="text-gray-700">
            <li>ConnectWise: <span className="text-green-600 font-bold">Connected</span></li>
            <li>Pax8: <span className="text-yellow-600 font-bold">Not Configured</span></li>
            <li>OpenAI: <span className="text-yellow-600 font-bold">Not Configured</span></li>
          </ul>
        </div>
        <div className="flex-1 min-w-[300px] bg-white rounded-2xl shadow p-6 border border-red-100">
          <h2 className="font-semibold mb-2 text-red-700">Automation Failures</h2>
          <p className="text-green-600">All systems operational</p>
        </div>
      </div>
      <div className="bg-gradient-to-r from-red-100 via-white to-gray-100 rounded-2xl shadow p-6 mt-6 border border-red-100">
        <h2 className="font-semibold mb-2 text-red-700">Coming Soon / Feature Roadmap</h2>
        <p>More admin features and insights coming soon!</p>
      </div>
    </>
  ),
  'active-users': <div><h2 className="text-2xl font-bold mb-4">Active Users</h2><p>List of active users will go here.</p></div>,
  'groups': <div><h2 className="text-2xl font-bold mb-4">Groups</h2><p>List of user groups will go here.</p></div>,
  'tenants': <div><h2 className="text-2xl font-bold mb-4">Tenants</h2><p>Tenant management will go here.</p></div>,
  'tickets': <div><h2 className="text-2xl font-bold mb-4">Tickets</h2><p>Admin ticket management will go here.</p></div>,
  'kb-articles': <div><h2 className="text-2xl font-bold mb-4">Knowledge Base Articles</h2><p>KB articles management will go here.</p></div>,
  'kb-categories': <div><h2 className="text-2xl font-bold mb-4">Knowledge Base Categories</h2><p>KB categories management will go here.</p></div>,
  'announcements': <div><h2 className="text-2xl font-bold mb-4">Announcements</h2><p>Announcement management will go here.</p></div>,
  'integrations': <div><h2 className="text-2xl font-bold mb-4">Integrations</h2><p>Integration settings will go here.</p></div>,
  'logs': <div><h2 className="text-2xl font-bold mb-4">Logs</h2><p>Audit logs and activity will go here.</p></div>,
  'settings': <div><h2 className="text-2xl font-bold mb-4">Settings</h2><p>Platform settings will go here.</p></div>,
};

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [openDropdowns, setOpenDropdowns] = useState({});

  useEffect(() => {
    document.title = 'Buckeye IT Admin Center';
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} openDropdowns={openDropdowns} setOpenDropdowns={setOpenDropdowns} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto">
          {sectionContent[activeSection] || <div>Section coming soon…</div>}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 