import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaThumbsUp,
  FaChartLine,
  FaEllipsisV,
  FaFileAlt,
  FaCalendarAlt,
  FaUser,
  FaExclamationTriangle,
  FaTrophy,
  FaMedal,
  FaAward,
  FaFolder,
  FaStar
} from 'react-icons/fa';

const MostViewedArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [authorFilter, setAuthorFilter] = useState('All');
  const [viewMode, setViewMode] = useState('most_viewed'); // most_viewed, most_liked, most_searched
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('view_count');
  const [sortOrder, setSortOrder] = useState('desc');
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [showActionsMenu, setShowActionsMenu] = useState(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/adminpanel/api/kb-articles/';
      const params = new URLSearchParams();
      
      // Filter for published articles only
      params.append('status', 'published');
      
      // Add analytics filters
      params.append('date_range', dateRange);
      params.append('view_mode', viewMode);
      
      if (categoryFilter !== 'All') {
        params.append('category', categoryFilter);
      }
      if (authorFilter !== 'All') {
        params.append('author', authorFilter);
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
      console.error('Error fetching popular articles:', err);
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

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/adminpanel/api/kb-authors/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuthors(data.results || []);
      }
    } catch (err) {
      console.error('Error fetching authors:', err);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [currentPage, sortBy, sortOrder, dateRange, viewMode]);

  useEffect(() => {
    fetchCategories();
    fetchAuthors();
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

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
          <FaTrophy className="w-4 h-4 text-yellow-600" />
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
          <FaMedal className="w-4 h-4 text-gray-600" />
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
          <FaAward className="w-4 h-4 text-orange-600" />
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
          <span className="text-sm font-bold text-blue-600">{rank}</span>
        </div>
      );
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

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getViewModeLabel = (mode) => {
    switch (mode) {
      case 'most_viewed':
        return 'Most Viewed';
      case 'most_liked':
        return 'Most Liked';
      case 'most_searched':
        return 'Most Searched';
      default:
        return 'Most Viewed';
    }
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
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">Most Viewed Articles</h1>
              <p className="text-gray-600 mt-1">
                These articles have received the most views in the past {dateRange === '7' ? '7' : dateRange === '30' ? '30' : 'all time'} days.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <FaChartLine className="w-6 h-6 text-blue-600" />
              <span className="text-sm text-gray-500">
                {articles.length} article{articles.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {/* View Mode Toggle */}
            <div className="lg:col-span-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'most_viewed', label: 'Most Viewed', icon: <FaEye /> },
                  { key: 'most_liked', label: 'Most Liked', icon: <FaThumbsUp /> },
                  { key: 'most_searched', label: 'Most Searched', icon: <FaSearch /> }
                ].map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => setViewMode(mode.key)}
                    className={`flex items-center justify-center flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === mode.key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-2">{mode.icon}</span>
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Date Range */}
            <div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
            
            {/* Category Filter */}
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
            
            {/* Author Filter */}
            <div>
              <select
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Authors</option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>
                    {author.first_name} {author.last_name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Apply Button */}
            <div>
              <button
                onClick={handleSearch}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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
                <h3 className="text-sm font-medium text-red-800">Error loading popular articles</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Articles Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <FaChartLine className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No article view data available</h3>
              <p className="mt-1 text-sm text-gray-500">
                {dateRange !== 'all' 
                  ? `No article view data available for the selected date range.`
                  : 'No article view data available.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
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
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('view_count')}
                    >
                      <div className="flex items-center">
                        <FaEye className="w-4 h-4 mr-1" />
                        Views
                        {sortBy === 'view_count' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('like_count')}
                    >
                      <div className="flex items-center">
                        <FaThumbsUp className="w-4 h-4 mr-1" />
                        Likes
                        {sortBy === 'like_count' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('last_viewed')}
                    >
                      <div className="flex items-center">
                        Last Viewed
                        {sortBy === 'last_viewed' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Published By
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles.map((article, index) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRankBadge(index + 1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <FaFileAlt className="h-10 w-10 text-blue-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              <a 
                                href={`/adminpanel/kb/articles/${article.id}/view`}
                                className="hover:text-blue-600 transition-colors"
                              >
                                {article.title}
                              </a>
                            </div>
                            <div className="text-sm text-gray-500">
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
                          <FaEye className="w-4 h-4 mr-1 text-blue-500" />
                          {formatNumber(article.view_count || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FaThumbsUp className="w-4 h-4 mr-1 text-green-500" />
                          {formatNumber(article.like_count || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="w-4 h-4 mr-1 text-gray-400" />
                          {article.last_viewed ? new Date(article.last_viewed).toLocaleDateString() : 'Never'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FaUser className="w-4 h-4 mr-1 text-gray-400" />
                          {article.author ? `${article.author.first_name} ${article.author.last_name}` : 'Unknown'}
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
                                  View Article
                                </a>
                                <a
                                  href={`/adminpanel/kb/articles/${article.id}/edit`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FaFileAlt className="w-4 h-4 mr-2" />
                                  Edit Article
                                </a>
                                <a
                                  href={`/adminpanel/kb/articles/${article.id}/analytics`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FaChartLine className="w-4 h-4 mr-2" />
                                  View Analytics
                                </a>
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

export default MostViewedArticles; 