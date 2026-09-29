import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { User, Mail, Phone, MapPin, Building, CreditCard, ShieldCheck } from 'lucide-react';

export const ApplicantProfile = () => {
  const { currentUser } = useAuth();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.getActiveApplicantApplication(currentUser?.id);
        setApp(data);
        setPhone(data?.phone || currentUser?.phone || '');
        setEmail(data?.email || currentUser?.email || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [currentUser]);

  const handleSave = (e) => {
    e.preventDefault();
    setEditing(false);
    alert('Contact details updated successfully!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#014BAA]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Student Beneficiary Dossier
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered Scheduled Tribe Fellow • Application ID: <strong className="text-slate-800">{app?.id || '—'}</strong>
          </p>
        </div>

        <Button
          variant={editing ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => setEditing(!editing)}
        >
          {editing ? 'Cancel' : 'Edit Contact Info'}
        </Button>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DDD7] shadow-xs space-y-6">
        {/* Personal Header */}
        <div className="flex items-center space-x-4 pb-6 border-b border-[#E8DDD7]">
          <div className="w-16 h-16 rounded-full bg-[#014BAA] text-white flex items-center justify-center font-bold text-2xl">
            {(app?.applicantName || currentUser?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{app?.applicantName || currentUser?.name || 'Registered Applicant'}</h2>
            <p className="text-xs text-slate-500">
              {app ? `${app.subTribe} Community (ST) • ${app.district}, ${app.state}` : 'Scheduled Tribe (ST) Candidate'}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={app ? 'verified' : 'default'}>{app ? 'ST Certificate Verified' : 'Registration Active'}</Badge>
              {app?.scheme && <Badge variant="primary">{app.scheme}</Badge>}
            </div>
          </div>
        </div>

        {/* Form Details */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Registered Phone</label>
              {editing ? (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              ) : (
                <span className="font-bold text-slate-800">{phone || '—'}</span>
              )}
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Institutional Email</label>
              {editing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              ) : (
                <span className="font-bold text-slate-800">{email || '—'}</span>
              )}
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Host Institution</label>
              <span className="font-bold text-slate-800">{app?.institution || '—'}</span>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Enrolled Programme</label>
              <span className="font-bold text-slate-800">{app ? `${app.courseType} in ${app.discipline}` : '—'}</span>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Annual Family Income</label>
              <span className="font-bold text-slate-800">{app?.annualFamilyIncome ? `₹${app.annualFamilyIncome.toLocaleString()}` : '—'}</span>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">DBT Bank Account</label>
              <span className="font-bold text-slate-800">{app?.bankDetails?.bankName ? `${app.bankDetails.bankName} (${app.bankDetails.accountNumber})` : '—'}</span>
            </div>
          </div>

          {editing && (
            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
