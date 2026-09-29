import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  GitBranch,
  RefreshCw,
  Building,
  GraduationCap,
  Calendar,
  FileCheck
} from 'lucide-react';

export const ApplicationStatus = () => {
  const { currentUser } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    try {
      const app = await api.getActiveApplicantApplication(currentUser?.id);
      setApplication(app);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#014BAA]"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#014BAA] mb-1">
              <GitBranch className="w-4 h-4" />
              <span>Real-Time Milestone Tracking</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Application Status & Lifecycle Timeline
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track your submission across all 7 verification and screening phases.
            </p>
          </div>
          <Button variant="cream" size="sm" onClick={loadStatus} icon={RefreshCw}>
            Refresh Progress
          </Button>
        </div>

        <div className="bg-white rounded-2xl p-12 text-center border border-[#E8DDD7] space-y-3">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No application history</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have not submitted any applications yet. When you submit an application, its real-time lifecycle tracking will appear here.
          </p>
        </div>
      </div>
    );
  }

  const timeline = application?.timeline || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#014BAA] mb-1">
            <GitBranch className="w-4 h-4" />
            <span>Real-Time Milestone Tracking</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Application Status & Lifecycle Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Application ID: <strong className="text-slate-800">{application?.id}</strong> • Track your submission across all 7 verification and screening phases.
          </p>
        </div>

        <Button variant="cream" size="sm" onClick={loadStatus} icon={RefreshCw}>
          Refresh Progress
        </Button>
      </div>

      {/* Main Timeline Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DDD7] shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DDD7]">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              7-Stage Scrutiny & Award Pathway
            </h2>
            <p className="text-xs text-slate-500">
              Scheme: <strong className="text-[#014BAA]">{application?.schemeName}</strong>
            </p>
          </div>
          <Badge variant={application?.status === 'APPROVED' ? 'approved' : application?.status === 'DEFICIENT' ? 'deficient' : 'primary'} size="lg">
            {application?.status?.replace('_', ' ')}
          </Badge>
        </div>

        {/* Vertical Timeline */}
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {timeline.map((step, idx) => {
            const isCompleted = step.status === 'COMPLETED';
            const isInProgress = step.status === 'IN_PROGRESS';
            const isPending = step.status === 'PENDING';

            return (
              <div key={idx} className="relative group">
                {/* Node icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : isInProgress
                      ? 'bg-white border-[#014BAA] text-[#014BAA] ring-4 ring-blue-100'
                      : 'bg-white border-slate-300 text-slate-300'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : isInProgress ? (
                    <div className="w-2 h-2 rounded-full bg-[#014BAA] animate-ping" />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">{idx + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className={`p-4 rounded-xl border transition-all ${
                  isInProgress ? 'bg-blue-50/50 border-blue-200 shadow-xs' : 'bg-[#F8F3F0]/60 border-[#E8DDD7]'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h3 className={`text-sm font-bold ${isInProgress ? 'text-[#014BAA]' : 'text-slate-900'}`}>
                      {idx + 1}. {step.stage}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-400 text-[11px]">{step.date}</span>
                      <Badge variant={isCompleted ? 'verified' : isInProgress ? 'review' : 'default'} size="sm">
                        {step.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    {step.note}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Officer Remarks Box */}
        {application?.officerRemarks && (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-slate-800">Latest Ministry Officer Remarks:</span>
            <p className="text-xs text-slate-600 italic">
              "{application.officerRemarks}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
