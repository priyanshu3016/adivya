import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  Clock,
  FileText,
  ShieldAlert,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const ApplicantDeficiencies = () => {
  const { currentUser } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDeficiency, setActiveDeficiency] = useState(null);
  const [resubmitFilename, setResubmitFilename] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const app = await api.getActiveApplicantApplication(currentUser?.id);
      setApplication(app);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleResubmit = async (e) => {
    e.preventDefault();
    if (!activeDeficiency) return;
    setSubmitting(true);
    try {
      await api.resolveDeficiency(application.id, activeDeficiency.id, {
        filename: resubmitFilename || 'corrected_document_stamp.pdf',
        remarks: remarks || 'Uploaded verified and stamped copy as requested.'
      });
      alert('Deficiency resubmitted successfully! The Ministry Scrutiny Officer has been notified.');
      setActiveDeficiency(null);
      setResubmitFilename('');
      setRemarks('');
      await loadData();
    } catch (err) {
      alert('Resubmission failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#014BAA]"></div>
      </div>
    );
  }

  const deficiencies = application?.deficiencies || [];
  const openDeficiencies = deficiencies.filter((d) => d.status === 'OPEN');
  const resolvedDeficiencies = deficiencies.filter((d) => d.status !== 'OPEN');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Deficiency & Resubmission Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Application Deficiencies
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Application ID: <strong className="text-slate-800">{application?.id || '—'}</strong> • Rectify issues raised during administrative scrutiny.
          </p>
        </div>

        <Button variant="cream" size="sm" onClick={loadData} icon={RefreshCw}>
          Refresh Status
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Open Actions</span>
          <p className="text-2xl font-black text-amber-900 mt-1">{openDeficiencies.length}</p>
          <span className="text-xs text-slate-500">Requires applicant resubmission</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Resubmitted / Resolved</span>
          <p className="text-2xl font-black text-emerald-900 mt-1">{resolvedDeficiencies.length}</p>
          <span className="text-xs text-slate-500">Under officer review</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DDD7] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Application State</span>
          <p className="text-base font-bold text-slate-900 mt-2">
            <Badge variant={application?.status === 'DEFICIENT' ? 'deficient' : 'verified'}>
              {application?.status || 'NONE'}
            </Badge>
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Live ministry synchronised</span>
        </div>
      </div>

      {/* Open Deficiencies List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Pending Deficiencies Requiring Action ({openDeficiencies.length})</span>
        </h2>

        {openDeficiencies.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No active deficiencies</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No deficiencies have been reported for your application.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {openDeficiencies.map((def) => (
              <div
                key={def.id}
                className="bg-white rounded-2xl p-6 border-2 border-amber-300 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-amber-100 gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-amber-700 uppercase">
                      Deficiency ID: {def.id} • {def.documentType}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{def.issue}</h3>
                  </div>
                  <Badge variant="deficient">Action Required</Badge>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <span className="font-bold block">Officer Remarks & Instructions:</span>
                  <p className="leading-relaxed text-[11px] text-slate-700">{def.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">
                    Raised on: {new Date(def.createdAt).toLocaleDateString()}
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={UploadCloud}
                    onClick={() => {
                      setActiveDeficiency(def);
                      setResubmitFilename('');
                      setRemarks('');
                    }}
                  >
                    Upload Replacement & Resubmit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Deficiencies History */}
      {resolvedDeficiencies.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#E8DDD7]">
          <h2 className="text-sm font-bold text-slate-900">
            Resubmission History ({resolvedDeficiencies.length})
          </h2>

          <div className="space-y-3">
            {resolvedDeficiencies.map((def) => (
              <div
                key={def.id}
                className="bg-white rounded-xl p-4 border border-[#E8DDD7] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800">{def.issue}</span>
                    <Badge variant="verified">{def.status}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Replacement: <strong className="text-slate-700">{def.resubmittedDocument}</strong> • Resubmitted on: {def.resubmittedAt ? new Date(def.resubmittedAt).toLocaleString() : 'Recent'}
                  </p>
                  {def.applicantResponse && (
                    <p className="text-[11px] text-slate-600 mt-0.5 italic">
                      Applicant Note: "{def.applicantResponse}"
                    </p>
                  )}
                </div>

                <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Forwarded for Verification</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resubmission Modal */}
      <Modal
        isOpen={!!activeDeficiency}
        onClose={() => setActiveDeficiency(null)}
        title={`Resubmit: ${activeDeficiency?.documentType}`}
        subtitle={`Deficiency: ${activeDeficiency?.issue}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setActiveDeficiency(null)}>
              Cancel
            </Button>
            <Button variant="primary" loading={submitting} onClick={handleResubmit}>
              Confirm & Resubmit to Ministry
            </Button>
          </>
        }
      >
        <form onSubmit={handleResubmit} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
            <strong className="block">Officer Instruction:</strong>
            <p className="text-[11px] text-slate-700">{activeDeficiency?.description}</p>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50">
            <UploadCloud className="w-8 h-8 text-[#014BAA] mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">
              Select Corrected / Stamped Certificate
            </p>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setResubmitFilename(e.target.files[0].name);
                }
              }}
              className="mt-2 text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:bg-blue-50 file:text-[#014BAA]"
            />
          </div>

          {resubmitFilename && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex justify-between">
              <span>Attached: <strong>{resubmitFilename}</strong></span>
              <span className="text-emerald-700 font-bold">Valid Scan</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Applicant Clarification / Remarks to Scrutiny Officer
            </label>
            <textarea
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Attached clean scanned copy showing the official branch manager stamp and visible IFSC code."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA] focus:outline-none"
            ></textarea>
          </div>
        </form>
      </Modal>
    </div>
  );
};
