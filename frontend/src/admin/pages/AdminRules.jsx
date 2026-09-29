import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Sliders, Save, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AdminRules = () => {
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('NFST');

  useEffect(() => {
    api.getRules().then((data) => {
      setRules(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateRules(activeTab, rules[activeTab]);
      alert(`Configurable rules for ${activeTab} updated successfully! Eligibility checks will now use these updated parameters.`);
    } catch (err) {
      alert('Error updating rules: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !rules) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#014BAA]"></div>
      </div>
    );
  }

  const activeRuleSet = rules[activeTab];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8DDD7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#014BAA] mb-1">
            <Sliders className="w-4 h-4" />
            <span>Dynamic Eligibility Engine Parameters</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Configurable Scheme Rules & Cutoffs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Adjust qualifying percentages, annual income limits, and statutory thresholds without code modifications.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          loading={saving}
          onClick={handleSave}
          icon={Save}
        >
          Save & Apply Rules
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[#E8DDD7] pb-2">
        <button
          onClick={() => setActiveTab('NFST')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'NFST' ? 'bg-[#014BAA] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          NFST (Domestic Fellowship)
        </button>
        <button
          onClick={() => setActiveTab('NOS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'NOS' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          NOS (National Overseas Scholarship)
        </button>
      </div>

      {/* Rule Configuration Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DDD7] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8DDD7] pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Active Parameters for {activeTab === 'NFST' ? 'National Fellowship for ST (NFST)' : 'National Overseas Scholarship (NOS)'}
            </h3>
            <p className="text-xs text-slate-500">Changes reflect immediately across applicant eligibility evaluation matrices.</p>
          </div>
          <Badge variant="verified">RULE ENGINE V2</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          {/* Rule: Income Ceiling */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Maximum Family Income Ceiling (₹ / Annum)
            </label>
            <input
              type="number"
              value={activeRuleSet.maxFamilyIncome}
              onChange={(e) =>
                setRules({
                  ...rules,
                  [activeTab]: { ...activeRuleSet, maxFamilyIncome: Number(e.target.value) }
                })
              }
              className="w-full px-3 py-2 border rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#014BAA]"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Candidates above this limit are flagged INELIGIBLE</span>
          </div>

          {/* Rule: Minimum Qualifying Percentage */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Minimum Qualifying Examination Score (%)
            </label>
            <input
              type="number"
              value={activeTab === 'NFST' ? activeRuleSet.minPostGradPercentage : activeRuleSet.minGradPercentage}
              onChange={(e) => {
                const key = activeTab === 'NFST' ? 'minPostGradPercentage' : 'minGradPercentage';
                setRules({
                  ...rules,
                  [activeTab]: { ...activeRuleSet, [key]: Number(e.target.value) }
                })
              }}
              className="w-full px-3 py-2 border rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#014BAA]"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Cutoff threshold for academic screening</span>
          </div>

          {/* Rule: Age Limit */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Age Limit (Years)
            </label>
            <input
              type="number"
              value={activeTab === 'NFST' ? activeRuleSet.maxAgeMale : activeRuleSet.maxAge}
              onChange={(e) => {
                const key = activeTab === 'NFST' ? 'maxAgeMale' : 'maxAge';
                setRules({
                  ...rules,
                  [activeTab]: { ...activeRuleSet, [key]: Number(e.target.value) }
                })
              }}
              className="w-full px-3 py-2 border rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#014BAA]"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Relaxations apply for female/PwD candidates per policy</span>
          </div>

          {/* NOS-Specific Rule: QS Rank Threshold */}
          {activeTab === 'NOS' && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Maximum Permissible QS World University Ranking
              </label>
              <input
                type="number"
                value={activeRuleSet.maxRankQsWorld || 500}
                onChange={(e) =>
                  setRules({
                    ...rules,
                    [activeTab]: { ...activeRuleSet, maxRankQsWorld: Number(e.target.value) }
                  })
                }
                className="w-full px-3 py-2 border rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#014BAA]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Offer letters from universities below this rank are excluded</span>
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-[#014BAA] shrink-0 mt-0.5" />
          <div>
            <strong className="block">Audited Administrative Governance</strong>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Every parameter update is cryptographically logged in the Ministry audit trail with the Officer SSO ID timestamp to maintain transparent accountability.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#E8DDD7]">
          <Button type="submit" variant="primary" loading={saving} icon={Save}>
            Save Changes to {activeTab} Rules
          </Button>
        </div>
      </form>
    </div>
  );
};
