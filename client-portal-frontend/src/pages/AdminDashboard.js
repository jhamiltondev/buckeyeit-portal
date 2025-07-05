import React, { useState, useEffect } from 'react';
import { FaUser, FaUsers, FaBuilding, FaUserShield, FaUserTimes, FaBook, FaBullhorn, FaCogs, FaChartBar, FaChevronDown, FaChevronUp, FaHome, FaCog, FaList, FaArchive, FaEye, FaLock, FaKey, FaEnvelope, FaBell, FaPalette, FaShieldAlt, FaRobot, FaChartPie, FaCheckCircle, FaExclamationTriangle, FaClock, FaSearch, FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaGroup, FaSitemap, FaStar, FaSync, FaFileAlt, FaCommentDots, FaUserEdit, FaUsersCog, FaUserCheck, FaUserSlash, FaUserSecret, FaUserFriends, FaUserTag, FaUserCircle, FaUserGraduate, FaUserNinja, FaUserMd, FaUserTie, FaUserAlt, FaUserAstronaut, FaUserInjured, FaUserLock, FaUserMinus, FaUserPlus, FaUserTimes as FaUserTimesAlt, FaTicketAlt } from 'react-icons/fa';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import ActiveUsers from './ActiveUsers';
import Groups from './Groups';
import SuspendedDeletedUsers from './SuspendedDeletedUsers';
import './AdminDashboard.css';
import { AnimatePresence, motion } from 'framer-motion';
import { useUser } from '../context/UserContext';

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
      { label: 'Active Users', key: 'active-users', icon: <FaUserCheck />, path: 'users/active' },
      { label: 'Groups', key: 'groups', icon: <FaUsersCog />, path: 'groups' },
      { label: 'Suspended/Deleted Users', key: 'suspended-users', icon: <FaUserSlash />, path: 'users/suspended' },
      { label: 'Audit/Logs', key: 'user-logs', icon: <FaList />, path: 'users/logs' },
    ],
  },
  {
    label: 'Tenants',
    icon: <FaBuilding />,
    key: 'tenants',
    children: [
      { label: 'Active Tenants', key: 'active-tenants', icon: <FaCheckCircle />, path: 'tenants/active' },
      { label: 'VIP Tenants', key: 'vip-tenants', icon: <FaStar />, path: 'tenants/vip' },
      { label: 'Suspended/Deleted Tenants', key: 'suspended-tenants', icon: <FaUserTimesAlt />, path: 'tenants/suspended' },
    ],
  },
  {
    label: 'Knowledge Base',
    icon: <FaBook />,
    key: 'kb',
    children: [
      { label: 'All Articles', key: 'kb-articles', icon: <FaFileAlt />, path: 'kb/articles' },
      { label: 'Categories', key: 'kb-categories', icon: <FaSitemap />, path: 'kb/categories' },
      { label: 'Draft & Pending Review', key: 'kb-drafts', icon: <FaEdit />, path: 'kb/drafts' },
      { label: 'Archived Articles', key: 'kb-archived', icon: <FaArchive />, path: 'kb/archived' },
      { label: 'Most Viewed / Popular', key: 'kb-popular', icon: <FaEye />, path: 'kb/popular' },
      { label: 'Tenant Access Control', key: 'kb-access', icon: <FaUserShield />, path: 'kb/access' },
      { label: 'Article Feedback', key: 'kb-feedback', icon: <FaCommentDots />, path: 'kb/feedback' },
    ],
  },
  {
    label: 'Announcements',
    icon: <FaBullhorn />,
    key: 'announcements',
    children: [
      { label: 'All Announcements', key: 'announcements-all', icon: <FaBullhorn />, path: 'announcements/all' },
      { label: 'Drafts', key: 'announcements-drafts', icon: <FaEdit />, path: 'announcements/drafts' },
      { label: 'Scheduled Announcements', key: 'announcements-scheduled', icon: <FaCalendarAlt />, path: 'announcements/scheduled' },
      { label: 'Expired / Archived', key: 'announcements-archived', icon: <FaArchive />, path: 'announcements/archived' },
      { label: 'Audience View Matrix', key: 'announcements-audience', icon: <FaUsers />, path: 'announcements/audience' },
      { label: 'Analytics & Read Tracking', key: 'announcements-analytics', icon: <FaChartPie />, path: 'announcements/analytics' },
    ],
  },
  {
    label: 'Integrations',
    icon: <FaCogs />,
    key: 'integrations',
    children: [
      { label: 'All Integrations', key: 'integrations-all', icon: <FaCogs />, path: 'integrations/all' },
      { label: 'Available Integrations', key: 'integrations-available', icon: <FaPlus />, path: 'integrations/available' },
      { label: 'Connected Integrations', key: 'integrations-connected', icon: <FaCheckCircle />, path: 'integrations/connected' },
      { label: 'Add New Integration', key: 'integrations-add', icon: <FaPlus />, path: 'integrations/add' },
      { label: 'Integration Log', key: 'integrations-log', icon: <FaList />, path: 'integrations/log' },
      { label: 'Automation Settings', key: 'integrations-automation', icon: <FaRobot />, path: 'integrations/automation' },
      { label: 'Tenant-Level Integration Settings', key: 'integrations-tenant', icon: <FaBuilding />, path: 'integrations/tenant' },
    ],
  },
  {
    label: 'Logs',
    icon: <FaList />,
    key: 'logs',
    children: [
      { label: 'User Activity Logs', key: 'logs-user', icon: <FaUser />, path: 'logs/user' },
      { label: 'Admin Actions Logs', key: 'logs-admin', icon: <FaUserShield />, path: 'logs/admin' },
      { label: 'Login & Access Logs', key: 'logs-login', icon: <FaLock />, path: 'logs/login' },
      { label: 'Audit Trails', key: 'logs-audit', icon: <FaKey />, path: 'logs/audit' },
      { label: 'Integration Logs', key: 'logs-integration', icon: <FaCogs />, path: 'logs/integration' },
      { label: 'Automation Logs', key: 'logs-automation', icon: <FaRobot />, path: 'logs/automation' },
      { label: 'Email & Notification Logs', key: 'logs-email', icon: <FaEnvelope />, path: 'logs/email' },
    ],
  },
  {
    label: 'Settings',
    icon: <FaCog />,
    key: 'settings',
    children: [
      { label: 'General Settings', key: 'settings-general', icon: <FaCog />, path: 'settings/general' },
      { label: 'User & Authentication Settings', key: 'settings-auth', icon: <FaUserLock />, path: 'settings/auth' },
      { label: 'Tenant Defaults', key: 'settings-tenant', icon: <FaBuilding />, path: 'settings/tenant' },
      { label: 'Email & Notification Settings', key: 'settings-email', icon: <FaEnvelope />, path: 'settings/email' },
      { label: 'Permissions & Roles', key: 'settings-permissions', icon: <FaUserTag />, path: 'settings/permissions' },
      { label: 'Automation Rules', key: 'settings-automation', icon: <FaRobot />, path: 'settings/automation' },
      { label: 'Branding & Theme', key: 'settings-branding', icon: <FaPalette />, path: 'settings/branding' },
      { label: 'Security Settings', key: 'settings-security', icon: <FaShieldAlt />, path: 'settings/security' },
      { label: 'API Access', key: 'settings-api', icon: <FaKey />, path: 'settings/api' },
    ],
  },
];

function Sidebar() {
  const [expandedSections, setExpandedSections] = useState(new Set(['users']));
  const navigate = useNavigate();
  const { user } = useUser();

  const toggleSection = (sectionKey) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionKey)) {
      newExpanded.delete(sectionKey);
    } else {
      newExpanded.add(sectionKey);
    }
    setExpandedSections(newExpanded);
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <aside className="w-64 bg-gray-900 border-r h-[calc(100vh-4rem)] flex flex-col shadow-lg">
      <nav className="flex-1 overflow-y-auto py-4 pr-2">
        <ul className="space-y-2">
          {sidebarSections.map(section => (
            <li key={section.key}>
              {section.children ? (
                <>
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full flex items-center justify-between px-4 py-2 text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{section.icon}</span>
                      <span>{section.label}</span>
                    </div>
                    {expandedSections.has(section.key) ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                  </button>
                  <AnimatePresence initial={false}>
                    {expandedSections.has(section.key) && (
                      <motion.ul
                        className="ml-8 mt-2 space-y-1 admin-sidebar-dropdown"
                        initial={{ height: 0, opacity: 0, y: -10 }}
                        animate={{ height: 'auto', opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -10 }}
                        transition={{ duration: 0.32, ease: 'easeInOut' }}
                      >
                        {section.children.map(child => (
                          <li key={child.key}>
                            <NavLink
                              to={child.path}
                              className={({ isActive }) =>
                                `block px-3 py-2 rounded-lg transition-colors text-sm ${
                                  isActive
                                    ? 'bg-gray-800 text-blue-500 font-semibold'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
                                }`
                              }
                              onClick={() => handleNavClick(child.path)}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{child.icon}</span>
                                <span>{child.label}</span>
                              </div>
                            </NavLink>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <NavLink
                  to={section.path || ''}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-gray-800 text-blue-500 font-semibold' 
                        : 'text-gray-200 hover:bg-gray-800'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{section.icon}</span>
                    <span>{section.label}</span>
                  </div>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 text-xs text-gray-500">© {new Date().getFullYear()} Buckeye IT</div>
    </aside>
  );
}

function Topbar({ onSignOut }) {
  const { user } = useUser();
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
      fetch(`/api/user/?search=${encodeURIComponent(search)}`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
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
    <header className="admin-topbar">
      <div className="admin-topbar-col admin-topbar-left">
        <span className="admin-title">Buckeye IT Admin Center</span>
      </div>
      <div className="admin-topbar-col admin-topbar-center">
        <div className="relative w-full max-w-xl mx-auto">
          <FaSearch className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input with-icon"
            placeholder="Search users, groups..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => search.length > 1 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />
          {showDropdown && results.length > 0 && (
            <div className="admin-search-dropdown">
              {results.map((r, i) => (
                <div
                  key={r.type + '-' + r.id}
                  className="admin-search-result"
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
      <div className="admin-topbar-col admin-topbar-right">
        <span className="admin-user-name">{user ? `${user.first_name} ${user.last_name}`.trim() || user.username : ''}</span>
        <button onClick={() => setDropdownOpen(v => !v)} className="admin-profile-btn">
          <img src="/static/portal/react/buckeyeit-logo-white.png" alt="Buckeye IT Logo" className="admin-profile-img" />
        </button>
        {dropdownOpen && (
          <div className="admin-profile-dropdown">
            <button className="admin-profile-dropdown-btn" onClick={onSignOut}>Sign out</button>
          </div>
        )}
      </div>
    </header>
  );
}

function QuickActions() {
  return (
    <div className="admin-quick-actions">
      <div className="admin-quick-actions-title">Quick Actions</div>
      <button className="admin-btn-neutral">Add User</button>
      <button className="admin-btn-neutral">Sync Data</button>
      <button className="admin-btn-neutral">Post Announcement</button>
      <button className="admin-btn-danger">Open Settings</button>
    </div>
  );
}

const dashboardCards = [
  {
    title: 'Total Users',
    metric: '128',
    subtext: '+5 this week',
    icon: <FaUser className="admin-card-icon" />,
    area: 'users',
  },
  {
    title: 'Active Tenants',
    metric: '12',
    subtext: 'All healthy',
    icon: <FaBuilding className="admin-card-icon" />,
    area: 'tenants',
  },
  {
    title: 'Open Tickets',
    metric: '7',
    subtext: '2 scheduled',
    icon: <FaTicketAlt className="admin-card-icon" />,
    area: 'tickets',
  },
  {
    title: 'Automation Failures',
    metric: '0',
    subtext: 'All systems operational',
    icon: <FaExclamationTriangle className="admin-card-icon" style={{ color: '#c00' }} />,
    area: 'failures',
  },
];

const integrations = [
  { name: 'ConnectWise', status: 'connected', icon: <FaCogs /> },
  { name: 'Pax8', status: 'not_configured', icon: <FaCogs /> },
  { name: 'OpenAI', status: 'not_configured', icon: <FaCogs /> },
];

const adminActivity = [
  { user: 'admin', action: 'logged in', time: 'Jul/03/2025 04:06 PM' },
  { user: 'testuser', action: 'logged in', time: 'Jul/01/2025 12:43 PM' },
];

const lastAnnouncement = { title: 'Scheduled Maintenance July 10', time: 'Jul/02/2025 09:00 AM' };

function useAdminTabTitle() {
  useEffect(() => {
    document.title = 'Buckeye IT Admin Center';
  }, []);
}

function DashboardContent() {
  const [stats, setStats] = useState({ users: null, tenants: null, tickets: null, failures: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('/api/user/?per_page=1').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/adminpanel/api/tenants/').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/dashboard_ticket_summary/').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/system_usage/').then(r => r.ok ? r.json() : Promise.reject()),
    ])
      .then(([userData, tenantData, ticketData, systemUsage]) => {
        setStats({
          users: userData.total || 0,
          tenants: tenantData.results ? tenantData.results.length : 0,
          tickets: ticketData.open_tickets || 0,
          failures: systemUsage.failures || 0,
        });
      })
      .catch(() => setError('Error loading dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  // Framer Motion variants for staggered fade-in
  const containerVariants = {
    show: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <div className="admin-dashboard-content">
      <motion.div className="admin-dashboard-masonry" variants={containerVariants} initial="hidden" animate="show">
        {loading ? (
          <div className="admin-loading-overlay">
            {error ? (
              <div className="admin-error-message">{error}</div>
            ) : (
              <div className="admin-loading-spinner"></div>
            )}
          </div>
        ) : (
          <>
            <motion.div className="admin-dashboard-card card-users" variants={cardVariants} whileHover={{ scale: 1.045, boxShadow: '0 8px 32px rgba(0,0,0,0.13)' }}>
              <div className="admin-card-header">{dashboardCards[0].icon}<span className="admin-card-title">{dashboardCards[0].title}</span></div>
              <div className="admin-card-metric">{stats.users}</div>
              <div className="admin-card-subtext">{dashboardCards[0].subtext}</div>
            </motion.div>
            <motion.div className="admin-dashboard-card card-tenants" variants={cardVariants} whileHover={{ scale: 1.045, boxShadow: '0 8px 32px rgba(0,0,0,0.13)' }}>
              <div className="admin-card-header">{dashboardCards[1].icon}<span className="admin-card-title">{dashboardCards[1].title}</span></div>
              <div className="admin-card-metric">{stats.tenants}</div>
              <div className="admin-card-subtext">{dashboardCards[1].subtext}</div>
            </motion.div>
            <motion.div className="admin-dashboard-card card-tickets" variants={cardVariants} whileHover={{ scale: 1.045, boxShadow: '0 8px 32px rgba(0,0,0,0.13)' }}>
              <div className="admin-card-header">{dashboardCards[2].icon}<span className="admin-card-title">{dashboardCards[2].title}</span></div>
              <div className="admin-card-metric">{stats.tickets}</div>
              <div className="admin-card-subtext">{dashboardCards[2].subtext}</div>
            </motion.div>
            <motion.div className="admin-dashboard-card card-failures" variants={cardVariants} whileHover={{ scale: 1.045, boxShadow: '0 8px 32px rgba(0,0,0,0.13)' }}>
              <div className="admin-card-header">{dashboardCards[3].icon}<span className="admin-card-title">{dashboardCards[3].title}</span></div>
              <div className="admin-card-metric">{stats.failures}</div>
              <div className="admin-card-subtext">{dashboardCards[3].subtext}</div>
            </motion.div>
            <motion.div className="admin-dashboard-card card-activity" variants={cardVariants} whileHover={{ scale: 1.045, boxShadow: '0 8px 32px rgba(0,0,0,0.13)' }}>
              <div className="admin-card-header"><FaCheckCircle className="admin-card-icon" /><span className="admin-card-title">Recent Admin Activity</span></div>
              <ul className="admin-activity-list">
                <li className="admin-activity-item">admin logged in at Jul/03/2025 04:06 PM</li>
                <li className="admin-activity-item">testuser logged in at Jul/01/2025 12:43 PM</li>
              </ul>
            </motion.div>
            <motion.div className="admin-dashboard-card card-integrations" variants={cardVariants} whileHover={{ scale: 1.045, boxShadow: '0 8px 32px rgba(0,0,0,0.13)' }}>
              <div className="admin-card-header"><FaCogs className="admin-card-icon" /><span className="admin-card-title">System Integrations</span></div>
              <ul className="admin-integrations-list">
                <li className="admin-integration-item"><FaCogs /> ConnectWise <span className="admin-integration-dot connected"></span><span className="admin-integration-status">Connected</span></li>
                <li className="admin-integration-item"><FaCogs /> Pax8 <span className="admin-integration-dot not_configured"></span><span className="admin-integration-status">Not Configured</span></li>
                <li className="admin-integration-item"><FaCogs /> OpenAI <span className="admin-integration-dot not_configured"></span><span className="admin-integration-status">Not Configured</span></li>
              </ul>
            </motion.div>
            <motion.div className="admin-dashboard-card card-announcement" variants={cardVariants} whileHover={{ scale: 1.045, boxShadow: '0 8px 32px rgba(0,0,0,0.13)' }}>
              <div className="admin-card-header"><FaBullhorn className="admin-card-icon" /><span className="admin-card-title">Announcements</span></div>
              <div className="admin-announcement-title">Scheduled Maintenance July 10</div>
              <div className="admin-announcement-time">Jul/02/2025 09:00 AM</div>
              <button className="admin-btn-primary admin-announcement-btn">View All</button>
            </motion.div>
            {/* Last row: Roadmap and Quick Actions side by side */}
            <div className="admin-dashboard-row-end">
              <motion.div className="admin-dashboard-card card-roadmap" variants={cardVariants} whileHover={{ scale: 1.045, boxShadow: '0 8px 32px rgba(0,0,0,0.13)' }}>
                <div className="admin-roadmap-title">Coming Soon / Roadmap</div>
                <ul className="admin-roadmap-list">
                  <li>Advanced reporting & analytics</li>
                  <li>Customizable dashboard widgets</li>
                  <li>Role-based access controls</li>
                  <li>Integration with more platforms</li>
                </ul>
              </motion.div>
              <motion.div className="admin-quick-actions-wrapper" variants={cardVariants}>
                <QuickActions />
              </motion.div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

const AdminDashboard = () => {
  useAdminTabTitle();
  const location = useLocation();
  return (
    <div className="bg-gray-50 min-h-screen admin-dashboard-root">
      <Topbar onSignOut={() => { window.location.href = '/adminpanel/login/'; }} />
      <div className="flex pt-16">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {location.pathname === '/adminpanel' || location.pathname === '/adminpanel/' ? <DashboardContent /> : <Outlet />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 