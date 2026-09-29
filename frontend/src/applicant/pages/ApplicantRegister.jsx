import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MinistryEmblem, TribalCornerMotif } from '../../components/heritage/TribalPatterns';
import { User, Mail, Phone, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export const ApplicantRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    stCommunity: '',
    state: '',
    scheme: 'NFST',
    password: ''
  });

  const { loginApplicant } = useAuth();
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    loginApplicant({
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    });
    navigate('/applicant/application?scheme=' + formData.scheme);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="relative bg-white rounded-2xl p-8 border border-[#E8DDD7] shadow-md">
          <TribalCornerMotif position="top-right" />

          <div className="text-center space-y-2 mb-6">
            <MinistryEmblem className="w-12 h-12 mx-auto" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Adivya • New Student Registration
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Create Applicant Account
            </h2>
            <p className="text-xs text-slate-500">
              For Scheduled Tribe candidates applying for NFST or NOS Fellowships
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (As in ST Certificate)
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (Aadhaar Linked)
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional / Personal Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scheduled Tribe (ST) Community
                </label>
                <input
                  type="text"
                  required
                  value={formData.stCommunity}
                  onChange={(e) => setFormData({ ...formData, stCommunity: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Scheme
                </label>
                <select
                  value={formData.scheme}
                  onChange={(e) => setFormData({ ...formData, scheme: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#014BAA] focus:outline-none bg-white"
                >
                  <option value="NFST">NFST (National Fellowship for ST)</option>
                  <option value="NOS">NOS (National Overseas Scholarship)</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
              <span className="font-bold flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-[#014BAA]" />
                <span>Eligibility Self-Declaration</span>
              </span>
              <p className="text-[11px] text-slate-600">
                I hereby declare that I belong to a recognized Scheduled Tribe community and hold a valid ST certificate issued by a competent revenue authority.
              </p>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-[#014BAA] hover:bg-[#003882] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Create Account & Start Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Already have an application account?{' '}
            <Link to="/applicant/login" className="font-bold text-[#014BAA] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
