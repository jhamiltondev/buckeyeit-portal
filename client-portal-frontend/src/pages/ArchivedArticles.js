import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaUndo,
  FaTrash,
  FaEllipsisV,
  FaFileAlt,
  FaArchive,
  FaCalendarAlt,
  FaUser,
  FaExclamationTriangle,
  FaHistory,
  FaTag,
  FaFolder
} from 'react-icons/fa';

const ArchivedArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [archivedByFilter, setArchivedByFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('archived_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [categories, setCategories] = useState([]);
  const [archivedByUsers, setArchivedByUsers] = useState([]);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/adminpanel/api/kb-articles/';
      const params = new URLSearchParams();
      
      // Filter for archived articles only
      params.append('status', 'archived');
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (categoryFilter !== 'All') {
        params.append('category', categoryFilter);
      }
      if (archivedByFilter !== 'All') {
        params.append('archived_by', archivedByFilter);
      }
      if (dateFrom) {
        params.append('archived_date_from', dateFrom);
      }
      if (dateTo) {
        params.append('archived_date_to', dateTo);
      }
      
      params.append('page', currentPage);
      params.append('page_size', 15);
      params.append('ordering', sortOrder === 'desc' ? `-${sortBy}` : sortBy);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.results) {
        setArticles(data.results);
        setTotalPages(Math.ceil(data.count / 15));
      } else {
        setArticles([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching archived articles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/adminpanel/api/kb-categories/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.results || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchArchivedByUsers = async () => {
    try {
      const response = await fetch('/adminpanel/api/kb-authors/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setArchivedByUsers(data.results || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [currentPage, sortBy, sortOrder]);

  useEffect(() => {
    fetchCategories();
    fetchArchivedByUsers();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchArticles();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleAction = async (articleId, action) => {
    try {
      setActionLoading(articleId);
      
      let url = `/adminpanel/api/kb-articles/${articleId}/`;
      let method = 'PATCH';
      let body = {};
      
      switch (action) {
        case 'restore':
          body = { status: 'draft' };
          break;
        case 'delete':
          method = 'DELETE';
          break;
        default:
          throw new Error('Invalid action');
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: method !== 'DELETE' ? JSON.stringify(body) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`Action failed: ${response.status}`);
      }
      
      // Refresh the list
      fetchArticles();
      
    } catch (err) {
      console.error('Error performing action:', err);
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionLoading(null);
      setShowActionsMenu(null);
    }
  };

  const getCategoryChip = (category) => {
    const categoryColors = {
      'Networking': 'bg-blue-100 text-blue-800',
      'Microsoft 365': 'bg-purple-100 text-purple-800',
      'Security': 'bg-red-100 text-red-800',
      'Hardware': 'bg-orange-100 text-orange-800',
      'Software': 'bg-green-100 text-green-800',
      'General': 'bg-gray-100 text-gray-800',
    };
    
    const colorClass = categoryColors[category] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        <FaFolder className="w-3 h-3 mr-1" />
        {category}
      </span>
    );
  };

  const getOriginalStatusBadge = (originalStatus) => {
    const statusColors = {
      'published': 'bg-green-100 text-green-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'pending_review': 'bg-orange-100 text-orange-800',
    };
    
    const colorClass = statusColors[originalStatus] || 'bg-gray-100 text-gray-800';
    const statusText = originalStatus?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {statusText}
      </span>
    );
  };

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          
          {/* Filters Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="animate-pulse">
              <div className="flex space-x-4">
                <div className="h-10 bg-gray-200 rounded w-64"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
          
          {/* Table Skeleton */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-gray-200 p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Archived Articles</h1>
              <p className="text-gray-600 mt-1">
                Articles that have been retired but retained for historical reference
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {articles.length} archived article{articles.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search archived articles by title, keyword, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={archivedByFilter}
                onChange={(e) => setArchivedByFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Users</option>
                {archivedByUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-2">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <FaFilter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <FaExclamationTriangle className="w-5 h-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading archived articles</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Articles Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <FaArchive className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No archived articles found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || categoryFilter !== 'All' || archivedByFilter !== 'All' || dateFrom || dateTo
                  ? 'No archived articles match your current filters.'
                  : 'All articles are currently active or there are no archived articles.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center">
                        Title
                        {sortBy === 'title' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Archived By
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('archived_at')}
                    >
                      <div className="flex items-center">
                        Date Archived
                        {sortBy === 'archived_at' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Original Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason / Notes
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <FaArchive className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-500 italic">
                              {article.title}
                            </div>
                            <div className="text-sm text-gray-400">
                              {article.excerpt && article.excerpt.length > 60 
                                ? `${article.excerpt.substring(0, 60)}...` 
                                : article.excerpt
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {article.category ? getCategoryChip(article.category) : (
                          <span className="text-sm text-gray-500">No category</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FaUser className="w-4 h-4 mr-1 text-gray-400" />
                          {article.archived_by ? `${article.archived_by.first_name} ${article.archived_by.last_name}` : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="w-4 h-4 mr-1 text-gray-400" />
                          {article.archived_at ? new Date(article.archived_at).toLocaleDateString() : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getOriginalStatusBadge(article.original_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 max-w-xs truncate" title={article.archive_reason}>
                          {article.archive_reason || 'No reason provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => setShowActionsMenu(showActionsMenu === article.id ? null : article.id)}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                          >
                            <FaEllipsisV className="w-4 h-4" />
                          </button>
                          
                          {showActionsMenu === article.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                <a
                                  href={`/adminpanel/kb/articles/${article.id}/view`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FaEye className="w-4 h-4 mr-2" />
                                  View Snapshot
                                </a>
                                
                                <button
                                  onClick={() => handleAction(article.id, 'restore')}
                                  disabled={actionLoading === article.id}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                >
                                  <FaUndo className="w-4 h-4 mr-2" />
                                  Restore to Draft
                                </button>
                                
                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to permanently delete this archived article? This action cannot be undone.')) {
                                      handleAction(article.id, 'delete');
                                    }
                                  }}
                                  disabled={actionLoading === article.id}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                >
                                  <FaTrash className="w-4 h-4 mr-2" />
                                  Permanently Delete
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
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivedArticles; 