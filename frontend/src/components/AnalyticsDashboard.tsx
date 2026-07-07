import React, { useState, useEffect } from 'react';
import { api, type DepartmentPerformance, type InventorPerformance, type ForecastItem, type RiskDetail } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader } from './Loader';
import { 
  Brain, 
  BarChart, 
  Users, 
  AlertOctagon, 
  TrendingUp, 
  CornerDownRight, 
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Data States
  const [deptPerf, setDeptPerf] = useState<DepartmentPerformance[]>([]);
  const [facultyPerf, setFacultyPerf] = useState<InventorPerformance[]>([]);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [risks, setRisks] = useState<RiskDetail[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<'ai' | 'rankings'>('ai');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load standard APIs
      const [yearlyRes, forecastRes, riskRes, facultyRes] = await Promise.all([
        api.getYearlyTrends(),
        api.getAIForecast(),
        api.getAIRisks(),
        api.getFacultyRankings()
      ]);
      
      setForecast(forecastRes);
      setRisks(riskRes);
      setFacultyPerf(facultyRes);
      setYearlyData(yearlyRes);
      
      // Load department comparison if Admin or Auditor
      if (user?.role === 'super_admin' || user?.role === 'management_viewer') {
        const deptRes = await api.getDepartmentComparison();
        setDeptPerf(deptRes);
      }
    } catch (err) {
      console.error("Failed to load analytics panel:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <Loader />;
  }

  // Combine historical and forecasted data for double-plot forecast chart
  const combinedChartData = [
    ...yearlyData.map(d => ({
      year: String(d.year),
      'Actual Filings': d.filings,
      'Actual Grants': d.grants,
      'Predicted Filings': null,
      'Predicted Grants': null
    })),
    // Link the last actual year to forecast to make curves contiguous
    ...(yearlyData.length > 0 ? [{
      year: String(yearlyData[yearlyData.length - 1].year),
      'Actual Filings': yearlyData[yearlyData.length - 1].filings,
      'Actual Grants': yearlyData[yearlyData.length - 1].grants,
      'Predicted Filings': yearlyData[yearlyData.length - 1].filings,
      'Predicted Grants': yearlyData[yearlyData.length - 1].grants,
    }] : []),
    ...forecast.map(f => ({
      year: String(f.year),
      'Actual Filings': null,
      'Actual Grants': null,
      'Predicted Filings': f.predicted_filings,
      'Predicted Grants': f.predicted_grants
    }))
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics</h2>
          <p className="text-slate-500 text-sm mt-1">AI-driven predictive forecasting, risk evaluation, and innovation indexes</p>
        </div>

        {/* Panel Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-lg border border-slate-200 no-print">
          <button
            onClick={() => setActivePanel('ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activePanel === 'ai' 
                ? 'bg-brand-500 text-white shadow-sm' 
                : 'text-slate-600 hover:text-brand-650'
            }`}
          >
            <Brain size={14} />
            <span>AI Projections & Risks</span>
          </button>
          <button
            onClick={() => setActivePanel('rankings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activePanel === 'rankings' 
                ? 'bg-brand-500 text-white shadow-sm' 
                : 'text-slate-600 hover:text-brand-650'
            }`}
          >
            <Users size={14} />
            <span>Innovation Performance Rankings</span>
          </button>
        </div>
      </div>

      {activePanel === 'ai' ? (
        <div className="space-y-8">
          
          {/* AI Forecast Area Chart */}
          <div className="glass-panel p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-brand-500" />
              <h3 className="text-lg font-bold font-display text-slate-950">AI Trend Forecasting Engine</h3>
            </div>
            <p className="text-slate-500 text-xs mb-6">
              Polynomial regression forecasting showing filing & grant trajectories projected 3 years ahead
            </p>
 
            <div className="h-80 w-full">
              {combinedChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={combinedChartData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                      labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    {/* Historical Curves */}
                    <Line 
                      name="Actual Filings" 
                      type="monotone" 
                      dataKey="Actual Filings" 
                      stroke="#6B1E2B" 
                      strokeWidth={2.5} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }} 
                    />
                    <Line 
                      name="Actual Grants" 
                      type="monotone" 
                      dataKey="Actual Grants" 
                      stroke="#16A34A" 
                      strokeWidth={2.5} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }} 
                    />
                    {/* Forecasted Curves */}
                    <Line 
                      name="Predicted Filings (AI)" 
                      type="monotone" 
                      dataKey="Predicted Filings" 
                      stroke="#6B1E2B" 
                      strokeWidth={2.5} 
                      strokeDasharray="6 6"
                      dot={{ r: 3, fill: '#6B1E2B' }}
                    />
                    <Line 
                      name="Predicted Grants (AI)" 
                      type="monotone" 
                      dataKey="Predicted Grants" 
                      stroke="#16A34A" 
                      strokeWidth={2.5} 
                      strokeDasharray="6 6"
                      dot={{ r: 3, fill: '#16A34A' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                  Insufficient data to plot forecast curves.
                </div>
              )}
            </div>
          </div>

          {/* AI Risk Assessment panel */}
          <div className="glass-panel p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={18} className="text-red-500" />
              <h3 className="text-lg font-bold font-display text-slate-950">AI Stalled Patent Risk Alerts</h3>
            </div>
            <p className="text-slate-500 text-xs mb-6">
              AI scanning of patents under examination and draft preparation stages flagging delay bottle-necks
            </p>

            {risks.length > 0 ? (
              <div className="space-y-4">
                {risks.map((risk) => (
                  <div 
                    key={risk.patent_id}
                    className={`p-5 rounded-xl border flex flex-col md:flex-row justify-between gap-4 items-start ${
                      risk.risk_level === 'High' ? 'border-red-200 bg-red-50/20' : 'border-amber-200 bg-amber-50/20'
                    }`}
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                          risk.risk_level === 'High' ? 'bg-red-500 text-white' : 'bg-amber-500 text-slate-900'
                        }`}>
                          {risk.risk_level} Risk
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{risk.title}</h4>
                      </div>

                      <div className="space-y-1 text-xs">
                        {risk.reasons.map((r, idx) => (
                          <div key={idx} className="flex gap-2 text-slate-650">
                            <AlertOctagon size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="w-full md:w-80 bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Action Mitigation
                      </span>
                      {risk.action_items.map((act, idx) => (
                        <div key={idx} className="flex gap-2 text-xs text-slate-600 font-semibold leading-relaxed">
                          <CornerDownRight size={12} className="text-brand-500 mt-0.5 flex-shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-xl border border-slate-200">
                <CheckCircle size={36} className="text-emerald-500/40 mb-2.5" />
                <p className="text-slate-700 text-sm font-semibold">All active patent timelines healthy</p>
                <p className="text-slate-500 text-xs mt-1">No examiner delays or stalled draft warnings reported.</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Department Rankings table */}
          {(user?.role === 'super_admin' || user?.role === 'management_viewer') && deptPerf.length > 0 ? (
            <div className="lg:col-span-12 glass-panel p-6 rounded-xl border border-slate-200 shadow-sm bg-white space-y-6">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-950">Departmental Innovation Leaderboard</h3>
                <p className="text-slate-500 text-xs mt-0.5">Performance ranking metrics computed by patent stages and success ratios</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Visual score comparison */}
                <div className="lg:col-span-5 h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={deptPerf}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                      <YAxis dataKey="department_code" type="category" stroke="#94a3b8" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                      />
                      <Bar name="Innovation Score" dataKey="innovation_score" fill="#6B1E2B" radius={[0, 4, 4, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>

                {/* Score leaderboard details */}
                <div className="lg:col-span-7 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4 text-center">Total IP</th>
                        <th className="py-3 px-4 text-center">Granted</th>
                        <th className="py-3 px-4 text-center">Success Rate</th>
                        <th className="py-3 px-4 text-center">Innovation Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {deptPerf.map((dept, index) => (
                        <tr key={dept.department_id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-bold text-slate-900">#{index + 1}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{dept.department_code}</span>
                            <span className="text-[10px] text-slate-500">{dept.department_name}</span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold">{dept.total_patents}</td>
                          <td className="py-3.5 px-4 text-center text-emerald-600 font-bold">{dept.granted_patents}</td>
                          <td className="py-3.5 px-4 text-center font-semibold">{dept.success_rate.toFixed(1)}%</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-1 rounded bg-brand-50 border border-brand-100 text-brand-600 font-bold">
                              {dept.innovation_score.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}

          {/* Faculty rankings table */}
          <div className="lg:col-span-12 glass-panel p-6 rounded-xl border border-slate-200 shadow-sm bg-white space-y-6">
            <div>
              <h3 className="text-lg font-bold font-display text-slate-950">Academic Innovator Rankings</h3>
              <p className="text-slate-500 text-xs mt-0.5">Faculty researchers ordered by patent production and primary authorship weight</p>
            </div>

            {facultyPerf.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Faculty Inventor</th>
                      <th className="py-3 px-4 text-center">Total IP Contributions</th>
                      <th className="py-3 px-4 text-center">Primary Authorship</th>
                      <th className="py-3 px-4 text-center">Granted Patents</th>
                      <th className="py-3 px-4 text-center">Innovation Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {facultyPerf.map((fac, index) => (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">#{index + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{fac.inventor_name}</td>
                        <td className="py-3.5 px-4 text-center font-semibold">{fac.total_patents}</td>
                        <td className="py-3.5 px-4 text-center font-semibold">{fac.primary_patents}</td>
                        <td className="py-3.5 px-4 text-center text-emerald-600 font-bold">{fac.granted_patents}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-1 rounded bg-indigo-50 border border-indigo-100 text-indigo-650 font-bold">
                            {fac.innovation_index.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs py-8">No faculty researcher ranking data available.</div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
