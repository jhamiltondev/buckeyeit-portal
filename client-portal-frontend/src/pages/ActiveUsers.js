import React, { useState, useEffect } from 'react';
import { FaUser, FaUsers, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus, FaUserShield, FaUserCheck, FaUserSlash, FaUserTimes, FaBuilding, FaKey, FaUserSecret, FaSync, FaLock, FaUnlock, FaChevronLeft, FaChevronRight, FaDownload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const statuses = ['All Statuses', 'Active', 'Suspended', 'Pending'];

// Placeholder user data
const mockUsers = [
  {
    id: 1,
    fullName: 'Aaron Navarro',
    email: 'anavarro.BIT@eyedocarnold.onmicrosoft.com',
    role: 'User',
    tenant: 'Eyedoc',
    status: 'Active',
    lastLogin: '2024-06-10 09:12',
    dateCreated: '2023-11-01',
    avatar: '',
  },
  {
    id: 2,
    fullName: 'Alice',
    email: 'alice@eyedocarnold.com',
    role: 'Admin',
    tenant: 'Eyedoc',
    status: 'Suspended',
    lastLogin: '2024-06-09 14:22',
    dateCreated: '2023-10-15',
    avatar: '',
  },
  // ... more users ...
];

function StatusBadge({ status }) {
  const color = status === 'Active' ? 'bg-green-100 text-green-700' : status === 'Suspended' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>{status}</span>;
}

function UserDetailsModal({ user, open, onClose }) {
  const [tab, setTab] = useState('general');
  if (!open || !user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fadeInSlow">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative animate-fadeInSlow">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl" onClick={onClose}>&times;</button>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl font-bold text-red-700">
            {user.avatar ? <img src={user.avatar} alt={user.fullName} className="w-full h-full rounded-full object-cover" /> : `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`}
          </div>
          <div>
            <div className="text-2xl font-bold">{user.fullName}</div>
            <div className="text-gray-500">{user.email}</div>
            <div className="flex gap-2 mt-1">
              <StatusBadge status={user.status} />
              <span className="text-xs text-gray-400">{user.role}</span>
              <span className="text-xs text-gray-400 flex items-center"><FaBuilding className="mr-1" />{user.tenant}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 border-b mb-4">
          <button className={`pb-2 px-2 border-b-2 ${tab === 'general' ? 'border-red-500 text-red-700 font-semibold' : 'border-transparent text-gray-500'}`} onClick={() => setTab('general')}>General Info</button>
          <button className={`pb-2 px-2 border-b-2 ${tab === 'security' ? 'border-red-500 text-red-700 font-semibold' : 'border-transparent text-gray-500'}`} onClick={() => setTab('security')}>Security</button>
          <button className={`pb-2 px-2 border-b-2 ${tab === 'activity' ? 'border-red-500 text-red-700 font-semibold' : 'border-transparent text-gray-500'}`} onClick={() => setTab('activity')}>Activity Logs</button>
          <button className={`pb-2 px-2 border-b-2 ${tab === 'support' ? 'border-red-500 text-red-700 font-semibold' : 'border-transparent text-gray-500'}`} onClick={() => setTab('support')}>Support Summary</button>
        </div>
        <div className="min-h-[180px]">
          {tab === 'general' && (
            <div className="grid grid-cols-2 gap-4">
              <div><span className="font-semibold">Username:</span> {user.email}</div>
              <div><span className="font-semibold">User ID:</span> {user.id}</div>
              <div><span className="font-semibold">Tenant:</span> {user.tenant}</div>
              <div><span className="font-semibold">Role:</span> {user.role}</div>
              <div><span className="font-semibold">Status:</span> {user.status}</div>
              <div><span className="font-semibold">Last Login:</span> {user.lastLogin}</div>
              <div><span className="font-semibold">Date Created:</span> {user.dateCreated}</div>
              <div><span className="font-semibold">MFA Enabled:</span> Yes</div>
              <div><span className="font-semibold">Password Expiry:</span> 2024-12-01</div>
            </div>
          )}
          {tab === 'security' && (
            <div className="space-y-4">
              <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded font-semibold flex items-center gap-2"><FaKey /> Reset Password</button>
              <button className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded font-semibold flex items-center gap-2"><FaSync /> Force Sign-Out</button>
              <div><span className="font-semibold">MFA Status:</span> Enabled <button className="ml-2 text-xs underline text-blue-600">Reset MFA</button></div>
              <div className="mt-2"><span className="font-semibold">Login Attempts:</span>
                <ul className="text-xs mt-1">
                  <li>2024-06-10 09:12 — Success (IP: 1.2.3.4)</li>
                  <li>2024-06-09 14:22 — Failed (IP: 1.2.3.4)</li>
                  <li>2024-06-08 11:05 — Success (IP: 1.2.3.4)</li>
                  <li>2024-06-07 10:44 — Success (IP: 1.2.3.4)</li>
                  <li>2024-06-06 08:30 — Failed (IP: 1.2.3.4)</li>
                </ul>
              </div>
              <div><span className="font-semibold">Blocked IPs:</span> None</div>
            </div>
          )}
          {tab === 'activity' && (
            <div>
              <ul className="text-sm space-y-1">
                <li>2024-06-10 09:12 — Created Ticket #20493</li>
                <li>2024-06-09 14:22 — Viewed KB Article</li>
                <li>2024-06-08 11:05 — Logged in</li>
                <li>2024-06-07 10:44 — Updated Profile</li>
                <li>2024-06-06 08:30 — Reset Password</li>
                <li>2024-06-05 07:20 — Viewed Dashboard</li>
                <li>2024-06-04 06:10 — Created Ticket #20492</li>
                <li>2024-06-03 05:00 — Viewed KB Article</li>
                <li>2024-06-02 04:50 — Logged in</li>
                <li>2024-06-01 03:40 — Viewed Dashboard</li>
              </ul>
              <button className="mt-2 text-xs underline text-blue-600">View Full Activity Log</button>
            </div>
          )}
          {tab === 'support' && (
            <div>
              <div className="font-semibold mb-2">Open Tickets: 2</div>
              <ul className="text-sm space-y-1">
                <li>#20493: Printer not working</li>
                <li>#20494: Password reset</li>
              </ul>
              <button className="mt-2 text-xs underline text-blue-600">View All Tickets for this User</button>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-semibold flex items-center gap-2"><FaEdit /> Edit Info</button>
          <button className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded font-semibold flex items-center gap-2"><FaLock /> Disable</button>
          <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded font-semibold flex items-center gap-2"><FaKey /> Reset Password</button>
          <button className="bg-green-100 text-green-700 px-4 py-2 rounded font-semibold flex items-center gap-2"><FaUserSecret /> Impersonate</button>
          <button className="bg-red-100 text-red-700 px-4 py-2 rounded font-semibold flex items-center gap-2"><FaTrash /> Delete</button>
        </div>
      </div>
      <style>{`
        @keyframes fadeInSlow { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeInSlow { animation: fadeInSlow 0.7s cubic-bezier(0.4,0,0.2,1); }
      `}</style>
    </div>
  );
}

export default function ActiveUsers() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All Roles');
  const [tenant, setTenant] = useState('All Tenants');
  const [tenants, setTenants] = useState(['All Tenants']);
  const [status, setStatus] = useState('All Statuses');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [roles, setRoles] = useState(['All Roles']);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState(null);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [skeletonCount, setSkeletonCount] = useState(0);

  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
    fetchTenants();
    fetchRoles();
    if (!loading) {
      // Keep skeleton for 300ms after loading finishes for smooth fade
      const timeout = setTimeout(() => setShowSkeleton(false), 300);
      return () => clearTimeout(timeout);
    } else {
      setShowSkeleton(true);
    }
    // eslint-disable-next-line
  }, [search, role, tenant, status, page]);

  // Only show skeleton while loading, and for 300ms after loading finishes
  useEffect(() => {
    if (!loading && users && users.length >= 0) {
      const timeout = setTimeout(() => setShowSkeleton(false), 300);
      return () => clearTimeout(timeout);
    } else if (loading) {
      setShowSkeleton(true);
    }
  }, [loading, users]);

  // Calculate skeleton row count only once per loading cycle
  useEffect(() => {
    if (loading) {
      setSkeletonCount(total > 0 ? Math.min(total, usersPerPage) : usersPerPage);
    }
  }, [loading, total, usersPerPage]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        search,
        role,
        tenant,
        status,
        page,
        per_page: usersPerPage,
      });
      const res = await fetch(`/adminpanel/api/users/?${params.toString()}`);
      let data;
      try {
        data = await res.json();
      } catch (e) {
        const text = await res.text().catch(() => '[unreadable]');
        console.log('Active Users API raw response:', text);
        setError(`API error: ${res.status} ${res.statusText} - Not JSON`);
        setUsers([]);
        setTotal(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }
      console.log('Fetched users data:', data);
      setUsers((data && Array.isArray(data.results)) ? data.results : []);
      setTotal(data && typeof data.total === 'number' ? data.total : 0);
      setTotalPages(data && typeof data.totalPages === 'number' ? data.totalPages : 1);
    } catch (err) {
      setUsers([]);
      setTotal(0);
      setTotalPages(1);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await fetch('/adminpanel/api/tenants/');
      if (!res.ok) throw new Error('Failed to fetch tenants');
      const data = await res.json();
      setTenants(['All Tenants', ...data.results.map(t => t.name)]);
    } catch (err) {
      setTenants(['All Tenants']);
    }
  };

  const fetchRoles = async () => {
    setRolesLoading(true);
    setRolesError(null);
    try {
      const res = await fetch('/api/roles/');
      if (!res.ok) throw new Error('Failed to fetch roles');
      const data = await res.json();
      setRoles(['All Roles', ...data.map(r => r.name)]);
    } catch (err) {
      setRoles(['All Roles']);
      setRolesError('Error loading roles');
    } finally {
      setRolesLoading(false);
    }
  };

  const pagedUsers = Array.isArray(users) ? users : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Active Users</h1>
          <div className="text-gray-500 mt-1">Showing {total} active users</div>
        </div>
        <div className="flex gap-2">
          <button className="bg-red-600 text-white px-4 py-2 rounded font-semibold flex items-center gap-2"><FaPlus /> Add User</button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-semibold flex items-center gap-2"><FaDownload /> Export to CSV</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-4 items-center">
        <div className="flex items-center bg-white rounded shadow px-3 py-2 gap-2">
          <FaSearch className="text-gray-400" />
          <input value={search} onChange={e => { setPage(1); setSearch(e.target.value); }} placeholder="Search by name or email" className="outline-none bg-transparent" />
        </div>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="bg-white rounded shadow px-3 py-2"
          disabled={rolesLoading}
        >
          {roles.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        {rolesError && <div className="text-xs text-red-500 mt-1">{rolesError}</div>}
        <select value={tenant} onChange={e => { setPage(1); setTenant(e.target.value); }} className="bg-white rounded shadow px-3 py-2">
          {tenants.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={status} onChange={e => { setPage(1); setStatus(e.target.value); }} className="bg-white rounded shadow px-3 py-2">
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50 text-gray-700 text-sm">
              <th className="p-3"><input type="checkbox" /></th>
              <th className="p-3 text-left">Full Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Tenant</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Last Login</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
              <AnimatePresence initial={false}>
                {pagedUsers.length > 0 ? (
                  pagedUsers.map((user, idx) => (
              <tr key={user.id} className="border-b hover:bg-blue-50 cursor-pointer">
                      <td className="p-3 relative" style={{ minWidth: 40 }}>
                        <div className="relative" style={{ minHeight: 32 }}>
                          <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: showSkeleton ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-center"
                            style={{ pointerEvents: 'none' }}
                          >
                            <div className="w-4 h-4 bg-gray-200 rounded" />
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: showSkeleton ? 0 : 1 }}
                            transition={{ duration: 0.4, delay: showSkeleton ? 0 : 0.1 }}
                          >
                            <input type="checkbox" />
                          </motion.div>
                        </div>
                      </td>
                      <td className="p-3 relative" style={{ minWidth: 160 }}>
                        <div className="relative flex items-center gap-2" style={{ minHeight: 32 }}>
                          <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: showSkeleton ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 flex items-center gap-2"
                            style={{ pointerEvents: 'none' }}
                          >
                            <span className="w-8 h-8 rounded-full bg-gray-200" />
                            <span className="h-4 w-24 bg-gray-200 rounded" />
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: showSkeleton ? 0 : 1 }}
                            transition={{ duration: 0.4, delay: showSkeleton ? 0 : 0.1 }}
                            className="flex items-center gap-2"
                          >
                  <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-lg font-bold text-red-700">
                              {user.avatar ? <img src={user.avatar} alt={user.fullName} className="w-full h-full rounded-full object-cover" /> : `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`}
                  </span>
                  {user.fullName}
                          </motion.div>
                        </div>
                      </td>
                      <td className="p-3 relative" style={{ minWidth: 180 }}>
                        <div className="relative" style={{ minHeight: 32 }}>
                          <motion.div initial={{ opacity: 1 }} animate={{ opacity: showSkeleton ? 1 : 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex items-center" style={{ pointerEvents: 'none' }}>
                            <div className="h-4 w-32 bg-gray-200 rounded" />
                          </motion.div>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: showSkeleton ? 0 : 1 }} transition={{ duration: 0.4, delay: showSkeleton ? 0 : 0.1 }}>
                            {user.email}
                          </motion.div>
                        </div>
                      </td>
                      <td className="p-3 relative" style={{ minWidth: 100 }}>
                        <div className="relative" style={{ minHeight: 32 }}>
                          <motion.div initial={{ opacity: 1 }} animate={{ opacity: showSkeleton ? 1 : 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex items-center" style={{ pointerEvents: 'none' }}>
                            <div className="h-4 w-16 bg-gray-200 rounded" />
                          </motion.div>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: showSkeleton ? 0 : 1 }} transition={{ duration: 0.4, delay: showSkeleton ? 0 : 0.1 }}>
                            {user.role}
                          </motion.div>
                        </div>
                      </td>
                      <td className="p-3 relative" style={{ minWidth: 120 }}>
                        <div className="relative" style={{ minHeight: 32 }}>
                          <motion.div initial={{ opacity: 1 }} animate={{ opacity: showSkeleton ? 1 : 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex items-center" style={{ pointerEvents: 'none' }}>
                            <div className="h-4 w-20 bg-gray-200 rounded" />
                          </motion.div>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: showSkeleton ? 0 : 1 }} transition={{ duration: 0.4, delay: showSkeleton ? 0 : 0.1 }}>
                            {user.tenant}
                          </motion.div>
                        </div>
                      </td>
                      <td className="p-3 relative" style={{ minWidth: 100 }}>
                        <div className="relative" style={{ minHeight: 32 }}>
                          <motion.div initial={{ opacity: 1 }} animate={{ opacity: showSkeleton ? 1 : 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex items-center" style={{ pointerEvents: 'none' }}>
                            <div className="h-4 w-16 bg-gray-200 rounded" />
                          </motion.div>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: showSkeleton ? 0 : 1 }} transition={{ duration: 0.4, delay: showSkeleton ? 0 : 0.1 }}>
                            <StatusBadge status={user.status} />
                          </motion.div>
                        </div>
                      </td>
                      <td className="p-3 relative" style={{ minWidth: 120 }}>
                        <div className="relative" style={{ minHeight: 32 }}>
                          <motion.div initial={{ opacity: 1 }} animate={{ opacity: showSkeleton ? 1 : 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex items-center" style={{ pointerEvents: 'none' }}>
                            <div className="h-4 w-20 bg-gray-200 rounded" />
                          </motion.div>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: showSkeleton ? 0 : 1 }} transition={{ duration: 0.4, delay: showSkeleton ? 0 : 0.1 }}>
                            {user.lastLogin}
                          </motion.div>
                        </div>
                </td>
                      <td className="p-3 relative" style={{ minWidth: 120 }}>
                        <div className="relative flex gap-2" style={{ minHeight: 32 }}>
                          <motion.div initial={{ opacity: 1 }} animate={{ opacity: showSkeleton ? 1 : 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex items-center gap-2" style={{ pointerEvents: 'none' }}>
                            <div className="h-4 w-24 bg-gray-200 rounded" />
                          </motion.div>
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: showSkeleton ? 0 : 1 }} transition={{ duration: 0.4, delay: showSkeleton ? 0 : 0.1 }} className="flex gap-2">
                  <button className="text-blue-600 hover:underline text-xs" onClick={() => { setSelectedUser(user); setModalOpen(true); }}>View</button>
                  <button className="text-yellow-600 hover:underline text-xs">Disable</button>
                  <button className="text-blue-600 hover:underline text-xs">Reset PW</button>
                  <button className="text-green-600 hover:underline text-xs">Impersonate</button>
                          </motion.div>
                        </div>
                </td>
              </tr>
                  ))
                ) : (
                  // fallback: if no users, show skeletons as before
                  showSkeleton ? (
                    Array.from({ length: skeletonCount }).map((_, i) => (
                      <motion.tr
                        key={i}
                        className="animate-pulse"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="p-3">
                          <div className="w-4 h-4 bg-gray-200 rounded" />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-gray-200" />
                            <span className="h-4 w-24 bg-gray-200 rounded" />
                          </div>
                        </td>
                        <td className="p-3"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                        <td className="p-3"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                        <td className="p-3"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                        <td className="p-3"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
                        <td className="p-3"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                        <td className="p-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                      </motion.tr>
                    ))
                  ) : null
                )}
              </AnimatePresence>
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">Page {page} of {totalPages}</div>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"><FaChevronLeft /></button>
          <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"><FaChevronRight /></button>
        </div>
      </div>
      <UserDetailsModal user={selectedUser} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
    </motion.div>
  );
} 