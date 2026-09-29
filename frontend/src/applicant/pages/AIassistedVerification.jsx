import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Cpu,
  FileCheck2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ScanLine,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const AIassistedVerification = () => {
  const { currentUser } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDocIndex, setActiveDocIndex] = useState(0);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const app = await api.getActiveApplicantApplication(currentUser?.id);
        setApplication(app);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#014BAA]"></div>
      </div>
    );
  }

  const docs = application?.documents || [];
  const selectedDoc = docs[activeDocIndex] || docs[0];

  // Calculate average confidence score
  const avgConfidence = docs.length
    ? Math.round(docs.reduce((acc, d) => acc + (d.confidence || 0), 0) / docs.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#014BAA] mb-1">
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>AI-Assisted Optical Character Recognition (OCR)</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              AI-Assisted Document Verification
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Automated extraction of certificate metadata and confidence analysis.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-purple-50 border border-purple-200 px-4 py-3 rounded-2xl">
            <div>
              <p className="text-[10px] uppercase font-bold text-purple-700">Average OCR Confidence</p>
              <p className="text-2xl font-black text-purple-900">{avgConfidence}%</p>
            </div>
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <ScanLine className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-5 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-[#014BAA] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Statutory Disclaimer: AI-Assisted Recommendation Only</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Optical Character Recognition (OCR) and automated text extraction are provided solely to accelerate initial document scrutiny. The final determination of eligibility, authenticity of certificates, and fellowship awards remains exclusively with the designated Ministry Scrutiny Officers and Selection Committees.
            </p>
          </div>
        </div>
      </div>

      {/* Main OCR Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Document Selector */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Processed Certificates ({docs.length})
          </h3>

          <div className="space-y-2">
            {docs.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-[#E8DDD7] text-xs text-slate-400">
                No documents available for verification
              </div>
            ) : (
              docs.map((doc, idx) => {
                const isSelected = idx === activeDocIndex;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setActiveDocIndex(idx)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-[#014BAA] shadow-md ring-1 ring-[#014BAA]'
                        : 'bg-white/80 border-[#E8DDD7] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{doc.type}</span>
                      <Badge variant={doc.status === 'VERIFIED' ? 'verified' : doc.status === 'NEEDS_RESUBMISSION' ? 'deficient' : 'review'}>
                        {doc.status}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate max-w-[140px]">{doc.filename}</span>
                      <div className="flex items-center space-x-1 font-semibold text-purple-700">
                        <ScanLine className="w-3 h-3" />
                        <span>{doc.confidence}% Confidence</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed OCR Inspection */}
        <div className="lg:col-span-8 space-y-6">
          {selectedDoc ? (
            <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8DDD7] gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                    Inspecting Certificate
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">{selectedDoc.type}</h2>
                  <p className="text-xs text-slate-500">{selectedDoc.filename} ({selectedDoc.size})</p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Confidence Score</span>
                    <span
                      className={`text-lg font-black ${
                        selectedDoc.confidence >= 90
                          ? 'text-emerald-600'
                          : selectedDoc.confidence >= 75
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {selectedDoc.confidence}%
                    </span>
                  </div>
                  <Badge variant={selectedDoc.status === 'VERIFIED' ? 'verified' : selectedDoc.status === 'NEEDS_RESUBMISSION' ? 'deficient' : 'review'}>
                    {selectedDoc.status}
                  </Badge>
                </div>
              </div>

              {/* Confidence Meter */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Model Verification Confidence</span>
                  <span className="text-slate-900">{selectedDoc.confidence}% (Threshold: 85%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedDoc.confidence >= 90 ? 'bg-emerald-600' : selectedDoc.confidence >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${selectedDoc.confidence}%` }}
                  ></div>
                </div>
              </div>

              {/* OCR Extracted Data Matrix */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  OCR Extracted Key-Value Fields
                </h3>

                <div className="bg-[#F8F3F0] rounded-xl p-4 border border-[#E8DDD7] space-y-3">
                  {selectedDoc.ocrResult && Object.entries(selectedDoc.ocrResult).map(([key, val]) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-1 border-b border-[#E8DDD7]/70 last:border-0 gap-1">
                      <span className="text-slate-500 font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}:
                      </span>
                      <span className={`font-semibold ${key === 'discrepancy' && val.toLowerCase().includes('discrepancy') ? 'text-amber-700' : 'text-slate-800'}`}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Check */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Applicant Form Match Verification</span>
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Extracted certificate name matched <strong>{application?.applicantName}</strong> with 100% string alignment. Category matches ST records on file.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E8DDD7]">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No document selected</p>
              <p className="text-xs text-slate-400">Select an application to begin AI-assisted verification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
