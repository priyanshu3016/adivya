import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MinistryEmblem, TribalBorderRibbon } from '../components/heritage/TribalPatterns';
import {
  LayoutDashboard,
  GraduationCap,
  FilePlus,
  Files,
  Cpu,
  AlertTriangle,
  GitBranch,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';

export const ApplicantLayout = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  useEffect(() => {
    api.getNotifications('applicant', currentUser?.id).then((notifs) => {
      setUnreadNotifsCount(notifs.filter(n => !n.read).length);
    });
  }, [currentUser]);

  const navItems = [
    { label: 'Dashboard', path: '/applicant/dashboard', icon: LayoutDashboard },
    { label: 'Explore Schemes', path: '/applicant/schemes', icon: GraduationCap },
    { label: 'New Application', path: '/applicant/application', icon: FilePlus },
    { label: 'My Documents', path: '/applicant/documents', icon: Files },
    { label: 'AI Verification', path: '/applicant/verification', icon: Cpu, badge: 'AI/OCR' },
    { label: 'Deficiencies', path: '/applicant/deficiencies', icon: AlertTriangle },
    { label: 'Track Status', path: '/applicant/status', icon: GitBranch },
    { label: 'Notifications', path: '/applicant/notifications', icon: Bell },
    { label: 'My Profile', path: '/applicant/profile', icon: User }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F3F0] text-slate-900">
      {/* Main Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E8DDD7] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/applicant/dashboard" className="flex items-center space-x-2.5">
              <MinistryEmblem className="w-8 h-8" />
              <div>
                <span className="block text-sm font-black text-[#014BAA]">
                  Adivya
                </span>
                <span className="block text-[10px] text-slate-500 hidden sm:inline">
                  Applicant Portal
                </span>
              </div>
            </Link>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              to="/"
              className="text-xs text-slate-500 hover:text-[#014BAA] flex items-center space-x-1 hidden sm:flex"
            >
              <span>Public Portal</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <Link
              to="/applicant/notifications"
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
              )}
            </Link>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#014BAA] text-white flex items-center justify-center font-bold text-xs">
                {currentUser?.name ? currentUser.name.trim().charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser?.name || 'Applicant'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-[#E8DDD7] p-4 shadow-xs space-y-1">
            <div className="px-3 py-2 mb-2 bg-[#F8F3F0] rounded-xl border border-[#E8DDD7]">
              <span className="text-[10px] uppercase font-bold text-slate-500">Active Account</span>
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name || 'Applicant'}</p>
              <p className="text-[11px] text-[#014BAA] font-semibold">{currentUser?.scheme ? `${currentUser.scheme} Applicant` : 'Student Portal'}</p>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      active
                        ? 'bg-[#014BAA] text-white shadow-xs'
                        : 'text-slate-700 hover:bg-[#F8F3F0] hover:text-[#014BAA]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && !active && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-[#014BAA] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#E8DDD7] mt-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <span className="font-bold flex items-center space-x-1">
                  <span>Tribal Student Helpdesk</span>
                </span>
                <p className="text-slate-600 text-[10px]">Toll-Free: 1800-11-7788</p>
                <p className="text-slate-600 text-[10px]">support-tribal@gov.in</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-slate-900/60" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-72 bg-white h-full p-4 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD7]">
                  <span className="font-bold text-sm text-[#014BAA]">Applicant Menu</span>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 rounded text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const active = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                          active ? 'bg-[#014BAA] text-white' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
