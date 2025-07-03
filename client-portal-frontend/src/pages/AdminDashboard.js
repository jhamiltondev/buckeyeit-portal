import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
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
    </div>
  );
};

export default AdminDashboard; 