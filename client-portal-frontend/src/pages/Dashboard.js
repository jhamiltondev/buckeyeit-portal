import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTicketAlt, FaBullhorn, FaBook, FaBuilding, FaUser, FaHeartbeat, FaLink, FaNewspaper, FaRegFileAlt, FaChartBar, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function Dashboard() {
  const { user } = useUser();

  // Ticket Summary State
  const [ticketSummary, setTicketSummary] = useState({ open_tickets: '--', resolved_this_month: '--', avg_response_time: '--' });
  const recentLogins = [];
  // Health status: fetch real status for Microsoft 365 and Google Workspace
  const [healthStatus, setHealthStatus] = useState('Checking...');
  useEffect(() => {
    let isMounted = true;
    async function fetchStatus() {
      try {
        const resp = await fetch('/api/status/');
        if (resp.ok) {
          const data = await resp.json();
          if (isMounted) {
            setHealthStatus(`Microsoft: ${data.microsoft}\nGoogle: ${data.google}`);
          }
        } else {
          setHealthStatus('Microsoft: Unavailable\nGoogle: Unavailable');
        }
      } catch (e) {
        setHealthStatus('Microsoft: Unavailable\nGoogle: Unavailable');
      }
    }
    fetchStatus();
    return () => { isMounted = false; };
  }, []);
  const techNews = [];
  const announcement = null;

  // Tech News Slideshow State
  const [newsIdx, setNewsIdx] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => {
      setNewsIdx((idx) => (idx + 1) % techNews.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [techNews.length]);

  // Animation variants
  const tileVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12 } }),
  };

  // Fetch ticket summary
  useEffect(() => {
    fetch('/api/dashboard_ticket_summary/')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setTicketSummary(data))
      .catch(() => setTicketSummary({ open_tickets: 'Error', resolved_this_month: 'Error', avg_response_time: 'Error' }));
  }, []);

  // Security Center State
  const [securityData, setSecurityData] = useState({ mfa_status: '--', last_blocked_login: '--', risky_signins: '--' });
  useEffect(() => {
    fetch('/api/security_center/')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setSecurityData(data))
      .catch(() => setSecurityData({ mfa_status: 'Error', last_blocked_login: 'Error', risky_signins: 'Error' }));
  }, []);

  // System Usage State
  const [systemUsage, setSystemUsage] = useState({ usage_percent: '--', details: '--' });
  const [systemUsageLoading, setSystemUsageLoading] = useState(true);
  const [systemUsageError, setSystemUsageError] = useState(null);
  useEffect(() => {
    setSystemUsageLoading(true);
    setSystemUsageError(null);
    fetch('/api/system_usage/')
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setSystemUsage(data))
      .catch(() => setSystemUsageError('Error fetching system usage'))
      .finally(() => setSystemUsageLoading(false));
  }, []);

  return (
    <motion.div className="w-full py-6 px-2 md:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Dashboard Title & Subtitle */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-lg text-gray-500 dark:text-gray-300 mt-1">Welcome back, {user?.first_name || user?.username || 'User'}! Explore the dashboard.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {/* Ticket Summary Card (spans 2 cols) */}
          <motion.div
            className="col-span-1 md:col-span-2 bg-white rounded-xl shadow p-5 flex flex-col justify-between hover:shadow-lg transition cursor-pointer"
            custom={-1}
            initial="hidden"
            animate="visible"
            variants={tileVariants}
          >
            <div className="flex items-center mb-2">
              <span className="bg-blue-100 text-blue-600 rounded-full p-2 mr-3">
                <FaRegFileAlt size={24} />
              </span>
              <h3 className="font-semibold text-lg">Ticket Summary</h3>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-2">
              <div className="flex-1 flex flex-col items-center">
                <div className="text-2xl font-bold">{ticketSummary.open_tickets}</div>
                <div className="text-xs text-gray-500">Open Tickets</div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="text-2xl font-bold">{ticketSummary.resolved_this_month}</div>
                <div className="text-xs text-gray-500">Resolved This Month</div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="text-2xl font-bold">{ticketSummary.avg_response_time}</div>
                <div className="text-xs text-gray-500">Avg Response Time (hrs)</div>
              </div>
            </div>
          </motion.div>
          {/* Security Center Card */}
          <motion.div
            className="bg-blue-100/60 border-t-4 border-blue-400 rounded-xl shadow p-5 flex flex-col justify-between hover:shadow-lg transition cursor-pointer"
            custom={0}
            initial="hidden"
            animate="visible"
            variants={tileVariants}
          >
            <div className="mb-2">
              <h3 className="font-semibold text-lg">Security Center</h3>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">MFA Status:</span>
                <span className="font-normal">{securityData.mfa_status || '--'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Last Blocked Login:</span>
                <span className="font-normal">{securityData.last_blocked_login || '--'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Risky Sign-ins:</span>
                <span className="font-normal">{securityData.risky_signins || '--'}</span>
              </div>
            </div>
          </motion.div>
          {/* Announcements Card */}
          <motion.div
            className="bg-purple-100/60 border-t-4 border-purple-400 rounded-xl shadow p-5 flex flex-col justify-between hover:shadow-lg transition cursor-pointer"
            custom={1}
            initial="hidden"
            animate="visible"
            variants={tileVariants}
          >
            <div className="flex items-center mb-2">
              <span className="bg-purple-200 text-purple-600 rounded-full p-2 mr-3">
                <FaBullhorn size={24} />
              </span>
              <h3 className="font-semibold text-lg">Announcements</h3>
            </div>
            {announcement ? (
              <>
                <div className="text-lg font-semibold mb-1 truncate">{announcement.title}</div>
                <div className="text-sm text-gray-500 mb-2">{announcement.preview}</div>
                <a href={announcement.url} className="text-purple-700 hover:underline text-sm self-end">See more</a>
              </>
            ) : (
              <div className="text-sm text-gray-400">No new announcements</div>
            )}
          </motion.div>
          {/* Knowledge Base Card */}
          <motion.div
            className="bg-green-100/60 border-t-4 border-green-400 rounded-xl shadow p-5 flex flex-col justify-between hover:shadow-lg transition cursor-pointer"
            custom={2}
            initial="hidden"
            animate="visible"
            variants={tileVariants}
          >
            <div className="flex items-center mb-2">
              <span className="bg-green-200 text-green-600 rounded-full p-2 mr-3">
                <FaBook size={24} />
              </span>
              <h3 className="font-semibold text-lg">Knowledge Base</h3>
            </div>
            <div className="text-2xl font-bold mb-1">--</div>
            <div className="text-xs text-green-700">Browse articles</div>
          </motion.div>
          {/* Company Info Card */}
          <motion.div
            className="bg-yellow-100/60 border-t-4 border-yellow-400 rounded-xl shadow p-5 flex flex-col justify-between hover:shadow-lg transition cursor-pointer"
            custom={3}
            initial="hidden"
            animate="visible"
            variants={tileVariants}
          >
            <div className="flex items-center mb-2">
              <span className="bg-yellow-200 text-yellow-600 rounded-full p-2 mr-3">
                <FaBuilding size={24} />
              </span>
              <h3 className="font-semibold text-lg">Company Info</h3>
            </div>
            <div className="text-2xl font-bold mb-1">--</div>
            <div className="text-xs text-yellow-700">View company details</div>
          </motion.div>
          {/* Recent Logins Card */}
          <motion.div
            className="bg-pink-100/60 border-t-4 border-pink-400 rounded-xl shadow p-5 flex flex-col hover:shadow-lg transition cursor-pointer"
            custom={4}
            initial="hidden"
            animate="visible"
            variants={tileVariants}
          >
            <div className="flex items-center mb-2">
              <span className="bg-pink-200 text-pink-600 rounded-full p-2 mr-3">
                <FaUser size={24} />
              </span>
              <h3 className="font-semibold text-lg">Recent Logins</h3>
            </div>
            {recentLogins.length > 0 ? (
              <ul className="text-sm text-gray-700">
                {recentLogins.map((login, idx) => (
                  <li key={idx}>{login.user} <span className="text-gray-400">({login.time})</span></li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-400">No recent logins</div>
            )}
          </motion.div>
          {/* Health Status Card */}
          <motion.div
            className="bg-teal-100/60 border-t-4 border-teal-400 rounded-xl shadow p-5 flex flex-col hover:shadow-lg transition cursor-pointer"
            custom={5}
            initial="hidden"
            animate="visible"
            variants={tileVariants}
          >
            <div className="flex items-center mb-2">
              <span className="bg-teal-200 text-teal-600 rounded-full p-2 mr-3">
                <FaHeartbeat size={24} />
              </span>
              <h3 className="font-semibold text-lg">Health Status</h3>
            </div>
            {healthStatus && (healthStatus.includes('Error') || healthStatus.includes('Unavailable')) ? (
              <div className="flex flex-col items-start">
                <span className="text-xs text-gray-500 mb-1">Live status not available.</span>
                <a
                  href="https://status.cloud.microsoft/api/status"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline text-xs"
                >
                  Click here to view Microsoft 365 Service Health
                </a>
              </div>
            ) : (
              <div className="text-xs font-semibold mb-1 whitespace-pre-line">{healthStatus || 'Unknown'}</div>
            )}
          </motion.div>
          {/* Quick Links Card */}
          <motion.div
            className="bg-gray-100/60 border-t-4 border-gray-300 rounded-xl shadow p-5 flex flex-col hover:shadow-lg transition cursor-pointer"
            custom={6}
            initial="hidden"
            animate="visible"
            variants={tileVariants}
          >
            <div className="flex items-center mb-2">
              <span className="bg-gray-200 text-gray-600 rounded-full p-2 mr-3">
                <FaLink size={24} />
              </span>
              <h3 className="font-semibold text-lg">Quick Links</h3>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <a href="/support" className="text-blue-600 hover:underline">Submit a Ticket</a>
              <a href="/tickets" className="text-blue-600 hover:underline">View All Tickets</a>
              <a href="/knowledge-base" className="text-blue-600 hover:underline">Browse Knowledge Base</a>
            </div>
          </motion.div>
          {/* Tech News Card (slideshow) */}
          <motion.div
            className="bg-indigo-100/60 border-t-4 border-indigo-400 rounded-xl shadow p-5 flex flex-col hover:shadow-lg transition cursor-pointer xl:col-span-2"
            custom={7}
            initial="hidden"
            animate="visible"
            variants={tileVariants}
          >
            <div className="flex items-center mb-2">
              <span className="bg-indigo-200 text-indigo-600 rounded-full p-2 mr-3">
                <FaNewspaper size={24} />
              </span>
              <h3 className="font-semibold text-lg">Tech News</h3>
            </div>
            <div className="flex flex-col gap-1 mt-2 min-h-[2.5rem]">
              {techNews.length > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.a
                    key={newsIdx}
                    href={techNews[newsIdx].url}
                    className="text-gray-800 hover:text-indigo-600 truncate block"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                  >
                    {techNews[newsIdx].title}
                  </motion.a>
                </AnimatePresence>
              ) : (
                <div className="text-sm text-gray-400">No tech news</div>
              )}
              <div className="text-xs text-gray-400 mt-2">(Slideshow auto-advances)</div>
            </div>
          </motion.div>
          {/* Example Extra Card: System Usage (live) */}
          <motion.div
            className="bg-orange-100/60 border-t-4 border-orange-400 rounded-xl shadow p-5 flex flex-col hover:shadow-lg transition cursor-pointer"
            custom={8}
            initial="hidden"
            animate="visible"
            variants={tileVariants}
          >
            <div className="flex items-center mb-2">
              <span className="bg-orange-200 text-orange-600 rounded-full p-2 mr-3">
                <FaChartBar size={24} />
              </span>
              <h3 className="font-semibold text-lg">System Usage</h3>
            </div>
            <div className="flex flex-col gap-1 mt-2">
              {systemUsageLoading ? (
                <div className="w-full h-2 bg-orange-200 rounded-full overflow-hidden animate-pulse"></div>
              ) : systemUsageError ? (
                <div className="text-xs text-orange-700">{systemUsageError}</div>
              ) : (
                <>
                  <div className="w-full h-2 bg-orange-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{width: `${systemUsage.usage_percent || 0}%`}}></div>
                  </div>
                  <div className="text-xs text-orange-700">{systemUsage.details}</div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
} 