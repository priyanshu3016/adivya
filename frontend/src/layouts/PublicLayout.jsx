import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { MinistryEmblem, TribalBorderRibbon } from '../components/heritage/TribalPatterns';
import { Menu, X, ArrowRight, ShieldCheck, User } from 'lucide-react';

export const PublicLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Schemes', path: '/schemes' },
    { name: 'How It Works', path: '/how-it-works' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F3F0] text-slate-900">
      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8DDD7] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Emblem */}
            <Link to="/" className="flex items-center space-x-3.5 group">
              <MinistryEmblem className="w-12 h-12 shrink-0 group-hover:scale-105 transition-transform" />
              <div>
                <span className="block text-2xl font-black text-[#014BAA] tracking-tight leading-tight">
                  Adivya
                </span>
                <span className="block text-[11px] text-slate-500 font-medium">
                  Scholarship & Fellowship Management System
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-[#014BAA] bg-[#014BAA]/8 font-semibold'
                      : 'text-slate-600 hover:text-[#014BAA] hover:bg-slate-100/60'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* CTAs */}
            <div className="hidden sm:flex items-center space-x-3">
              <Link
                to="/applicant/login"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg text-[#014BAA] border border-[#014BAA] hover:bg-[#014BAA]/5 transition"
              >
                <User className="w-3.5 h-3.5" />
                <span>Applicant Portal</span>
              </Link>
              <Link
                to="/admin/login"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-[#014BAA] text-white hover:bg-[#003882] shadow-xs transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </Link>
            </div>

            {/* Mobile menu trigger */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E8DDD7] bg-white px-4 pt-3 pb-5 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path) ? 'bg-[#014BAA]/10 text-[#014BAA]' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2">
              <Link
                to="/applicant/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-1.5 py-2.5 text-xs font-semibold rounded-lg text-[#014BAA] border border-[#014BAA]"
              >
                <User className="w-3.5 h-3.5" />
                <span>Applicant</span>
              </Link>
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-1.5 py-2.5 text-xs font-semibold rounded-lg bg-[#014BAA] text-white"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-12 border-t border-slate-800">
        <TribalBorderRibbon className="opacity-20 mb-8" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Ministry Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <MinistryEmblem className="w-10 h-10" light={true} />
                <div>
                  <h4 className="text-white font-bold text-base leading-tight">
                    Adivya
                  </h4>
                  <p className="text-xs text-slate-400">Scholarship & Fellowship Management System</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                Unified digital platform for transparent, AI-assisted verification, screening and DBT disbursement of higher education scholarships & fellowships (NFST & NOS) dedicated to Scheduled Tribe students.
              </p>
              <div className="pt-2 text-xs text-amber-400/90 font-medium">
                Smart India Hackathon 2026 • Problem Statement ID: 26239
              </div>
            </div>

            {/* Col 2: Schemes */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                Flagship Schemes
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/schemes" className="hover:text-white transition">
                    National Fellowship for ST (NFST)
                  </Link>
                </li>
                <li>
                  <Link to="/schemes" className="hover:text-white transition">
                    National Overseas Scholarship (NOS)
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-white transition">
                    AI-Assisted Verification Guide
                  </Link>
                </li>
                <li>
                  <Link to="/applicant/deficiencies" className="hover:text-white transition">
                    Deficiency Resubmission
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Portal Access & Support */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
                Portals & Helpdesk
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/applicant/login" className="hover:text-white transition">
                    Applicant Registration / Login
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="hover:text-white transition">
                    Admin Scrutiny Portal
                  </Link>
                </li>
                <li className="text-slate-400 pt-2">
                  Toll-Free Helpline: <span className="text-slate-200 font-semibold">1800-11-7788</span>
                </li>
                <li className="text-slate-400">
                  Email: <span className="text-slate-200">fellowship-tribal@gov.in</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 Adivya. All Rights Reserved.</p>
            <p className="flex items-center space-x-4">
              <span>Standardized under SIH 2026 Framework</span>
              <span>•</span>
              <span>Accessibility Compliant</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
