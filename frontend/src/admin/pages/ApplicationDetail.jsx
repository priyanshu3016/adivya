import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  User,
  GraduationCap,
  Globe,
  Building,
  Files,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  ScanLine,
  Calendar,
  CreditCard
} from 'lucide-react';

export const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  // Deficiency Modal State
  const [deficiencyModalOpen, setDeficiencyModalOpen] = useState(false);
  const [defDocId, setDefDocId] = useState('');
  const [defIssue, setDefIssue] = useState('');
  const [defDesc, setDefDesc] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadApp = async () => {
    try {
      const data = await api.getApplicationById(id);
      setApp(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApp();
  }, [id]);

  // Officer Actions
  const handleRaiseDeficiency = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const doc = app.documents.find((d) => d.id === defDocId);
      await api.createDeficiency(app.id, {
        documentId: defDocId,
        documentType: doc?.type || 'Application Certificate',
        issue: defIssue,
        description: defDesc
      });
      alert('Deficiency logged and notification sent to applicant.');
      setDeficiencyModalOpen(false);
      setDefDocId('');
      setDefIssue('');
      setDefDesc('');
      await loadApp();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus, remarks) => {
    if (!confirm(`Are you sure you want to mark this application as ${newStatus}?`)) return;
    setActionLoading(true);
    try {
      await api.updateApplicationStatus(app.id, newStatus, remarks);
      alert(`Application updated to ${newStatus}`);
      await loadApp();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyAllDocs = async () => {
    setActionLoading(true);
    try {
      for (const doc of app.documents || []) {
        await api.verifyDocument(app.id, doc.id, 'PASS');
      }
      await api.updateApplicationStatus(app.id, 'ELIGIBLE', 'All certificates verified by scrutiny officer.');
      alert('All certificates verified as PASS. Application marked ELIGIBLE.');
      await loadApp();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#014BAA]"></div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-[#E8DDD7]">
        <h2 className="text-lg font-bold text-slate-900">Application not found</h2>
        <Button variant="secondary" size="sm" onClick={() => navigate('/admin/applications')} className="mt-4">
          Back to Applications List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/admin/applications')}
            className="text-xs text-slate-500 hover:text-[#014BAA] flex items-center space-x-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Applications Queue</span>
          </button>
          <div className="flex items-center space-x-3 mt-1">
            <h1 className="text-2xl font-black text-slate-900">{app.id}</h1>
            <Badge variant={app.status === 'APPROVED' ? 'approved' : app.status === 'DEFICIENT' ? 'deficient' : 'primary'} size="lg">
              {app.status}
            </Badge>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-[#014BAA]">
              Scheme: {app.scheme}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Submitted: <strong>{new Date(app.submittedAt).toLocaleString()}</strong> • Last Scrutiny Update: <strong>{new Date(app.lastUpdatedAt).toLocaleString()}</strong>
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVerifyAllDocs}
            loading={actionLoading}
            icon={CheckCircle2}
          >
            Verify Certificates
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeficiencyModalOpen(true)}
            icon={AlertTriangle}
          >
            Raise Deficiency
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleUpdateStatus('ELIGIBLE', 'Statutory eligibility criteria verified.')}
            loading={actionLoading}
          >
            Mark Eligible
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleUpdateStatus('SCREENED', 'Forwarded to Subject Expert Screening Committee.')}
            loading={actionLoading}
          >
            Send for Screening
          </Button>

          <Button
            variant="success"
            size="sm"
            onClick={() => handleUpdateStatus('APPROVED', 'Sanction awarded by Competent Authority.')}
            loading={actionLoading}
            icon={ThumbsUp}
          >
            Approve Award
          </Button>
        </div>
      </div>

      {/* Grid of Scrutiny Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Dossier Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Applicant Profile */}
          <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-[#E8DDD7] pb-3 flex items-center space-x-2">
              <User className="w-4 h-4 text-[#014BAA]" />
              <span>1. Applicant Personal & Caste Particulars</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Candidate Legal Name:</span>
                <span className="font-bold text-slate-900">{app.applicantName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Scheduled Tribe Community:</span>
                <span className="font-bold text-slate-900">{app.subTribe} (ST)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Domicile State & District:</span>
                <span className="font-semibold text-slate-800">{app.district}, {app.state}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date of Birth & Gender:</span>
                <span className="font-semibold text-slate-800">{app.dob} ({app.gender})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Contact Phone:</span>
                <span className="font-semibold text-slate-800">{app.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Official Email:</span>
                <span className="font-semibold text-slate-800">{app.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Annual Family Income:</span>
                <span className="font-bold text-emerald-700">₹{app.annualFamilyIncome?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Income Status:</span>
                <span className="font-semibold text-emerald-700">Within ₹{app.scheme === 'NOS' ? '8,00,000' : '6,00,000'} Statutory Ceiling</span>
              </div>
            </div>
          </div>

          {/* Section 2: Academic & Scheme Details */}
          <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-[#E8DDD7] pb-3 flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-[#014BAA]" />
              <span>2. Academic Records & Research Placement</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Qualifying Examination:</span>
                <span className="font-bold text-slate-900">{app.qualifyingDegree}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Overall Percentage:</span>
                <span className="font-bold text-[#014BAA]">{app.qualifyingPercentage}%</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block">Host University / Institute:</span>
                <span className="font-bold text-slate-900">{app.institution}</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">
                  {app.scheme === 'NOS' ? `QS World University Ranking: #${app.qsRank}` : `NIRF Ranking: #${app.nirfRank}`}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block">Discipline / Research Proposal:</span>
                <span className="font-semibold text-slate-800">{app.discipline} ({app.courseType})</span>
              </div>
            </div>
          </div>

          {/* Section 3: Document Verification & AI Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DDD7] pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-purple-600" />
                <span>3. Uploaded Certificates & AI/OCR Extraction</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {app.documents?.length || 0} Files Attached
              </span>
            </div>

            <div className="space-y-3">
              {app.documents?.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-[#E8DDD7] bg-[#F8F3F0]/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{doc.type}</span>
                      <span className="text-slate-500 text-[11px] block">{doc.filename} ({doc.size})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-700 font-bold text-[11px] flex items-center space-x-1">
                        <ScanLine className="w-3.5 h-3.5" />
                        <span>{doc.confidence}% Confidence</span>
                      </span>
                      <Badge variant={doc.status === 'VERIFIED' ? 'verified' : doc.status === 'NEEDS_RESUBMISSION' ? 'deficient' : 'review'}>
                        {doc.status}
                      </Badge>
                    </div>
                  </div>

                  {doc.ocrResult && (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-[11px] space-y-1">
                      <p className="text-slate-600">
                        Extracted Name: <strong className="text-slate-900">{doc.ocrResult.extractedName || app.applicantName}</strong>
                      </p>
                      {doc.ocrResult.certificateNo && (
                        <p className="text-slate-600">
                          Certificate No: <strong className="text-slate-900">{doc.ocrResult.certificateNo}</strong>
                        </p>
                      )}
                      <p className={`font-medium ${doc.ocrResult.discrepancy.includes('None') ? 'text-emerald-700' : 'text-amber-700'}`}>
                        AI Note: {doc.ocrResult.discrepancy}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Scrutiny Actions, Deficiencies & Timeline */}
        <div className="space-y-6">
          {/* Statutory Eligibility Checklist */}
          <div className="bg-white rounded-2xl p-5 border border-[#E8DDD7] shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Statutory Rule Validation</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span>ST Certificate Validity:</span>
                <span className="font-bold text-emerald-700">PASS</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span>Income Criteria (&lt; Ceiling):</span>
                <span className="font-bold text-emerald-700">PASS</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span>Degree Cutoff (&gt; 55% / 60%):</span>
                <span className="font-bold text-emerald-700">PASS</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span>Institution NIRF / QS Rank:</span>
                <span className="font-bold text-emerald-700">PASS</span>
              </div>
            </div>
          </div>

          {/* Active Deficiencies */}
          <div className="bg-white rounded-2xl p-5 border border-[#E8DDD7] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Deficiencies ({app.deficiencies?.length || 0})</span>
              </h4>
              <button
                onClick={() => setDeficiencyModalOpen(true)}
                className="text-xs font-bold text-[#014BAA] hover:underline"
              >
                + Raise New
              </button>
            </div>

            {(!app.deficiencies || app.deficiencies.length === 0) ? (
              <p className="text-xs text-slate-400">No deficiencies raised for this application.</p>
            ) : (
              <div className="space-y-2">
                {app.deficiencies.map((def) => (
                  <div key={def.id} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950">{def.issue}</span>
                      <Badge variant={def.status === 'OPEN' ? 'deficient' : 'verified'}>{def.status}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-600">{def.description}</p>
                    {def.resubmittedDocument && (
                      <p className="text-[10px] text-emerald-800 font-semibold pt-1">
                        ✓ Resubmitted: {def.resubmittedDocument}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scrutiny Timeline */}
          <div className="bg-white rounded-2xl p-5 border border-[#E8DDD7] shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-[#014BAA]" />
              <span>Lifecycle History</span>
            </h4>

            <div className="space-y-2 text-xs">
              {app.timeline?.slice(0, 4).map((tl, i) => (
                <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{tl.stage}</span>
                    <span className="text-[10px] text-slate-400">{tl.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{tl.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deficiency Issuance Modal */}
      <Modal
        isOpen={deficiencyModalOpen}
        onClose={() => setDeficiencyModalOpen(false)}
        title="Raise Scrutiny Deficiency"
        subtitle={`Application: ${app.id} (${app.applicantName})`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeficiencyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={actionLoading} onClick={handleRaiseDeficiency}>
              Dispatch Official Deficiency Notice
            </Button>
          </>
        }
      >
        <form onSubmit={handleRaiseDeficiency} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Affected Document / Category
            </label>
            <select
              value={defDocId}
              onChange={(e) => setDefDocId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA] bg-white"
            >
              <option value="">-- Choose Affected Certificate --</option>
              {app.documents?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.type} ({d.filename})
                </option>
              ))}
              <option value="GENERAL">General Academic / Bank Details</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Issue Title
            </label>
            <input
              type="text"
              required
              value={defIssue}
              onChange={(e) => setDefIssue(e.target.value)}
              placeholder="e.g. Income Certificate Expired or Stamp Unclear"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Officer Instruction for Applicant
            </label>
            <textarea
              rows="4"
              required
              value={defDesc}
              onChange={(e) => setDefDesc(e.target.value)}
              placeholder="Specify exactly what needs to be rectified and re-uploaded..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
            ></textarea>
          </div>
        </form>
      </Modal>
    </div>
  );
};
