import React, { useState } from 'react';
import { FaUser, FaUsers, FaBuilding, FaTicketAlt, FaBook, FaBullhorn, FaCogs, FaChartBar, FaChevronDown, FaChevronUp, FaHome, FaCog, FaList } from 'react-icons/fa';

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
      { label: 'Active Users', key: 'active-users' },
      { label: 'Groups', key: 'groups' },
    ],
  },
  {
    label: 'Tenants',
    icon: <FaBuilding />,
    key: 'tenants',
  },
  {
    label: 'Tickets',
    icon: <FaTicketAlt />,
    key: 'tickets',
  },
  {
    label: 'Knowledge Base',
    icon: <FaBook />,
    key: 'kb',
    children: [
      { label: 'Articles', key: 'kb-articles' },
      { label: 'Categories', key: 'kb-categories' },
    ],
  },
  {
    label: 'Announcements',
    icon: <FaBullhorn />,
    key: 'announcements',
  },
  {
    label: 'Integrations',
    icon: <FaCogs />,
    key: 'integrations',
  },
  {
    label: 'Logs',
    icon: <FaList />,
    key: 'logs',
  },
  {
    label: 'Settings',
    icon: <FaCog />,
    key: 'settings',
  },
];

function Sidebar({ activeSection, setActiveSection, openDropdowns, setOpenDropdowns }) {
  return (
    <aside className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-6 font-bold text-xl text-red-600 flex items-center gap-2">
        <FaChartBar className="text-2xl" /> Buckeye IT Admin
      </div>
      <nav className="flex-1 overflow-y-auto">
        {sidebarSections.map(section => (
          <div key={section.key}>
            <button
              className={`w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-red-50 transition ${activeSection === section.key ? 'bg-red-100 font-semibold' : ''}`}
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
              <div className="ml-8">
                {section.children.map(child => (
                  <button
                    key={child.key}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-red-50 transition ${activeSection === child.key ? 'bg-red-100 font-semibold' : ''}`}
                    onClick={() => setActiveSection(child.key)}
                  >
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
    <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
      <div className="font-bold text-lg">Admin Center</div>
      <div className="flex items-center gap-4">
        <span className="text-gray-600">admin@buckeyeit.com</span>
        <img src="/static/portal/react/buckeyeit-logo-white.png" alt="Buckeye IT Logo" className="w-8 h-8 rounded-full shadow" />
      </div>
    </header>
  );
}

const sectionContent = {
  dashboard: (
    <>
      <h1 className="text-3xl font-bold mb-4">Welcome Back, admin! <span className="text-lg font-normal text-gray-500">[Tenant: Buckeye IT]</span></h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[300px] bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <button className="bg-green-100 border border-green-400 text-green-700 rounded px-3 py-2">Approve New User</button>
            <button className="bg-blue-100 border border-blue-400 text-blue-700 rounded px-3 py-2">Run Automation Test</button>
            <button className="bg-red-100 border border-red-400 text-red-700 rounded px-3 py-2">Post Announcement</button>
            <button className="bg-gray-100 border border-gray-400 text-gray-700 rounded px-3 py-2">Open Platform Settings</button>
          </div>
        </div>
        <div className="flex-1 min-w-[300px] bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">Portal Insights</h2>
          <ul className="text-gray-700">
            <li>Total Users: <b>2</b></li>
            <li>Total Tenants: <b>1</b></li>
            <li>Open Tickets: <b>4</b></li>
            <li>KB Articles: <b>0</b></li>
          </ul>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[300px] bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">Recent Admin Activity (Audit Log Preview)</h2>
          <ul className="text-gray-700 list-disc ml-6">
            <li>admin logged in at Jul/03/2025 04:06 PM EST</li>
            <li>Test User logged in at Jul/01/2025 12:43 PM EST</li>
          </ul>
        </div>
        <div className="flex-1 min-w-[300px] bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">System Integrations</h2>
          <ul className="text-gray-700">
            <li>ConnectWise: <span className="text-green-600 font-bold">Connected</span></li>
            <li>Pax8: <span className="text-yellow-600 font-bold">Not Configured</span></li>
            <li>OpenAI: <span className="text-yellow-600 font-bold">Not Configured</span></li>
          </ul>
        </div>
        <div className="flex-1 min-w-[300px] bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">Automation Failures</h2>
          <p className="text-green-600">All systems operational</p>
        </div>
      </div>
      <div className="bg-white rounded shadow p-4 mt-6">
        <h2 className="font-semibold mb-2">Coming Soon / Feature Roadmap</h2>
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