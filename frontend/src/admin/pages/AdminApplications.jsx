import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Download,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filters state
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [schemeFilter, setSchemeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [verifFilter, setVerifFilter] = useState('ALL');
  const [eligFilter, setEligFilter] = useState('ALL');

  const loadData = async () => {
    try {
      const data = await api.getApplications();
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = applications.filter((app) => {
    if (schemeFilter !== 'ALL' && app.scheme !== schemeFilter) return false;
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (verifFilter !== 'ALL' && app.verificationStatus !== verifFilter) return false;
    if (eligFilter !== 'ALL' && app.eligibilityStatus !== eligFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = app.id.toLowerCase().includes(q);
      const matchName = app.applicantName.toLowerCase().includes(q);
      const matchInst = (app.institution || '').toLowerCase().includes(q);
      const matchState = (app.state || '').toLowerCase().includes(q);
      if (!matchId && !matchName && !matchInst && !matchState) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Administrative Scrutiny Queue
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">
            Application Dossier Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Displaying {filtered.length} of {applications.length} submitted fellowship and scholarship applications.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="cream" size="sm" onClick={loadData} icon={RefreshCw}>
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => alert('Mock Export: Applications list exported to applications_report_2026.csv')}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8DDD7] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Query */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Name, ID, State..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
            />
          </div>

          {/* Scheme Filter */}
          <div>
            <select
              value={schemeFilter}
              onChange={(e) => setSchemeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA] bg-white"
            >
              <option value="ALL">All Schemes (NFST & NOS)</option>
              <option value="NFST">NFST (National Fellowship)</option>
              <option value="NOS">NOS (National Overseas)</option>
            </select>
          </div>

          {/* Application Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA] bg-white"
            >
              <option value="ALL">All Application Statuses</option>
              <option value="UNDER_VERIFICATION">Under Verification</option>
              <option value="DEFICIENT">Deficient / Action Required</option>
              <option value="ELIGIBLE">Eligible</option>
              <option value="SCREENED">Screened</option>
              <option value="APPROVED">Approved</option>
            </select>
          </div>

          {/* Verification Filter */}
          <div>
            <select
              value={verifFilter}
              onChange={(e) => setVerifFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA] bg-white"
            >
              <option value="ALL">All AI/Doc Verifications</option>
              <option value="PASS">Pass (Verified)</option>
              <option value="REVIEW">Review / In Progress</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Eligibility Filter */}
          <div>
            <select
              value={eligFilter}
              onChange={(e) => setEligFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA] bg-white"
            >
              <option value="ALL">All Eligibility Criteria</option>
              <option value="ELIGIBLE">Eligible</option>
              <option value="PENDING">Pending Check</option>
              <option value="REVIEW_REQUIRED">Review Required</option>
            </select>
          </div>
        </div>

        {(search || schemeFilter !== 'ALL' || statusFilter !== 'ALL' || verifFilter !== 'ALL' || eligFilter !== 'ALL') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Active filters applied</span>
            <button
              onClick={() => {
                setSearch('');
                setSchemeFilter('ALL');
                setStatusFilter('ALL');
                setVerifFilter('ALL');
                setEligFilter('ALL');
              }}
              className="text-[#014BAA] font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-[#E8DDD7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F3F0] border-b border-[#E8DDD7] text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Application ID</th>
                <th className="py-3.5 px-4">Applicant & Community</th>
                <th className="py-3.5 px-4">Scheme</th>
                <th className="py-3.5 px-4">Institution / Rank</th>
                <th className="py-3.5 px-4">Submission Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">AI Verification</th>
                <th className="py-3.5 px-4">Eligibility</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DDD7]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-500">
                    <p className="text-sm font-semibold text-slate-700">No applications found</p>
                    <p className="text-xs text-slate-400 mt-1">Applications submitted through the Applicant Portal will appear here.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/admin/applications/${app.id}`)}
                    className="hover:bg-blue-50/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-bold text-[#014BAA]">{app.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{app.applicantName}</p>
                      <p className="text-[10px] text-slate-500">{app.subTribe} (ST) • {app.district}, {app.state}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{app.scheme}</span>
                    </td>
                    <td className="py-3 px-4 max-w-[200px] truncate">
                      <p className="text-slate-800 truncate">{app.institution}</p>
                      <p className="text-[10px] text-slate-500">
                        {app.scheme === 'NOS' ? `QS Rank #${app.qsRank || '-'}` : `NIRF Rank #${app.nirfRank || '-'}`}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={app.status === 'APPROVED' ? 'approved' : app.status === 'DEFICIENT' ? 'deficient' : 'primary'}>
                        {app.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={app.verificationStatus === 'PASS' ? 'verified' : app.verificationStatus === 'FAILED' ? 'danger' : 'review'}>
                        {app.verificationStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={app.eligibilityStatus === 'ELIGIBLE' ? 'eligible' : app.eligibilityStatus === 'INELIGIBLE' ? 'danger' : 'review'}>
                        {app.eligibilityStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[#014BAA] font-semibold hover:underline">
                        Open Dossier →
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
