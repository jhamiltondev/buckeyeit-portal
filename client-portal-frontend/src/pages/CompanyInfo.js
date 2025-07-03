import React, { useEffect, useState } from 'react';

export default function CompanyInfo() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/company_info/', { credentials: 'include' })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(setData)
      .catch(() => setError('Could not load company info.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center text-lg">Loading...</div>;
  if (error) return <div className="py-12 text-center text-red-600">{error}</div>;
  if (!data) return null;

  const { company_profile, contacts, support_info, services, documents } = data;

  return (
    <div className="max-w-5xl mx-auto py-8 px-2 md:px-6">
      <h1 className="text-2xl font-bold mb-6">Company Information</h1>

      {/* 1. Company Profile Card */}
      <div className="bg-white rounded-xl shadow p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        {company_profile.logo && (
          <img src={company_profile.logo} alt="Company Logo" className="h-20 w-20 object-contain rounded" />
        )}
        <div className="flex-1">
          <div className="text-xl font-semibold mb-1">{company_profile.name}</div>
          <div className="text-gray-600 mb-2">{company_profile.domain}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <div><span className="font-medium">Tenant ID:</span> {company_profile.tenant_id}</div>
            <div><span className="font-medium">Plan Type:</span> {company_profile.plan_type}</div>
            <div><span className="font-medium">Security Tier:</span> {company_profile.security_tier}</div>
            <div><span className="font-medium">Onboarded:</span> {company_profile.onboarded}</div>
          </div>
        </div>
      </div>

      {/* 2. Primary Contacts Panel */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="font-semibold text-lg mb-4">Primary Contacts</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-medium">Name</th>
                <th className="text-left py-2 pr-4 font-medium">Role</th>
                <th className="text-left py-2 pr-4 font-medium">Email</th>
                <th className="text-left py-2 pr-4 font-medium">Phone</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 pr-4">{c.name}</td>
                  <td className="py-2 pr-4"><span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-semibold">{c.role}</span></td>
                  <td className="py-2 pr-4">
                    <span>{c.email}</span>
                    <button className="ml-2 text-blue-600 underline text-xs" onClick={() => navigator.clipboard.writeText(c.email)}>Copy</button>
                  </td>
                  <td className="py-2 pr-4">{c.phone || <span className="text-gray-400">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Support Info & SLA */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="font-semibold text-lg mb-4">Support Info & SLA</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div><span className="font-medium">Assigned Tech:</span> {support_info.assigned_tech}</div>
          <div><span className="font-medium">SLA:</span> {support_info.sla}</div>
          <div><span className="font-medium">Support Line:</span> {support_info.support_line}</div>
          <div><span className="font-medium">Email Support:</span> {support_info.email_support}</div>
          <div><span className="font-medium">Time Zone:</span> {support_info.timezone}</div>
        </div>
      </div>

      {/* 4. Services Overview */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="font-semibold text-lg mb-4">Services Overview</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((cat, i) => (
            <div key={i}>
              <div className="font-medium mb-1">{cat.category}</div>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {cat.services.map((svc, j) => (
                  <li key={j}>{svc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Documents Section */}
      {documents && documents.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="font-semibold text-lg mb-4">Documents</div>
          <ul className="space-y-2">
            {documents.map((doc, i) => (
              <li key={i} className="flex items-center justify-between border-b last:border-0 pb-2">
                <div>
                  <span className="font-medium">{doc.title}</span>
                  <span className="ml-2 text-gray-400 text-xs">({doc.uploaded_at})</span>
                </div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">View</a>
              </li>
            ))}
          </ul>
          {documents.length > 5 && (
            <div className="mt-2 text-right">
              <a href="#" className="text-blue-600 underline text-sm">View All Documents</a>
            </div>
          )}
        </div>
      )}

      {/* 6. Edit Request Button (Optional) */}
      <div className="flex justify-center mt-8">
        <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-200 transition">Need to update your company profile? Submit an Edit Request</button>
      </div>
    </div>
  );
} 