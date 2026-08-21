import React, { useState, useEffect } from 'react';
import { api, type DepartmentPerformance, type InventorPerformance, type Department, type Patent } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader } from './Loader';
import { 
  BarChart as BarChartIcon, 
  Users, 
  AlertOctagon, 
  ShieldAlert, 
  Clock, 
  Filter, 
  CheckCircle,
  FileText,
  Building2,
  Calendar,
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

interface LegalAlert {
  id: string;
  patent_title: string;
  department_code: string;
  alert_type: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  deadline_date: string;
  action_required: string;
  days_remaining: number;
}

interface AnalyticsDashboardProps {
  onSelectPatent?: (patentId: number) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onSelectPatent }) => {
  const { user } = useAuth();
  
  // Data States
  const [deptPerf, setDeptPerf] = useState<DepartmentPerformance[]>([]);
  const [facultyPerf, setFacultyPerf] = useState<InventorPerformance[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States (2000 - 2026 & 13 Departments)
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [activePanel, setActivePanel] = useState<'pipeline' | 'rankings' | 'alerts'>('pipeline');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const [deptList, deptRes, facultyRes, patentList] = await Promise.all([
        api.getDepartments(),
        api.getDepartmentComparison(),
        api.getFacultyRankings(),
        api.getPatents()
      ]);
      
      setDepartments(deptList);
      setDeptPerf(deptRes);
      setFacultyPerf(facultyRes);
      setPatents(patentList);
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

  // Generate Year Array from 2000 to 2026
  const YEARS = Array.from({ length: 2026 - 2000 + 1 }, (_, i) => (2026 - i).toString());

  // Dynamically compute department performance for selected year and department
  const filteredDeptPerf: DepartmentPerformance[] = departments
    .filter(d => selectedDeptId === '' || d.id === selectedDeptId)
    .map(d => {
      let deptPatents = patents.filter(p => p.department_id === d.id);
      
      if (selectedYear !== 'All') {
        deptPatents = deptPatents.filter(p => {
          if (p.filing_date) return new Date(p.filing_date).getFullYear().toString() === selectedYear;
          if (p.created_at) return new Date(p.created_at).getFullYear().toString() === selectedYear;
          return false;
        });
      }

      const disclosures_count = deptPatents.filter(p => p.status === 'Idea Identified' || p.status === 'Draft Preparation').length;
      const filed_patents = deptPatents.filter(p => ['Patent Filed', 'Under Examination', 'FER Issued', 'FER Responded'].includes(p.status)).length;
      const published_patents = deptPatents.filter(p => p.status === 'Published').length;
      const granted_patents = deptPatents.filter(p => p.status === 'Granted').length;
      const total_patents = deptPatents.length;
      const conversion_ratio = total_patents > 0 
        ? Math.round(((filed_patents + published_patents + granted_patents) / total_patents) * 1000) / 10 
        : 0;
      const innovation_score = granted_patents * 30 + published_patents * 20 + filed_patents * 15 + disclosures_count * 5;

      return {
        department_id: d.id,
        department_name: d.name,
        department_code: d.code,
        disclosures_count,
        filed_patents,
        published_patents,
        granted_patents,
        pending_patents: (disclosures_count + filed_patents),
        total_patents,
        conversion_ratio,
        success_rate: conversion_ratio,
        innovation_score
      };
    });

  // Statutory Legal Alerts Data (InPASS Deadlines)
  const legalAlerts: LegalAlert[] = [
    {
      id: 'alert-1',
      patent_title: 'High throughput distributed graph database engine',
      department_code: 'IT',
      alert_type: 'FER Response Deadline (6-Month Limit)',
      severity: 'CRITICAL',
      deadline_date: '2026-09-15',
      action_required: 'File official response to Examination Report objections with Form 3 amendments.',
      days_remaining: 18
    },
    {
      id: 'alert-2',
      patent_title: 'Continuous enzymatic bioreactor design for cellulose degradation',
      department_code: 'BIOTECH',
      alert_type: 'Form 18 Request for Examination (31-Month Window)',
      severity: 'WARNING',
      deadline_date: '2026-10-30',
      action_required: 'Submit Form 18 RFE fee to Indian Patent Office (InPASS) prior to window expiry.',
      days_remaining: 42
    },
    {
      id: 'alert-3',
      patent_title: 'Smart automated greenhouse monitoring node using LoRaWAN',
      department_code: 'ECE',
      alert_type: 'Stalled Faculty Review (> 14 Days)',
      severity: 'WARNING',
      deadline_date: '2026-08-20',
      action_required: 'Faculty Advisor endorsement pending. Remind Department IP Cell Lead.',
      days_remaining: 14
    },
    {
      id: 'alert-4',
      patent_title: 'Machine learning based dynamic load balancer for cloud servers',
      department_code: 'CSE',
      alert_type: 'Annual Patent Maintenance / Renewal Fee',
      severity: 'INFO',
      deadline_date: '2026-11-05',
      action_required: 'Process 3rd-year maintenance annuity fee with Patent Office registry.',
      days_remaining: 85
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Header & Filters Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Institutional Analytics & Legal Center</h2>
          <p className="text-slate-500 text-sm mt-1">Departmental IP pipelines, statutory InPASS alerts, and accreditation metrics (2000–2026)</p>
        </div>

        {/* Panel Switcher Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-lg border border-slate-200 no-print flex-wrap gap-1">
          <button
            onClick={() => setActivePanel('pipeline')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activePanel === 'pipeline' 
                ? 'bg-[#6B1D2F] text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChartIcon size={14} />
            <span>Department Output Pipeline</span>
          </button>
          <button
            onClick={() => setActivePanel('alerts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activePanel === 'alerts' 
                ? 'bg-[#6B1D2F] text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert size={14} />
            <span>Statutory Legal Alerts ({legalAlerts.length})</span>
          </button>
          <button
            onClick={() => setActivePanel('rankings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activePanel === 'rankings' 
                ? 'bg-[#6B1D2F] text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={14} />
            <span>Faculty Rankings</span>
          </button>
        </div>
      </div>

      {/* Global Filter Bar (13 Departments & Years 2000-2026) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
          <Filter size={14} className="text-[#6B1D2F]" />
          <span>Timeline & Department Filters</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Department Filter (Supports 13 Departments) */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <label className="text-xs text-slate-500 font-semibold">Dept:</label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value === '' ? '' : Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#6B1D2F] cursor-pointer"
            >
              <option value="">All 13 Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
              ))}
            </select>
          </div>

          {/* Single Year Filter (2000 to 2026) */}
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500 font-semibold">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#6B1D2F] cursor-pointer"
            >
              <option value="All">All Years (2000 - 2026)</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {activePanel === 'pipeline' ? (
        <div className="space-y-8">
          
          {/* Department Output Pipeline Bar Chart (Recharts) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold font-display text-slate-900">Department Output Pipeline (13-Department Comparison)</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Comparative volume of Invention Disclosures (IDFs), Filed, Published, and Granted patents across institutional departments ({selectedYear === 'All' ? '2000–2026' : selectedYear})
              </p>
            </div>

            <div className="h-80 w-full pt-2">
              {filteredDeptPerf.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredDeptPerf} margin={{ top: 10, right: 30, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="department_code" stroke="#64748b" fontSize={11} interval={0} angle={-25} textAnchor="end" />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="rect" />
                    <Bar name="Disclosures (IDFs)" dataKey="disclosures_count" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                    <Bar name="Filed Patents" dataKey="filed_patents" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    <Bar name="Published" dataKey="published_patents" fill="#D97706" radius={[4, 4, 0, 0]} />
                    <Bar name="Granted Patents" dataKey="granted_patents" fill="#6B1D2F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                  No department pipeline data available for selected filters.
                </div>
              )}
            </div>
          </div>

          {/* 13-Department Comparison Table */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900">13-Department IP Performance Breakdown</h3>
                <p className="text-slate-500 text-xs mt-0.5">Comprehensive disclosure-to-grant conversion rates and total IP output per department</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                13 Total Departments
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Department Name</th>
                    <th className="py-3 px-4 text-center">Disclosures (IDFs)</th>
                    <th className="py-3 px-4 text-center">Filed</th>
                    <th className="py-3 px-4 text-center">Published</th>
                    <th className="py-3 px-4 text-center">Granted</th>
                    <th className="py-3 px-4 text-center">Filing Conversion</th>
                    <th className="py-3 px-4 text-center">Innovation Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {deptPerf.map((dept) => (
                    <tr key={dept.department_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{dept.department_code}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{dept.department_name}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-600">{dept.disclosures_count || 0}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-blue-600">{dept.filed_patents}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-amber-600">{dept.published_patents}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">{dept.granted_patents}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-semibold text-slate-800">
                          {(dept.conversion_ratio || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-1 rounded bg-[#6B1D2F]/10 border border-[#6B1D2F]/20 text-[#6B1D2F] font-bold">
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
      ) : activePanel === 'alerts' ? (
        /* Statutory Legal Alert Center Widget (Section 6B) */
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert size={20} className="text-[#6B1D2F]" />
              <h3 className="text-xl font-bold font-display text-slate-900">Statutory Legal Alert Center</h3>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Indian Patent Office (InPASS) legally binding prosecution deadlines, examination response windows, and fee renewals
            </p>
          </div>

          <div className="space-y-4">
            {legalAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-5 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                  alert.severity === 'CRITICAL' 
                    ? 'border-red-200 bg-red-50/30' 
                    : alert.severity === 'WARNING'
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-emerald-200 bg-emerald-50/30'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      alert.severity === 'CRITICAL' 
                        ? 'bg-red-600 text-white' 
                        : alert.severity === 'WARNING'
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {alert.department_code}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{alert.patent_title}</h4>
                  </div>

                  <p className="text-xs font-semibold text-slate-700">{alert.alert_type}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <AlertOctagon size={14} className={alert.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'} />
                    <span>{alert.action_required}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-200/60">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Deadline</span>
                    <span className="text-xs font-bold text-slate-900 block">{alert.deadline_date}</span>
                    <span className={`text-[10px] font-semibold block ${alert.days_remaining <= 20 ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                      {alert.days_remaining} days left
                    </span>
                  </div>

                  {/* Burgundy Action Button */}
                  <button
                    onClick={() => {
                      const targetPatent = patents.find(p => p.title.toLowerCase().includes(alert.patent_title.toLowerCase().slice(0, 12))) || patents[0];
                      if (targetPatent && onSelectPatent) {
                        onSelectPatent(targetPatent.id);
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#6B1D2F] hover:bg-[#800020] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Take Action</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Faculty Performance Rankings */
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900">Academic Innovator Rankings</h3>
            <p className="text-slate-500 text-xs mt-0.5">Faculty researchers ordered by patent production and primary authorship weight</p>
          </div>

          {facultyPerf.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
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
                    <tr key={index} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">#{index + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{fac.inventor_name}</td>
                      <td className="py-3.5 px-4 text-center font-semibold">{fac.total_patents}</td>
                      <td className="py-3.5 px-4 text-center font-semibold">{fac.primary_patents}</td>
                      <td className="py-3.5 px-4 text-center text-emerald-600 font-bold">{fac.granted_patents}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-1 rounded bg-[#6B1D2F]/10 border border-[#6B1D2F]/20 text-[#6B1D2F] font-bold">
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
      )}

    </div>
  );
};
