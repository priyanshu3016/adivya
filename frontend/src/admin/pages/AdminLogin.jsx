import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MinistryEmblem, TribalCornerMotif } from '../../components/heritage/TribalPatterns';
import { ShieldCheck, Lock, User, ArrowRight } from 'lucide-react';

export const AdminLogin = () => {
  const [officerId, setOfficerId] = useState('');
  const [secretPin, setSecretPin] = useState('');
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    loginAdmin(officerId);
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="relative bg-white rounded-2xl p-8 border border-[#E8DDD7] shadow-md">
          <TribalCornerMotif position="top-right" />

          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-7 h-7 text-amber-400" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Adivya • Administrative Portal
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Officer Scrutiny Console
            </h2>
            <p className="text-xs text-slate-500">
              For designated Section Officers, Scrutiny Desk & Screening Board
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Name / Officer SSO ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  required
                  placeholder="Enter Admin Name (e.g. Amit Kumar)"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#014BAA] bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Security PIN / Digital Token
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={secretPin}
                  onChange={(e) => setSecretPin(e.target.value)}
                  required
                  placeholder="Enter Security PIN"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#014BAA] bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <span>Authenticate & Enter Ministry Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Are you a student applicant?{' '}
            <Link to="/applicant/login" className="font-bold text-[#014BAA] hover:underline">
              Go to Applicant Portal
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
