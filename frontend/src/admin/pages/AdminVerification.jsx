import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  ShieldCheck,
  Eye,
  RefreshCw,
  Cpu,
  UserCheck
} from 'lucide-react';

export const AdminVerification = () => {
  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [loading, setLoading] = useState(true);
  const [decisionLoading, setDecisionLoading] = useState(false);

  const loadData = async () => {
    try {
      const data = await api.getApplications();
      setApplications(data);
      if (data.length > 0 && !selectedAppId) {
        setSelectedAppId(data[0].id);
        if (data[0].documents?.length > 0) {
          setSelectedDocId(data[0].documents[0].id);
        }
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

  const activeApp = applications.find((a) => a.id === selectedAppId) || applications[0];
  const activeDoc = activeApp?.documents?.find((d) => d.id === selectedDocId) || activeApp?.documents?.[0];

  const handleOfficerDecision = async (decision) => {
    if (!activeApp || !activeDoc) return;
    setDecisionLoading(true);
    try {
      await api.verifyDocument(activeApp.id, activeDoc.id, decision);
      alert(`Officer Decision "${decision}" recorded for ${activeDoc.type}.`);
      await loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setDecisionLoading(false);
    }
  };

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
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-700 mb-1">
            <Cpu className="w-4 h-4" />
            <span>Automated OCR Extraction & Human Scrutiny Console</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            AI / OCR Document Verification Workstation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review machine extractions, confidence indicators, and execute authoritative officer verification overrides.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="cream" size="sm" onClick={loadData} icon={RefreshCw}>
            Refresh Files
          </Button>
        </div>
      </div>

      {/* Selector Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8DDD7] shadow-xs flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-700">Select Application:</span>
          <select
            disabled={applications.length === 0}
            value={selectedAppId}
            onChange={(e) => {
              setSelectedAppId(e.target.value);
              const target = applications.find((a) => a.id === e.target.value);
              if (target?.documents?.length > 0) {
                setSelectedDocId(target.documents[0].id);
              }
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-[#014BAA] bg-slate-50 disabled:opacity-60"
          >
            {applications.length === 0 ? (
              <option value="">No applications available</option>
            ) : (
              applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} - {a.applicantName} ({a.scheme})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-700">Select Certificate:</span>
          <select
            disabled={!activeApp?.documents?.length}
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-800 bg-slate-50 disabled:opacity-60"
          >
            {!activeApp?.documents?.length ? (
              <option value="">No certificates available</option>
            ) : (
              activeApp.documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.type} ({d.confidence}% Confidence)
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {!activeApp || !activeDoc ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E8DDD7] space-y-3">
          <ScanLine className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No document selected</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Select an application to begin AI-assisted verification.
          </p>
        </div>
      ) : (
        /* Main Verification Split Screen */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Document Preview Placeholder */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DDD7] pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-[#014BAA]" />
                <span>Document Optical Scan Preview</span>
              </span>
              <span className="text-[11px] text-slate-500">{activeDoc?.size || '1.2 MB'}</span>
            </div>

            {/* Document Mock Preview Canvas */}
            <div className="relative border-2 border-slate-200 rounded-xl bg-slate-100 p-6 min-h-[360px] flex flex-col justify-between overflow-hidden shadow-inner">
              <div className="border border-slate-300 rounded p-4 bg-white/90 space-y-3">
                <div className="text-center border-b border-slate-200 pb-2">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Authorized State / Revenue Authority</p>
                  <p className="text-xs font-bold text-slate-900">{activeDoc?.type?.toUpperCase()}</p>
                </div>
                <div className="space-y-1 text-[11px] text-slate-700">
                  <p>Certificate Holder: <strong className="text-slate-900">{activeApp?.applicantName}</strong></p>
                  <p>Tribe / Category: <strong>{activeApp?.subTribe} (Scheduled Tribe)</strong></p>
                  <p>Authority: <strong>Sub-Divisional Revenue Officer</strong></p>
                  <p>Document Ref: <strong>ST/2021/8849/GOI</strong></p>
                </div>
                <div className="pt-4 flex justify-between items-center text-[10px] text-slate-400">
                  <span>[Digital Hologram Verified]</span>
                  <div className="w-12 h-12 rounded-full border border-slate-300 flex items-center justify-center text-[8px] text-slate-500 uppercase font-bold text-center">
                    Official Stamp
                  </div>
                </div>
              </div>

              {/* OCR Scanning Line Animation */}
              <div className="absolute inset-x-0 top-0 h-1 bg-[#014BAA]/40 animate-pulse"></div>

              <div className="text-center text-[11px] text-slate-500 pt-2">
                Filename: <strong>{activeDoc?.filename}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AI Extractions & Officer Decision Controls */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8DDD7] pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{activeDoc?.type}</h3>
              <p className="text-xs text-slate-500">Applicant: <strong>{activeApp?.applicantName}</strong> ({activeApp?.id})</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-purple-700">OCR Confidence:</span>
              <span className="text-lg font-black text-purple-900">{activeDoc?.confidence}%</span>
            </div>
          </div>

          {/* AI Recommendation Box */}
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-950 flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-purple-700" />
                <span>AI Optical Character Model Recommendation:</span>
              </span>
              <Badge variant={activeDoc?.confidence >= 90 ? 'verified' : 'review'}>
                {activeDoc?.confidence >= 90 ? 'RECOMMEND PASS' : 'FLAGGED FOR SCRUTINY'}
              </Badge>
            </div>
            <p className="text-slate-700 leading-relaxed text-[11px]">
              {activeDoc?.ocrResult?.discrepancy || 'Extracted fields matched applicant record with high confidence.'}
            </p>
          </div>

          {/* Field Extraction Verification Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Extracted Fields & Confidence Breakdown
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="p-3 bg-slate-50 flex justify-between font-bold text-slate-700 text-[11px]">
                <span>Field Name</span>
                <span>Extracted Value</span>
                <span>Confidence</span>
                <span>Match Status</span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Applicant Name</span>
                <span className="font-bold text-slate-900">{activeApp?.applicantName}</span>
                <span className="font-bold text-emerald-700">98.4%</span>
                <Badge variant="verified">EXACT MATCH</Badge>
              </div>

              <div className="p-3 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Category / Tribe</span>
                <span className="font-bold text-slate-900">{activeApp?.subTribe} (ST)</span>
                <span className="font-bold text-emerald-700">97.1%</span>
                <Badge variant="verified">VERIFIED ST</Badge>
              </div>

              <div className="p-3 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Issuing Authority</span>
                <span className="font-bold text-slate-900">Revenue Tehsildar / SDO</span>
                <span className="font-bold text-emerald-700">94.8%</span>
                <Badge variant="verified">AUTHENTIC</Badge>
              </div>

              <div className="p-3 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Official Stamp / Seal</span>
                <span className="font-bold text-slate-900">Emblem Visible</span>
                <span className="font-bold text-amber-600">{activeDoc?.confidence}%</span>
                <Badge variant={activeDoc?.confidence >= 90 ? 'verified' : 'review'}>
                  {activeDoc?.confidence >= 90 ? 'CLEAN' : 'REVIEW'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Officer Decision & Override Section */}
          <div className="pt-4 border-t border-[#E8DDD7] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                  <UserCheck className="w-4 h-4 text-[#014BAA]" />
                  <span>Authoritative Officer Verdict (Human Override)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Officer retains statutory authority to approve, flag deficiency, or fail.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                disabled={decisionLoading}
                onClick={() => handleOfficerDecision('PASS')}
                className="flex items-center justify-center space-x-2 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Pass</span>
              </button>

              <button
                type="button"
                disabled={decisionLoading}
                onClick={() => handleOfficerDecision('NEEDS_RESUBMISSION')}
                className="flex items-center justify-center space-x-2 py-3 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Flag Deficiency</span>
              </button>

              <button
                type="button"
                disabled={decisionLoading}
                onClick={() => handleOfficerDecision('FAIL')}
                className="flex items-center justify-center space-x-2 py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Document</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
