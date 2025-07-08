import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaRedo, 
  FaTrash,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';

const SuspendedDeletedTenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/adminpanel/api/tenants/';
      const params = new URLSearchParams();
      
      if (statusFilter === 'Suspended') {
        params.append('suspended', 'true');
      } else if (statusFilter === 'Deleted') {
        params.append('is_deleted', 'true');
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      params.append('page', currentPage);
      params.append('page_size', 10);
      
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
        setTenants(data.results);
        setTotalPages(Math.ceil(data.count / 10));
      } else {
        setTenants([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [statusFilter, currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTenants();
  };

  const handleAction = async (tenantId, action) => {
    try {
      setActionLoading(tenantId);
      
      let url = `/adminpanel/api/tenants/${tenantId}/`;
      let method = 'PATCH';
      let body = {};
      
      switch (action) {
        case 'reactivate':
          body = { is_deleted: false, deleted_at: null, deleted_by: null, deletion_reason: '' };
          break;
        case 'restore':
          body = { suspended_at: null, suspended_by: null, suspension_reason: '' };
          break;
        case 'permanent_delete':
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
      fetchTenants();
      
    } catch (err) {
      console.error('Error performing action:', err);
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (tenant) => {
    if (tenant.is_deleted) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FaTrash className="w-3 h-3 mr-1" />
          Deleted
        </span>
      );
    } else if (tenant.suspended_at) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FaExclamationTriangle className="w-3 h-3 mr-1" />
          Suspended
        </span>
      );
    }
    return null;
  };

  const getStatusIcon = (tenant) => {
    if (tenant.is_deleted) {
      return <FaTrash className="w-5 h-5 text-red-500" />;
    } else if (tenant.suspended_at) {
      return <FaExclamationTriangle className="w-5 h-5 text-yellow-500" />;
    }
    return <FaClock className="w-5 h-5 text-gray-400" />;
  };

  if (loading && tenants.length === 0) {
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
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Suspended & Deleted Tenants</h1>
              <p className="text-gray-600 mt-1">
                Manage suspended and deleted tenant accounts
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {tenants.length} tenant{tenants.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Suspended">Suspended</option>
                <option value="Deleted">Deleted</option>
              </select>
              
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
                <h3 className="text-sm font-medium text-red-800">Error loading tenants</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tenants List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {tenants.length === 0 ? (
            <div className="text-center py-12">
              <FaExclamationTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tenants found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter === 'All' 
                  ? 'No suspended or deleted tenants match your criteria.'
                  : `No ${statusFilter.toLowerCase()} tenants found.`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tenants.map((tenant) => (
                <div 
                  key={tenant.id} 
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    tenant.is_deleted ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(tenant)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className={`text-lg font-medium ${
                            tenant.is_deleted ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {tenant.name}
                          </h3>
                          {getStatusBadge(tenant)}
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          {tenant.domain && (
                            <span>Domain: {tenant.domain}</span>
                          )}
                          {tenant.industry && (
                            <span>Industry: {tenant.industry}</span>
                          )}
                          <span>Created: {new Date(tenant.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        {/* Suspension/Deletion Details */}
                        {(tenant.suspended_at || tenant.is_deleted) && (
                          <div className="mt-2 text-sm">
                            {tenant.suspended_at && (
                              <div className="text-yellow-700">
                                <strong>Suspended:</strong> {new Date(tenant.suspended_at).toLocaleString()}
                                {tenant.suspended_by && ` by ${tenant.suspended_by.first_name} ${tenant.suspended_by.last_name}`}
                                {tenant.suspension_reason && ` - ${tenant.suspension_reason}`}
                              </div>
                            )}
                            {tenant.is_deleted && (
                              <div className="text-red-700">
                                <strong>Deleted:</strong> {new Date(tenant.deleted_at).toLocaleString()}
                                {tenant.deleted_by && ` by ${tenant.deleted_by.first_name} ${tenant.deleted_by.last_name}`}
                                {tenant.deletion_reason && ` - ${tenant.deletion_reason}`}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="View Details"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      
                      {tenant.is_deleted && (
                        <button
                          onClick={() => handleAction(tenant.id, 'reactivate')}
                          disabled={actionLoading === tenant.id}
                          className="p-2 text-green-600 hover:text-green-700 disabled:opacity-50 transition-colors"
                          title="Reactivate Tenant"
                        >
                          <FaRedo className="w-4 h-4" />
                        </button>
                      )}
                      
                      {tenant.suspended_at && !tenant.is_deleted && (
                        <button
                          onClick={() => handleAction(tenant.id, 'restore')}
                          disabled={actionLoading === tenant.id}
                          className="p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                          title="Restore Tenant"
                        >
                          <FaCheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {tenant.is_deleted && (
                        <button
                          onClick={() => {
                            if (window.confirm('This will permanently delete the tenant. This action cannot be undone. Are you sure?')) {
                              handleAction(tenant.id, 'permanent_delete');
                            }
                          }}
                          disabled={actionLoading === tenant.id}
                          className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                          title="Permanently Delete"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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

        {/* Details Modal */}
        {showDetailsModal && selectedTenant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Tenant Details: {selectedTenant.name}
                  </h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTenant.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Domain</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTenant.domain || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Industry</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTenant.industry || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedTenant)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedTenant.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Users</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTenant.user_count || 0}</p>
                  </div>
                </div>
                
                {selectedTenant.suspended_at && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">Suspension Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Suspended:</strong> {new Date(selectedTenant.suspended_at).toLocaleString()}</p>
                      {selectedTenant.suspended_by && (
                        <p><strong>By:</strong> {selectedTenant.suspended_by.first_name} {selectedTenant.suspended_by.last_name}</p>
                      )}
                      {selectedTenant.suspension_reason && (
                        <p><strong>Reason:</strong> {selectedTenant.suspension_reason}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {selectedTenant.is_deleted && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Deletion Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Deleted:</strong> {new Date(selectedTenant.deleted_at).toLocaleString()}</p>
                      {selectedTenant.deleted_by && (
                        <p><strong>By:</strong> {selectedTenant.deleted_by.first_name} {selectedTenant.deleted_by.last_name}</p>
                      )}
                      {selectedTenant.deletion_reason && (
                        <p><strong>Reason:</strong> {selectedTenant.deletion_reason}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuspendedDeletedTenants; 