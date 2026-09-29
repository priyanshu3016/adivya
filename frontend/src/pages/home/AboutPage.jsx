import React from 'react';
import { TribalMotifDivider } from '../../components/heritage/TribalPatterns';
import { ShieldCheck, Award, FileSearch, Users, BookOpen } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#014BAA]">
          About The Initiative
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Empowering Scheduled Tribe Scholars
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto">
          Adivya is an AI-enabled scholarship and fellowship management platform developed for Smart India Hackathon 2026 (Problem Statement ID: 26239).
        </p>
        <TribalMotifDivider color="#014BAA" opacity={0.3} />
      </div>

      <div className="bg-white rounded-2xl p-8 border border-[#E8DDD7] space-y-6 text-sm text-slate-700 leading-relaxed shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 border-b border-[#E8DDD7] pb-3">
          Problem Background & Objective
        </h3>
        <p>
          Flagship central sector schemes including the <strong>National Fellowship for Scheduled Tribe (NFST)</strong> and <strong>National Overseas Scholarship (NOS)</strong> facilitate higher academic research (M.Phil / Ph.D.) and foreign studies for Scheduled Tribe youth.
        </p>
        <p>
          Historically, scholarship scrutiny involved manual cross-verification of multi-jurisdictional caste certificates, annual income proof, academic transcripts, and institutional admission letters. Discrepancies and blurry scans led to prolonged delays, administrative bottlenecks, and repeated postal queries.
        </p>
        <p>
          This <strong>AI-Enabled Scholarship and Fellowship Management System</strong> provides an integrated digital platform that bridges applicants and scrutiny officials:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#F8F3F0] border border-[#E8DDD7]">
            <h4 className="font-bold text-[#014BAA] mb-1 flex items-center space-x-2">
              <FileSearch className="w-4 h-4" />
              <span>AI/OCR Document Verification</span>
            </h4>
            <p className="text-xs text-slate-600">
              Extracts text and critical values from government certificates, calculating match confidence without eliminating officer authority.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F8F3F0] border border-[#E8DDD7]">
            <Award className="font-bold text-[#014BAA] mb-1 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Direct Deficiency Resubmission</span>
            </Award>
            <p className="text-xs text-slate-600">
              Allows officers to raise clear remarks on specific certificates, enabling applicants to upload replacement files in seconds.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#E8DDD7] text-center">
          <ShieldCheck className="w-8 h-8 text-[#014BAA] mx-auto mb-2" />
          <h4 className="font-bold text-slate-900 text-sm">Ministry-Grade Security</h4>
          <p className="text-xs text-slate-600 mt-1">Role-based access separation ensuring applicant data confidentiality.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#E8DDD7] text-center">
          <Award className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <h4 className="font-bold text-slate-900 text-sm">Transparent Selection</h4>
          <p className="text-xs text-slate-600 mt-1">Configurable eligibility rules and screening committee evaluation records.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-[#E8DDD7] text-center">
          <BookOpen className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <h4 className="font-bold text-slate-900 text-sm">Direct DBT Integration</h4>
          <p className="text-xs text-slate-600 mt-1">Seamless transfer into Aadhaar-linked beneficiary bank accounts.</p>
        </div>
      </div>
    </div>
  );
};
