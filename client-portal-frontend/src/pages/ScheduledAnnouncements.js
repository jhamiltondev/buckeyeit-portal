import React, { useState } from 'react';
import { FaSearch, FaEllipsisV, FaEdit, FaCalendarAlt, FaPlay, FaTimes, FaTrash, FaClock } from 'react-icons/fa';

const mockScheduled = [
  {
    id: 1,
    title: 'Monthly Maintenance Notice',
    audience: 'All Tenants',
    scheduledDate: '2025-07-15 09:00',
    scheduledBy: 'admin@buckeyeit.com',
    status: 'Scheduled',
    lastModified: '2025-07-08'
  },
  {
    id: 2,
    title: 'VIP Feature Launch',
    audience: 'VIP',
    scheduledDate: '2025-07-20 14:30',
    scheduledBy: 'jane@buckeyeit.com',
    status: 'Scheduled',
    lastModified: '2025-07-09'
  },
  {
    id: 3,
    title: 'Internal Team Update',
    audience: 'Internal Only',
    scheduledDate: '2025-07-12 16:00',
    scheduledBy: 'john@buckeyeit.com',
    status: 'Scheduled',
    lastModified: '2025-07-10'
  }
];

const mockAdmins = [
  'All',
  'admin@buckeyeit.com',
  'jane@buckeyeit.com',
  'john@buckeyeit.com'
];

export default function ScheduledAnnouncements() {
  const [scheduled, setScheduled] = useState(mockScheduled);
  const [filtered, setFiltered] = useState(mockScheduled);
  const [filters, setFilters] = useState({
    search: '',
    audience: 'All',
    scheduledBy: 'All',
    dateFrom: '',
    dateTo: ''
  });
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statusBadge = (status) => {
    switch (status) {
      case 'Scheduled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><FaClock className="w-3 h-3 mr-1" />Scheduled</span>;
      default:
        return null;
    }
  };

  const isPublishingSoon = (scheduledDate) => {
    const scheduled = new Date(scheduledDate);
    const now = new Date();
    const diffHours = (scheduled - now) / (1000 * 60 * 60);
    return diffHours <= 24 && diffHours > 0;
  };

  const applyFilters = () => {
    let filtered = scheduled.filter(s => {
      const matchesSearch = !filters.search || s.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesAudience = filters.audience === 'All' || s.audience === filters.audience;
      const matchesScheduledBy = filters.scheduledBy === 'All' || s.scheduledBy === filters.scheduledBy;
      // Date filter stub (not implemented)
      return matchesSearch && matchesAudience && matchesScheduledBy;
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
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Scheduled Announcements</h1>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.audience}
            onChange={e => setFilters(f => ({ ...f, audience: e.target.value }))}
          >
            <option value="All">All</option>
            <option value="All Tenants">All Tenants</option>
            <option value="VIP">VIP</option>
            <option value="Internal Only">Internal Only</option>
            <option value="Specific Tenant">Specific Tenant</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled By</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.scheduledBy}
            onChange={e => setFilters(f => ({ ...f, scheduledBy: e.target.value }))}
          >
            {mockAdmins.map(admin => (
              <option key={admin} value={admin}>{admin}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date Range</label>
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
      {/* Scheduled Announcements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Publish Date/Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FaCalendarAlt className="text-4xl text-gray-300 mb-2" />
                      <p className="text-lg font-medium">No announcements are currently scheduled for future publication.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map(s => (
                  <tr key={s.id} className={isPublishingSoon(s.scheduledDate) ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:underline font-semibold">
                        {s.title}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{s.audience}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.scheduledDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{s.scheduledBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{statusBadge(s.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.lastModified}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative">
                        <button onClick={() => setShowActionsMenu(showActionsMenu === s.id ? null : s.id)} className="text-gray-400 hover:text-gray-600">
                          <FaEllipsisV />
                        </button>
                        {showActionsMenu === s.id && (
                          <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-10 border">
                            <div className="py-1">
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FaEdit className="inline mr-2" />Edit</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FaCalendarAlt className="inline mr-2" />Reschedule</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FaPlay className="inline mr-2" />Publish Now</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FaTimes className="inline mr-2" />Cancel Schedule</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FaTrash className="inline mr-2" />Delete</button>
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