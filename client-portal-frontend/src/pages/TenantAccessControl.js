import React, { useState } from 'react';
import { FaUsers, FaList, FaSync, FaSearch, FaChevronDown, FaChevronUp, FaCheckCircle, FaExclamationCircle, FaBuilding, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const mockTenants = [
  { id: 1, name: 'Acme Corp', accessType: 'Full Access', categories: 8, articles: 24, lastModified: '2025-07-01', custom: false },
  { id: 2, name: 'Beta LLC', accessType: 'Limited Access', categories: 3, articles: 7, lastModified: '2025-07-05', custom: true },
];
const mockCategories = [
  { id: 1, name: 'Security', tenants: 2, visibility: 'Restricted' },
  { id: 2, name: 'General', tenants: 5, visibility: 'Public' },
];

export default function TenantAccessControl() {
  const [tab, setTab] = useState('tenant');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [expanded, setExpanded] = useState({});

  // Filtered tenants/categories (stub logic)
  const filteredTenants = mockTenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  const filteredCategories = mockCategories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  // Modal content (stub)
  const renderManageAccessModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={() => setShowModal(false)}>&times;</button>
        <h2 className="text-xl font-bold mb-2">Manage Access for {selectedTenant?.name}</h2>
        <div className="mb-4">
          <label className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked readOnly />
            <span>All Public Content</span>
          </label>
          <label className="flex items-center gap-2 mb-2">
            <input type="checkbox" />
            <span>Custom Selection</span>
          </label>
        </div>
        <div className="max-h-40 overflow-y-auto border rounded p-2 mb-4">
          <div className="font-semibold mb-2">Categories</div>
          {mockCategories.map(cat => (
            <label key={cat.id} className="flex items-center gap-2 mb-1">
              <input type="checkbox" />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-6">
      {/* Page Title & Overview */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Tenant Access Control</h1>
      </div>
      <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-4 mb-6">
        <div className="text-gray-700">Control which tenants can access specific knowledge base content. This applies to both articles and categories marked as restricted.</div>
      </div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab==='tenant' ? 'bg-white border-b-2 border-blue-600 text-blue-700 shadow' : 'bg-gray-100 text-gray-500'}`} onClick={()=>setTab('tenant')}><FaUsers className="inline mr-2"/>By Tenant</button>
        <button className={`px-4 py-2 rounded-t-lg font-semibold ${tab==='category' ? 'bg-white border-b-2 border-blue-600 text-blue-700 shadow' : 'bg-gray-100 text-gray-500'}`} onClick={()=>setTab('category')}><FaList className="inline mr-2"/>By Category</button>
      </div>
      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="flex items-center bg-white border rounded px-2 py-1">
          <FaSearch className="text-gray-400 mr-2" />
          <input type="text" className="outline-none" placeholder={tab==='tenant' ? 'Search Tenant...' : 'Search Category...'} value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="border rounded px-2 py-1 text-gray-700">
          <option>All Access Types</option>
          <option>Full Access</option>
          <option>Limited Access</option>
        </select>
        <button className="bg-gray-200 px-3 py-1 rounded text-gray-700 flex items-center gap-1"><FaSync/>Reset Filters</button>
        <button className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1" disabled><FaCheckCircle/>Bulk Assign</button>
        <button className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1" disabled><FaExclamationCircle/>Bulk Remove</button>
      </div>
      {/* By Tenant View */}
      {tab==='tenant' && (
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Tenant Name</th>
                <th className="px-4 py-2 text-left">Access Type</th>
                <th className="px-4 py-2 text-left"># Categories</th>
                <th className="px-4 py-2 text-left"># Articles</th>
                <th className="px-4 py-2 text-left">Last Modified</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-400 py-8">No custom access rules defined. All tenants currently follow default visibility settings.</td></tr>
              ) : filteredTenants.map(t => (
                <tr key={t.id} className="border-b hover:bg-blue-50">
                  <td className="px-4 py-2 font-semibold flex items-center gap-2">
                    <button className="text-blue-600 hover:underline" onClick={()=>setExpanded(e=>({...e,[t.id]:!e[t.id]}))}>{t.name}</button>
                    <button onClick={()=>setExpanded(e=>({...e,[t.id]:!e[t.id]}))}>{expanded[t.id] ? <FaChevronUp/> : <FaChevronDown/>}</button>
                  </td>
                  <td className="px-4 py-2">
                    {t.accessType === 'Full Access' ? <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"><FaEye/> Full Access</span> : <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"><FaLock/> Limited Access</span>}
                  </td>
                  <td className="px-4 py-2">{t.categories}</td>
                  <td className="px-4 py-2">{t.articles}</td>
                  <td className="px-4 py-2">{t.lastModified}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold" onClick={()=>{setSelectedTenant(t);setShowModal(true);}}>Manage Access</button>
                    <button className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">Reset to Default</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Expandable row stub */}
          {Object.entries(expanded).map(([id, open]) => open && (
            <div key={id} className="bg-blue-50 px-8 py-4 border-t text-gray-700">Access details for tenant ID {id} (stub)</div>
          ))}
        </div>
      )}
      {/* By Category View (stub) */}
      {tab==='category' && (
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Category Name</th>
                <th className="px-4 py-2 text-left"># Tenants with Access</th>
                <th className="px-4 py-2 text-left">Visibility Level</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-gray-400 py-8">No categories found.</td></tr>
              ) : filteredCategories.map(c => (
                <tr key={c.id} className="border-b hover:bg-blue-50">
                  <td className="px-4 py-2 font-semibold">{c.name}</td>
                  <td className="px-4 py-2">{c.tenants}</td>
                  <td className="px-4 py-2">
                    {c.visibility === 'Public' ? <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"><FaEye/> Public</span> : c.visibility === 'Internal' ? <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"><FaLock/> Internal</span> : <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"><FaEyeSlash/> Restricted</span>}
                  </td>
                  <td className="px-4 py-2">
                    <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold" disabled>Manage Tenant Access</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal */}
      {showModal && renderManageAccessModal()}
    </div>
  );
} 