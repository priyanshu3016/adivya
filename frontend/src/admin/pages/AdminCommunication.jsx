import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  MessageSquare,
  AlertTriangle,
  Send,
  CheckCircle2,
  Clock,
  User,
  RefreshCw,
  FileText
} from 'lucide-react';

export const AdminCommunication = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(false);

  // New Notice form
  const [targetAppId, setTargetAppId] = useState('');
  const [docCategory, setDocCategory] = useState('Income Certificate');
  const [issueTitle, setIssueTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const data = await api.getApplications();
      setApplications(data);
      if (data.length > 0 && !targetAppId) {
        setTargetAppId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendDeficiencyNotice = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createDeficiency(targetAppId, {
        documentType: docCategory,
        issue: issueTitle,
        description: instructions
      });
      alert(`Official Deficiency Notice dispatched to applicant ${targetAppId}!`);
      setActiveModal(false);
      setIssueTitle('');
      setInstructions('');
      await loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Flatten all deficiencies across all applications
  const allDeficiencies = [];
  applications.forEach((app) => {
    (app.deficiencies || []).forEach((def) => {
      allDeficiencies.push({
        ...def,
        applicantId: app.id,
        applicantName: app.applicantName,
        scheme: app.scheme
      });
    });
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
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Two-Way Applicant Communication & Deficiency Center</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Deficiency Notices & Communications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Issue formal clarification notices, monitor document resubmissions, and resolve pending applicant queries.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="primary" size="sm" onClick={() => setActiveModal(true)} icon={Send}>
            Dispatch Deficiency Notice
          </Button>
          <Button variant="cream" size="sm" onClick={loadData} icon={RefreshCw}>
            Sync
          </Button>
        </div>
      </div>

      {/* Deficiencies Central Table */}
      <div className="bg-white rounded-2xl border border-[#E8DDD7] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E8DDD7] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active & Resubmitted Deficiency Log ({allDeficiencies.length})
            </h3>
            <p className="text-xs text-slate-500">Live communication trail between Ministry officers and ST applicants.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F3F0] border-b border-[#E8DDD7] text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Applicant & ID</th>
                <th className="py-3 px-4">Scheme</th>
                <th className="py-3 px-4">Affected Document</th>
                <th className="py-3 px-4">Deficiency Issue</th>
                <th className="py-3 px-4">Date Issued</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Resubmitted File</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DDD7]">
              {allDeficiencies.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No active deficiencies</p>
                    <p className="text-xs text-slate-400 mt-1">No applicant communication records available.</p>
                  </td>
                </tr>
              ) : (
                allDeficiencies.map((def) => (
                  <tr key={def.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{def.applicantName}</p>
                      <p className="text-[10px] text-slate-500 font-mono text-[#014BAA]">{def.applicantId}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{def.scheme}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{def.documentType}</td>
                    <td className="py-3 px-4 max-w-[220px]">
                      <p className="font-bold text-slate-900">{def.issue}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-2">{def.description}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(def.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={def.status === 'OPEN' ? 'deficient' : 'verified'}>
                        {def.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {def.resubmittedDocument ? (
                        <div>
                          <span className="text-emerald-700 font-bold block">{def.resubmittedDocument}</span>
                          <span className="text-[10px] text-slate-400">Ready for review</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Awaiting candidate upload</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {def.status === 'RESUBMITTED' ? (
                        <button
                          onClick={async () => {
                            await api.updateApplicationStatus(def.applicantId, 'UNDER_VERIFICATION', 'Resubmitted file accepted for verification.');
                            alert('Deficiency marked as accepted. Application returned to Verification queue.');
                            await loadData();
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition shadow-2xs"
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <span className="text-amber-700 font-medium text-[11px]">Pending Reply</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Deficiency Modal */}
      <Modal
        isOpen={activeModal}
        onClose={() => setActiveModal(false)}
        title="Dispatch Official Deficiency Notice"
        subtitle="The applicant will receive an immediate SMS/Email alert and can upload the requested document."
        footer={
          <>
            <Button variant="secondary" onClick={() => setActiveModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleSendDeficiencyNotice}>
              Send Notice
            </Button>
          </>
        }
      >
        <form onSubmit={handleSendDeficiencyNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Candidate Application
            </label>
            <select
              value={targetAppId}
              onChange={(e) => setTargetAppId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA] bg-white font-medium"
            >
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} - {a.applicantName} ({a.scheme})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Certificate / Information in Deficiency
            </label>
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA] bg-white"
            >
              <option value="Income Certificate">Family Income Certificate</option>
              <option value="Bank Passbook / Statement">Bank Passbook / Statement (Aadhaar Seeded)</option>
              <option value="ST Certificate">Scheduled Tribe Community Certificate</option>
              <option value="Academic Transcripts">Degree Transcript / Marksheet</option>
              <option value="Admission Letter">University Admission / Offer Letter</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deficiency Summary Title
            </label>
            <input
              type="text"
              required
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              placeholder="e.g. Please upload a clearer copy of the income certificate."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Formal Scrutiny Instructions to Candidate
            </label>
            <textarea
              rows="4"
              required
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="State the exact deficiency observed (e.g. invalid financial year, missing branch seal, illegible text)..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
            ></textarea>
          </div>
        </form>
      </Modal>
    </div>
  );
};
