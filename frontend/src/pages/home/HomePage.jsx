import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  FileText, 
  Upload, 
  Cpu, 
  CheckCircle2, 
  ShieldCheck, 
  GraduationCap, 
  Globe, 
  BarChart3, 
  Sliders, 
  AlertCircle, 
  Users, 
  Clock, 
  Check,
  Layers
} from 'lucide-react';
import { TribalMotifDivider, TribalCornerMotif } from '../../components/heritage/TribalPatterns';

export const HomePage = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-tribal-pattern-cream pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-[#E8DDD7]">
        {/* Subtle Decorative Geometric Backdrop Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="tribal-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 40 M 0 0 L 40 40" fill="none" stroke="#014BAA" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tribal-grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8DDD7] shadow-xs text-xs font-semibold text-[#014BAA]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Academic Year 2026-27 Intake Open</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">Adivya Platform</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Scholarship & Fellowship <br className="hidden sm:inline" />
              <span className="text-[#014BAA]">Management for Tribal Students</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              A unified national digital ecosystem facilitating seamless scholarship and fellowship applications, AI/OCR-assisted document scrutiny, deficiency resolution, and transparent Direct Benefit Transfer for Scheduled Tribe researchers across India and abroad.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link
                to="/applicant/login"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-[#014BAA] hover:bg-[#003882] text-white font-semibold text-sm shadow-md transition-all hover:scale-[1.02]"
              >
                <span>Apply Now (Student Portal)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/admin/login"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-sm shadow-xs transition"
              >
                <ShieldCheck className="w-4 h-4 text-[#014BAA]" />
                <span>Ministry Admin Portal</span>
              </Link>
            </div>

            <div className="pt-4 flex items-center justify-center space-x-6 text-xs text-slate-500">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI-Assisted OCR Verification</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Physical Paperwork</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Direct DBT Disbursement</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ROLE SELECTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#014BAA]">
            Portal Access
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            How would you like to continue?
          </p>
          <TribalMotifDivider className="mt-3" color="#014BAA" opacity={0.3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CARD 1: APPLICANT */}
          <div className="relative bg-white rounded-2xl p-8 border-2 border-[#E8DDD7] hover:border-[#014BAA] shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between">
            <TribalCornerMotif position="top-right" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#014BAA] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="inline-block px-2.5 py-1 rounded bg-[#014BAA]/10 text-[#014BAA] text-xs font-bold uppercase mb-2">
                For Students & Researchers
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Applicant Portal
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Apply for National Fellowship for ST (NFST) or National Overseas Scholarship (NOS), securely upload required certificates, view instant AI extraction feedback, and track your application milestones until selection and disbursement.
              </p>

              <ul className="space-y-2.5 mb-8 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Scheme eligibility check & instant application submission</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Interactive deficiency notification and re-upload flow</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time multi-stage status tracking (7 lifecycle milestones)</span>
                </li>
              </ul>
            </div>

            <Link
              to="/applicant/login"
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-[#014BAA] hover:bg-[#003882] text-white font-semibold text-sm transition shadow-sm"
            >
              <span>Enter Applicant Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* CARD 2: ADMIN */}
          <div className="relative bg-white rounded-2xl p-8 border-2 border-[#E8DDD7] hover:border-[#014BAA] shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between">
            <TribalCornerMotif position="top-right" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="inline-block px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-xs font-bold uppercase mb-2">
                For Ministry & Scrutiny Officers
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">
                Admin Portal
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Comprehensive scrutiny workstation for ministry desk officers, screening committee members, and scheme directors. Review AI document extractions, raise deficiencies, verify statutory eligibility criteria, and execute merit rankings.
              </p>

              <ul className="space-y-2.5 mb-8 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>AI/OCR confidence inspection with officer override controls</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Deficiency communication system with applicant messaging</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Configurable scheme-specific rules engine and live analytics</span>
                </li>
              </ul>
            </div>

            <Link
              to="/admin/login"
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition shadow-sm"
            >
              <span>Enter Admin Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. ABOUT THE PLATFORM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#E8DDD7] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#014BAA]">
                Adivya Initiative
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Empowering Tribal Scholars through Modern Digital Governance
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Adivya provides a unified digital gateway for Scheduled Tribe scholars pursuing advanced research (M.Phil/Ph.D.) in premier Indian institutes and top international universities abroad.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Under Smart India Hackathon 2026 (Problem Statement ID: 26239), this unified portal eliminates paperwork bottlenecks through AI-assisted verification of caste, income, and academic documents while preserving human officer scrutiny and statutory compliance.
              </p>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-[#F8F3F0] p-4 rounded-xl border border-[#E8DDD7]">
                <p className="text-2xl font-black text-[#014BAA]">750+</p>
                <p className="text-xs font-semibold text-slate-700 mt-1">Annual NFST Fellowships</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Domestic Ph.D. scholars</p>
              </div>
              <div className="bg-[#F8F3F0] p-4 rounded-xl border border-[#E8DDD7]">
                <p className="text-2xl font-black text-[#014BAA]">Top 500</p>
                <p className="text-xs font-semibold text-slate-700 mt-1">World Universities</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Under NOS Overseas</p>
              </div>
              <div className="bg-[#F8F3F0] p-4 rounded-xl border border-[#E8DDD7]">
                <p className="text-2xl font-black text-emerald-700">2 Schemes</p>
                <p className="text-xs font-semibold text-slate-700 mt-1">National Fellowships</p>
                <p className="text-[11px] text-slate-500 mt-0.5">NFST & NOS Portfolios</p>
              </div>
              <div className="bg-[#F8F3F0] p-4 rounded-xl border border-[#E8DDD7]">
                <p className="text-2xl font-black text-[#014BAA]">100%</p>
                <p className="text-xs font-semibold text-slate-700 mt-1">Aadhaar / DBT</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Direct bank transfer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SCHEMES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#014BAA]">
            Active Programs
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Ministry Scholarship & Fellowship Schemes
          </p>
          <TribalMotifDivider className="mt-3" color="#014BAA" opacity={0.3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* SCHEME 1: NFST */}
          <div className="bg-white rounded-2xl p-7 border border-[#E8DDD7] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-50 text-[#014BAA] rounded-xl">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#014BAA]">Scheme Code: NFST</span>
                    <h3 className="text-lg font-bold text-slate-900">
                      National Fellowship for Scheduled Tribe
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Open
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Provides financial assistance to Scheduled Tribe students for pursuing full-time research programmes leading to M.Phil and Ph.D. in Sciences, Humanities, Engineering, and Social Sciences at recognized Indian institutions.
              </p>

              <div className="bg-[#F8F3F0] rounded-xl p-4 space-y-2 text-xs border border-[#E8DDD7] mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-500">Annual Slots:</span>
                  <span className="font-semibold text-slate-800">750 fresh fellowships</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fellowship Amount:</span>
                  <span className="font-semibold text-slate-800">JRF: ₹37,000 / SRF: ₹42,000 pm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Family Income Limit:</span>
                  <span className="font-semibold text-slate-800">₹6,00,000 per annum</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Academic Cutoff:</span>
                  <span className="font-semibold text-slate-800">Min 55% in Post-Graduation</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">Next Deadline: Oct 31, 2026</span>
              <Link
                to="/applicant/application?scheme=NFST"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#014BAA] hover:underline"
              >
                <span>Apply for NFST</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* SCHEME 2: NOS */}
          <div className="bg-white rounded-2xl p-7 border border-[#E8DDD7] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-700">Scheme Code: NOS</span>
                    <h3 className="text-lg font-bold text-slate-900">
                      National Overseas Scholarship
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Open
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Enables meritorious Scheduled Tribe candidates to acquire higher education qualifications (Master's Degree and Ph.D.) abroad in engineering, technology, medicine, pure sciences, and agriculture in premier institutions.
              </p>

              <div className="bg-[#F8F3F0] rounded-xl p-4 space-y-2 text-xs border border-[#E8DDD7] mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-500">Institution Scope:</span>
                  <span className="font-semibold text-slate-800">Top 500 QS World Ranked</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coverage:</span>
                  <span className="font-semibold text-slate-800">Full Tuition + Living + Airfare</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Family Income Limit:</span>
                  <span className="font-semibold text-slate-800">₹8,00,000 per annum</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Qualifying Score:</span>
                  <span className="font-semibold text-slate-800">Min 60% in Bachelor / Master</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">Next Deadline: Nov 15, 2026</span>
              <Link
                to="/applicant/application?scheme=NOS"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-700 hover:underline"
              >
                <span>Apply for NOS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* SCHEME 3: PLACEHOLDER */}
          <div className="bg-white rounded-2xl p-7 border border-[#E8DDD7] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500">Upcoming Portfolio</span>
                    <h3 className="text-lg font-bold text-slate-900">
                      More Schemes Coming Soon
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  COMING SOON
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Additional scholarship and fellowship opportunities will be added to Adivya as more schemes are onboarded.
              </p>

              <div className="bg-[#F8F3F0] rounded-xl p-4 space-y-2 text-xs border border-[#E8DDD7] mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-semibold text-slate-700">Scheme onboarding in progress</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Beneficiaries:</span>
                  <span className="font-semibold text-slate-700">ST Students & Researchers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification:</span>
                  <span className="font-semibold text-slate-700">AI/OCR Automated Pipeline</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Disbursement:</span>
                  <span className="font-semibold text-slate-700">Direct Benefit Transfer (DBT)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Launch Timeline: Forthcoming</span>
              <button
                type="button"
                disabled
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 cursor-not-allowed bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
              >
                <span>Coming Soon</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (4-STEP FLOW) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#014BAA]">
            Workflow
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            How The System Works
          </p>
          <p className="text-xs text-slate-500 mt-2">
            A 4-step streamlined process from digital submission to DBT disbursement.
          </p>
          <TribalMotifDivider className="mt-3" color="#014BAA" opacity={0.3} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-xl p-6 border border-[#E8DDD7] shadow-xs relative">
            <span className="text-4xl font-black text-[#014BAA]/20">01</span>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#014BAA] flex items-center justify-center mb-4 mt-2">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">1. Apply</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select your scheme (NFST or NOS) and complete the digital questionnaire with personal, academic, admission, and bank details.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-xl p-6 border border-[#E8DDD7] shadow-xs relative">
            <span className="text-4xl font-black text-[#014BAA]/20">02</span>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#014BAA] flex items-center justify-center mb-4 mt-2">
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">2. Upload Documents</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload scanned certificates (ST certificate, Income certificate, Degree transcripts, Admission letter, and Bank passbook).
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-xl p-6 border border-[#E8DDD7] shadow-xs relative">
            <span className="text-4xl font-black text-[#014BAA]/20">03</span>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-4 mt-2">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">3. AI-Assisted Verification</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated OCR extracts key certificate metadata and calculates match confidence scores to support administrative scrutiny.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-xl p-6 border border-[#E8DDD7] shadow-xs relative">
            <span className="text-4xl font-black text-[#014BAA]/20">04</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 mt-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">4. Track & Process</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Resolve deficiencies if raised, monitor screening committee evaluations, and receive sanction letters through your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* 6. KEY FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#014BAA]">
            Platform Capabilities
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Built for Transparency & Performance
          </p>
          <TribalMotifDivider className="mt-3" color="#014BAA" opacity={0.3} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E8DDD7]">
            <Cpu className="w-6 h-6 text-[#014BAA] mb-3" />
            <h4 className="text-sm font-bold text-slate-900 mb-1">AI/OCR Assisted Verification</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automates extraction of certificate numbers, issuing authorities, and dates with clear confidence indicators (98%, 94%, 87%).
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8DDD7]">
            <AlertCircle className="w-6 h-6 text-amber-600 mb-3" />
            <h4 className="text-sm font-bold text-slate-900 mb-1">Deficiency Management</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct two-way loop allowing scrutiny officers to flag unreadable files and students to resubmit without starting over.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8DDD7]">
            <Clock className="w-6 h-6 text-[#014BAA] mb-3" />
            <h4 className="text-sm font-bold text-slate-900 mb-1">7-Stage Live Tracking</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete visibility into application progress from submission, OCR extraction, scrutiny, and screening to final disbursement.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8DDD7]">
            <Sliders className="w-6 h-6 text-indigo-600 mb-3" />
            <h4 className="text-sm font-bold text-slate-900 mb-1">Configurable Scheme Rules</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ministry officers can adjust income limits, qualifying cutoffs, and required documents dynamically through the admin rules engine.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8DDD7]">
            <BarChart3 className="w-6 h-6 text-emerald-600 mb-3" />
            <h4 className="text-sm font-bold text-slate-900 mb-1">Reports & Analytics</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time dashboards providing intake distributions, turnaround statistics, deficiency patterns, and one-click summary exports.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8DDD7]">
            <ShieldCheck className="w-6 h-6 text-[#014BAA] mb-3" />
            <h4 className="text-sm font-bold text-slate-900 mb-1">Officer Decision Autonomy</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Maintains full officer authority to confirm or override AI recommendations, ensuring rigorous statutory compliance.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#014BAA] to-[#003780] rounded-3xl p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-lg">
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Making scholarship administration simpler, faster and more transparent.
            </h3>
            <p className="text-sm sm:text-base text-blue-100 font-normal leading-relaxed">
              Join thousands of tribal scholars advancing higher education and research through Adivya.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/applicant/register"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white text-[#014BAA] hover:bg-blue-50 font-bold text-sm shadow-sm transition"
              >
                Register as an Applicant
              </Link>
              <Link
                to="/schemes"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-transparent border border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition"
              >
                Explore Scheme Guidelines
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
