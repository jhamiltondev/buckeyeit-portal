import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaUsers, FaBuilding, FaUserShield, FaUserTimes, FaBook, FaBullhorn, FaCogs, FaChartBar, FaChevronDown, FaChevronUp, FaHome, FaCog, FaList, FaArchive, FaEye, FaLock, FaKey, FaEnvelope, FaBell, FaPalette, FaShieldAlt, FaRobot, FaChartPie, FaCheckCircle, FaExclamationTriangle, FaClock, FaSearch, FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaGroup, FaSitemap, FaStar, FaSync, FaFileAlt, FaCommentDots, FaUserEdit, FaUsersCog, FaUserCheck, FaUserSlash, FaUserSecret, FaUserFriends, FaUserTag, FaUserCircle, FaUserGraduate, FaUserNinja, FaUserMd, FaUserTie, FaUserAlt, FaUserAstronaut, FaUserInjured, FaUserLock, FaUserMinus, FaUserPlus, FaUserTimes as FaUserTimesAlt, FaTicketAlt, FaLightbulb } from 'react-icons/fa';
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
      { label: 'Suspended/Deleted Tenants', key: 'suspended-tenants', icon: <FaUserTimesAlt />, path: 'tenants/suspended-deleted' },
    ],
  },
  {
    label: 'Knowledge Base',
    icon: <FaBook />,
    key: 'kb',
    children: [
      { label: 'All Articles', key: 'kb-articles', icon: <FaFileAlt />, path: 'kb/articles' },
      { label: 'Categories', key: 'kb-categories', icon: <FaSitemap />, path: 'kb/categories' },
      { label: 'Draft & Pending Review', key: 'kb-drafts', icon: <FaEdit />, path: 'kb/draft-pending' },
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

function IdeasModal({ open, onClose, ideas, onSubmit, loading, error, isAdmin }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ title, description, priority });
    setSubmitting(false);
    setTitle('');
    setDescription('');
    setPriority('medium');
  };
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <motion.div className="modal" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}>
        <div className="modal-header">
          <FaLightbulb className="mr-2 text-yellow-400" /> Submit an Idea
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <input className="modal-input" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
          <textarea className="modal-input" placeholder="Describe your idea..." value={description} onChange={e => setDescription(e.target.value)} required rows={3} />
          <select className="modal-input" value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <button className="admin-btn-primary w-full mt-2" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Idea'}</button>
        </form>
        <div className="modal-section">
          <div className="modal-section-title">Recent Ideas</div>
          {loading ? <div>Loading...</div> : error ? <div className="text-red-500">{error}</div> : (
            <ul className="modal-ideas-list">
              {ideas.map(idea => (
                <li key={idea.id} className="modal-idea-item">
                  <div className="font-semibold">{idea.title}</div>
                  <div className="text-xs text-gray-500">{idea.status} • {idea.priority} • {new Date(idea.created_at).toLocaleString()}</div>
                  <div className="text-sm text-gray-700">{idea.description}</div>
                  <div className="text-xs text-gray-400">By {idea.submitted_by?.name || 'Unknown'}</div>
                  {isAdmin && (
                    <div className="modal-idea-actions">
                      {/* Admin actions: Approve/Reject/Implement (scaffold only) */}
                      <button className="admin-btn-neutral text-xs mr-1">Approve</button>
                      <button className="admin-btn-neutral text-xs mr-1">Reject</button>
                      <button className="admin-btn-neutral text-xs">Mark Implemented</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function DashboardSkeleton() {
  // Skeleton loader for dashboard layout
  return (
    <div className="admin-dashboard-new-layout dashboard-skeleton">
      <div className="dashboard-summary-row">
        {[1,2,3].map(i => (
          <div key={i} className="dashboard-summary-card skeleton-box" />
        ))}
      </div>
      <div className="dashboard-main-row">
        <div className="dashboard-main-card half-width skeleton-box" style={{height: 220}} />
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '16px', width: '100%' }}>
          <div className="dashboard-main-card compact-announcements skeleton-box" style={{width: '100%', height: 90}} />
          <div className="dashboard-main-card placeholder-card skeleton-box" style={{width: '100%', height: 80}} />
          <div className="dashboard-main-card placeholder-card skeleton-box" style={{width: '100%', height: 80}} />
        </div>
        <div className="dashboard-sidebar">
          {[1,2,3,4].map(i => (
            <div key={i} className="dashboard-sidebar-card skeleton-box" style={{height: 80}} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const [stats, setStats] = useState({ users: 0, tenants: 0, tickets: 0, failures: 0, automations_ran: 0, automation_fails: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [announcementsError, setAnnouncementsError] = useState(null);
  const [ideasOpen, setIdeasOpen] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState(null);
  const { user } = useUser();
  const isAdmin = user?.is_staff || user?.is_superuser;
  const firstLoadRef = useRef(true);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.18 } },
  };
  const fadeInCard = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.1, ease: 'easeInOut' } },
    hover: { scale: 1.04, transition: { duration: 0.45, ease: 'easeInOut' } },
  };

  // Fetch stats (users, tenants, tickets, failures)
  useEffect(() => {
    setStatsLoading(true);
    setStatsError(null);
    Promise.all([
      fetch('/api/user/?per_page=1').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/adminpanel/api/tenants/').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/system_usage/').then(r => r.ok ? r.json() : Promise.reject()),
    ])
      .then(([userData, tenantData, systemUsage]) => {
        setStats({
          users: userData.total || 0,
          tenants: tenantData.results ? tenantData.results.length : 0,
          tickets: systemUsage.tickets || 0,
          failures: systemUsage.failures || 0,
          automations_ran: systemUsage.automations_ran || 0,
          automation_fails: systemUsage.automation_fails || 0,
        });
      })
      .catch(() => setStatsError('Failed to load stats'))
      .finally(() => {
        setStatsLoading(false);
        firstLoadRef.current = false;
      });
  }, []);

  // Fetch announcements
  useEffect(() => {
    setAnnouncementsLoading(true);
    setAnnouncementsError(null);
    fetch('/api/announcements/')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => setAnnouncementsError('Failed to load announcements'))
      .finally(() => setAnnouncementsLoading(false));
  }, []);

  const fetchIdeas = () => {
    setIdeasLoading(true);
    setIdeasError(null);
    fetch('/api/ideas/', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setIdeas(data))
      .catch(() => setIdeasError('Failed to load ideas'))
      .finally(() => setIdeasLoading(false));
  };
  useEffect(() => { fetchIdeas(); }, []);

  const handleIdeaSubmit = async (idea) => {
    setIdeasLoading(true);
    setIdeasError(null);
    try {
      const res = await fetch('/api/ideas/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(idea),
      });
      if (!res.ok) throw new Error('Failed to submit idea');
      fetchIdeas();
    } catch {
      setIdeasError('Failed to submit idea');
    } finally {
      setIdeasLoading(false);
    }
  };

  if (firstLoadRef.current && (statsLoading && announcementsLoading)) return <DashboardSkeleton />;

  return (
    <div className="admin-dashboard-new-layout">
      <motion.h1
        style={{ fontSize: '2.25rem', fontWeight: 700, margin: '0 0 24px 0', letterSpacing: '-1px' }}
        variants={fadeInCard}
        initial="hidden"
        animate="visible"
      >
        Dashboard
      </motion.h1>
      {/* Top summary cards row */}
      <div className="dashboard-summary-row">
        <motion.div className="dashboard-summary-card" variants={fadeInCard} initial="hidden" animate="visible" whileHover="hover">
          <div className="summary-title">Total Users</div>
          {statsLoading ? <div className="skeleton-box" style={{height: 32, width: 60}} /> : statsError ? <div className="text-red-400 text-xs">No data</div> : <div className="summary-value up">{stats.users || 0}</div>}
          <div className="summary-progress"><div className="progress-bar up" style={{width: '67%'}}></div></div>
          <div className="summary-percent">+5 this week</div>
            </motion.div>
        <motion.div className="dashboard-summary-card" variants={fadeInCard} initial="hidden" animate="visible" whileHover="hover">
          <div className="summary-title">Active Tenants</div>
          {statsLoading ? <div className="skeleton-box" style={{height: 32, width: 60}} /> : statsError ? <div className="text-red-400 text-xs">No data</div> : <div className="summary-value up">{stats.tenants || 0}</div>}
          <div className="summary-progress"><div className="progress-bar up" style={{width: '90%'}}></div></div>
          <div className="summary-percent">All healthy</div>
            </motion.div>
        <motion.div className="dashboard-summary-card" variants={fadeInCard} initial="hidden" animate="visible" whileHover="hover">
          <div className="summary-title">Open Tickets</div>
          {statsLoading ? <div className="skeleton-box" style={{height: 32, width: 60}} /> : statsError ? <div className="text-red-400 text-xs">No data</div> : <div className="summary-value down">{stats.tickets || 0}</div>}
          <div className="summary-progress"><div className="progress-bar down" style={{width: '30%'}}></div></div>
          <div className="summary-percent">2 scheduled</div>
            </motion.div>
      </div>
      {/* Main content and sidebar */}
      <div className="dashboard-main-row">
        <motion.div className="dashboard-main-card half-width" variants={fadeInCard} initial="hidden" animate="visible" whileHover="hover">
          <div className="main-title">Recent Admin Activity</div>
              <ul className="admin-activity-list">
            {adminActivity.map((a, i) => (
              <li key={i} className="admin-activity-item">
                <span className="font-semibold">{a.user}</span> {a.action} <span className="text-gray-400">{formatTime(a.time)}</span>
              </li>
            ))}
              </ul>
            </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '16px', width: '100%' }}>
          <motion.div className="dashboard-main-card compact-announcements" style={{width: '100%'}} variants={fadeInCard} initial="hidden" animate="visible" whileHover="hover">
            <div className="main-title">Announcements</div>
            {announcementsLoading ? <div className="skeleton-box" style={{height: 32, width: 120}} /> : announcementsError ? <div className="text-red-400 text-xs">No data</div> : announcements.length > 0 ? announcements.slice(0,2).map((a, i) => (
              <div key={a.id || i} style={{marginBottom: 12}}>
                <div className="admin-announcement-title">{a.title}</div>
                <div className="admin-announcement-time">{formatTime(a.created_at)}</div>
              </div>
            )) : <div className="text-gray-400">No announcements</div>}
            <button className="admin-btn-primary admin-announcement-btn" style={{marginTop: 8, marginBottom: 0}}>View All</button>
          </motion.div>
          <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
            <motion.div className="dashboard-main-card placeholder-card" style={{ flex: 1 }} variants={fadeInCard} initial="hidden" animate="visible" whileHover="hover">
              <div className="main-title">Placeholder 1</div>
              <div className="text-gray-400">Content coming soon...</div>
            </motion.div>
            <motion.div className="dashboard-main-card placeholder-card" style={{ flex: 1 }} variants={fadeInCard} initial="hidden" animate="visible" whileHover="hover">
              <div className="main-title">Placeholder 2</div>
              <div className="text-gray-400">Content coming soon...</div>
            </motion.div>
          </div>
        </div>
        <div className="dashboard-sidebar">
          <motion.div className="dashboard-sidebar-card blue" variants={fadeInCard} initial="hidden" animate="visible" whileHover="hover">
            <div className="sidebar-title">Automation Failures</div>
            {statsLoading ? <div className="skeleton-box" style={{height: 28, width: 40}} /> : statsError ? <div className="text-red-400 text-xs">No data</div> : <div className="sidebar-value">{stats.failures || 0}</div>}
            <div className="sidebar-subtext">All systems operational</div>
          </motion.div>
          <motion.div className="dashboard-sidebar-card" variants={fadeInCard} initial="hidden" animate="visible" whileHover="hover">
            <div className="sidebar-title">Automations Ran</div>
            {statsLoading ? <div className="skeleton-box" style={{height: 28, width: 40}} /> : statsError ? <div className="text-red-400 text-xs">No data</div> : <div className="sidebar-value">{stats.automations_ran || 0}</div>}
            <div className="sidebar-subtext">This month</div>
            </motion.div>
          <motion.div className="dashboard-sidebar-card" variants={fadeInCard} initial="hidden" animate="visible" whileHover="hover">
            <div className="sidebar-title">Automation Fails</div>
            {statsLoading ? <div className="skeleton-box" style={{height: 28, width: 40}} /> : statsError ? <div className="text-red-400 text-xs">No data</div> : <div className="sidebar-value">{stats.automation_fails || 0}</div>}
            <div className="sidebar-subtext">This month</div>
            </motion.div>
          <motion.div className="dashboard-sidebar-card yellow" style={{ cursor: 'pointer' }} onClick={() => setIdeasOpen(true)} variants={fadeInCard} initial="hidden" animate="visible" whileHover="hover">
            <div className="sidebar-title flex items-center gap-2"><FaLightbulb className="text-yellow-400" /> Ideas</div>
            {ideasLoading ? <div className="skeleton-box" style={{height: 28, width: 40}} /> : ideasError ? <div className="text-red-400 text-xs">No data</div> : <div className="sidebar-value">{ideas.length || 0}</div>}
            <div className="sidebar-subtext">Submit or review ideas</div>
      </motion.div>
        </div>
      </div>
      <IdeasModal open={ideasOpen} onClose={() => setIdeasOpen(false)} ideas={ideas} onSubmit={handleIdeaSubmit} loading={ideasLoading} error={ideasError} isAdmin={isAdmin} />
    </div>
  );
}

function formatTime(timeStr) {
  // Accepts ISO or 'Jul/03/2025 04:06 PM' and returns a nice relative or formatted string
  const d = new Date(timeStr);
  if (!isNaN(d)) {
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff/60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)} hr ago`;
    return d.toLocaleString();
  }
  return timeStr;
}

const AdminDashboard = () => {
  useAdminTabTitle();
  const location = useLocation();
  const isDashboard = location.pathname === '/adminpanel' || location.pathname === '/adminpanel/';
  return (
    <div className="bg-gray-50 min-h-screen admin-dashboard-root" style={{ height: '100vh', width: '100vw', overflow: 'visible' }}>
      <Topbar onSignOut={() => { window.location.href = '/adminpanel/login/'; }} />
      <div className="flex pt-16" style={{ height: 'calc(100vh - 64px)', minHeight: 0, minWidth: 0, width: '100%' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0" style={{ minWidth: 0, flex: '1 1 0%', width: '100%' }}>
          <main className="flex-1 p-0" style={{ minWidth: 0, minHeight: 0, padding: 0, overflow: 'visible', width: '100%' }}>
            {isDashboard ? <DashboardContent /> : <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 