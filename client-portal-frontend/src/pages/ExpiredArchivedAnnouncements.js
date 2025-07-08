import React, { useState } from 'react';
import { FaSearch, FaEllipsisV, FaEye, FaUndo, FaCopy, FaTrash, FaArchive, FaClock } from 'react-icons/fa';

const mockArchived = [
  {
    id: 1,
    title: 'Old System Maintenance Notice',
    audience: 'All Tenants',
    status: 'Archived',
    dateArchived: '2025-06-15',
    createdBy: 'admin@buckeyeit.com',
    totalViews: 245
  },
  {
    id: 2,
    title: 'Previous Feature Update',
    audience: 'VIP',
    status: 'Expired',
    dateArchived: '2025-06-20',
    createdBy: 'jane@buckeyeit.com',
    totalViews: 89
  },
  {
    id: 3,
    title: 'Legacy Policy Document',
    audience: 'Internal Only',
    status: 'Archived',
    dateArchived: '2025-05-30',
    createdBy: 'john@buckeyeit.com',
    totalViews: 156
  }
];

const mockAdmins = [
  'All',
  'admin@buckeyeit.com',
  'jane@buckeyeit.com',
  'john@buckeyeit.com'
];

export default function ExpiredArchivedAnnouncements() {
  const [archived, setArchived] = useState(mockArchived);
  const [filtered, setFiltered] = useState(mockArchived);
  const [filters, setFilters] = useState({
    search: '',
    audience: 'All',
    archivedBy: 'All',
    status: 'All',
    dateFrom: '',
    dateTo: ''
  });
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statusBadge = (status) => {
    switch (status) {
      case 'Archived':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><FaArchive className="w-3 h-3 mr-1" />Archived</span>;
      case 'Expired':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><FaClock className="w-3 h-3 mr-1" />Expired</span>;
      default:
        return null;
    }
  };

  const applyFilters = () => {
    let filtered = archived.filter(a => {
      const matchesSearch = !filters.search || a.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesAudience = filters.audience === 'All' || a.audience === filters.audience;
      const matchesArchivedBy = filters.archivedBy === 'All' || a.createdBy === filters.archivedBy;
      const matchesStatus = filters.status === 'All' || a.status === filters.status;
      // Date filter stub (not implemented)
      return matchesSearch && matchesAudience && matchesArchivedBy && matchesStatus;
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
        <h1 className="text-3xl font-bold text-gray-800">Expired & Archived Announcements</h1>
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
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Archived By</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.archivedBy}
            onChange={e => setFilters(f => ({ ...f, archivedBy: e.target.value }))}
          >
            {mockAdmins.map(admin => (
              <option key={admin} value={admin}>{admin}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="All">All</option>
            <option value="Archived">Archived</option>
            <option value="Expired">Expired</option>
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
      {/* Archived Announcements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Archived/Expired</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FaArchive className="text-4xl text-gray-300 mb-2" />
                      <p className="text-lg font-medium">No archived or expired announcements found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map(a => (
                  <tr key={a.id} className={a.status === 'Expired' ? 'bg-red-50' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-gray-500 hover:text-gray-700 font-semibold">
                        {a.title}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.audience}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{statusBadge(a.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.dateArchived}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.createdBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{a.totalViews}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative">
                        <button onClick={() => setShowActionsMenu(showActionsMenu === a.id ? null : a.id)} className="text-gray-400 hover:text-gray-600">
                          <FaEllipsisV />
                        </button>
                        {showActionsMenu === a.id && (
                          <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-10 border">
                            <div className="py-1">
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FaEye className="inline mr-2" />View</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FaUndo className="inline mr-2" />Restore to Draft</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FaCopy className="inline mr-2" />Duplicate</button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"><FaTrash className="inline mr-2" />Permanently Delete</button>
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