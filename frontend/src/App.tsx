import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { PatentRepository } from './components/PatentRepository';
import { PatentDetails } from './components/PatentDetails';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ReportsManager } from './components/ReportsManager';

const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatentId, setSelectedPatentId] = useState<number | null>(null);

  if (!user) return <Login />;

  const handleSelectPatent = (id: number) => {
    setSelectedPatentId(id);
    setActiveTab('repository'); // Ensure we are on repository to show details
  };

  const handleBackToRepo = () => {
    setSelectedPatentId(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main content wrapper */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 max-h-screen">
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
