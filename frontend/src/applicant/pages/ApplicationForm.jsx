import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import {
  GraduationCap,
  Globe,
  User,
  BookOpen,
  Building,
  CreditCard,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  ShieldCheck,
  Plus
} from 'lucide-react';

export const ApplicationForm = () => {
  const [searchParams] = useSearchParams();
  const initialScheme = searchParams.get('scheme') || 'NFST';
  const navigate = useNavigate();
  const { loginApplicant, setSessionApplication } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('ST Certificate');

  // Form State - empty clean default state
  const [formData, setFormData] = useState({
    // Step 1: Scheme
    scheme: initialScheme,
    // Step 2: Personal
    applicantName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    category: 'ST',
    subTribe: '',
    state: '',
    district: '',
    annualFamilyIncome: '',
    // Step 3: Academic
    qualifyingDegree: '',
    academicInstitute: '',
    qualifyingPercentage: '',
    passingYear: '',
    // Step 4: Scheme Details
    courseType: 'Ph.D.',
    discipline: '',
    institution: '',
    nirfRank: '',
    qsRank: '',
    // Step 5: Bank Details
    bankName: '',
    accountNumber: '',
    ifsc: '',
    aadhaarSeeded: false,
    // Step 6: Documents
    documents: []
  });

  const steps = [
    { num: 1, label: 'Scheme Selection' },
    { num: 2, label: 'Personal Info' },
    { num: 3, label: 'Academic Info' },
    { num: 4, label: 'Scheme Info' },
    { num: 5, label: 'Bank Details' },
    { num: 6, label: 'Document Upload' },
    { num: 7, label: 'Review & Submit' }
  ];

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 7));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleAddMockDoc = () => {
    if (!docName.trim()) return;
    const newDoc = {
      id: `doc-${Date.now()}`,
      type: docType,
      filename: docName.trim(),
      size: '1.2 MB',
      uploaded: true,
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'UNDER_REVIEW',
      confidence: 96.0,
      ocrResult: {
        extractedName: formData.applicantName || 'Applicant',
        discrepancy: 'Uploaded for scrutiny.'
      }
    };
    setFormData({
      ...formData,
      documents: [...formData.documents, newDoc]
    });
    setDocName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const createdApp = await api.submitApplication(formData);
      if (setSessionApplication) {
        setSessionApplication(createdApp);
      }
      api.setSubmittedApplication(createdApp);
      loginApplicant({
        id: createdApp.id,
        name: createdApp.applicantName,
        email: createdApp.email,
        phone: createdApp.phone,
        role: 'applicant',
        hasDeficiency: false
      });
      alert(`Application Submitted Successfully! Assigned Application ID: ${createdApp.id}`);
      navigate('/applicant/dashboard');
    } catch (err) {
      alert('Error submitting application: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Fellowship & Scholarship Online Application
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Adivya • Application Cycle 2026-27
        </p>

        {/* Step Indicator Bar */}
        <div className="mt-6 hidden sm:grid grid-cols-7 gap-1 border-t border-[#E8DDD7] pt-4">
          {steps.map((s) => (
            <div
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              className={`text-center cursor-pointer transition ${
                s.num === step
                  ? 'text-[#014BAA] font-bold'
                  : s.num < step
                  ? 'text-emerald-700 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs mb-1 ${
                  s.num === step
                    ? 'bg-[#014BAA] text-white ring-2 ring-blue-200'
                    : s.num < step
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {s.num < step ? '✓' : s.num}
              </div>
              <span className="text-[10px] block leading-tight">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Mobile progress summary */}
        <div className="sm:hidden mt-4 flex items-center justify-between text-xs text-[#014BAA] font-semibold border-t border-[#E8DDD7] pt-3">
          <span>Step {step} of 7: {steps[step - 1].label}</span>
          <span className="text-slate-500 text-[11px]">{Math.round((step / 7) * 100)}% Complete</span>
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DDD7] shadow-xs">
          {/* STEP 1: SCHEME SELECTION */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-[#E8DDD7] pb-3">
                1. Select Target Scheme
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setFormData({ ...formData, scheme: 'NFST' })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.scheme === 'NFST'
                      ? 'border-[#014BAA] bg-blue-50/50 shadow-xs'
                      : 'border-[#E8DDD7] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <GraduationCap className="w-6 h-6 text-[#014BAA]" />
                    <span className="font-bold text-sm text-slate-900">NFST</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">National Fellowship for Scheduled Tribe</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    For pursuing M.Phil and Ph.D. research programmes in recognized Indian Universities.
                  </p>
                  <div className="mt-3 text-[11px] font-semibold text-[#014BAA]">
                    Quota: 750 Slots • Fellowship: JRF ₹37,000 pm
                  </div>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, scheme: 'NOS' })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.scheme === 'NOS'
                      ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                      : 'border-[#E8DDD7] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Globe className="w-6 h-6 text-amber-700" />
                    <span className="font-bold text-sm text-slate-900">NOS</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">National Overseas Scholarship</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    For pursuing Master's Degree or Ph.D. abroad in Top 500 QS World Ranked Universities.
                  </p>
                  <div className="mt-3 text-[11px] font-semibold text-amber-700">
                    Quota: 20 Slots • 100% Tuition + Living Stipend
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL INFORMATION */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-[#E8DDD7] pb-3">
                2. Applicant Personal & Caste Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formData.applicantName}
                    onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA] bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scheduled Tribe (ST) Sub-Tribe / Community
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Santhal / Gond / Bodo / Bhil"
                    value={formData.subTribe}
                    onChange={(e) => setFormData({ ...formData, subTribe: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State / Union Territory
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jharkhand / Odisha / Assam"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter domicile district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Annual Total Family Income (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Enter total family income"
                    value={formData.annualFamilyIncome}
                    onChange={(e) => setFormData({ ...formData, annualFamilyIncome: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                  <span className="text-[10px] text-slate-500">Max limit for NFST: ₹6,00,000 / NOS: ₹8,00,000</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ACADEMIC INFORMATION */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-[#E8DDD7] pb-3">
                3. Qualifying Academic Record
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Highest Qualifying Degree Completed
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.qualifyingDegree}
                    onChange={(e) => setFormData({ ...formData, qualifyingDegree: e.target.value })}
                    placeholder="e.g. M.Sc. / M.Tech / M.A."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    University / Institution Graduated From
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter graduation university"
                    value={formData.academicInstitute}
                    onChange={(e) => setFormData({ ...formData, academicInstitute: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Overall Marks Percentage / Equivalent %
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 68.5"
                    value={formData.qualifyingPercentage}
                    onChange={(e) => setFormData({ ...formData, qualifyingPercentage: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                  <span className="text-[10px] text-slate-500">Min 55% for NFST, 60% for NOS</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Year of Passing
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2024"
                    value={formData.passingYear}
                    onChange={(e) => setFormData({ ...formData, passingYear: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SCHEME / RESEARCH INFORMATION */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-[#E8DDD7] pb-3">
                4. Fellowship Research & Admission Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Programme Level
                  </label>
                  <select
                    value={formData.courseType}
                    onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA] bg-white"
                  >
                    <option value="Ph.D.">Ph.D. (Doctor of Philosophy)</option>
                    <option value="M.Phil">M.Phil</option>
                    <option value="Master of Science">Master of Science (NOS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Host University / Institute of Admission
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter institution of research or admission"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discipline / Research Proposal Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter academic discipline or research topic"
                    value={formData.discipline}
                    onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                </div>

                {formData.scheme === 'NOS' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      QS World University Ranking
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={formData.qsRank}
                      onChange={(e) => setFormData({ ...formData, qsRank: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                    />
                    <span className="text-[10px] text-slate-500">Must be within Top 500</span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      NIRF Ranking of Indian Institution
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 5"
                      value={formData.nirfRank}
                      onChange={(e) => setFormData({ ...formData, nirfRank: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: BANK DETAILS */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-[#E8DDD7] pb-3">
                5. Bank Account for Direct Benefit Transfer (DBT)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. State Bank of India"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter bank account number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SBIN0001055"
                    value={formData.ifsc}
                    onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA]"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="aadhaarSeed"
                    checked={formData.aadhaarSeeded}
                    onChange={(e) => setFormData({ ...formData, aadhaarSeeded: e.target.checked })}
                    className="h-4 w-4 text-[#014BAA] rounded"
                  />
                  <label htmlFor="aadhaarSeed" className="text-xs text-slate-700 font-medium">
                    This account is linked and seeded with my Aadhaar number for DBT
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: DOCUMENT UPLOAD */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-[#E8DDD7] pb-3">
                6. Document Repository & Uploads
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Attach scanned certificates required for automated AI/OCR verification and officer review.
              </p>

              {/* Upload input helper */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <span className="text-xs font-bold text-slate-800">Add Certificate to Application:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="ST Certificate">ST Certificate</option>
                    <option value="Income Certificate">Income Certificate</option>
                    <option value="Academic Transcripts">Academic Transcripts</option>
                    <option value="Admission Letter">Admission Letter</option>
                    <option value="Bank Passbook / Statement">Bank Passbook / Statement</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Enter document filename"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />

                  <Button variant="secondary" size="sm" onClick={handleAddMockDoc} icon={Plus}>
                    Attach File
                  </Button>
                </div>
              </div>

              {formData.documents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  No documents uploaded yet. You can attach documents above or upload them after submission in the My Documents tab.
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.documents.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      className="p-3 rounded-xl border border-[#E8DDD7] bg-[#F8F3F0]/60 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <FileCheck className="w-4 h-4 text-[#014BAA]" />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{doc.type}</span>
                          <span className="text-[10px] text-slate-500">{doc.filename}</span>
                        </div>
                      </div>
                      <span className="text-xs text-emerald-700 font-semibold">Attached</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 7: REVIEW APPLICATION & SUBMIT */}
          {step === 7 && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-slate-900 border-b border-[#E8DDD7] pb-3">
                7. Review Application Before Final Submission
              </h2>

              <div className="bg-[#F8F3F0] rounded-xl p-5 border border-[#E8DDD7] space-y-4 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[#E8DDD7]">
                  <span className="text-slate-500 uppercase tracking-wider font-semibold">Selected Scheme</span>
                  <span className="font-bold text-[#014BAA] text-sm">{formData.scheme}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block">Applicant Name:</span>
                    <strong className="text-slate-800">{formData.applicantName || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Community & State:</span>
                    <strong className="text-slate-800">{formData.subTribe || 'ST'}, {formData.state || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Degree & Score:</span>
                    <strong className="text-slate-800">{formData.qualifyingDegree || 'Not specified'} ({formData.qualifyingPercentage || '0'}%)</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Host Institution:</span>
                    <strong className="text-slate-800">{formData.institution || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Annual Family Income:</span>
                    <strong className="text-slate-800">₹{Number(formData.annualFamilyIncome || 0).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">DBT Bank Account:</span>
                    <strong className="text-slate-800">{formData.bankName || 'Not specified'} ({formData.accountNumber ? `••••${formData.accountNumber.slice(-4)}` : 'Not provided'})</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
                <div className="flex items-center space-x-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#014BAA]" />
                  <span>Applicant Undertaking</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  I solemnly declare that all particulars furnished above and the certificates uploaded are genuine and true to my knowledge. I understand that submitting false caste certificates or income proofs constitutes an offence under the law and will lead to immediate cancellation of fellowship and recovery of disbursed funds.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-5 border-t border-[#E8DDD7] flex items-center justify-between">
            {step > 1 ? (
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handlePrev}
                icon={ArrowLeft}
                iconPosition="left"
              >
                Previous Step
              </Button>
            ) : (
              <div></div>
            )}

            {step < 7 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleNext}
                icon={ArrowRight}
                iconPosition="right"
              >
                Continue to Step {step + 1}
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                icon={CheckCircle2}
                iconPosition="right"
              >
                Submit Application to Ministry
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
