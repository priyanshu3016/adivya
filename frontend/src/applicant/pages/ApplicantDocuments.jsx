import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Files,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const ApplicantDocuments = () => {
  const { currentUser } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeUploadModal, setActiveUploadModal] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  const loadApp = async () => {
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
    loadApp();
  }, [currentUser]);

  const requiredDocCategories = [
    {
      type: 'ST Certificate',
      desc: 'Valid Scheduled Tribe caste community certificate issued by authorized Revenue/District Officer.',
      docTypeMatch: 'ST Certificate'
    },
    {
      type: 'Income Certificate',
      desc: 'Current financial year annual family income certificate from Tehsildar/Sub-Divisional Magistrate.',
      docTypeMatch: 'Income Certificate'
    },
    {
      type: 'Academic Transcripts',
      desc: 'Final marksheet & degree certificate for Master Degree (NFST) or Bachelor/Master (NOS).',
      docTypeMatch: 'Academic Transcripts'
    },
    {
      type: 'Admission Letter',
      desc: 'Official admission letter or unconditional offer letter from Indian/Overseas host institution.',
      docTypeMatch: 'Admission'
    },
    {
      type: 'Bank Passbook / Statement',
      desc: 'First page of bank passbook or cancelled cheque with clear Account No, IFSC, and Bank Stamp.',
      docTypeMatch: 'Bank'
    },
    {
      type: 'Identity Proof (Aadhaar / Passport)',
      desc: 'Clear copy of Aadhaar Card (domestic) or Valid Indian Passport (for overseas NOS candidates).',
      docTypeMatch: 'Identity'
    }
  ];

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!application?.id) {
      alert('Please start and submit an application first before uploading additional documents.');
      return;
    }
    setUploading(true);
    try {
      await api.uploadDocument(application.id, {
        type: activeUploadModal.type,
        filename: selectedFileName || `${activeUploadModal.type.toLowerCase().replace(/\s+/g, '_')}_scan.pdf`,
        size: '1.2 MB'
      });
      alert(`Document for "${activeUploadModal.type}" uploaded successfully!`);
      setActiveUploadModal(null);
      setSelectedFileName('');
      loadApp();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
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
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Document Repository & Upload Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Application ID: <strong className="text-slate-800">{application?.id || '—'}</strong> • Manage required statutory certificates and view OCR verification status.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="cream"
            size="sm"
            onClick={loadApp}
            icon={RefreshCw}
          >
            Refresh Files
          </Button>
        </div>
      </div>

      {/* Grid of Document Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requiredDocCategories.map((cat, idx) => {
          // Check if document exists in application
          const existingDoc = application?.documents?.find((d) =>
            d.type.toLowerCase().includes(cat.docTypeMatch.toLowerCase())
          );

          const status = existingDoc ? existingDoc.status : 'PENDING';

          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                status === 'NEEDS_RESUBMISSION'
                  ? 'border-amber-400 bg-amber-50/20'
                  : status === 'VERIFIED'
                  ? 'border-emerald-200'
                  : 'border-[#E8DDD7]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : status === 'NEEDS_RESUBMISSION'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-blue-50 text-[#014BAA]'
                      }`}
                    >
                      <Files className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{cat.type}</h3>
                      <span className="text-[10px] text-slate-400">Mandatory Document</span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      status === 'VERIFIED'
                        ? 'verified'
                        : status === 'NEEDS_RESUBMISSION'
                        ? 'deficient'
                        : status === 'UNDER_REVIEW'
                        ? 'review'
                        : 'default'
                    }
                  >
                    {status.replace('_', ' ')}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {cat.desc}
                </p>

                {existingDoc ? (
                  <div className="p-3 rounded-xl bg-[#F8F3F0] border border-[#E8DDD7] text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-700 font-medium">
                      <span className="truncate max-w-[200px]">{existingDoc.filename}</span>
                      <span>{existingDoc.size}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Uploaded on: {existingDoc.uploadedAt}</span>
                      <span className="font-semibold text-[#014BAA]">
                        AI Confidence: {existingDoc.confidence}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-400">
                    No document uploaded yet
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E8DDD7] flex items-center justify-between gap-2 mt-4">
                <Button
                  variant={status === 'NEEDS_RESUBMISSION' ? 'danger' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    setSelectedFileName('');
                    setActiveUploadModal(cat);
                  }}
                  icon={UploadCloud}
                >
                  {existingDoc ? 'Replace / Re-upload' : 'Upload Document'}
                </Button>

                {existingDoc && (
                  <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Stored in Vault</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Mock Document Upload */}
      <Modal
        isOpen={!!activeUploadModal}
        onClose={() => setActiveUploadModal(null)}
        title={`Upload: ${activeUploadModal?.type}`}
        subtitle="Supported formats: PDF, JPG, PNG (Max 5MB). Optical character recognition runs immediately."
        footer={
          <>
            <Button variant="secondary" onClick={() => setActiveUploadModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" loading={uploading} onClick={handleUploadSubmit}>
              Upload & Run AI Scan
            </Button>
          </>
        }
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 hover:bg-blue-50/30 transition cursor-pointer">
            <UploadCloud className="w-10 h-10 text-[#014BAA] mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">
              Drag and drop your scanned certificate here
            </p>
            <p className="text-[11px] text-slate-500 mt-1">or click to browse local files</p>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFileName(e.target.files[0].name);
                }
              }}
              className="mt-3 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#014BAA]"
            />
          </div>

          {selectedFileName && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
              <span>Selected file: <strong>{selectedFileName}</strong></span>
              <span className="text-emerald-700 font-semibold">Ready</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Guidelines for High AI Accuracy:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Ensure official revenue stamp and issuing authority signature are visible.</li>
              <li>Avoid camera glare or folded edges over certificate numbers.</li>
            </ul>
          </div>
        </form>
      </Modal>
    </div>
  );
};
