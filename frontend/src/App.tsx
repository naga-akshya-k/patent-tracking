import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { PatentRepository } from './components/PatentRepository';
import { PatentDetails } from './components/PatentDetails';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ReportsManager } from './components/ReportsManager';
import { Menu, Settings, Bell, User as UserIcon, LogOut, Palette, CheckCircle } from 'lucide-react';
import eecLogo from './assets/eec_logo.png';
import { api, type NotificationResponse } from './services/api';

const THEMES = [
  { name: 'Happiness', primary: '#6B1E2B', secondary: '#0F2742', primaryDots: '#6B1E2B', secondaryDots: '#0F2742' },
  { name: 'Joy', primary: '#76A035', secondary: '#3f541b', primaryDots: '#84cc16', secondaryDots: '#eab308' },
  { name: 'Courage', primary: '#2563EB', secondary: '#1E3A8A', primaryDots: '#3b82f6', secondaryDots: '#93c5fd' },
  { name: 'Ocean', primary: '#0284C7', secondary: '#083344', primaryDots: '#bae6fd', secondaryDots: '#0284c7' },
  { name: 'Royal', primary: '#4F46E5', secondary: '#1E1B4B', primaryDots: '#a5b4fc', secondaryDots: '#3b82f6' },
  { name: 'Serene', primary: '#D97706', secondary: '#3B0764', primaryDots: '#f97316', secondaryDots: '#6366f1' }
];

const DashboardContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatentId, setSelectedPatentId] = useState<number | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [activeTheme, setActiveTheme] = useState('Happiness');

  const currentTheme = THEMES.find(t => t.name === activeTheme) || THEMES[0];

  useEffect(() => {
    // Dynamic theme overrides across all sub-components using brand colors
    const styleEl = document.getElementById('dynamic-theme-style') || document.createElement('style');
    styleEl.id = 'dynamic-theme-style';
    styleEl.innerHTML = `
      .bg-brand-50 { background-color: ${currentTheme.primary}10 !important; }
      .bg-brand-100 { background-color: ${currentTheme.primary}20 !important; }
      .bg-brand-500 { background-color: ${currentTheme.primary} !important; }
      .bg-brand-600 { background-color: ${currentTheme.primary} !important; }
      .text-brand-400 { color: ${currentTheme.primary} !important; }
      .text-brand-600 { color: ${currentTheme.primary} !important; }
      .border-brand-500 { border-color: ${currentTheme.primary} !important; }
      .focus\\:border-brand-500:focus { border-color: ${currentTheme.primary} !important; }
      .bg-brand-500\\/10 {
        background-color: ${currentTheme.primary}15 !important;
        color: ${currentTheme.primary} !important;
        border-color: ${currentTheme.primary}30 !important;
      }
    `;
    document.head.appendChild(styleEl);
  }, [activeTheme]);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 25000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user) return <Login />;

  const handleSelectPatent = (id: number) => {
    setSelectedPatentId(id);
    setActiveTab('repository'); // Ensure we are on repository to show details
  };

  const handleBackToRepo = () => {
    setSelectedPatentId(null);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'ADMIN';
      case 'department_coordinator': return 'COORDINATOR';
      case 'faculty_inventor': return 'INVENTOR';
      case 'management_viewer': return 'VIEWER';
      default: return 'ADMIN';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 relative">
      {/* Top Header Navbar in Burgundy */}
      <header className="h-14 bg-[#6C2434] flex items-center justify-between px-4 md:px-6 z-20 shadow-md">
        
        {/* Left Side: Hamburger Menu + Logo + College Name */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hover:opacity-80 transition-opacity"
          >
            <Menu size={20} style={{ color: '#ffffff' }} />
          </button>
          
          {/* Logo container */}
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden">
            <img src={eecLogo} alt="EEC Logo" className="w-full h-full object-contain" />
          </div>

          <span className="font-bold text-[14px] md:text-[15px] tracking-wide select-none" style={{ color: '#ffffff' }}>
            Easwari Engineering College
          </span>
        </div>

        {/* Right Side: Profile Info + Actions */}
        <div className="flex items-center gap-4">
          
          {/* User Profile display */}
          <div className="flex items-center gap-2.5 px-3 py-1 rounded bg-black/15 border border-white/10">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-0.5">
              <UserIcon size={14} className="text-[#6C2434]" />
            </div>
            <span className="text-xs font-bold tracking-wide uppercase select-none hidden sm:inline" style={{ color: '#ffffff' }}>
              {user.full_name} [ {getRoleLabel(user.role)} ]
            </span>
          </div>

          {/* Action Icons */}
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowSettings(false);
            }}
            className="hover:opacity-85 transition-opacity p-1 relative"
            title="Notifications"
          >
            <Bell size={18} style={{ color: '#ffffff' }} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-600 rounded-full border border-[#6C2434] flex items-center justify-center text-[7px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => {
              setShowSettings(!showSettings);
              setShowNotifications(false);
            }}
            className="hover:opacity-85 transition-opacity p-1"
            title="Settings"
          >
            <Settings size={18} style={{ color: '#ffffff' }} />
          </button>

          {/* Quick logout */}
          <button 
            onClick={logout}
            className="hover:opacity-80 transition-opacity p-1 border-l border-white/20 pl-3 ml-1 flex items-center gap-1.5 text-xs font-bold"
            title="Sign Out"
            style={{ color: '#ffffff' }}
          >
            <LogOut size={16} style={{ color: '#ffffff' }} />
            <span className="hidden md:inline" style={{ color: '#ffffff' }}>Sign Out</span>
          </button>
        </div>

      </header>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-12 top-14 w-80 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50 text-slate-800 animate-fadeIn">
          <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-lg">
            <span className="font-bold text-xs text-slate-900">Recent Notifications</span>
            <button 
              onClick={() => setShowNotifications(false)}
              className="text-[10px] text-slate-500 hover:text-slate-700 font-semibold"
            >
              Close
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-slate-500">
                No notifications found.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={async () => {
                    if (!notif.read) {
                      try {
                        await api.markNotificationRead(notif.id);
                        fetchNotifications();
                      } catch (err) {
                        console.error(err);
                      }
                    }
                  }}
                  className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-2 items-start ${!notif.read ? 'bg-slate-50/80 font-medium' : ''}`}
                >
                  {!notif.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C2434] mt-1.5 flex-shrink-0"></span>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{notif.title}</h4>
                    <p className="text-[10px] text-slate-650 mt-0.5 leading-normal">{notif.message}</p>
                    <span className="text-[8px] text-slate-400 mt-1 block">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Settings Dropdown */}
      {showSettings && (
        <div className="absolute right-4 top-14 w-44 bg-white border border-slate-200 rounded shadow-md py-1 z-50 text-slate-800 animate-fadeIn no-print">
          <button 
            onClick={() => {
              setShowThemeModal(true);
              setShowSettings(false);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700"
          >
            <Palette size={14} className="text-slate-500" />
            <span>Select theme</span>
          </button>
        </div>
      )}

      {/* Theme Selection Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn no-print">
          <div className="bg-white rounded-lg shadow-xl w-[400px] p-6 text-slate-800 relative border border-slate-100">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-150 mb-4">
              <h3 className="font-bold text-sm text-slate-900">Select Theme</h3>
              <button 
                onClick={() => setShowThemeModal(false)}
                className="text-slate-400 hover:text-slate-650 transition-colors text-lg font-semibold p-1"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Themes list */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {THEMES.map((theme) => {
                const isSelected = activeTheme === theme.name;
                return (
                  <div 
                    key={theme.name}
                    onClick={() => {
                      setActiveTheme(theme.name);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded border transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-[#0369a1] bg-slate-50/50' 
                        : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-850">{theme.name}</span>
                      
                      {/* Color Preview Dots */}
                      <div className="flex gap-1 items-center">
                        <span 
                          className="w-3.5 h-3.5 rounded-full inline-block shadow-sm border border-slate-200/50" 
                          style={{ backgroundColor: theme.primaryDots }}
                        ></span>
                        <span 
                          className="w-3.5 h-3.5 rounded-full inline-block shadow-sm border border-slate-200/50" 
                          style={{ backgroundColor: theme.secondaryDots }}
                        ></span>
                      </div>
                    </div>

                    {/* Radio Button Indicator */}
                    <div className="flex items-center justify-center">
                      {isSelected ? (
                        <CheckCircle size={18} className="text-[#0369a1] fill-[#0369a1]/10" />
                      ) : (
                        <span className="w-4.5 h-4.5 rounded-full border border-slate-300 inline-block bg-white hover:border-slate-400 transition-colors"></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* Main Body Layout */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 3.5rem)' }}>
        {/* Sidebar navigation */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed} 
          theme={currentTheme}
        />
        
        {/* Main content wrapper */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 max-h-[calc(100vh-3.5rem)]">
          {activeTab === 'overview' && <DashboardOverview />}
          
          {activeTab === 'repository' && (
            selectedPatentId !== null ? (
              <PatentDetails patentId={selectedPatentId} onBack={handleBackToRepo} />
            ) : (
              <PatentRepository onSelectPatent={handleSelectPatent} />
            )
          )}
          
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          
          {activeTab === 'reports' && <ReportsManager />}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
};

export default App;
