import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Bell, CheckCircle2, AlertTriangle, Info, ArrowRight } from 'lucide-react';

export const ApplicantNotifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const notifs = await api.getNotifications('applicant', currentUser?.id);
        setNotifications(notifs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Official Notifications & Alerts
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          System and scrutiny officer communications regarding your scholarship application.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E8DDD7] space-y-3">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No new notifications</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You are all caught up! Updates regarding scrutiny, deficiency alerts, and screening decisions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl bg-white border transition-all ${
                n.type === 'warning'
                  ? 'border-amber-300 bg-amber-50/20'
                  : n.type === 'success'
                  ? 'border-emerald-200'
                  : 'border-[#E8DDD7]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      n.type === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : n.type === 'success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-[#014BAA]'
                    }`}
                  >
                    {n.type === 'warning' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : n.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">{n.date}</span>
                  </div>
                </div>

                {n.link && (
                  <Link
                    to={n.link}
                    className="shrink-0 inline-flex items-center space-x-1 text-xs font-semibold text-[#014BAA] hover:underline"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
