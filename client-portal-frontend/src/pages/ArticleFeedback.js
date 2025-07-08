import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt, 
  FaThumbsUp, 
  FaThumbsDown, 
  FaComment, 
  FaLightbulb,
  FaEllipsisV,
  FaEye,
  FaCheck,
  FaFlag,
  FaReply,
  FaFileAlt,
  FaChartBar,
  FaStar
} from 'react-icons/fa';

const mockFeedback = [
  {
    id: 1,
    articleTitle: 'How to Set Up VPN Connection',
    feedbackType: 'helpful',
    submittedBy: 'john.doe@acme.com',
    feedbackText: 'This article was very clear and helped me connect successfully.',
    dateSubmitted: '2025-07-05',
    status: 'unreviewed',
    category: 'VPN & Remote Access'
  },
  {
    id: 2,
    articleTitle: 'Email Configuration Guide',
    feedbackType: 'not_helpful',
    submittedBy: 'Anonymous',
    feedbackText: 'The steps were confusing and I couldn\'t complete the setup.',
    dateSubmitted: '2025-07-04',
    status: 'reviewed',
    category: 'Email & Outlook'
  },
  {
    id: 3,
    articleTitle: 'Printer Troubleshooting',
    feedbackType: 'comment',
    submittedBy: 'sarah.smith@beta.com',
    feedbackText: 'Would be helpful to include more specific error codes.',
    dateSubmitted: '2025-07-03',
    status: 'flagged',
    category: 'Devices & Printers'
  },
  {
    id: 4,
    articleTitle: 'MFA Setup Instructions',
    feedbackType: 'suggestion',
    submittedBy: 'admin@gamma.com',
    feedbackText: 'Consider adding screenshots for mobile app setup.',
    dateSubmitted: '2025-07-02',
    status: 'unreviewed',
    category: 'Account & Access'
  }
];

const mockMetrics = {
  totalFeedback: 156,
  helpfulPercentage: 78,
  notHelpfulPercentage: 22,
  topArticles: [
    { title: 'VPN Setup Guide', positiveFeedback: 45 },
    { title: 'Email Configuration', positiveFeedback: 32 },
    { title: 'MFA Setup', positiveFeedback: 28 }
  ]
};

export default function ArticleFeedback() {
  const [feedback, setFeedback] = useState(mockFeedback);
  const [filteredFeedback, setFilteredFeedback] = useState(mockFeedback);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    feedbackType: 'all',
    category: 'all',
    dateFrom: '',
    dateTo: '',
    status: 'all'
  });

  // Categories for filter
  const categories = [
    'Account & Access',
    'Devices & Printers', 
    'Email & Outlook',
    'VPN & Remote Access',
    'Microsoft 365',
    'Admin Tools',
    'General FAQs'
  ];

  const getFeedbackTypeIcon = (type) => {
    switch (type) {
      case 'helpful':
        return <FaThumbsUp className="text-green-600" />;
      case 'not_helpful':
        return <FaThumbsDown className="text-red-600" />;
      case 'comment':
        return <FaComment className="text-blue-600" />;
      case 'suggestion':
        return <FaLightbulb className="text-yellow-600" />;
      default:
        return <FaComment className="text-gray-600" />;
    }
  };

  const getFeedbackTypeLabel = (type) => {
    switch (type) {
      case 'helpful':
        return '👍 Helpful';
      case 'not_helpful':
        return '👎 Not Helpful';
      case 'comment':
        return '💬 Comment';
      case 'suggestion':
        return '💡 Suggestion';
      default:
        return 'Unknown';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'reviewed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheck className="w-3 h-3 mr-1" />
            Reviewed
          </span>
        );
      case 'unreviewed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaEye className="w-3 h-3 mr-1" />
            Unreviewed
          </span>
        );
      case 'flagged':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaFlag className="w-3 h-3 mr-1" />
            Flagged
          </span>
        );
      default:
        return null;
    }
  };

  const applyFilters = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let filtered = mockFeedback.filter(item => {
        const matchesSearch = !filters.search || 
          item.articleTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.feedbackText.toLowerCase().includes(filters.search.toLowerCase());
        
        const matchesType = filters.feedbackType === 'all' || item.feedbackType === filters.feedbackType;
        const matchesCategory = filters.category === 'all' || item.category === filters.category;
        const matchesStatus = filters.status === 'all' || item.status === filters.status;
        
        return matchesSearch && matchesType && matchesCategory && matchesStatus;
      });
      
      setFilteredFeedback(filtered);
      setCurrentPage(1);
      setLoading(false);
    }, 500);
  };

  const handleAction = async (feedbackId, action) => {
    try {
      setActionLoading(feedbackId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setFilteredFeedback(prev => prev.map(item => {
        if (item.id === feedbackId) {
          switch (action) {
            case 'mark_reviewed':
              return { ...item, status: 'reviewed' };
            case 'flag':
              return { ...item, status: 'flagged' };
            default:
              return item;
          }
        }
        return item;
      }));
      
    } catch (err) {
      console.error('Error performing action:', err);
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionLoading(null);
      setShowActionsMenu(null);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFeedback.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto py-8 px-2 md:px-6">
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Article Feedback</h1>
          <div className="text-gray-500 mt-1">Review and manage user feedback on knowledge base articles</div>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <FaChartBar className="text-blue-600 text-2xl mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-800">{mockMetrics.totalFeedback}</div>
              <div className="text-sm text-gray-500">Total Feedback</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <FaThumbsUp className="text-green-600 text-2xl mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-800">{mockMetrics.helpfulPercentage}%</div>
              <div className="text-sm text-gray-500">Helpful</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <FaThumbsDown className="text-red-600 text-2xl mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-800">{mockMetrics.notHelpfulPercentage}%</div>
              <div className="text-sm text-gray-500">Not Helpful</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <FaStar className="text-yellow-600 text-2xl mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-800">3</div>
              <div className="text-sm text-gray-500">Top Articles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search articles or feedback..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.feedbackType}
              onChange={(e) => setFilters(prev => ({ ...prev, feedbackType: e.target.value }))}
            >
              <option value="all">All Types</option>
              <option value="helpful">👍 Helpful</option>
              <option value="not_helpful">👎 Not Helpful</option>
              <option value="comment">💬 Comment</option>
              <option value="suggestion">💡 Suggestion</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="unreviewed">Unreviewed</option>
              <option value="reviewed">Reviewed</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={applyFilters}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Applying...' : 'Apply Filters'}
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FaComment className="text-4xl text-gray-300 mb-2" />
                      <p className="text-lg font-medium">No feedback has been submitted for any articles yet.</p>
                      <p className="text-sm">When users provide feedback on articles, it will appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <button className="text-blue-600 hover:text-blue-800 hover:underline">
                          {item.articleTitle}
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFeedbackTypeIcon(item.feedbackType)}
                        <span className="ml-2 text-sm text-gray-900">
                          {getFeedbackTypeLabel(item.feedbackType)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.submittedBy === 'Anonymous' ? (
                        <span className="text-gray-500 italic">Anonymous</span>
                      ) : (
                        item.submittedBy
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {item.feedbackText}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.dateSubmitted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative">
                        <button
                          onClick={() => setShowActionsMenu(showActionsMenu === item.id ? null : item.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <FaEllipsisV />
                        </button>
                        
                        {showActionsMenu === item.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                            <div className="py-1">
                              <button
                                onClick={() => handleAction(item.id, 'mark_reviewed')}
                                disabled={actionLoading === item.id}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                              >
                                <FaCheck className="inline mr-2" />
                                Mark as Reviewed
                              </button>
                              <button
                                onClick={() => handleAction(item.id, 'flag')}
                                disabled={actionLoading === item.id}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                              >
                                <FaFlag className="inline mr-2" />
                                Flag as Inappropriate
                              </button>
                              <button
                                onClick={() => {/* TODO: Implement reply */}}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <FaReply className="inline mr-2" />
                                Respond
                              </button>
                              <button
                                onClick={() => {/* TODO: View article */}}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <FaFileAlt className="inline mr-2" />
                                View Article
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
                  <span className="font-medium">{Math.min(indexOfLastItem, filteredFeedback.length)}</span> of{' '}
                  <span className="font-medium">{filteredFeedback.length}</span> results
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