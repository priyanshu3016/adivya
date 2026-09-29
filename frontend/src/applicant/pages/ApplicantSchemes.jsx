import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { GraduationCap, Globe, ArrowRight, CheckCircle2, FileText, Calendar, IndianRupee, Layers } from 'lucide-react';

export const ApplicantSchemes = () => {
  const [schemes, setSchemes] = useState([]);

  useEffect(() => {
    api.getSchemes().then(setSchemes);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Available Higher Education Schemes
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Central sector scholarship and fellowship schemes currently accepting applications for Academic Year 2026-27.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemes.map((scheme) => (
          <div key={scheme.id} className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${scheme.id === 'NFST' ? 'bg-blue-50 text-[#014BAA]' : 'bg-amber-50 text-amber-700'}`}>
                    {scheme.id === 'NFST' ? <GraduationCap className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {scheme.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {scheme.name}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {scheme.shortDesc}
              </p>

              <div className="bg-[#F8F3F0] rounded-xl p-4 space-y-2 text-xs border border-[#E8DDD7]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Eligibility Cutoff:</span>
                  <span className="font-semibold text-slate-800">{scheme.qualifyingCriteria.minMarks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Family Income Ceiling:</span>
                  <span className="font-semibold text-slate-800">{scheme.qualifyingCriteria.maxIncome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Financial Package:</span>
                  <span className="font-semibold text-slate-800">{scheme.financialBenefits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Deadline:</span>
                  <span className="font-semibold text-rose-600">{scheme.deadline}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Required Documents Checklist:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {scheme.requiredDocuments.map((doc, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      ✓ {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Link
              to={`/applicant/application?scheme=${scheme.id}`}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-[#014BAA] hover:bg-[#003882] text-white text-xs font-bold transition shadow-xs"
            >
              <span>Apply for {scheme.code} Scheme</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}

        {/* 3. PLACEHOLDER SCHEME */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-slate-100 text-slate-500">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                    COMING SOON
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    More Schemes Coming Soon
                  </h3>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Additional scholarship and fellowship opportunities will be added to Adivya as more schemes are onboarded.
            </p>

            <div className="bg-[#F8F3F0] rounded-xl p-4 space-y-2 text-xs border border-[#E8DDD7]">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-slate-700">Scheme onboarding in progress</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiaries:</span>
                <span className="font-semibold text-slate-700">ST Students & Scholars</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Disbursement:</span>
                <span className="font-semibold text-slate-700">Direct Benefit Transfer (DBT)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Intake Timeline:</span>
                <span className="font-semibold text-slate-600">To be notified</span>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Key Highlights:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  ✓ 100% Online
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  ✓ AI/OCR Verification
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  ✓ Central Sector
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed border border-slate-200"
          >
            <span>Coming Soon</span>
          </button>
        </div>
      </div>
    </div>
  );
};
