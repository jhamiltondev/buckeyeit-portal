import React, { useState } from 'react';
import { FaUserCircle, FaHeadset, FaBook, FaUser, FaBuilding, FaBullhorn, FaSignOutAlt, FaTachometerAlt, FaBars } from 'react-icons/fa';
import { NavLink, Link } from 'react-router-dom';
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

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user } = useUser();
  // Collapsed for desktop, mobileOpen for mobile
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
        className={`fixed md:static z-50 mt-8 ml-2 h-[92vh] bg-white shadow-xl rounded-2xl flex flex-col transition-all duration-300
          ${collapsed ? 'w-16' : 'w-56'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
        style={{ minWidth: collapsed ? 64 : 224 }}
      >
        <div className="flex items-center justify-center relative px-4 py-3 border-b border-gray-200 bg-white h-14">
          <span className="text-lg font-bold tracking-wide text-red-700">Menu</span>
          <button
            className="absolute right-4 text-gray-400 hover:text-red-700"
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <FaBars size={22} />
          </button>
        </div>
        <div className="flex flex-col items-center py-6 border-b border-gray-200">
          <FaUserCircle className="text-5xl text-gray-400" />
          {!collapsed && user && <>
            <div className="mt-2 font-semibold">{user.first_name || user.username}</div>
            <div className="text-xs text-gray-500">{user.tenant?.name || ''}</div>
          </>}
        </div>
        <nav className="flex-1 px-2 py-4">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg mb-2 text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-150 ${isActive ? 'bg-red-100 text-red-700 font-bold' : ''} ${collapsed ? 'justify-center' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && item.label}
            </NavLink>
          ))}
          <li>
            <Link to="/admin/groups">Groups</Link>
          </li>
        </nav>
      </aside>
    </>
  );
} 