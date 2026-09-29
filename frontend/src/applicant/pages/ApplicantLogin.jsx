import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MinistryEmblem, TribalCornerMotif } from '../../components/heritage/TribalPatterns';
import { User, Lock, ArrowRight } from 'lucide-react';

export const ApplicantLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { loginApplicant } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    loginApplicant(identifier);
    navigate('/applicant/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Card */}
        <div className="relative bg-white rounded-2xl p-8 border border-[#E8DDD7] shadow-md">
          <TribalCornerMotif position="top-right" />

          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <MinistryEmblem className="w-12 h-12 mx-auto" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Adivya • Applicant Portal
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Applicant Login
            </h2>
            <p className="text-xs text-slate-500">
              Access your scholarship application, AI verification & tracking
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applicant Name / Registered Email / Mobile
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder="Enter Applicant Name (e.g. Raman, Puney) or Email"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#014BAA] focus:border-transparent bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password / OTP
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Please contact your institutional nodal officer or MoTA helpdesk for password reset.');
                  }}
                  className="text-[11px] text-[#014BAA] hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter Password or OTP"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#014BAA] focus:border-transparent bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-[#014BAA] hover:bg-[#003882] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Sign In to Applicant Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Don't have an application yet?{' '}
            <Link to="/applicant/register" className="font-bold text-[#014BAA] hover:underline">
              Register New Application
            </Link>
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-800">
            ← Return to Ministry Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
