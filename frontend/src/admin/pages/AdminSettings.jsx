import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Settings, ShieldCheck, Database, Lock, History, RefreshCw } from 'lucide-react';

export const AdminSettings = () => {
  const { currentUser, resetAllDemoData } = useAuth();

  const auditLogs = [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#014BAA] mb-1">
          <Settings className="w-4 h-4" />
          <span>System & Ministry Configuration</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Portal Administration & Security Audit
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Ministry authentication credentials, security parameters, and immutable access logs.
        </p>
      </div>

      {/* Officer Credential Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-[#E8DDD7] pb-3">
          Authenticated Scrutiny Officer
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Officer Name:</span>
            <strong className="text-slate-900">{currentUser?.name || 'Admin'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Admin ID:</span>
            <strong className="text-slate-900">{currentUser?.adminId || '001'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Designation:</span>
            <strong className="text-slate-900">{currentUser?.designation || 'Admin'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Department / Authority:</span>
            <strong className="text-slate-900">Adivya Administration</strong>
          </div>
          <div>
            <span className="text-slate-500 block">SSO Email:</span>
            <strong className="text-slate-900">{currentUser?.email || 'admin@adivya.gov.in'}</strong>
          </div>
        </div>
      </div>

      {/* Security Audit Trail */}
      <div className="bg-white rounded-2xl border border-[#E8DDD7] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E8DDD7] flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <History className="w-4 h-4 text-slate-600" />
            <span>Cryptographic Ministry Scrutiny Audit Trail</span>
          </h3>
          <span className="text-[11px] text-emerald-700 font-semibold">Active Integrity Guard</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No audit logs recorded</p>
            <p className="text-xs text-slate-400 mt-1">Administrative actions and scrutiny events will be logged here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <p className="font-bold text-slate-800">{log.action}</p>
                  <p className="text-[10px] text-slate-400">Initiated by: {log.user} ({log.ip})</p>
                </div>
                <div className="text-right">
                  <Badge variant="verified">{log.status}</Badge>
                  <span className="text-[10px] text-slate-400 block mt-1">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
