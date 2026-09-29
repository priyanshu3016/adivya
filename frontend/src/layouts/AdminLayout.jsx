import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MinistryEmblem } from '../components/heritage/TribalPatterns';
import {
  LayoutDashboard,
  FileSpreadsheet,
  ScanLine,
  CheckCheck,
  Award,
  MessageSquare,
  BarChart3,
  Layers,
  Sliders,
  Settings,
  Search,
  Bell,
  LogOut,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';

export const AdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  useEffect(() => {
    api.getNotifications('admin').then((notifs) => {
      setUnreadNotifsCount(notifs.filter(n => !n.read).length);
    });
  }, []);

  const adminNav = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Application Scrutiny', path: '/admin/applications', icon: FileSpreadsheet },
    { label: 'AI/OCR Verification', path: '/admin/verification', icon: ScanLine, badge: 'AI' },
    { label: 'Eligibility Matrix', path: '/admin/eligibility', icon: CheckCheck },
    { label: 'Screening & Merit', path: '/admin/screening', icon: Award },
    { label: 'Deficiency & Notices', path: '/admin/communication', icon: MessageSquare },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { label: 'Scheme Management', path: '/admin/schemes', icon: Layers },
    { label: 'Configurable Rules', path: '/admin/rules', icon: Sliders },
    { label: 'Portal Settings', path: '/admin/settings', icon: Settings }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/applications?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F3F0] text-slate-900">
      {/* Admin Header */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/admin/dashboard" className="flex items-center space-x-3">
              <MinistryEmblem className="w-8 h-8" light={true} />
              <div>
                <span className="block text-sm font-black text-white tracking-wide uppercase">
                  Adivya Admin
                </span>
                <span className="block text-[10px] text-slate-400 hidden sm:inline">
                  Scrutiny & Administration Workstation
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-xs w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Application ID, Name, Scheme..."
              className="w-full bg-slate-800 text-xs text-white placeholder-slate-400 pl-9 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-[#014BAA]"
            />
          </form>

          {/* Officer profile & actions */}
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 hidden sm:flex"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <Link
              to="/admin/communication"
              className="relative p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition"
              aria-label="View notices"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400"></span>
              )}
            </Link>

            <div className="h-6 w-px bg-slate-700"></div>

            <div className="flex items-center space-x-2 text-left">
              <div className="w-8 h-8 rounded-full bg-[#014BAA] text-white flex items-center justify-center font-bold text-xs border border-blue-400">
                {currentUser?.name ? currentUser.name.trim().charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-white leading-tight">
                  {currentUser?.name || 'Admin'}
                </p>
                <p className="text-[10px] text-slate-400">
                  Admin ID: {currentUser?.adminId || '001'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace - Extreme Left Sidebar with full viewport height */}
      <div className="flex-1 flex w-full">
        {/* Desktop Admin Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-[#E8DDD7] min-h-[calc(100vh-4rem)] sticky top-16 self-start p-3 shadow-xs">
          <div className="px-3 py-2.5 mb-2 bg-slate-900 text-white rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400">Officer Console</span>
            <p className="text-xs font-bold truncate text-white mt-0.5">{currentUser?.name || 'Admin'}</p>
            <p className="text-[11px] text-slate-400">Admin ID: {currentUser?.adminId || '001'}</p>
            <p className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Active Authorization</span>
            </p>
          </div>

          <nav className="space-y-0.5 flex-1">
            {adminNav.map((item) => {
              const active = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
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
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[#E8DDD7] mt-3 px-2">
            <p className="text-[10px] text-slate-400 font-medium">
              Adivya Portal • Problem Statement ID: 26239
            </p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-slate-900/60" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-72 bg-white h-full p-4 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8DDD7]">
                  <div>
                    <span className="font-bold text-sm text-[#014BAA]">Adivya Admin Console</span>
                    <p className="text-[11px] text-slate-500">{currentUser?.name || 'Admin'} • ID: {currentUser?.adminId || '001'}</p>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 rounded text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {adminNav.map((item) => {
                    const active = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                          active ? 'bg-[#014BAA] text-white' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
