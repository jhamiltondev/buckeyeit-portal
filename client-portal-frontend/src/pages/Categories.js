import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaPlus, 
  FaEdit, 
  FaEye, 
  FaEllipsisV,
  FaEye as FaPublic,
  FaEyeSlash,
  FaLock,
  FaTrash,
  FaFileAlt,
  FaSitemap
} from 'react-icons/fa';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'public',
    icon: ''
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/adminpanel/api/kb-categories/';
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      params.append('page', currentPage);
      params.append('page_size', 20);
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
        setCategories(data.results);
        setTotalPages(Math.ceil(data.count / 20));
      } else {
        setCategories([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, sortBy, sortOrder]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCategories();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleAction = async (categoryId, action) => {
    try {
      setActionLoading(categoryId);
      
      let url = `/adminpanel/api/kb-categories/${categoryId}/`;
      let method = 'PATCH';
      let body = {};
      
      switch (action) {
        case 'visibility_public':
          body = { visibility: 'public' };
          break;
        case 'visibility_internal':
          body = { visibility: 'internal' };
          break;
        case 'visibility_hidden':
          body = { visibility: 'hidden' };
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
      fetchCategories();
      
    } catch (err) {
      console.error('Error performing action:', err);
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionLoading(null);
      setShowActionsMenu(null);
    }
  };

  const getVisibilityBadge = (visibility) => {
    switch (visibility) {
      case 'public':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaPublic className="w-3 h-3 mr-1" />
            Public
          </span>
        );
      case 'internal':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FaLock className="w-3 h-3 mr-1" />
            Internal
          </span>
        );
      case 'hidden':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FaEyeSlash className="w-3 h-3 mr-1" />
            Hidden
          </span>
        );
      default:
        return null;
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        visibility: category.visibility || 'public',
        icon: category.icon || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        visibility: 'public',
        icon: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
        description: '',
        visibility: 'public',
        icon: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingCategory 
        ? `/adminpanel/api/kb-categories/${editingCategory.id}/`
        : '/adminpanel/api/kb-categories/';
      
      const method = editingCategory ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${editingCategory ? 'update' : 'create'} category`);
      }
      
      closeModal();
      fetchCategories();
      
    } catch (err) {
      console.error('Error saving category:', err);
      alert(`Failed to save category: ${err.message}`);
    }
  };

  if (loading && categories.length === 0) {
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
          
          {/* Search Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-10 bg-gray-200 rounded w-64"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
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
              <h1 className="text-2xl font-bold text-gray-900">Article Categories</h1>
              <p className="text-gray-600 mt-1">
                Organize and manage your knowledge base categories
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} found
              </span>
              <button
                onClick={() => openModal()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                New Category
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <FaSitemap className="w-5 h-5 text-red-400 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading categories</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <FaSitemap className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'No categories match your search.'
                  : 'Start by creating your first category.'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => openModal()}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Create First Category
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Category Name
                        {sortBy === 'name' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('article_count')}
                    >
                      <div className="flex items-center">
                        # of Articles
                        {sortBy === 'article_count' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created On
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('updated_at')}
                    >
                      <div className="flex items-center">
                        Last Modified
                        {sortBy === 'updated_at' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <FaSitemap className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              <a 
                                href={`/adminpanel/kb/categories/${category.id}/articles`}
                                className="hover:text-blue-600 transition-colors"
                              >
                                {category.name}
                              </a>
                            </div>
                            <div className="text-sm text-gray-500">
                              {category.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaFileAlt className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {category.article_count || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getVisibilityBadge(category.visibility)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.updated_at ? new Date(category.updated_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => setShowActionsMenu(showActionsMenu === category.id ? null : category.id)}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                          >
                            <FaEllipsisV className="w-4 h-4" />
                          </button>
                          
                          {showActionsMenu === category.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    openModal(category);
                                    setShowActionsMenu(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FaEdit className="w-4 h-4 mr-2" />
                                  Edit Category
                                </button>
                                <a
                                  href={`/adminpanel/kb/categories/${category.id}/articles`}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <FaEye className="w-4 h-4 mr-2" />
                                  View Articles
                                </a>
                                
                                <div className="border-t border-gray-100">
                                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Change Visibility
                                  </div>
                                  <button
                                    onClick={() => handleAction(category.id, 'visibility_public')}
                                    disabled={actionLoading === category.id || category.visibility === 'public'}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                  >
                                    <FaPublic className="w-4 h-4 mr-2" />
                                    Make Public
                                  </button>
                                  <button
                                    onClick={() => handleAction(category.id, 'visibility_internal')}
                                    disabled={actionLoading === category.id || category.visibility === 'internal'}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                  >
                                    <FaLock className="w-4 h-4 mr-2" />
                                    Make Internal
                                  </button>
                                  <button
                                    onClick={() => handleAction(category.id, 'visibility_hidden')}
                                    disabled={actionLoading === category.id || category.visibility === 'hidden'}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                  >
                                    <FaEyeSlash className="w-4 h-4 mr-2" />
                                    Make Hidden
                                  </button>
                                </div>
                                
                                <div className="border-t border-gray-100">
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)) {
                                        handleAction(category.id, 'delete');
                                      }
                                    }}
                                    disabled={actionLoading === category.id}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                  >
                                    <FaTrash className="w-4 h-4 mr-2" />
                                    Delete Category
                                  </button>
                                </div>
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Category Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter category name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Optional description"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Visibility
                      </label>
                      <select
                        value={formData.visibility}
                        onChange={(e) => setFormData({...formData, visibility: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="public">Public</option>
                        <option value="internal">Internal</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Icon (Font Awesome class)
                      </label>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => setFormData({...formData, icon: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., fa-envelope"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {editingCategory ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories; 