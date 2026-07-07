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
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  theme: { primary: string; secondary: string };
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  theme
}) => {
  const { user, logout } = useAuth();
  const [isHovered, setIsHovered] = React.useState(false);

  if (!user) return null;

  const menuItems = [
    {
      id: 'overview',
      label: 'Dashboard',
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
      label: 'Analytics',
      icon: Brain,
      roles: ['super_admin', 'department_coordinator', 'faculty_inventor', 'management_viewer']
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileSpreadsheet,
      roles: ['super_admin', 'department_coordinator', 'management_viewer']
    }
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(user.role));

  const isExpanded = !isCollapsed || isHovered;

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        backgroundColor: theme.secondary, 
        height: 'calc(100vh - 3.5rem)', 
        minHeight: '100%',
        width: isExpanded ? '260px' : '64px',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0
      }} 
      className="flex flex-col border-r border-slate-800/20 select-none overflow-hidden"
    >
      
      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-6 space-y-2">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
              }}
              className={`w-full flex items-center rounded text-sm font-semibold transition-all ${
                isExpanded 
                  ? 'px-3 py-3 gap-3.5 justify-start' 
                  : 'p-3 justify-center'
              } ${
                isActive 
                  ? 'bg-white/15 border-l-4 border-sky-400' 
                  : 'hover:bg-white/5'
              }`}
              style={{ color: isActive ? '#ffffff' : '#cbd5e1' }}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon size={18} style={{ color: isActive ? '#38bdf8' : '#cbd5e1' }} className="flex-shrink-0" />
              {isExpanded && (
                <span 
                  style={{ color: isActive ? '#ffffff' : '#cbd5e1' }}
                  className="font-semibold text-sm whitespace-nowrap animate-fadeIn"
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

    </aside>
  );
};
