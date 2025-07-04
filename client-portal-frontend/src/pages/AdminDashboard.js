import React, { useState, useEffect } from 'react';
import { FaUser, FaUsers, FaBuilding, FaUserShield, FaUserTimes, FaBook, FaBullhorn, FaCogs, FaChartBar, FaChevronDown, FaChevronUp, FaHome, FaCog, FaList, FaArchive, FaEye, FaLock, FaKey, FaEnvelope, FaBell, FaPalette, FaShieldAlt, FaRobot, FaChartPie, FaCheckCircle, FaExclamationTriangle, FaClock, FaSearch, FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaGroup, FaSitemap, FaStar, FaSync, FaFileAlt, FaCommentDots, FaUserEdit, FaUsersCog, FaUserCheck, FaUserSlash, FaUserSecret, FaUserFriends, FaUserTag, FaUserCircle, FaUserGraduate, FaUserNinja, FaUserMd, FaUserTie, FaUserAlt, FaUserAstronaut, FaUserInjured, FaUserLock, FaUserMinus, FaUserPlus, FaUserTimes as FaUserTimesAlt, FaTicketAlt } from 'react-icons/fa';

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
                <span className={`transition-transform duration-300 ${openDropdowns[section.key] ? 'rotate-180' : ''}`}>{openDropdowns[section.key] ? <FaChevronUp className="ml-auto" /> : <FaChevronDown className="ml-auto" />}</span>
              )}
            </button>
            <div
              style={{
                maxHeight: openDropdowns[section.key] ? `${section.children.length * 44}px` : '0px',
                transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
              }}
            >
              {section.children && (
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
          </div>
        ))}
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
  const [activeSection, setActiveSection] = useState('dashboard');
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [fadeOut, setFadeOut] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    user_count: 0,
    tenant_count: 0,
    open_ticket_count: 0,
    kb_article_count: 0,
    integrations: {},
    automation_failures: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Buckeye IT Admin Center';
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/adminpanel/api/dashboard-stats/');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    setFadeOut(true);
    setTimeout(() => {
      window.location.href = '/adminpanel/login/';
    }, 700);
  };

  const dashboardTiles = [
    {
      title: 'Total Users',
      value: dashboardData.user_count,
      icon: <FaUser className="text-blue-500 text-3xl" />,
      color: 'from-blue-100 to-blue-50',
      footer: '+3 this week',
    },
    {
      title: 'Active Tenants',
      value: dashboardData.tenant_count,
      icon: <FaBuilding className="text-green-500 text-3xl" />,
      color: 'from-green-100 to-green-50',
      footer: 'All healthy',
    },
    {
      title: 'KB Articles',
      value: dashboardData.kb_article_count,
      icon: <FaBook className="text-purple-500 text-3xl" />,
      color: 'from-purple-100 to-purple-50',
      footer: '5 drafts',
    },
    {
      title: 'Open Tickets',
      value: dashboardData.open_ticket_count,
      icon: <FaTicketAlt className="text-orange-500 text-3xl" />,
      color: 'from-orange-100 to-orange-50',
      footer: '2 scheduled',
    },
    {
      title: 'Integrations',
      value: Object.keys(dashboardData.integrations || {}).length,
      icon: <FaCogs className="text-pink-500 text-3xl" />,
      color: 'from-pink-100 to-pink-50',
      footer: '1 needs attention',
    },
    {
      title: 'Automation Failures',
      value: dashboardData.automation_failures?.length || 0,
      icon: <FaExclamationTriangle className="text-red-500 text-3xl" />,
      color: 'from-red-100 to-red-50',
      footer: 'All systems operational',
    },
  ];

  const sectionContent = {
    dashboard: (
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Overview</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardTiles.map((tile, index) => (
              <div key={index} className={`bg-gradient-to-br ${tile.color} rounded-lg shadow-md p-6 group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{tile.title}</h3>
                    <p className="text-3xl font-bold text-gray-900">{tile.value}</p>
                  </div>
                  <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                    {tile.icon}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400 group-hover:text-gray-600 transition">{tile.footer}</div>
              </div>
            ))}
          </div>
        )}
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
      </div>
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

  const SectionFade = ({ children, keyProp }) => {
    const [show, setShow] = useState(false);
    useEffect(() => {
      setShow(false);
      const timeout = setTimeout(() => setShow(true), 100);
      return () => clearTimeout(timeout);
    }, [keyProp]);
    return (
      <div className={`transition-opacity duration-700 ${show ? 'opacity-100' : 'opacity-0'}`}>{children}</div>
    );
  };

  return (
    <div className={`flex min-h-screen bg-gray-50 transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} openDropdowns={openDropdowns} setOpenDropdowns={setOpenDropdowns} />
      <div className="flex-1 flex flex-col">
        <Topbar onSignOut={handleSignOut} />
        <main className="flex-1 p-8 overflow-y-auto">
          <SectionFade keyProp={activeSection}>
            {sectionContent[activeSection] || <div>Section coming soon…</div>}
          </SectionFade>
        </main>
      </div>
      <style>{`
        @keyframes fadeInSlow { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeInSlow { animation: fadeInSlow 0.7s cubic-bezier(0.4,0,0.2,1); }
      `}</style>
    </div>
  );
};

export default AdminDashboard; 