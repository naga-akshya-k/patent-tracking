import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Database, 
  Brain, 
  FileSpreadsheet, 
  LogOut, 
  Sparkles,
  User as UserIcon,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const menuItems = [
    {
      id: 'overview',
      label: 'Overview Dashboard',
      icon: LayoutDashboard,
      roles: ['super_admin', 'department_coordinator', 'faculty_inventor', 'management_viewer']
    },
    {
      id: 'repository',
      label: 'Patent Repository',
      icon: Database,
      roles: ['super_admin', 'department_coordinator', 'faculty_inventor', 'management_viewer']
    },
    {
      id: 'analytics',
      label: 'Analytics & AI Insights',
      icon: Brain,
      roles: ['super_admin', 'department_coordinator', 'faculty_inventor', 'management_viewer']
    },
    {
      id: 'reports',
      label: 'Reports & Accreditation',
      icon: FileSpreadsheet,
      roles: ['super_admin', 'department_coordinator', 'management_viewer']
    }
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(user.role));

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'department_coordinator': return 'Dept Coordinator';
      case 'faculty_inventor': return 'Faculty Inventor';
      case 'management_viewer': return 'Management Auditor';
      default: return role;
    }
  };

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 flex flex-col h-screen sticky top-0">
      
      {/* Brand logo */}
      <div className="p-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg font-display text-slate-900 tracking-wide leading-none">PatentPulse</h1>
            <span className="text-[10px] text-brand-500 font-semibold uppercase tracking-wider mt-1 block">
              AI-Intelligence
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/10' 
                  : 'text-slate-600 hover:text-brand-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-850 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-100 border border-slate-200 mb-3">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-slate-350">
            <UserIcon size={20} className="text-slate-500" />
          </div>
          <div className="overflow-hidden min-w-0">
            <h4 className="text-sm font-bold text-slate-900 truncate leading-tight">
              {user.full_name}
            </h4>
            <span className="text-[10px] font-semibold text-slate-500 block truncate mt-0.5">
              {getRoleLabel(user.role)}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-600 hover:text-red-600 hover:border-red-350 hover:bg-red-50 transition-all"
        >
          <LogOut size={14} />
          <span>Sign Out Portal</span>
        </button>
      </div>

    </aside>
  );
};
