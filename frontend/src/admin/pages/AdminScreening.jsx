import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Award, CheckCircle2, XCircle, Clock, Filter, RefreshCw, ThumbsUp } from 'lucide-react';

export const AdminScreening = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterScheme, setFilterScheme] = useState('ALL');

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

  const handleScreeningVerdict = async (appId, verdict) => {
    try {
      await api.updateScreeningStatus(appId, verdict, `Screening Committee Verdict: ${verdict}`);
      alert(`Applicant ${appId} marked as ${verdict}`);
      await loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const eligiblePool = applications.filter((a) => {
    if (filterScheme !== 'ALL' && a.scheme !== filterScheme) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#014BAA]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-700 mb-1">
            <Award className="w-4 h-4" />
            <span>National Screening & Selection Board</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Fellowship Screening & Merit Committee
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review verified and eligible ST candidates for committee recommendation, quota slotting, and final sanction.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="cream" size="sm" onClick={loadData} icon={RefreshCw}>
            Refresh Pool
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DDD7] shadow-xs flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-700">Scheme Pool:</span>
          <button
            onClick={() => setFilterScheme('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterScheme === 'ALL' ? 'bg-[#014BAA] text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            All Candidates ({applications.length})
          </button>
          <button
            onClick={() => setFilterScheme('NFST')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterScheme === 'NFST' ? 'bg-[#014BAA] text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            NFST Domestic Ph.D. ({applications.filter((a) => a.scheme === 'NFST').length})
          </button>
          <button
            onClick={() => setFilterScheme('NOS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterScheme === 'NOS' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            NOS Overseas ({applications.filter((a) => a.scheme === 'NOS').length})
          </button>
        </div>

        <span className="text-slate-500 text-[11px]">
          Session: AY 2026-27 Selection Batch 1
        </span>
      </div>

      {/* Screening Candidates Table */}
      <div className="bg-white rounded-2xl border border-[#E8DDD7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F3F0] border-b border-[#E8DDD7] text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Applicant & ID</th>
                <th className="py-3 px-4">Scheme</th>
                <th className="py-3 px-4">Academic Merit</th>
                <th className="py-3 px-4">Host Institution / Rank</th>
                <th className="py-3 px-4">Statutory Eligibility</th>
                <th className="py-3 px-4">AI Verification</th>
                <th className="py-3 px-4">Screening Status</th>
                <th className="py-3 px-4 text-right">Committee Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DDD7]">
              {eligiblePool.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No eligible applicants available for screening.</p>
                    <p className="text-xs text-slate-400 mt-1">Candidates who pass verification and eligibility checks will be listed here.</p>
                  </td>
                </tr>
              ) : (
                eligiblePool.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{app.applicantName}</p>
                    <p className="text-[10px] text-slate-500 font-mono text-[#014BAA]">{app.id}</p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{app.scheme}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900">{app.qualifyingDegree}</p>
                    <p className="text-[10px] font-bold text-[#014BAA]">{app.qualifyingPercentage}% score</p>
                  </td>
                  <td className="py-3.5 px-4 max-w-[200px] truncate">
                    <p className="text-slate-800 font-medium truncate">{app.institution}</p>
                    <p className="text-[10px] text-slate-400">
                      {app.scheme === 'NOS' ? `QS Rank #${app.qsRank || '-'}` : `NIRF Rank #${app.nirfRank || '-'}`}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={app.eligibilityStatus === 'ELIGIBLE' ? 'eligible' : 'review'}>
                      {app.eligibilityStatus}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={app.verificationStatus === 'PASS' ? 'verified' : 'review'}>
                      {app.verificationStatus}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        app.screeningStatus === 'RECOMMENDED'
                          ? 'approved'
                          : app.screeningStatus === 'NOT_RECOMMENDED'
                          ? 'danger'
                          : 'review'
                      }
                    >
                      {app.screeningStatus}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => handleScreeningVerdict(app.id, 'RECOMMENDED')}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition shadow-2xs"
                        title="Recommend for Selection"
                      >
                        Recommend
                      </button>
                      <button
                        onClick={() => handleScreeningVerdict(app.id, 'NOT_RECOMMENDED')}
                        className="px-2.5 py-1 rounded bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 font-semibold text-[11px] transition"
                        title="Do Not Recommend"
                      >
                        Defer
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
