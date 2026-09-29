import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Layers,
  GraduationCap,
  Globe,
  Sliders,
  Files,
  ArrowRight,
  Eye,
  CheckCircle2,
  Calendar,
  IndianRupee
} from 'lucide-react';

export const AdminSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspectScheme, setInspectScheme] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getSchemes(), api.getApplications()]).then(([sch, apps]) => {
      setSchemes(sch);
      setApplications(apps);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#014BAA]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#014BAA] mb-1">
            <Layers className="w-4 h-4" />
            <span>Central Sector Scheme Portfolio</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Scheme Administration & Quota Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure fellowship intake caps, mandatory document checklists, and policy guidelines.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/admin/rules')}
          icon={Sliders}
        >
          Configure Rules Engine
        </Button>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schemes.map((scheme) => {
          const count = applications.filter((a) => a.scheme === scheme.code).length;
          return (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-3 rounded-xl ${
                        scheme.code === 'NFST' ? 'bg-blue-50 text-[#014BAA]' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {scheme.code === 'NFST' ? <GraduationCap className="w-6 h-6" /> : <Globe className="w-6 h-6" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">{scheme.code} Scheme</span>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{scheme.name}</h3>
                    </div>
                  </div>
                  <Badge variant="verified">ACTIVE CYCLE</Badge>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {scheme.shortDesc}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-[#F8F3F0] rounded-xl border border-[#E8DDD7]">
                    <span className="text-slate-500 block text-[11px]">Applications in Queue:</span>
                    <strong className="text-base text-slate-900 font-bold">{count} Submissions</strong>
                  </div>
                  <div className="p-3 bg-[#F8F3F0] rounded-xl border border-[#E8DDD7]">
                    <span className="text-slate-500 block text-[11px]">Sanctioned Annual Quota:</span>
                    <strong className="text-base text-[#014BAA] font-bold">{scheme.annualSlots} Slots</strong>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Income Limit:</span>
                    <span className="font-semibold">{scheme.qualifyingCriteria.maxIncome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Academic Threshold:</span>
                    <span className="font-semibold">{scheme.qualifyingCriteria.minMarks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Application Window Closes:</span>
                    <span className="font-semibold text-rose-600">{scheme.deadline}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1.5">
                    Configured Mandatory Documents ({scheme.requiredDocuments.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {scheme.requiredDocuments.map((doc, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        ✓ {doc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E8DDD7] grid grid-cols-3 gap-2">
                <Button
                  variant="cream"
                  size="sm"
                  onClick={() => setInspectScheme(scheme)}
                  icon={Eye}
                >
                  View Scheme
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/admin/rules')}
                  icon={Sliders}
                >
                  Edit Rules
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => alert(`Document checklist for ${scheme.code} is synchronized with OCR extraction pipeline.`)}
                  icon={Files}
                >
                  Documents
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scheme Detail Modal */}
      <Modal
        isOpen={!!inspectScheme}
        onClose={() => setInspectScheme(null)}
        title={inspectScheme?.name}
        subtitle={`Scheme Code: ${inspectScheme?.code} • Adivya Scheme Registry`}
        footer={
          <Button variant="primary" onClick={() => setInspectScheme(null)}>
            Close Overview
          </Button>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-700 leading-relaxed text-sm">{inspectScheme?.shortDesc}</p>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
            <strong>Financial Assistance Package:</strong>
            <p className="text-xs text-slate-700">{inspectScheme?.financialBenefits}</p>
          </div>
          <div className="space-y-2">
            <strong className="block text-slate-800">Mandatory Application Prerequisites:</strong>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Belonging to recognized Scheduled Tribe (ST) community.</li>
              <li>Academic requirement: {inspectScheme?.qualifyingCriteria.minMarks}</li>
              <li>Annual family income: {inspectScheme?.qualifyingCriteria.maxIncome}</li>
              <li>Age criteria: {inspectScheme?.qualifyingCriteria.maxAge}</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};
