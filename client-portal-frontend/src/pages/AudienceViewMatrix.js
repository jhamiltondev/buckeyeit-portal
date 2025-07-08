import React, { useState } from 'react';
import { 
  FaSearch, 
  FaEllipsisV, 
  FaEye, 
  FaEdit, 
  FaChartBar, 
  FaDownload, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaLock,
  FaFilter,
  FaTable,
  FaTh
} from 'react-icons/fa';

// Mock data for the matrix
const mockAnnouncements = [
  {
    id: 1,
    title: 'System Maintenance Notice',
    status: 'Published',
    publishDate: '2025-01-15',
    audiences: ['All Tenants', 'VIP', 'Internal']
  },
  {
    id: 2,
    title: 'New Feature Release',
    status: 'Published',
    publishDate: '2025-01-10',
    audiences: ['VIP', 'Internal']
  },
  {
    id: 3,
    title: 'Security Update Required',
    status: 'Scheduled',
    publishDate: '2025-01-20',
    audiences: ['All Tenants']
  },
  {
    id: 4,
    title: 'Holiday Schedule Changes',
    status: 'Published',
    publishDate: '2025-01-05',
    audiences: ['All Tenants', 'Internal']
  },
  {
    id: 5,
    title: 'VIP Client Portal Updates',
    status: 'Published',
    publishDate: '2025-01-12',
    audiences: ['VIP']
  }
];

const mockTenants = [
  'All Tenants',
  'VIP',
  'Internal',
  'Acme Corp',
  'TechStart Inc',
  'Global Solutions',
  'Local Business LLC'
];

// Mock view data - matrix of announcement ID vs tenant
const mockViewMatrix = {
  '1': { // System Maintenance Notice
    'All Tenants': { status: 'viewed', viewDate: '2025-01-15 10:30', viewCount: 156 },
    'VIP': { status: 'viewed', viewDate: '2025-01-15 09:15', viewCount: 23 },
    'Internal': { status: 'viewed', viewDate: '2025-01-15 08:45', viewCount: 12 },
    'Acme Corp': { status: 'viewed', viewDate: '2025-01-15 11:20', viewCount: 8 },
    'TechStart Inc': { status: 'not_viewed', viewDate: null, viewCount: 0 },
    'Global Solutions': { status: 'viewed', viewDate: '2025-01-15 14:30', viewCount: 15 },
    'Local Business LLC': { status: 'not_viewed', viewDate: null, viewCount: 0 }
  },
  '2': { // New Feature Release
    'All Tenants': { status: 'not_visible', viewDate: null, viewCount: 0 },
    'VIP': { status: 'viewed', viewDate: '2025-01-10 16:20', viewCount: 18 },
    'Internal': { status: 'viewed', viewDate: '2025-01-10 15:45', viewCount: 8 },
    'Acme Corp': { status: 'not_visible', viewDate: null, viewCount: 0 },
    'TechStart Inc': { status: 'not_visible', viewDate: null, viewCount: 0 },
    'Global Solutions': { status: 'not_visible', viewDate: null, viewCount: 0 },
    'Local Business LLC': { status: 'not_visible', viewDate: null, viewCount: 0 }
  },
  '3': { // Security Update Required
    'All Tenants': { status: 'scheduled', viewDate: null, viewCount: 0 },
    'VIP': { status: 'not_visible', viewDate: null, viewCount: 0 },
    'Internal': { status: 'not_visible', viewDate: null, viewCount: 0 },
    'Acme Corp': { status: 'scheduled', viewDate: null, viewCount: 0 },
    'TechStart Inc': { status: 'scheduled', viewDate: null, viewCount: 0 },
    'Global Solutions': { status: 'scheduled', viewDate: null, viewCount: 0 },
    'Local Business LLC': { status: 'scheduled', viewDate: null, viewCount: 0 }
  },
  '4': { // Holiday Schedule Changes
    'All Tenants': { status: 'viewed', viewDate: '2025-01-05 12:15', viewCount: 89 },
    'VIP': { status: 'not_visible', viewDate: null, viewCount: 0 },
    'Internal': { status: 'viewed', viewDate: '2025-01-05 11:30', viewCount: 5 },
    'Acme Corp': { status: 'viewed', viewDate: '2025-01-05 13:45', viewCount: 3 },
    'TechStart Inc': { status: 'viewed', viewDate: '2025-01-06 09:20', viewCount: 2 },
    'Global Solutions': { status: 'viewed', viewDate: '2025-01-05 16:10', viewCount: 7 },
    'Local Business LLC': { status: 'viewed', viewDate: '2025-01-06 10:30', viewCount: 1 }
  },
  '5': { // VIP Client Portal Updates
    'All Tenants': { status: 'not_visible', viewDate: null, viewCount: 0 },
    'VIP': { status: 'viewed', viewDate: '2025-01-12 14:20', viewCount: 12 },
    'Internal': { status: 'not_visible', viewDate: null, viewCount: 0 },
    'Acme Corp': { status: 'not_visible', viewDate: null, viewCount: 0 },
    'TechStart Inc': { status: 'not_visible', viewDate: null, viewCount: 0 },
    'Global Solutions': { status: 'not_visible', viewDate: null, viewCount: 0 },
    'Local Business LLC': { status: 'not_visible', viewDate: null, viewCount: 0 }
  }
};

export default function AudienceViewMatrix() {
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [tenants] = useState(mockTenants);
  const [viewMatrix] = useState(mockViewMatrix);
  const [filters, setFilters] = useState({
    search: '',
    audienceType: 'All',
    status: 'All',
    dateFrom: '',
    dateTo: ''
  });
  const [filteredAnnouncements, setFilteredAnnouncements] = useState(announcements);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' or 'list'
  const [hoveredCell, setHoveredCell] = useState(null);

  // Calculate summary metrics
  const totalPublished = announcements.filter(a => a.status === 'Published').length;
  const totalViews = Object.values(viewMatrix).reduce((sum, tenantViews) => {
    return sum + Object.values(tenantViews).reduce((tenantSum, view) => {
      return tenantSum + (view.status === 'viewed' ? 1 : 0);
    }, 0);
  }, 0);
  const totalPossibleViews = Object.keys(viewMatrix).length * tenants.length;
  const viewPercentage = totalPossibleViews > 0 ? Math.round((totalViews / totalPossibleViews) * 100) : 0;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'viewed':
        return <FaCheck className="text-green-600" />;
      case 'not_viewed':
        return <FaTimes className="text-red-600" />;
      case 'scheduled':
        return <FaClock className="text-yellow-600" />;
      case 'not_visible':
        return <FaLock className="text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusTooltip = (announcementId, tenant, status, viewDate, viewCount) => {
    const announcement = announcements.find(a => a.id === parseInt(announcementId));
    const baseText = `${announcement?.title} - ${tenant}`;
    
    switch (status) {
      case 'viewed':
        return `${baseText}\nViewed: ${viewDate}\nViews: ${viewCount}`;
      case 'not_viewed':
        return `${baseText}\nNot viewed yet`;
      case 'scheduled':
        return `${baseText}\nScheduled for future`;
      case 'not_visible':
        return `${baseText}\nNot visible to this audience`;
      default:
        return baseText;
    }
  };

  const applyFilters = () => {
    let filtered = announcements.filter(a => {
      const matchesSearch = !filters.search || a.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'All' || a.status === filters.status;
      const matchesAudience = filters.audienceType === 'All' || a.audiences.includes(filters.audienceType);
      return matchesSearch && matchesStatus && matchesAudience;
    });
    setFilteredAnnouncements(filtered);
  };

  const exportToCSV = () => {
    // Create CSV content
    const headers = ['Announcement', 'Status', 'Publish Date', 'Audience', ...tenants];
    const rows = [];
    
    filteredAnnouncements.forEach(announcement => {
      const baseRow = [
        announcement.title,
        announcement.status,
        announcement.publishDate,
        announcement.audiences.join(', ')
      ];
      
      // Add view status for each tenant
      tenants.forEach(tenant => {
        const viewData = viewMatrix[announcement.id]?.[tenant] || { 
          status: 'not_visible', 
          viewDate: null, 
          viewCount: 0 
        };
        
        let statusText = '';
        switch (viewData.status) {
          case 'viewed':
            statusText = `Viewed (${viewData.viewCount} views)`;
            break;
          case 'not_viewed':
            statusText = 'Not Viewed';
            break;
          case 'scheduled':
            statusText = 'Scheduled';
            break;
          case 'not_visible':
            statusText = 'Not Visible';
            break;
          default:
            statusText = 'Unknown';
        }
        
        baseRow.push(statusText);
      });
      
      rows.push(baseRow);
    });
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audience-view-matrix-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-2 md:px-6">
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Audience View Matrix</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              viewMode === 'matrix' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaTh className="inline mr-1" />
            Matrix
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaTable className="inline mr-1" />
            List
          </button>
        </div>
      </div>

      {/* Summary Panel */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Summary Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalPublished}</div>
            <div className="text-sm text-gray-600">Total Published</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{viewPercentage}%</div>
            <div className="text-sm text-gray-600">Viewed by All Tenants</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">156</div>
            <div className="text-sm text-gray-600">Most Viewed</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">0</div>
            <div className="text-sm text-gray-600">Least Viewed</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center mb-4">
          <FaFilter className="text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-800">Filters</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Announcements</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by title..."
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audience Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.audienceType}
              onChange={e => setFilters(f => ({ ...f, audienceType: e.target.value }))}
            >
              <option value="All">All</option>
              <option value="All Tenants">All Tenants</option>
              <option value="VIP">VIP Only</option>
              <option value="Internal">Internal Only</option>
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
              <option value="Published">Published</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="flex gap-2">
              <input 
                type="date" 
                className="px-2 py-2 border border-gray-300 rounded-md" 
                value={filters.dateFrom} 
                onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} 
              />
              <span className="text-gray-400">-</span>
              <input 
                type="date" 
                className="px-2 py-2 border border-gray-300 rounded-md" 
                value={filters.dateTo} 
                onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} 
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold shadow hover:bg-blue-700"
            >
              Apply Filters
            </button>
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold shadow hover:bg-green-700"
            >
              <FaDownload className="inline mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Matrix View */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    Announcements
                  </th>
                  {tenants.map(tenant => (
                    <th key={tenant} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                      {tenant}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAnnouncements.length === 0 ? (
                  <tr>
                    <td colSpan={tenants.length + 2} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaTable className="text-4xl text-gray-300 mb-2" />
                        <p className="text-lg font-medium">No announcements match the selected filters</p>
                        <p className="text-sm">Try adjusting your search criteria or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAnnouncements.map((announcement, index) => (
                    <tr key={announcement.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-inherit z-10">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                          <div className="text-xs text-gray-500">
                            {announcement.status} • {announcement.publishDate}
                          </div>
                        </div>
                      </td>
                      {tenants.map(tenant => {
                        const viewData = viewMatrix[announcement.id]?.[tenant] || { 
                          status: 'not_visible', 
                          viewDate: null, 
                          viewCount: 0 
                        };
                        return (
                          <td key={tenant} className="px-4 py-4 text-center">
                            <div
                              className="relative inline-flex items-center justify-center w-8 h-8 rounded-full cursor-pointer hover:bg-gray-100"
                              onMouseEnter={() => setHoveredCell(`${announcement.id}-${tenant}`)}
                              onMouseLeave={() => setHoveredCell(null)}
                            >
                              {getStatusIcon(viewData.status)}
                              {hoveredCell === `${announcement.id}-${tenant}` && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-pre-line z-20">
                                  {getStatusTooltip(announcement.id, tenant, viewData.status, viewData.viewDate, viewData.viewCount)}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="relative">
                          <button 
                            onClick={() => setShowActionsMenu(showActionsMenu === announcement.id ? null : announcement.id)} 
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FaEllipsisV />
                          </button>
                          {showActionsMenu === announcement.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                              <div className="py-1">
                                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <FaEye className="inline mr-2" />View Announcement
                                </button>
                                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <FaEdit className="inline mr-2" />Edit Audience
                                </button>
                                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <FaChartBar className="inline mr-2" />View Engagement Report
                                </button>
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
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Announcement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAnnouncements.map((announcement, index) => (
                  <tr key={announcement.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                        <div className="text-xs text-gray-500">Published: {announcement.publishDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        announcement.status === 'Published' ? 'bg-green-100 text-green-800' :
                        announcement.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {announcement.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {announcement.audiences.join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {tenants.slice(0, 3).map(tenant => {
                          const viewData = viewMatrix[announcement.id]?.[tenant];
                          return viewData ? (
                            <div key={tenant} className="w-6 h-6 flex items-center justify-center">
                              {getStatusIcon(viewData.status)}
                            </div>
                          ) : null;
                        })}
                        {tenants.length > 3 && (
                          <span className="text-xs text-gray-400">+{tenants.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative">
                        <button 
                          onClick={() => setShowActionsMenu(showActionsMenu === announcement.id ? null : announcement.id)} 
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FaEllipsisV />
                        </button>
                        {showActionsMenu === announcement.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                            <div className="py-1">
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <FaEye className="inline mr-2" />View Announcement
                              </button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <FaEdit className="inline mr-2" />Edit Audience
                              </button>
                              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <FaChartBar className="inline mr-2" />View Engagement Report
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <FaCheck className="text-green-600 mr-2" />
            <span className="text-sm text-gray-600">Viewed</span>
          </div>
          <div className="flex items-center">
            <FaTimes className="text-red-600 mr-2" />
            <span className="text-sm text-gray-600">Not Viewed</span>
          </div>
          <div className="flex items-center">
            <FaClock className="text-yellow-600 mr-2" />
            <span className="text-sm text-gray-600">Scheduled</span>
          </div>
          <div className="flex items-center">
            <FaLock className="text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Not Visible</span>
          </div>
        </div>
      </div>
    </div>
  );
} 