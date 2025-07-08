import React, { useState } from 'react';
import { FaSearch, FaCalendarAlt, FaEllipsisV, FaPlus, FaEye, FaEdit, FaArchive, FaTrash, FaRedo } from 'react-icons/fa';

const mockAnnouncements = [
  {
    id: 1,
    title: 'Scheduled Maintenance',
    audience: 'All Tenants',
    status: 'Published',
    date: '2025-07-05',
    createdBy: 'admin@buckeyeit.com',
    views: 120
  },
  {
    id: 2,
    title: 'VIP Feature Rollout',
    audience: 'VIP Tenants',
    status: 'Scheduled',
    date: '2025-07-10',
    createdBy: 'jane@buckeyeit.com',
    views: 45
  },
  {
    id: 3,
    title: 'Internal Policy Update',
    audience: 'Internal Only',
    status: 'Draft',
    date: '2025-07-12',
    createdBy: 'john@buckeyeit.com',
    views: 0
  },
  {
    id: 4,
    title: 'Tenant Portal Launch',
    audience: 'Specific Tenant',
    status: 'Archived',
    date: '2025-06-20',
    createdBy: 'admin@buckeyeit.com',
    views: 80
  }
];

export default function AllAnnouncements() {
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [filtered, setFiltered] = useState(mockAnnouncements);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    audience: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statusBadge = (status) => {
    switch (status) {
      case 'Published':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Published</span>;
      case 'Scheduled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Scheduled</span>;
      case 'Draft':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Draft</span>;
      case 'Archived':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-500">Archived</span>;
      default:
        return null;
    }
  };

  const applyFilters = () => {
    let filtered = announcements.filter(a => {
      const matchesSearch = !filters.search || a.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'all' || a.status === filters.status;
      const matchesAudience = filters.audience === 'all' || a.audience === filters.audience;
      // Date filter stub (not implemented)
      return matchesSearch && matchesStatus && matchesAudience;
    });
    setFiltered(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-6">
      {/* Page Title & Create Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">All Announcements</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold flex items-center gap-2 shadow hover:bg-blue-700">
          <FaPlus /> + New Announcement
        </button>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search title or content..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="all">All</option>
            <option value="Published">Published</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.audience}
            onChange={e => setFilters(f => ({ ...f, audience: e.target.value }))}
          >
            <option value="all">All Audiences</option>
            <option value="All Tenants">All Tenants</option>
            <option value="VIP Tenants">VIP Tenants</option>
            <option value="Specific Tenant">Specific Tenant</option>
            <option value="Internal Only">Internal Only</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <div className="flex gap-2">
            <input type="date" className="px-2 py-2 border border-gray-300 rounded-md" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
            <span className="text-gray-400">-</span>
            <input type="date" className="px-2 py-2 border border-gray-300 rounded-md" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
          </div>
        </div>
        <div>
          <button
            onClick={applyFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold shadow hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
      {/* Announcements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FaArchive className="text-4xl text-gray-300 mb-2" />
                      <p className="text-lg font-medium">No announcements created yet.</p>
                      <p className="text-sm">Use the 'New Announcement' button to get started.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:underline font-semibold">
                        {a.title}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{a.audience}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{statusBadge(a.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{a.createdBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{a.views}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative">
                        <button onClick={() => setShowActionsMenu(showActionsMenu === a.id ? null : a.id)} className="text-gray-400 hover:text-gray-600">
                          <FaEllipsisV />
                        </button>
                        {showActionsMenu === a.id && (
                          <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-10 border">
                            <div className="py-1">
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FaEye className="inline mr-2" />View Announcement</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FaEdit className="inline mr-2" />Edit</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FaArchive className="inline mr-2" />Archive</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FaTrash className="inline mr-2" />Delete</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FaRedo className="inline mr-2" />Resend</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastItem, filtered.length)}</span> of{' '}
                  <span className="font-medium">{filtered.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 