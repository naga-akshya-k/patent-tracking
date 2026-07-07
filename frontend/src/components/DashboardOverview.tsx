import React, { useState, useEffect } from 'react';
import { api, type KPIStats, type NotificationResponse, type Department, type Patent } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader } from './Loader';
import { 
  Award, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Bell, 
  Check, 
  ArrowRight,
  User,
  Users,
  DollarSign,
  GraduationCap,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Settings as SettingsIcon,
  UserCheck,
  Search
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<KPIStats | null>(null);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [domainData, setDomainData] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 6, 1)); // Default to July 2026 for timeline sync

  const fetchData = async () => {
    try {
      setLoading(true);
      const [kpiRes, yearlyRes, domainRes, notifRes, deptRes, patentRes] = await Promise.all([
        api.getKPIs(),
        api.getYearlyTrends(),
        api.getDomainDistribution(),
        api.getNotifications(),
        api.getDepartments(),
        api.getPatents()
      ]);
      setKpis(kpiRes);
      setYearlyData(yearlyRes);
      setDomainData(domainRes);
      setNotifications(notifRes.filter(n => !n.read));
      setDepartments(deptRes);
      setPatents(patentRes);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkRead = async (notifId: number) => {
    try {
      await api.markNotificationRead(notifId);
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  if (loading || !kpis) {
    return <Loader />;
  }

  // Mock yearly student vs faculty contribution data matching screenshot's timeline
  const yearlyContributions = [
    { year: '2021', Students: 3, Faculty: 1 },
    { year: '2022', Students: 5, Faculty: 2 },
    { year: '2023', Students: 8, Faculty: 3 },
    { year: '2024', Students: 12, Faculty: 4 },
    { year: '2025', Students: 9, Faculty: 5 },
    { year: '2026', Students: 11, Faculty: 4 },
  ];

  // Map dynamic department contributions
  const departmentBreakdown = departments.map((d) => {
    const patentCount = patents.filter(p => p.department_id === d.id).length;
    let students = 1;
    let faculty = 1;
    if (d.code === 'CSE') { students = 5; faculty = 1; }
    else if (d.code === 'ECE') { students = 4; faculty = 1; }
    else if (d.code === 'ME') { students = 2; faculty = 1; }
    else if (d.code === 'BT') { students = 1; faculty = 1; }

    return {
      code: d.code,
      name: d.name,
      students,
      faculty,
      patentsCount: patentCount,
      status: patentCount > 3 ? 'High Output' : 'Active'
    };
  });

  // Top Student Performers/Creators
  const topStudents = [
    { rank: 1, name: 'Aarav Sharma', dept: 'CSE', patents: 3, classRank: '1st Rank' },
    { rank: 2, name: 'Rohan Malhotra', dept: 'ECE', patents: 2, classRank: '2nd Rank' },
    { rank: 3, name: 'Siddharth Sen', dept: 'CSE', patents: 2, classRank: '3rd Rank' },
    { rank: 4, name: 'Ananya Iyer', dept: 'CSE', patents: 2, classRank: '4th Rank' },
    { rank: 5, name: 'Vikram Sen', dept: 'ME', patents: 1, classRank: '5th Rank' },
  ];

  // Calendar calculations
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayIndex }, () => null);
  const allDays = [...blankDays, ...daysArray];

  // Highlight specific calendar days for patent milestones (5th, 12th, 18th, 26th)
  const highlightedDays = [5, 12, 18, 26];

  const handlePrevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Welcome Header & Search Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {user?.role === 'super_admin' 
              ? 'Patent Activity Overview'
              : `Department patent statistics for ${user?.username.toUpperCase()}`
            }
          </p>
        </div>

        {/* Search Box (Matches mockup search) */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search for patents, inventors..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:border-brand-500 focus:outline-none shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Row (Matches mockup metrics avatar cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Students */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-50 text-amber-600 border border-amber-100 flex-shrink-0">
            <GraduationCap size={22} />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Students</span>
            <span className="text-2xl font-bold text-slate-900 font-sans block mt-0.5">12</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Patent creators</span>
          </div>
        </div>

        {/* Card 2: Faculty */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0">
            <Users size={22} />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Faculty</span>
            <span className="text-2xl font-bold text-slate-900 font-sans block mt-0.5">4</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Research advisors</span>
          </div>
        </div>

        {/* Card 3: Total Patents */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-100 flex-shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Patents</span>
            <span className="text-2xl font-bold text-slate-900 font-sans block mt-0.5">{patents.length}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Total college records</span>
          </div>
        </div>

        {/* Card 4: IP Sponsorship / Earnings */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-100 flex-shrink-0">
            <DollarSign size={22} />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">IP Valuation</span>
            <span className="text-2xl font-bold text-slate-900 font-sans block mt-0.5">$42.8k</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Grants & sponsorships</span>
          </div>
        </div>

      </div>

      {/* Main Column Layout (Matches mockup splits) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8/12) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Yearly Contribution Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold font-sans text-slate-900">Student Applications Status</h3>
                <p className="text-slate-500 text-xs">Overall student-led patent filings by year</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600">
                <TrendingUp size={12} className="text-brand-500" />
                <span>Annual Trajectory</span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={yearlyContributions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', fontSize: '12px' }}
                    labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                  />
                  <Bar name="Student Filings" dataKey="Students" fill="#6B1E2B" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department breakdown table (Matches mockup details layout) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold font-sans text-slate-900">Department-Wise Tracking</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Depts: {departments.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Student Creators</th>
                    <th className="py-3 px-4">Faculty Advisors</th>
                    <th className="py-3 px-4">Total Patents</th>
                    <th className="py-3 px-4">Activity Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departmentBreakdown.map((dept, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{dept.name} ({dept.code})</td>
                      <td className="py-3.5 px-4 font-medium">{dept.students} Students</td>
                      <td className="py-3.5 px-4 font-medium">{dept.faculty} Advisor</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{dept.patentsCount} Patents</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          dept.status === 'High Output'
                            ? 'bg-brand-50 border border-brand-100 text-brand-650'
                            : 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                        }`}>
                          {dept.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4/12) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Calendar reference widget */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 font-sans">Events Calendar</h3>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handlePrevMonth} 
                  className="p-1 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
                >
                  <ChevronLeft size={14} className="text-slate-600" />
                </button>
                <button 
                  onClick={handleNextMonth} 
                  className="p-1 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
                >
                  <ChevronRight size={14} className="text-slate-600" />
                </button>
              </div>
            </div>

            {/* Current month display */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                {monthNames[month]} {year}
              </span>
              <CalendarIcon size={14} className="text-brand-500" />
            </div>

            {/* Monthly grid */}
            <div className="grid grid-cols-7 gap-y-2 text-center text-[11px] pt-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                <span key={d} className="font-bold text-slate-400">{d}</span>
              ))}
              {allDays.map((day, idx) => {
                if (day === null) return <span key={idx}></span>;
                const isToday = day === 2;
                const isMilestone = highlightedDays.includes(day) && month === 6 && year === 2026;
                return (
                  <span 
                    key={idx} 
                    className={`w-7 h-7 flex items-center justify-center mx-auto rounded-full text-xs font-semibold cursor-pointer transition-all ${
                      isMilestone 
                        ? 'bg-brand-500 text-white font-bold shadow shadow-brand-500/20' 
                        : isToday
                        ? 'border border-brand-500 text-brand-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>

            {/* Upcoming items */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming Events</span>
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight">05 Jul - New CSE Filings</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Self audit checks & forms review</span>
                  </div>
                  <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded whitespace-nowrap">10:00 AM</span>
                </div>
                <div className="flex justify-between items-start gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight">18 Jul - Patent Review board</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Faculty committee hearing sessions</span>
                  </div>
                  <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded whitespace-nowrap">02:30 PM</span>
                </div>
              </div>
            </div>
          </div>


          {/* Actionable notifications alert panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-brand-500" />
              <h3 className="text-sm font-bold font-sans text-slate-900">Actionable Alerts</h3>
              <span className="px-2 py-0.5 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-[9px] font-bold">
                {notifications.length} Info
              </span>
            </div>

            {notifications.length > 0 ? (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {notifications.slice(0, 3).map((notif) => (
                  <div 
                    key={notif.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex justify-between items-start gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">{notif.title}</span>
                      <p className="text-slate-500 text-[10px] mt-1 leading-normal">{notif.message}</p>
                    </div>
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="p-1 rounded-full border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors flex-shrink-0"
                    >
                      <Check size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold">
                <CheckCircle size={14} />
                <span>Up to date. No warnings.</span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
