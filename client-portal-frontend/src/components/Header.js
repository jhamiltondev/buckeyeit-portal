import React, { useState, useRef, useEffect } from 'react';
import { FaMoon, FaSun, FaBell, FaUserCircle, FaSearch } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef();
  const userRef = useRef();

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="flex items-center justify-between px-10 py-2 text-gray-900 h-14" style={{marginLeft: '72px'}}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="font-bold text-lg text-black whitespace-nowrap">Buckeye IT Client Portal</span>
      </div>
      <div className="flex-1 flex justify-center min-w-0">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-1.5 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-200 text-sm"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <div className="flex items-center gap-6 flex-1 justify-end min-w-0">
        <button onClick={toggleTheme} aria-label="Toggle dark mode" className="hover:text-red-500">
          {theme === 'dark' ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen(o => !o)} className="focus:outline-none">
            <FaBell size={20} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1 font-bold">0</span>
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50">
              <div className="font-semibold mb-2">Notifications</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">No new notifications</div>
            </div>
          )}
        </div>
        <div className="relative" ref={userRef}>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setUserOpen(o => !o)}>
            <FaUserCircle size={28} />
            <span className="font-medium">{user ? (user.first_name || user.username) : 'User'}</span>
            <span className="text-xs text-gray-400">▼</span>
          </div>
          {userOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 z-50">
              <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Profile</a>
              <a href="/logout" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">Logout</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 