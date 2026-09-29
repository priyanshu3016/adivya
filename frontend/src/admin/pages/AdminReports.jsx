import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  PieChart as PieIcon,
  TrendingUp,
  RefreshCw,
  Printer
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
  CartesianGrid,
  Legend,
  LineChart,
  Line
} from 'recharts';

export const AdminReports = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getApplications().then((data) => {
      setApplications(data);
      setLoading(false);
    });
  }, []);

  const total = applications.length;
  const verifiedCount = applications.filter((a) => a.verificationStatus === 'PASS').length;
  const deficientCount = applications.filter((a) => a.status === 'DEFICIENT').length;
  const selectedCount = applications.filter((a) => a.status === 'APPROVED' || a.screeningStatus === 'RECOMMENDED').length;

  const stateCounts = {};
  applications.forEach((a) => {
    if (a.state) {
      stateCounts[a.state] = (stateCounts[a.state] || 0) + 1;
    }
  });
  const stateData = Object.entries(stateCounts).map(([state, applications]) => ({ state, applications }));

  const defCounts = {};
  applications.forEach((a) => {
    (a.deficiencies || []).forEach((d) => {
      defCounts[d.documentType] = (defCounts[d.documentType] || 0) + 1;
    });
  });
  const colors = ['#014BAA', '#D97706', '#DC2626', '#4F46E5', '#16A34A'];
  const deficiencyCategoryData = Object.entries(defCounts).map(([name, count], i) => ({
    name,
    count,
    color: colors[i % colors.length]
  }));

  const turnaroundData = applications.length ? [
    { stage: 'Application Submission', avgDays: 0 },
    { stage: 'AI Document Extraction', avgDays: 0.5 },
    { stage: 'Officer Scrutiny', avgDays: 1.0 },
    { stage: 'Eligibility Endorsement', avgDays: 1.0 },
    { stage: 'Screening Committee', avgDays: 2.0 },
    { stage: 'Sanction & DBT Award', avgDays: 1.0 }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#014BAA] mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Ministry MIS Analytics & Compliance Intelligence</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Reports & Scheme Performance Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time statistical synthesis of fellowship intake, OCR turnaround, state distribution, and quota utilization.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => alert('Mock Export: Full Analytics MIS Report generated as MoTA_Scholarships_MIS_2026.csv')}
          >
            Export Report (CSV)
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Printer}
            onClick={() => alert('Mock Export: Executive PDF Summary prepared for Parliamentary Committee.')}
          >
            Generate Summary (PDF)
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Gross Applications</span>
          <p className="text-3xl font-black text-slate-900 mt-1">{total}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">100% Digital Capture</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Verified Pipeline</span>
          <p className="text-3xl font-black text-[#014BAA] mt-1">{verifiedCount}</p>
          <span className="text-[11px] text-slate-500">OCR & Officer validated</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Active Deficiencies</span>
          <p className="text-3xl font-black text-amber-700 mt-1">{deficientCount}</p>
          <span className="text-[11px] text-slate-500">Under resubmission</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Selected / Awarded</span>
          <p className="text-3xl font-black text-emerald-700 mt-1">{selectedCount}</p>
          <span className="text-[11px] text-emerald-700 font-semibold">Sanction Ready</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* State/UT Distribution */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DDD7] pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Geography</h3>
              <p className="text-sm font-bold text-slate-900">Applications by State / UT</p>
            </div>
            <span className="text-xs font-semibold text-[#014BAA]">Top ST Domiciles</span>
          </div>

          <div className="h-60">
            {stateData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <p className="text-xs font-semibold text-slate-600">No data available yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Analytics will appear once applications are submitted</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="state" type="category" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#014BAA" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Deficiency Categorization */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DDD7] pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Deficiency Audit</h3>
              <p className="text-sm font-bold text-slate-900">Breakdown of Certificate Deficiencies</p>
            </div>
            <span className="text-xs font-semibold text-amber-700">Flagged Reasons</span>
          </div>

          <div className="h-60">
            {deficiencyCategoryData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <p className="text-xs font-semibold text-slate-600">No data available yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Analytics will appear once applications are submitted</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deficiencyCategoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                  >
                    {deficiencyCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Turnaround Time Analysis */}
        <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DDD7] pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Service Level Agreement (SLA)</h3>
              <p className="text-sm font-bold text-slate-900">Average Turnaround Time per Processing Stage (Days)</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700">Benchmark: &lt; 15 Days Total</span>
          </div>

          <div className="h-56">
            {turnaroundData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <p className="text-xs font-semibold text-slate-600">No data available yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Analytics will appear once applications are submitted</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={turnaroundData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="avgDays" fill="#16A34A" radius={[4, 4, 0, 0]} name="Average Days Taken" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
