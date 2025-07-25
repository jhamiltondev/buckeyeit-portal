import React, { useState } from 'react';
import { FaUserCircle, FaHeadset, FaBook, FaUser, FaBuilding, FaBullhorn, FaSignOutAlt, FaTachometerAlt, FaBars, FaChevronDown } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
  { to: '/support', label: 'Support', icon: <FaHeadset /> },
  { to: '/knowledge-base', label: 'Knowledge Base', icon: <FaBook /> },
  { to: '/profile', label: 'My Profile', icon: <FaUser /> },
  { to: '/company-info', label: 'Company Info', icon: <FaBuilding /> },
  { to: '/announcements', label: 'Announcements', icon: <FaBullhorn /> },
  { to: '/logout', label: 'Logout', icon: <FaSignOutAlt /> },
];

const sidebarSections = [
  {
    label: 'Users',
    icon: <FaUser />,
    children: [
      { to: '/users/active', label: 'Active Users' },
      { to: '/users/groups', label: 'Groups' },
      { to: '/users/suspended', label: 'Suspended/Deleted Users' },
      { to: '/users/auditlogs', label: 'AuditLogs' },
    ],
  },
  {
    label: 'Tenants',
    icon: <FaBuilding />,
    children: [
      { to: '/tenants', label: 'All Tenants' },
      { to: '/tenants/settings', label: 'Tenant Settings' },
      { to: '/adminpanel/kb/access', label: 'Tenant Access Control' },
    ],
  },
  {
    label: 'Knowledge Base',
    icon: <FaBook />,
    children: [
      { to: '/adminpanel/kb/articles', label: 'All Articles' },
      { to: '/adminpanel/kb/categories', label: 'Categories' },
      { to: '/adminpanel/kb/draft-pending', label: 'Draft & Pending' },
      { to: '/adminpanel/kb/archived', label: 'Archived Articles' },
      { to: '/adminpanel/kb/popular', label: 'Most Viewed' },
      { to: '/adminpanel/kb/feedback', label: 'Article Feedback' },
    ],
  },
  {
    label: 'Announcements',
    icon: <FaBullhorn />,
    children: [
      { to: '/adminpanel/announcements/all', label: 'All Announcements' },
      { to: '/adminpanel/announcements/drafts', label: 'Draft Announcements' },
      { to: '/adminpanel/announcements/scheduled', label: 'Scheduled Announcements' },
      { to: '/adminpanel/announcements/archived', label: 'Expired & Archived' },
      { to: '/announcements', label: 'Announcements' },
    ],
  },
  // Add more expandable sections as needed
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user } = useUser();
  // Collapsed for desktop, mobileOpen for mobile
  const [expandedSections, setExpandedSections] = useState(new Set());

  const handleNavClick = (path) => {
    if (expandedSections.has(path)) {
      setExpandedSections(prev => {
        const newSet = new Set(prev);
        newSet.delete(path);
        return newSet;
      });
    } else {
      setExpandedSections(prev => new Set([...prev, path]));
    }
  };

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white rounded-full p-2 shadow-lg"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <FaBars size={22} />
      </button>
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`sidebar-no-anim fixed md:static z-50 mt-8 ml-2 h-[92vh] bg-white shadow-xl rounded-2xl flex flex-col
          ${collapsed ? 'w-16' : 'w-56'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
        style={{ minWidth: collapsed ? 64 : 224 }}
      >
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 64 }}>
          {collapsed ? (
            <button className="sidebar-toggle" onClick={() => setCollapsed(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <FaBars size={28} />
            </button>
          ) : (
            <div className="sidebar-title" style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#c00', fontWeight: 'bold', fontSize: 24 }}>Menu</span>
              <button className="sidebar-toggle" onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8 }}>
                <FaBars size={20} />
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center py-6 border-b border-gray-200">
          <FaUserCircle className="text-5xl text-gray-400" />
          {!collapsed && user && <>
            <div className="mt-2 font-semibold">{user.first_name || user.username}</div>
            <div className="text-xs text-gray-500">{user.tenant?.name || ''}</div>
          </>}
        </div>
        <nav className="flex-1 px-2 py-4">
          {/* Expandable sections */}
          {sidebarSections.map(section => {
            const expanded = expandedSections.has(section.label);
            return (
              <div key={section.label}>
                <button
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-2 w-full text-gray-700 hover:bg-red-50 hover:text-red-700 ${collapsed ? 'justify-center' : ''}`}
                  onClick={() => handleNavClick(section.label)}
                  aria-expanded={expanded}
                  aria-controls={`submenu-${section.label}`}
                  style={{ outline: 'none', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <span className="text-lg">{section.icon}</span>
                  {!collapsed && <span>{section.label}</span>}
                  {!collapsed && (
                    <span 
                      style={{ 
                        marginLeft: 'auto', 
                        display: 'flex', 
                        alignItems: 'center',
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'none !important',
                        animation: 'none !important'
                      }}
                    >
                      <FaChevronDown />
                    </span>
                  )}
                </button>
                {expanded && !collapsed && (
                  <div
                    id={`submenu-${section.label}`}
                    style={{ 
                      overflow: 'hidden',
                      transition: 'none !important',
                      animation: 'none !important'
                    }}
                  >
                    {section.children.map(child => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `block pl-10 pr-3 py-2 rounded-lg mb-1 text-gray-600 hover:bg-red-50 hover:text-red-700 ${isActive ? 'bg-red-100 text-red-700 font-bold' : ''}`
                        }
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {/* Regular nav items */}
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg mb-2 text-gray-700 hover:bg-red-50 hover:text-red-700 ${isActive ? 'bg-red-100 text-red-700 font-bold' : ''} ${collapsed ? 'justify-center' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
} 