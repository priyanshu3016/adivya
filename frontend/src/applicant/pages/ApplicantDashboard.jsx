import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { TribalCornerMotif } from '../../components/heritage/TribalPatterns';
import {
  FileText,
  AlertTriangle,
  Cpu,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Upload,
  Eye,
  GraduationCap,
  ShieldCheck,
  RefreshCw,
  Bell,
  FilePlus
} from 'lucide-react';

export const ApplicantDashboard = () => {
  const { currentUser, sessionApplication } = useAuth();
  const [application, setApplication] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const app = await api.getActiveApplicantApplication(currentUser?.id);
        setApplication(app || null);
        if (app?.id) {
          const notifs = await api.getNotifications('applicant', app.id);
          setNotifications(notifs);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser, sessionApplication]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#014BAA]"></div>
      </div>
    );
  }

  const hasDeficiency = application?.status === 'DEFICIENT' || (application?.deficiencies && application.deficiencies.some(d => d.status === 'OPEN'));

  const stages = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'UNDER_VERIFICATION', label: 'AI/Doc Verification' },
    { key: 'ELIGIBLE', label: 'Eligibility' },
    { key: 'SCRUTINY', label: 'Scrutiny' },
    { key: 'SCREENED', label: 'Screening' },
    { key: 'APPROVED', label: 'Awarded' }
  ];

  let currentStageIndex = 0;
  if (application?.status === 'SUBMITTED') currentStageIndex = 0;
  if (application?.status === 'UNDER_VERIFICATION' || application?.status === 'DEFICIENT') currentStageIndex = 1;
  if (application?.status === 'ELIGIBLE') currentStageIndex = 2;
  if (application?.status === 'SCRUTINY') currentStageIndex = 3;
  if (application?.status === 'SCREENED') currentStageIndex = 4;
  if (application?.status === 'APPROVED') currentStageIndex = 5;

  return (
    <div className="space-y-6">
      {/* 1. WELCOME BANNER */}
      <div className="relative bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DDD7] shadow-xs overflow-hidden">
        <TribalCornerMotif position="top-right" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#014BAA]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Online Session Active</span>
              <span className="text-slate-300">•</span>
              <span>Scheduled Tribe Beneficiary Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Welcome, {currentUser?.name || (application?.applicantName || 'Applicant')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {application ? (
                <>Application ID: <strong className="text-slate-800">{application.id}</strong> • Scheme: <strong className="text-[#014BAA]">{application.schemeName}</strong></>
              ) : (
                'No applications yet. Submit an application to view live tracking and document verification.'
              )}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {application ? (
              <Link
                to="/applicant/status"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#014BAA] text-white text-xs font-semibold hover:bg-[#003882] transition shadow-xs"
              >
                <span>Detailed Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to="/applicant/application"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#014BAA] text-white text-xs font-semibold hover:bg-[#003882] transition shadow-xs"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>Start Application</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. CRITICAL DEFICIENCY ALERT (If Deficient) */}
      {hasDeficiency && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Action Required: Scrutiny Officer Raised a Deficiency
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 max-w-2xl leading-relaxed">
                One or more uploaded certificates require resubmission. Please review the officer remarks and upload a fresh, clear document.
              </p>
            </div>
          </div>

          <Link
            to="/applicant/deficiencies"
            className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition"
          >
            Review & Resubmit Now →
          </Link>
        </div>
      )}

      {/* 3. APPLICATION PROGRESS INDICATOR */}
      <Card title="Application Lifecycle Progress" subtitle="Multi-stage verification and selection tracking">
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {stages.map((stage, idx) => {
              if (!application) {
                // Inactive / neutral / disabled state when NO application submitted
                return (
                  <div
                    key={stage.key}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-center transition-all"
                  >
                    <div className="flex items-center justify-center mb-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    </div>
                    <p className="text-[11px] leading-tight text-slate-500 font-medium">{stage.label}</p>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block mt-0.5 font-semibold">
                      Pending
                    </span>
                  </div>
                );
              }

              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div
                  key={stage.key}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? hasDeficiency
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                        : 'bg-blue-50 border-[#014BAA] text-[#014BAA] font-bold shadow-xs'
                      : isPast
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1.5">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isCurrent ? (
                      hasDeficiency ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#014BAA] animate-ping"></div>
                      )
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    )}
                  </div>
                  <p className="text-[11px] leading-tight">{stage.label}</p>
                  <span className="text-[9px] uppercase tracking-wider opacity-70 block mt-0.5">
                    {isPast ? 'Done' : isCurrent ? (hasDeficiency ? 'Action Needed' : 'Active') : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-[#E8DDD7]">
            {application ? (
              <>
                <span>Current Status: <strong className="text-slate-800">{application?.status?.replace('_', ' ')}</strong></span>
                <span>Last Updated: <strong className="text-slate-800">{new Date(application?.lastUpdatedAt || application?.submittedAt || Date.now()).toLocaleDateString()}</strong></span>
              </>
            ) : (
              <>
                <span className="font-semibold text-slate-700">No active application</span>
                <span className="text-slate-500">Submit an application to begin tracking your progress.</span>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* 4. THREE MAIN COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Application Summary & Verification */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Details Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DDD7] pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-[#014BAA]" />
                <span>Fellowship Registration Summary</span>
              </h3>
              {application && (
                <Badge variant={application.status === 'APPROVED' ? 'approved' : hasDeficiency ? 'deficient' : 'primary'}>
                  {application.status}
                </Badge>
              )}
            </div>

            {application ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Candidate Name:</span>
                  <span className="font-semibold text-slate-800">{application.applicantName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tribal Community:</span>
                  <span className="font-semibold text-slate-800">{application.subTribe || 'ST'} ({application.state})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Enrolled Program:</span>
                  <span className="font-semibold text-slate-800">{application.courseType} in {application.discipline}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Host Institution:</span>
                  <span className="font-semibold text-slate-800">{application.institution}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Annual Family Income:</span>
                  <span className="font-semibold text-slate-800">₹{application.annualFamilyIncome?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Bank Account (DBT Linked):</span>
                  <span className="font-semibold text-slate-800">{application.bankDetails?.bankName} ({application.bankDetails?.accountNumber})</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                <p>No applications yet</p>
                <Link to="/applicant/application" className="mt-2 inline-block font-bold text-[#014BAA] hover:underline">
                  Start an Application →
                </Link>
              </div>
            )}

            {application && (
              <div className="pt-2 flex flex-wrap gap-2">
                <Link
                  to="/applicant/documents"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"
                >
                  <FileText className="w-3.5 h-3.5 text-[#014BAA]" />
                  <span>View {application?.documents?.length || 0} Uploaded Documents</span>
                </Link>
                <Link
                  to="/applicant/verification"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-[#014BAA] hover:bg-blue-100 text-xs font-semibold"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>AI/OCR Verification Breakdown</span>
                </Link>
              </div>
            )}
          </div>

          {/* Document Verification Health */}
          <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Document Status Health</span>
              </span>
              <span className="text-xs font-normal text-slate-500">
                {application?.documents ? `${application.documents.filter(d => d.status === 'VERIFIED').length} of ${application.documents.length} Verified` : 'No documents uploaded yet'}
              </span>
            </h3>

            {application?.documents && application.documents.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {application.documents.map((doc) => (
                  <div key={doc.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{doc.type}</p>
                      <p className="text-[10px] text-slate-400">{doc.filename} • {doc.size}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-semibold text-slate-500">
                        OCR: {doc.confidence}%
                      </span>
                      <Badge variant={doc.status === 'VERIFIED' ? 'verified' : doc.status === 'NEEDS_RESUBMISSION' ? 'deficient' : 'review'}>
                        {doc.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center">No documents uploaded yet</p>
            )}
          </div>
        </div>

        {/* Col 3: Notifications & Important Dates */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 border border-[#E8DDD7] shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quick Actions
            </h4>
            <div className="space-y-2">
              <Link
                to="/applicant/application"
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-[#014BAA] hover:bg-slate-50 text-xs font-semibold text-slate-800 transition"
              >
                <div className="flex items-center space-x-2">
                  <FilePlus className="w-4 h-4 text-[#014BAA]" />
                  <span>Start New Application</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/applicant/schemes"
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-[#014BAA] hover:bg-slate-50 text-xs font-semibold text-slate-800 transition"
              >
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-[#014BAA]" />
                  <span>Explore Schemes</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/applicant/documents"
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-[#014BAA] hover:bg-slate-50 text-xs font-semibold text-slate-800 transition"
              >
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-[#014BAA]" />
                  <span>Upload Certificates</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Important Dates */}
          <div className="bg-white rounded-2xl p-5 border border-[#E8DDD7] shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#014BAA]" />
              <span>Important Dates</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F8F3F0] border border-[#E8DDD7]">
                <p className="font-semibold text-slate-900">Application Window Closes</p>
                <p className="text-slate-500 text-[11px]">31 October 2026 (11:59 PM IST)</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F3F0] border border-[#E8DDD7]">
                <p className="font-semibold text-slate-900">Screening Committee Sitting</p>
                <p className="text-slate-500 text-[11px]">Second week of November 2026</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F8F3F0] border border-[#E8DDD7]">
                <p className="font-semibold text-slate-900">Sanction Letter Release</p>
                <p className="text-slate-500 text-[11px]">December 2026</p>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-[#E8DDD7] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>Recent Alerts</span>
              </h4>
              <Link to="/applicant/notifications" className="text-[11px] text-[#014BAA] hover:underline">
                View all
              </Link>
            </div>

            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <p className="font-bold text-slate-800 text-[11px]">{n.title}</p>
                    <p className="text-slate-600 text-[10px] mt-0.5 line-clamp-2">{n.message}</p>
                    <span className="text-[9px] text-slate-400 mt-1 block">{n.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center">No new notifications</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
