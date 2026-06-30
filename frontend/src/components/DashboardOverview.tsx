import React, { useState, useEffect } from 'react';
import { api, type KPIStats, type NotificationResponse } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Award, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Bell, 
  Check, 
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = [
  '#0e8eed', '#4f46e5', '#10b981', '#f59e0b', 
  '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6', 
  '#a855f7', '#6366f1', '#3b82f6'
];

export const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<KPIStats | null>(null);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [domainData, setDomainData] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [kpiRes, yearlyRes, domainRes, notifRes] = await Promise.all([
        api.getKPIs(),
        api.getYearlyTrends(),
        api.getDomainDistribution(),
        api.getNotifications()
      ]);
      setKpis(kpiRes);
      setYearlyData(yearlyRes);
      setDomainData(domainRes);
      setNotifications(notifRes.filter(n => !n.read));
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
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-500"></div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Patent Records',
      value: kpis.total_patents,
      desc: 'All identified ideas & filings',
      icon: Award,
      color: 'from-brand-500/20 to-indigo-500/20',
      iconColor: 'text-brand-400'
    },
    {
      title: 'Granted Patents',
      value: kpis.granted_patents,
      desc: 'Legally sealed grants',
      icon: CheckCircle,
      color: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-400'
    },
    {
      title: 'Published Gazettes',
      value: kpis.published_patents,
      desc: 'Publicly registered journals',
      icon: FileText,
      color: 'from-indigo-500/20 to-purple-500/20',
      iconColor: 'text-indigo-400'
    },
    {
      title: 'Pending Progress',
      value: kpis.pending_patents,
      desc: 'Actively in examination stage',
      icon: Clock,
      color: 'from-amber-500/20 to-yellow-500/20',
      iconColor: 'text-amber-400'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Welcome Header */}
      <div>
        <h2 className="text-3xl font-extrabold font-display text-white">
          Institutional Dashboard
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {user?.role === 'super_admin' 
            ? 'Institution-wide intellectual property activity logs'
            : `Department-level patent statistics for ${user?.username.toUpperCase()}`
          }
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={idx} 
              className={`glass-card p-6 rounded-xl bg-gradient-to-br ${kpi.color} border border-slate-800/80 hover:-translate-y-1 transform transition-all duration-300`}
            >
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 ${kpi.iconColor}`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-display text-white">{kpi.value}</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1.5">{kpi.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Trend Area Chart */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold font-display text-white">Patent Activity Timeline</h3>
              <p className="text-slate-500 text-xs">Annual publication filing and granting trajectory</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] font-semibold text-slate-400">
              <TrendingUp size={12} className="text-brand-500" />
              <span>Historical (2021 - 2026)</span>
            </div>
          </div>
          
          <div className="h-80 w-full">
            {yearlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearlyData} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFilings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0e8eed" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0e8eed" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGrants" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area 
                    name="Filings Submitted" 
                    type="monotone" 
                    dataKey="filings" 
                    stroke="#0e8eed" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorFilings)" 
                  />
                  <Area 
                    name="Grants Issued" 
                    type="monotone" 
                    dataKey="grants" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorGrants)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                No historical trend data available.
              </div>
            )}
          </div>
        </div>

        {/* Domain Distribution Pie Chart */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-xl border border-slate-800/80">
          <h3 className="text-lg font-bold font-display text-white mb-1">Domain Distribution</h3>
          <p className="text-slate-500 text-xs mb-6">Patent records by technical domain</p>
          
          <div className="h-60 w-full flex items-center justify-center relative">
            {domainData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={domainData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="domain"
                  >
                    {domainData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-sm">No domain distribution available</div>
            )}
            
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-white">{kpis.total_patents}</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Total IP</span>
            </div>
          </div>
          
          {/* Custom domain labels list */}
          <div className="mt-4 max-h-24 overflow-y-auto space-y-1.5 pr-2">
            {domainData.slice(0, 5).map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-slate-400 truncate">{entry.domain}</span>
                </div>
                <span className="text-slate-200 font-bold ml-2">{entry.count}</span>
              </div>
            ))}
            {domainData.length > 5 && (
              <div className="text-[10px] text-slate-500 text-center italic pt-1">
                + {domainData.length - 5} other domains
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Notifications Panel */}
      <div className="glass-panel p-6 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2 mb-6">
          <Bell size={20} className="text-brand-400" />
          <h3 className="text-lg font-bold font-display text-white">Actionable Repository Alerts</h3>
          <span className="px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-400 text-[10px] font-bold">
            {notifications.length} Unresolved
          </span>
        </div>

        {notifications.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                className="flex items-start justify-between p-4 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-slate-700/60 transition-colors group"
              >
                <div className="flex gap-3 pr-4">
                  <div className="p-2 rounded-lg bg-red-950/40 border border-red-900/40 text-red-400 mt-0.5 flex-shrink-0">
                    <AlertTriangle size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{notif.title}</h4>
                    <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{notif.message}</p>
                    <span className="text-[9px] text-slate-600 block mt-1.5">
                      {new Date(notif.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleMarkRead(notif.id)}
                  className="p-1.5 rounded-full border border-slate-800 text-slate-500 hover:text-emerald-400 hover:border-emerald-950/80 hover:bg-emerald-950/10 transition-colors"
                  title="Mark Resolved"
                >
                  <Check size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-950/20 rounded-lg border border-slate-800/40">
            <CheckCircle size={32} className="text-emerald-500/40 mb-2.5" />
            <p className="text-slate-400 text-sm font-semibold">Your workspace is up to date!</p>
            <p className="text-slate-500 text-xs mt-1">No outstanding administrative warnings or FER alerts found.</p>
          </div>
        )}
      </div>

    </div>
  );
};
