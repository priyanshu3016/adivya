import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { GraduationCap, Globe, ArrowRight, CheckCircle2, FileText, Calendar, IndianRupee, Layers } from 'lucide-react';
import { TribalMotifDivider } from '../../components/heritage/TribalPatterns';

export const SchemesPage = () => {
  const [schemes, setSchemes] = useState([]);

  useEffect(() => {
    api.getSchemes().then(setSchemes);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#014BAA]">
          Opportunities
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Official Scholarship & Fellowship Schemes
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto">
          Explore fellowship and overseas scholarship programs offered for Scheduled Tribe students.
        </p>
        <TribalMotifDivider color="#014BAA" opacity={0.3} />
      </div>

      <div className="space-y-8">
        {schemes.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DDD7] shadow-xs space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DDD7] pb-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3.5 rounded-2xl ${scheme.id === 'NFST' ? 'bg-blue-50 text-[#014BAA]' : 'bg-amber-50 text-amber-700'}`}>
                  {scheme.id === 'NFST' ? <GraduationCap className="w-8 h-8" /> : <Globe className="w-8 h-8" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Code: {scheme.code}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      {scheme.applicationWindow}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                    {scheme.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">{scheme.level} • {scheme.scope}</p>
                </div>
              </div>

              <Link
                to={`/applicant/application?scheme=${scheme.id}`}
                className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-[#014BAA] hover:bg-[#003882] text-white text-xs font-semibold shadow-xs transition"
              >
                <span>Apply for {scheme.code}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {scheme.shortDesc}
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#F8F3F0] p-4 rounded-xl border border-[#E8DDD7] space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Financial Benefits</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {scheme.financialBenefits}
                </p>
              </div>

              <div className="bg-[#F8F3F0] p-4 rounded-xl border border-[#E8DDD7] space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#014BAA]" />
                  <span>Key Eligibility Conditions</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Academic: {scheme.qualifyingCriteria.minMarks}</li>
                  <li>• Income Ceiling: {scheme.qualifyingCriteria.maxIncome}</li>
                  <li>• Age Criterion: {scheme.qualifyingCriteria.maxAge}</li>
                </ul>
              </div>

              <div className="bg-[#F8F3F0] p-4 rounded-xl border border-[#E8DDD7] space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Intake & Important Dates</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Annual Quota: <strong>{scheme.annualSlots} slots</strong></li>
                  <li>• Window Closes: <strong>{scheme.deadline}</strong></li>
                  <li>• Mode: 100% Online via this Portal</li>
                </ul>
              </div>
            </div>

            {/* Required Documents */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Mandatory Documents Required For Application:</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {scheme.requiredDocuments.map((doc, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    ✓ {doc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* 3. PLACEHOLDER SCHEME CARD */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DDD7] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DDD7] pb-6">
            <div className="flex items-start space-x-4">
              <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-500">
                <Layers className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                    COMING SOON
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-50 text-slate-500">
                    Future Scheme
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  More Schemes Coming Soon
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Central Sector • Scheduled Tribes</p>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed border border-slate-200"
            >
              <span>Coming Soon</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Additional scholarship and fellowship opportunities will be added to Adivya as more schemes are onboarded.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#F8F3F0] p-4 rounded-xl border border-[#E8DDD7] space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                <span>Financial Benefits</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct Benefit Transfer (DBT) fellowship stipends and research grants.
              </p>
            </div>

            <div className="bg-[#F8F3F0] p-4 rounded-xl border border-[#E8DDD7] space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Key Eligibility Criteria</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Under active onboarding</li>
                <li>• Scheduled Tribe (ST) scholars</li>
                <li>• Criteria published upon cycle launch</li>
              </ul>
            </div>

            <div className="bg-[#F8F3F0] p-4 rounded-xl border border-[#E8DDD7] space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Cycle Announcement</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Status: <strong>Upcoming</strong></li>
                <li>• Portal Mode: 100% Online</li>
                <li>• Timelines to be notified</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
