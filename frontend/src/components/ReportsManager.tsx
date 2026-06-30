import React, { useState, useEffect } from 'react';
import { api, type Patent, type Department } from '../services/api';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Filter, 
  BookOpen, 
  Award,
  CheckCircle
} from 'lucide-react';

export const ReportsManager: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter States
  const [reportType, setReportType] = useState<'nirf' | 'naac' | 'nba'>('nirf');
  const [deptId, setDeptId] = useState<number | ''>('');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const fetchMetaData = async () => {
    try {
      const depts = await api.getDepartments();
      setDepartments(depts);
    } catch (err) {
      console.error("Failed to load departments for reports:", err);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await api.getPatents({
        department_id: deptId === '' ? undefined : Number(deptId),
        status_filter: selectedStatus === 'All' ? undefined : selectedStatus
      });
      
      // Local filter by year if specified
      let filtered = res;
      if (selectedYear !== 'All') {
        filtered = res.filter(p => {
          if (!p.filing_date) return false;
          const yr = new Date(p.filing_date).getFullYear().toString();
          return yr === selectedYear;
        });
      }
      
      setPatents(filtered);
    } catch (err) {
      console.error("Failed to generate report data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetaData();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [deptId, selectedYear, selectedStatus]);

  // Export to CSV/Excel utility
  const handleExportCSV = () => {
    if (patents.length === 0) return;

    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `PatentPulse_${reportType}_Report.csv`;

    if (reportType === 'nirf') {
      headers = ['Filing Year', 'Patent Title', 'Application Number', 'Filing Date', 'Publication Date', 'Grant Number', 'Grant Date', 'Domain', 'Category', 'Status'];
      rows = patents.map(p => [
        p.filing_date ? String(new Date(p.filing_date).getFullYear()) : 'N/A',
        p.title.replace(/"/g, '""'),
        p.application_number || 'N/A',
        p.filing_date || 'N/A',
        p.publication_date || 'N/A',
        p.grant_number || 'N/A',
        p.grant_date || 'N/A',
        p.domain || 'N/A',
        p.category || 'N/A',
        p.status
      ]);
    } else if (reportType === 'naac') {
      headers = ['Patent Application/Grant Number', 'Patent Title', 'Name of Inventor(s)', 'Year of Award/Filing', 'Filing/Publication Status'];
      rows = patents.map(p => [
        p.grant_number || p.application_number || 'N/A',
        p.title.replace(/"/g, '""'),
        'Inventor details available in Repository', // Simplified for CSV cells
        p.filing_date ? String(new Date(p.filing_date).getFullYear()) : 'N/A',
        p.status
      ]);
    } else {
      // NBA
      headers = ['Department Code', 'Patent Title', 'Filing/Application Code', 'Status Stage', 'Verification Link'];
      rows = patents.map(p => {
        const dCode = departments.find(d => d.id === p.department_id)?.code || 'N/A';
        return [
          dCode,
          p.title.replace(/"/g, '""'),
          p.application_number || 'N/A',
          p.status,
          `http://localhost:8000/api/patents/${p.id}`
        ];
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn printable-area">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-3xl font-extrabold font-display text-white">Accreditation Report Center</h2>
          <p className="text-slate-400 text-sm mt-1">Export structured statistics and tables for NIRF, NAAC Criteria 3, and NBA audits</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={patents.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-350 hover:text-white transition-all text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none"
          >
            <Download size={14} />
            <span>Export CSV / Excel</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={patents.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-350 hover:text-white transition-all text-xs font-semibold disabled:opacity-40 disabled:pointer-events-none"
          >
            <Printer size={14} />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Builder Panel */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800/80 space-y-4 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Report Type Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Report Format Template</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 text-slate-300 text-xs rounded-lg px-3 py-2.5 outline-none"
            >
              <option value="nirf">NIRF Patent Metrics</option>
              <option value="naac">NAAC Criteria 3.4.3 Format</option>
              <option value="nba">NBA Departmental Innovation Audits</option>
            </select>
          </div>

          {/* Department Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department</label>
            <select
              value={deptId}
              onChange={(e) => setDeptId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 text-slate-300 text-xs rounded-lg px-3 py-2.5 outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          {/* Academic Year Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filing Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 text-slate-300 text-xs rounded-lg px-3 py-2.5 outline-none"
            >
              <option value="All">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
          </div>

          {/* Status Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Patent Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 text-slate-300 text-xs rounded-lg px-3 py-2.5 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Granted">Granted</option>
              <option value="Published">Published</option>
              <option value="Patent Filed">Patent Filed</option>
              <option value="Under Examination">Under Examination</option>
            </select>
          </div>

        </div>
      </div>

      {/* Printable Report Output Panel */}
      {loading ? (
        <div className="flex items-center justify-center h-60 no-print">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500"></div>
        </div>
      ) : patents.length > 0 ? (
        <div className="glass-panel p-6 rounded-xl border border-slate-800/80 space-y-6 bg-slate-900/40">
          
          {/* Report Metadata Block */}
          <div className="border-b border-slate-800/80 pb-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold font-display text-white">
                {reportType === 'nirf' ? 'NIRF Data Summary Report: Intellectual Property Rights' :
                 reportType === 'naac' ? 'NAAC Criteria 3.4.3: Patents Published / Awarded' :
                 'NBA Departmental Innovation Performance Report'}
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                Generated from PatentPulse Repository on {new Date().toLocaleDateString()}
              </p>
            </div>
            
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-400">
              Matches Found: <span className="text-white font-bold">{patents.length}</span>
            </div>
          </div>

          {/* Table grids */}
          <div className="overflow-x-auto">
            {reportType === 'nirf' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 font-bold text-slate-400">
                    <th className="py-3 px-4">Filing Year</th>
                    <th className="py-3 px-4">Patent Title</th>
                    <th className="py-3 px-4">Application No.</th>
                    <th className="py-3 px-4">Filing Date</th>
                    <th className="py-3 px-4">Publication Date</th>
                    <th className="py-3 px-4">Grant No.</th>
                    <th className="py-3 px-4">Grant Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {patents.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/10">
                      <td className="py-3 px-4 font-semibold">{p.filing_date ? new Date(p.filing_date).getFullYear() : 'N/A'}</td>
                      <td className="py-3 px-4 font-bold text-white max-w-xs truncate">{p.title}</td>
                      <td className="py-3 px-4 font-mono">{p.application_number || 'N/A'}</td>
                      <td className="py-3 px-4">{p.filing_date || 'N/A'}</td>
                      <td className="py-3 px-4">{p.publication_date || 'N/A'}</td>
                      <td className="py-3 px-4 font-mono">{p.grant_number || 'N/A'}</td>
                      <td className="py-3 px-4">{p.grant_date || 'N/A'}</td>
                      <td className="py-3 px-4 font-semibold">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'naac' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 font-bold text-slate-400">
                    <th className="py-3 px-4">Patent Number / Application Number</th>
                    <th className="py-3 px-4">Title of the Patent</th>
                    <th className="py-3 px-4">Name of Patenter / Inventor(s)</th>
                    <th className="py-3 px-4 text-center">Year of Award/Filing</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {patents.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/10">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">{p.grant_number || p.application_number || 'N/A'}</td>
                      <td className="py-3.5 px-4 max-w-xs leading-relaxed">{p.title}</td>
                      <td className="py-3.5 px-4 text-slate-400 italic">Tagged Inventors available in details</td>
                      <td className="py-3.5 px-4 text-center">{p.filing_date ? new Date(p.filing_date).getFullYear() : 'N/A'}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-brand-400">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'nba' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 font-bold text-slate-400">
                    <th className="py-3 px-4">Department Code</th>
                    <th className="py-3 px-4">Patent Title</th>
                    <th className="py-3 px-4">Filing/Application Code</th>
                    <th className="py-3 px-4">Current Stage</th>
                    <th className="py-3 px-4">Audited Verification URL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {patents.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/10">
                      <td className="py-3.5 px-4 font-bold text-white">
                        {departments.find(d => d.id === p.department_id)?.code || 'CSE'}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs leading-relaxed">{p.title}</td>
                      <td className="py-3.5 px-4 font-mono">{p.application_number || 'N/A'}</td>
                      <td className="py-3.5 px-4 font-semibold">{p.status}</td>
                      <td className="py-3.5 px-4 text-blue-400 font-mono underline select-all">
                        http://localhost:8000/api/patents/{p.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-slate-900/10 rounded-xl border border-slate-800/60 no-print">
          <FileSpreadsheet size={48} className="text-slate-650 mb-3" />
          <p className="text-slate-400 text-sm font-semibold">No records match filters</p>
          <p className="text-slate-500 text-xs mt-1">Try expanding the year filters or selecting different statuses.</p>
        </div>
      )}

    </div>
  );
};
