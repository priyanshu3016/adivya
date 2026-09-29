import React from 'react';
import { TribalMotifDivider } from '../../components/heritage/TribalPatterns';
import { 
  FileEdit, 
  UploadCloud, 
  Cpu, 
  FileCheck, 
  CheckCircle, 
  HelpCircle, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorksPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#014BAA]">
          Step-by-Step Guide
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          How the Digital Verification System Works
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto">
          Understand the end-to-end journey from online application and AI-assisted OCR verification to officer scrutiny and fellowship disbursement.
        </p>
        <TribalMotifDivider color="#014BAA" opacity={0.3} />
      </div>

      {/* Process Roadmap */}
      <div className="space-y-6">
        {/* Step 1 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DDD7] shadow-xs flex flex-col md:flex-row items-start gap-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#014BAA] flex items-center justify-center shrink-0 font-bold text-lg">
            1
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">
              Online Registration & Form Submission
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ST students create an account using their mobile number/email. Choose between NFST (Domestic Ph.D.) or NOS (Overseas Master/Ph.D.) and fill out basic demographic, academic, caste community, and host university admission details.
            </p>
            <div className="pt-2 text-xs font-semibold text-[#014BAA]">
              Estimated time: 10 - 15 minutes
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DDD7] shadow-xs flex flex-col md:flex-row items-start gap-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#014BAA] flex items-center justify-center shrink-0 font-bold text-lg">
            2
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">
              Document Upload & Automated Storage
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Upload PDF or clear scans of your ST Certificate, Annual Income Certificate, Qualifying Degree Marksheets, Institution Admission Letter, and Bank Passbook. Files are securely organized in your personal document vault.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DDD7] shadow-xs flex flex-col md:flex-row items-start gap-6 border-l-4 border-l-[#014BAA]">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 font-bold text-lg">
            3
          </div>
          <div className="space-y-2">
            <div className="inline-block px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px] font-bold">
              AI-ASSISTED INNOVATION
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              AI/OCR Certificate Data Extraction & Matching
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our automated optical character recognition pipeline processes uploaded certificates:
            </p>
            <ul className="text-xs sm:text-sm text-slate-600 space-y-1 list-disc pl-5">
              <li>Reads applicant name, certificate number, issuing authority, and issuance date.</li>
              <li>Compares extracted text with applicant self-declaration for discrepancies.</li>
              <li>Generates statistical match confidence scores (e.g. 98.4%, 94.2%).</li>
              <li>Highlights potential deficiencies (e.g. expired certificates or blurry stamps).</li>
            </ul>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DDD7] shadow-xs flex flex-col md:flex-row items-start gap-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#014BAA] flex items-center justify-center shrink-0 font-bold text-lg">
            4
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">
              Officer Scrutiny & Deficiency Rectification
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Ministry scrutiny officers review the application and AI recommendations side-by-side. If a document is unclear, the officer logs a specific deficiency note. The student receives an instant alert, uploads a replacement copy, and resubmits immediately.
            </p>
          </div>
        </div>

        {/* Step 5 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DDD7] shadow-xs flex flex-col md:flex-row items-start gap-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-lg">
            5
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">
              Screening Committee, Award & DBT Disbursement
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Eligible applicants are evaluated by the National Screening Selection Committee. Approved scholars receive official sanction orders, and recurring monthly fellowship allowances are credited directly into their Aadhaar-seeded bank accounts via DBT.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/applicant/login"
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-[#014BAA] hover:bg-[#003882] text-white font-semibold text-sm shadow-md transition"
        >
          <span>Get Started on the Portal</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
