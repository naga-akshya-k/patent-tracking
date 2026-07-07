import React, { useState, useEffect } from 'react';
import { api, type Patent, type Department, type User, type Inventor } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader } from './Loader';
import { 
  Search, 
  Plus, 
  Sparkles, 
  Folder, 
  Calendar, 
  UserCheck, 
  ChevronRight,
  Database,
  Building
} from 'lucide-react';

interface PatentRepositoryProps {
  onSelectPatent: (id: number) => void;
}

const STATUS_STAGES = [
  'All',
  'Idea Identified',
  'Draft Preparation',
  'Patent Filed',
  'Under Examination',
  'Published',
  'FER Issued',
  'FER Responded',
  'Granted',
  'Rejected',
  'Abandoned'
];

const DOMAINS = [
  'Artificial Intelligence', 'Data Science', 'Machine Learning', 
  'Internet of Things', 'Healthcare', 'Agriculture', 'Robotics', 
  'Electronics', 'Mechanical Engineering', 'Renewable Energy', 
  'Cybersecurity'
];

export const PatentRepository: React.FC<PatentRepositoryProps> = ({ onSelectPatent }) => {
  const { user } = useAuth();
  
  // View Toggle State: 'overall' or 'department'
  const [subView, setSubView] = useState<'overall' | 'department'>('overall');
  
  // Data States
  const [patents, setPatents] = useState<Patent[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableInventors, setAvailableInventors] = useState<User[]>([]);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDept, setSelectedDept] = useState<number | ''>('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Software');
  const [domain, setDomain] = useState('');
  const [filingDate, setFilingDate] = useState('');
  const [applicationNumber, setApplicationNumber] = useState('');
  const [deptId, setDeptId] = useState<number | ''>('');
  const [inventorsList, setInventorsList] = useState<{ name: string; userId?: number; isPrimary: boolean }[]>([
    { name: '', isPrimary: true }
  ]);
  
  // AI Suggestions State
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);

  const fetchPatents = async () => {
    try {
      setLoading(true);
      const res = await api.getPatents({
        search: subView === 'overall' ? search : undefined,
        status_filter: subView === 'overall' && selectedStatus !== 'All' ? selectedStatus : undefined,
        department_id: subView === 'overall' && selectedDept !== '' ? Number(selectedDept) : undefined,
        domain_filter: subView === 'overall' && selectedDomain !== '' ? selectedDomain : undefined
      });
      setPatents(res);
    } catch (err) {
      console.error("Failed to load patents:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [depts, invs] = await Promise.all([
        api.getDepartments(),
        api.getInventors()
      ]);
      setDepartments(depts);
      setAvailableInventors(invs);
    } catch (err) {
      console.error("Failed to load setup meta data:", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchPatents();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, selectedStatus, selectedDept, selectedDomain, subView]);

  // AI Domain Suggestion Trigger
  const handleAiSuggestDomain = async () => {
    if (!title) return;
    setAiSuggesting(true);
    setAiConfidence(null);
    try {
      const res = await api.aiSuggestDomain(title, description);
      setDomain(res.predicted_domain);
      setAiConfidence(res.confidence);
    } catch (err) {
      console.error("AI Categorization failed:", err);
    } finally {
      setAiSuggesting(false);
    }
  };

  const handleAddInventorField = () => {
    setInventorsList([...inventorsList, { name: '', isPrimary: false }]);
  };

  const handleInventorChange = (index: number, field: 'name' | 'userId' | 'isPrimary', value: any) => {
    const updated = [...inventorsList];
    if (field === 'userId') {
      const selectedUser = availableInventors.find(u => u.id === Number(value));
      updated[index] = {
        ...updated[index],
        userId: Number(value),
        name: selectedUser ? selectedUser.full_name : ''
      };
    } else if (field === 'isPrimary') {
      updated.forEach((inv, idx) => {
        inv.isPrimary = idx === index;
      });
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value
      };
    }
    setInventorsList(updated);
  };

  const handleRemoveInventorField = (index: number) => {
    const updated = inventorsList.filter((_, idx) => idx !== index);
    if (updated.length > 0 && !updated.some(i => i.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setInventorsList(updated);
  };

  const handleSubmitPatent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deptId) return;

    const formattedInventors = inventorsList
      .filter(i => i.name.trim() !== '')
      .map(i => ({
        inventor_name: i.name,
        user_id: i.userId,
        is_primary: i.isPrimary
      }));

    try {
      await api.createPatent({
        title,
        description,
        category,
        domain: domain || undefined,
        filing_date: filingDate || undefined,
        application_number: applicationNumber || undefined,
        department_id: Number(deptId),
        status: filingDate ? 'Patent Filed' : 'Idea Identified',
        inventors: formattedInventors
      });
      
      // Reset State
      setShowAddModal(false);
      setTitle('');
      setDescription('');
      setCategory('Software');
      setDomain('');
      setFilingDate('');
      setApplicationNumber('');
      setDeptId('');
      setInventorsList([{ name: '', isPrimary: true }]);
      setAiConfidence(null);
      
      fetchPatents();
    } catch (err) {
      console.error("Failed to create patent:", err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Granted': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'Published': return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
      case 'Patent Filed': return 'bg-brand-500/10 border-brand-500/30 text-brand-400';
      case 'Under Examination': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'FER Issued': return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'FER Responded': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'Draft Preparation': return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
      case 'Idea Identified': return 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400';
      default: return 'bg-red-950/20 border-red-900/30 text-red-300';
    }
  };

  const filteredPatents = patents.filter(pat => {
    if (!selectedYear) return true;
    const patentYear = pat.filing_date 
      ? new Date(pat.filing_date).getFullYear().toString() 
      : new Date(pat.created_at).getFullYear().toString();
    return patentYear === selectedYear;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Patent Repository</h2>
          <p className="text-slate-500 text-sm mt-1">Search, update, and audit patent portfolios</p>
        </div>

      </div>

      {/* Sub-view Toggles (Overall vs Department-Wise) */}
      <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit no-print">
        <button
          onClick={() => setSubView('overall')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            subView === 'overall' 
              ? 'bg-brand-500 text-white shadow-sm' 
              : 'text-slate-600 hover:text-brand-650'
          }`}
        >
          <Database size={14} />
          <span>Overall Tracking</span>
        </button>
        <button
          onClick={() => setSubView('department')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            subView === 'department' 
              ? 'bg-brand-500 text-white shadow-sm' 
              : 'text-slate-600 hover:text-brand-650'
          }`}
        >
          <Building size={14} />
          <span>Department-Wise Tracking</span>
        </button>
      </div>

      {subView === 'overall' ? (
        <>
          {/* Overall Filter Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search bar */}
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-brand-500 rounded-lg pl-11 pr-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 outline-none transition-colors shadow-sm"
                  placeholder="Search by patent title, application number, or inventor name..."
                />
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
                {/* Department Filter */}
                {user?.role === 'super_admin' || user?.role === 'management_viewer' ? (
                  <div className="relative w-full sm:w-48">
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 focus:border-brand-500 text-slate-700 text-sm rounded-lg px-3.5 py-2.5 outline-none appearance-none cursor-pointer shadow-sm"
                    >
                      <option value="">All Departments</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.code} Department</option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {/* Year Filter */}
                <div className="relative w-full sm:w-48">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-brand-500 text-slate-700 text-sm rounded-lg px-3.5 py-2.5 outline-none appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="">All Years</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                  </select>
                </div>

                {/* Domain Filter */}
                <div className="relative w-full sm:w-48">
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-brand-500 text-slate-700 text-sm rounded-lg px-3.5 py-2.5 outline-none appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="">All Domains</option>
                    {DOMAINS.map((dm, idx) => (
                      <option key={idx} value={dm}>{dm}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Status Scrollable Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 border-t border-slate-100 pt-4">
              {STATUS_STAGES.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedStatus === st
                      ? 'bg-brand-50 border-brand-200 text-brand-600 font-bold shadow-sm'
                      : 'bg-transparent border-transparent text-slate-500 hover:text-brand-500'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : filteredPatents.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-4 px-6">Patent Details</th>
                      <th className="py-4 px-6 hidden sm:table-cell">Dept</th>
                      <th className="py-4 px-6 hidden sm:table-cell">Year</th>
                      <th className="py-4 px-6 hidden md:table-cell">Tech Domain</th>
                      <th className="py-4 px-6">Filing Code</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {filteredPatents.map((pat) => (
                      <tr 
                        key={pat.id} 
                        className="hover:bg-slate-100/50 cursor-pointer transition-colors"
                        onClick={() => onSelectPatent(pat.id)}
                      >
                        <td className="py-4 px-6">
                          <div className="max-w-xs md:max-w-md">
                            <span className="font-bold text-slate-900 hover:text-brand-500 transition-colors line-clamp-1">
                              {pat.title}
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-1">
                              Added: {new Date(pat.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 hidden sm:table-cell">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500">
                            {departments.find(d => d.id === pat.department_id)?.code || 'CSE'}
                          </div>
                        </td>
                        <td className="py-4 px-6 hidden sm:table-cell text-slate-600 text-xs font-semibold">
                          {pat.filing_date ? new Date(pat.filing_date).getFullYear() : new Date(pat.created_at).getFullYear()}
                        </td>
                        <td className="py-4 px-6 hidden md:table-cell text-slate-600 text-xs">
                          {pat.domain || 'Unassigned'}
                        </td>
                        <td className="py-4 px-6 text-slate-650 text-xs font-mono">
                          {pat.application_number || 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(pat.status)}`}>
                            {pat.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button 
                            className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-300 text-slate-500 hover:text-brand-500 hover:border-brand-400 hover:bg-brand-500/5 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPatent(pat.id);
                            }}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-xl border border-slate-200">
              <Folder size={48} className="text-slate-400 mb-3" />
              <p className="text-slate-800 text-base font-bold">No patents found</p>
              <p className="text-slate-500 text-xs mt-1 max-w-sm leading-relaxed">
                We couldn't find any patent records matching your criteria. Try adjusting the search query or department filter.
              </p>
            </div>
          )}
        </>
      ) : (
        /* Department-Wise Visual Progress Tracking Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {departments.map((dept) => {
            const deptPatents = patents.filter(p => p.department_id === dept.id);
            const total = deptPatents.length;
            
            const idea = deptPatents.filter(p => p.status === 'Idea Identified').length;
            const draft = deptPatents.filter(p => p.status === 'Draft Preparation').length;
            const filed = deptPatents.filter(p => p.status === 'Patent Filed').length;
            const exam = deptPatents.filter(p => ['Under Examination', 'FER Issued', 'FER Responded', 'Published'].includes(p.status)).length;
            const granted = deptPatents.filter(p => p.status === 'Granted').length;
            const other = total - (idea + draft + filed + exam + granted);

            return (
              <div key={dept.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-sans">{dept.name}</h3>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-650 mt-1.5">
                      {dept.code} Department
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-slate-900 font-sans">{total}</span>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider mt-0.5">Total Patents</span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                {total > 0 ? (
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Lifecycle Distribution</span>
                      <span className="text-emerald-600">{granted} Granted</span>
                    </div>
                    <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-250">
                      {idea > 0 && <div style={{ width: `${(idea/total)*100}%` }} className="bg-zinc-400" title={`Idea: ${idea}`} />}
                      {draft > 0 && <div style={{ width: `${(draft/total)*100}%` }} className="bg-slate-400" title={`Draft: ${draft}`} />}
                      {filed > 0 && <div style={{ width: `${(filed/total)*100}%` }} className="bg-brand-500" title={`Filed: ${filed}`} />}
                      {exam > 0 && <div style={{ width: `${(exam/total)*100}%` }} className="bg-amber-500" title={`Exam: ${exam}`} />}
                      {granted > 0 && <div style={{ width: `${(granted/total)*100}%` }} className="bg-emerald-500" title={`Granted: ${granted}`} />}
                    </div>
                    {/* Legend labels */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[9px] font-bold text-slate-500 pt-2 border-t border-slate-200">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-400"></span>Idea ({idea})</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"></span>Draft ({draft})</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500"></span>Filed ({filed})</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Exam ({exam})</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Grant ({granted})</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-500 bg-slate-50 py-5 rounded border border-dashed border-slate-250">
                    No patents registered in this department yet.
                  </div>
                )}

                {/* Specific Department Patent List */}
                {total > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Application Tracking List
                    </span>
                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1.5">
                      {deptPatents.map(p => (
                        <div
                          key={p.id}
                          onClick={() => onSelectPatent(p.id)}
                          className="p-3 rounded bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 shadow-sm cursor-pointer transition-all flex justify-between items-center gap-4 group"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-brand-500 transition-colors block truncate leading-tight">
                              {p.title}
                            </span>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              App Code: {p.application_number || 'N/A'}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border flex-shrink-0 ${getStatusStyle(p.status)}`}>
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 overflow-y-auto no-print">
          <div className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-950 font-sans">Identify New Patent Proposal</h3>
                <p className="text-slate-500 text-xs mt-1">Initiate a patent record for tracking</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitPatent} className="space-y-6">
              
              {/* Core Details */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patent Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-brand-500 rounded-lg px-4 py-2.5 text-slate-900 text-sm outline-none transition-colors"
                    placeholder="Enter the title of the patent invention..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Abstract/Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-slate-300 focus:border-brand-500 rounded-lg px-4 py-2.5 text-slate-900 text-sm outline-none transition-colors"
                    placeholder="Enter patent summary or abstract description (Helps the AI auto-categorize it)..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department *</label>
                    <select
                      required
                      value={deptId}
                      onChange={(e) => setDeptId(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={user?.role !== 'super_admin'}
                      className="w-full bg-white border border-slate-300 focus:border-brand-500 text-slate-800 text-sm rounded-lg px-4 py-2.5 outline-none"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-brand-500 text-slate-800 text-sm rounded-lg px-4 py-2.5 outline-none"
                    >
                      <option value="Software">Software (Algorithms/GUI)</option>
                      <option value="Hardware">Hardware (Device/Apparatus)</option>
                      <option value="Process">Process (Methodology/Chemical)</option>
                    </select>
                  </div>
                </div>

                {/* AI Domain Suggestion wrapper */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Research Domain</label>
                    <button
                      type="button"
                      disabled={!title || aiSuggesting}
                      onClick={handleAiSuggestDomain}
                      className="flex items-center gap-1.5 text-brand-600 hover:text-brand-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-brand-500/25 bg-brand-500/5 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <Sparkles size={10} className="text-brand-600" />
                      <span>{aiSuggesting ? 'AI Classifying...' : 'AI Auto-Suggest'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => {
                        setDomain(e.target.value);
                        setAiConfidence(null);
                      }}
                      className="w-full bg-white border border-slate-300 focus:border-brand-500 rounded-lg px-4 py-2.5 text-slate-900 text-sm outline-none transition-colors"
                      placeholder="e.g. Artificial Intelligence, Healthcare, Robotics (or use AI Auto-Suggest)"
                    />
                    {aiConfidence !== null && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <span>AI Suggestion Match:</span>
                        <span>{Math.round(aiConfidence * 100)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional Filing details */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <Calendar size={14} className="text-slate-500" />
                  <span>Optional Initial Filing Details</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filing Date</label>
                    <input
                      type="date"
                      value={filingDate}
                      onChange={(e) => setFilingDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-brand-500 rounded-lg px-4 py-2 text-slate-800 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Application Number</label>
                    <input
                      type="text"
                      value={applicationNumber}
                      onChange={(e) => setApplicationNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-brand-500 rounded-lg px-4 py-2 text-slate-900 text-sm placeholder-slate-400 outline-none"
                      placeholder="e.g. IN202611099872"
                    />
                  </div>
                </div>
              </div>

              {/* Inventors list manager */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck size={14} className="text-slate-500" />
                    <span>Inventors & Co-inventors *</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddInventorField}
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                  >
                    + Add Co-Inventor
                  </button>
                </div>

                <div className="space-y-3">
                  {inventorsList.map((inv, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center p-3 rounded bg-slate-50 border border-slate-200">
                      
                      {/* Name or select */}
                      <div className="w-full sm:flex-1">
                        <select
                          value={inv.userId || ''}
                          onChange={(e) => handleInventorChange(idx, 'userId', e.target.value)}
                          className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded px-3 py-2 outline-none"
                        >
                          <option value="">-- Associate Registered Faculty --</option>
                          {availableInventors.map(u => (
                            <option key={u.id} value={u.id}>{u.full_name} ({u.role === 'department_coordinator' ? 'Coordinator' : 'Faculty'})</option>
                          ))}
                        </select>
                      </div>

                      {/* Guest Inventor Name input */}
                      <div className="w-full sm:flex-1">
                        <input
                          type="text"
                          required
                          value={inv.name}
                          onChange={(e) => handleInventorChange(idx, 'name', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900 text-xs outline-none"
                          placeholder="or type Inventor / Guest Name..."
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-semibold text-slate-500">
                          <input
                            type="checkbox"
                            checked={inv.isPrimary}
                            onChange={(e) => handleInventorChange(idx, 'isPrimary', e.target.checked)}
                            className="rounded border-slate-300 bg-white text-brand-600"
                          />
                          <span className={inv.isPrimary ? 'text-brand-600 font-bold' : ''}>Primary</span>
                        </label>

                        {inventorsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveInventorField(idx)}
                            className="text-slate-500 hover:text-red-650 text-xs transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:text-slate-800 hover:bg-slate-100 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs active:scale-[0.98] transition-all shadow-md shadow-brand-500/10"
                >
                  Create Proposal
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
