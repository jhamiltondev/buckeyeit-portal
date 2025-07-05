import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Support from './pages/Support';
import KnowledgeBase from './pages/KnowledgeBase';
import Profile from './pages/Profile';
import CompanyInfo from './pages/CompanyInfo';
import Announcements from './pages/Announcements';
import Logout from './pages/Logout';
import Login from './pages/Login';
import Tickets from './pages/Tickets';
import ErrorBoundary from './components/ErrorBoundary';
import { UserProvider } from './context/UserContext';
import { useUser } from './context/UserContext';
import './App.css';
import { AnimatePresence, motion } from 'framer-motion';
import { FaQuestionCircle } from 'react-icons/fa';
import AdminDashboard from './pages/AdminDashboard';
import ActiveUsers from './pages/ActiveUsers';
import Groups from './pages/Groups';
import SuspendedDeletedUsers from './pages/SuspendedDeletedUsers';

// ProtectedRoute component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useUser();
  if (loading) return null; // or a loading spinner
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function ProtectedLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const location = useLocation();
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={sidebarMobileOpen}
        setMobileOpen={setSidebarMobileOpen}
      />
      <div className="flex-1 flex flex-col transition-all duration-300 ml-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Routes location={location}>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/support" element={
                  <ErrorBoundary>
                    <Support />
                  </ErrorBoundary>
                } />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/knowledge-base" element={<KnowledgeBase />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/company-info" element={<CompanyInfo />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/logout" element={<Logout />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login title="Buckeye IT Client Portal" />} />
            <Route path="/adminpanel/login" element={<Login title="Buckeye IT Admin Center" />} />
            <Route path="/adminpanel/*" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }>
              <Route index element={<div className="text-center py-12">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to the Admin Center</h1>
                <p className="text-gray-600">Select an option from the sidebar to get started.</p>
              </div>} />
              <Route path="users/active" element={<ActiveUsers />} />
              <Route path="groups" element={<Groups />} />
              <Route path="users/suspended" element={<SuspendedDeletedUsers />} />
              <Route path="*" element={<div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
                <p className="text-gray-600">The requested admin page could not be found.</p>
              </div>} />
            </Route>
            <Route path="/*" element={
              <ProtectedRoute>
                <>
                  <ProtectedLayout />
                  {/* Copyright and Help Icon */}
                  <div className="fixed bottom-2 right-4 z-50 flex items-end gap-4 pointer-events-none">
                    <span className="text-xs text-gray-400 dark:text-gray-500 opacity-70 pointer-events-auto select-none">© {new Date().getFullYear()} Buckeye IT</span>
                    <button
                      className="pointer-events-auto bg-white dark:bg-gray-800 rounded-full shadow p-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      style={{ fontSize: 28 }}
                      aria-label="Help"
                      onClick={() => alert('Help coming soon!')}
                    >
                      <FaQuestionCircle />
                    </button>
                  </div>
                </>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App;
