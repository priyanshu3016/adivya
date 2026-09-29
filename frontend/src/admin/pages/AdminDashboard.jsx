import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  FileText,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Award,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';

export const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#014BAA]"></div>
      </div>
    );
  }

  // Calculate Metrics
  const totalApps = applications.length;
  const underVerification = applications.filter((a) => a.status === 'UNDER_VERIFICATION' || a.verificationStatus === 'REVIEW').length;
  const eligibleCount = applications.filter((a) => a.eligibilityStatus === 'ELIGIBLE' || a.status === 'ELIGIBLE').length;
  const deficientCount = applications.filter((a) => a.status === 'DEFICIENT' || (a.deficiencies && a.deficiencies.some(d => d.status === 'OPEN'))).length;
  const selectedCount = applications.filter((a) => a.status === 'APPROVED' || a.screeningStatus === 'RECOMMENDED').length;
  const pendingReview = applications.filter((a) => a.status !== 'APPROVED' && a.status !== 'REJECTED').length;

  // Chart Data: Schemes
  const schemeData = [
    { name: 'NFST (Domestic Ph.D.)', value: applications.filter((a) => a.scheme === 'NFST').length, color: '#014BAA' },
    { name: 'NOS (Overseas)', value: applications.filter((a) => a.scheme === 'NOS').length, color: '#D97706' }
  ];

  // Chart Data: Status
  const statusData = [
    { stage: 'Verification', count: underVerification, fill: '#014BAA' },
    { stage: 'Deficient', count: deficientCount, fill: '#DC2626' },
    { stage: 'Eligible', count: eligibleCount, fill: '#16A34A' },
    { stage: 'Screened', count: selectedCount, fill: '#4F46E5' }
  ];

  // Chart Data: Monthly Trends
  const monthlyData = applications.length ? [
    { month: 'Current Cycle', NFST: applications.filter((a) => a.scheme === 'NFST').length, NOS: applications.filter((a) => a.scheme === 'NOS').length }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Adivya • Scrutiny & Administration Overview
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">
            Scholarship & Fellowship Master Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time pipeline monitoring, AI/OCR extraction status, and screening progression.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="cream" size="sm" onClick={loadData} icon={RefreshCw}>
            Sync Records
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/applications')}
            icon={Filter}
          >
            Review Queue
          </Button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-stretch">
        <StatCard
          title="Total Submissions"
          value={totalApps}
          variant="blue"
          icon={FileText}
          onClick={() => navigate('/admin/applications')}
        />
        <StatCard
          title="Under Verification"
          value={underVerification}
          variant="blue"
          icon={ScanLine}
          onClick={() => navigate('/admin/verification')}
        />
        <StatCard
          title="Statutory Eligible"
          value={eligibleCount}
          variant="green"
          icon={CheckCircle2}
          onClick={() => navigate('/admin/eligibility')}
        />
        <StatCard
          title="Actionable Deficient"
          value={deficientCount}
          variant="red"
          icon={AlertTriangle}
          onClick={() => navigate('/admin/applications?status=DEFICIENT')}
        />
        <StatCard
          title="Screened / Selected"
          value={selectedCount}
          variant="purple"
          icon={Award}
          onClick={() => navigate('/admin/screening')}
        />
        <StatCard
          title="Pending Review"
          value={pendingReview}
          variant="amber"
          icon={Clock}
          onClick={() => navigate('/admin/applications')}
        />
      </div>

      {/* Visual Analytics Charts Grid - 3 Equal Height Compact Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* Chart 1: Applications by Scheme */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8DDD7] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#E8DDD7] pb-2.5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Distribution</h3>
              <p className="text-sm font-bold text-slate-900">Applications by Scheme</p>
            </div>
            <span className="text-[11px] font-semibold text-[#014BAA]">NFST vs NOS</span>
          </div>

          <div className="h-36 flex items-center justify-center mt-2">
            {applications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-2">
                <p className="text-xs font-semibold text-slate-600">No data available yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Analytics will appear once applications are submitted</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={schemeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={56}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {schemeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Pipeline Stage Progression */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8DDD7] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#E8DDD7] pb-2.5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Processing</h3>
              <p className="text-sm font-bold text-slate-900">Applications by Stage</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">Live Stage Count</span>
          </div>

          <div className="h-36 flex items-center justify-center mt-2">
            {applications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-2">
                <p className="text-xs font-semibold text-slate-600">No data available yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Analytics will appear once applications are submitted</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Monthly Applications Inflow */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8DDD7] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#E8DDD7] pb-2.5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Inflow Trend</h3>
              <p className="text-sm font-bold text-slate-900">Monthly Submissions</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600">2026 Cycle</span>
          </div>

          <div className="h-36 flex items-center justify-center mt-2">
            {applications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-2">
                <p className="text-xs font-semibold text-slate-600">No data available yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Analytics will appear once applications are submitted</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="NFST" stroke="#014BAA" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="NOS" stroke="#D97706" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-2xl border border-[#E8DDD7] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E8DDD7] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Applications for Scrutiny</h3>
            <p className="text-xs text-slate-500">Click any application row to view full 360-degree dossier & AI check.</p>
          </div>

          <Link
            to="/admin/applications"
            className="text-xs font-bold text-[#014BAA] hover:underline flex items-center space-x-1"
          >
            <span>View All Applications</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F3F0] border-b border-[#E8DDD7] text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Applicant Name</th>
                <th className="py-3 px-4">Scheme</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DDD7]">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No applications found</p>
                    <p className="text-xs text-slate-400 mt-1">Applications submitted through the Applicant Portal will appear here.</p>
                  </td>
                </tr>
              ) : (
                applications.slice(0, 5).map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/admin/applications/${app.id}`)}
                    className="hover:bg-blue-50/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-bold text-[#014BAA]">{app.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{app.applicantName}</p>
                      <p className="text-[10px] text-slate-500">{app.subTribe} (ST) • {app.state}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">{app.scheme}</span>
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
                    <td className="py-3 px-4 text-right">
                      <span className="text-[#014BAA] font-semibold hover:underline">
                        Scrutinize →
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
