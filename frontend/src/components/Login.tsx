import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Shield, User as UserIcon, Eye, Lock, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setSubmitting(true);
    setError('');
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: string) => {
    setSubmitting(true);
    setError('');
    
    let u = '';
    let p = '';
    
    switch (role) {
      case 'admin':
        u = 'admin';
        p = 'Admin123!';
        break;
      case 'coordinator':
        u = 'cse_coordinator';
        p = 'Coord123!';
        break;
      case 'faculty':
        u = 'faculty';
        p = 'Faculty123!';
        break;
      case 'iqac':
        u = 'iqac';
        p = 'Iqac123!';
        break;
    }
    
    try {
      await login(u, p);
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 items-center z-10">
        
        {/* Intro Panel */}
        <div className="md:col-span-6 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-medium text-sm animate-pulse-subtle">
            <Award size={16} />
            <span>PatentPulse Institutional IP Tracker</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display leading-tight text-white tracking-tight">
            AI-Powered <br className="hidden md:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">
              Patent Monitoring
            </span>
          </h1>
          
          <p className="text-slate-400 text-lg max-w-md leading-relaxed">
            Centralized platform for tracking intellectual property, evaluating departmental performance, assessing filing delays, and automating accreditation auditing.
          </p>

          <div className="flex flex-wrap items-center gap-6 justify-center md:justify-start text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-brand-500" />
              <span>Secure JWT Auth</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-brand-500" />
              <span>RBAC Policy</span>
            </div>
          </div>
        </div>

        {/* Login Form Panel */}
        <div className="md:col-span-6 glass-panel rounded-2xl p-8 border border-slate-800 shadow-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-white">Sign In</h2>
            <p className="text-sm text-slate-400">Access your institutional portal</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username or Email</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-brand-500 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-600 outline-none transition-colors"
                  placeholder="admin or email@patentpulse.edu"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-brand-500 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-600 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-6 border-t border-slate-800/80 space-y-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block text-center">
              Demo Fast Login Roles
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleQuickLogin('admin')}
                disabled={submitting}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all text-left group"
              >
                <span className="text-xs font-bold text-slate-200 group-hover:text-brand-400">Super Admin</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Principal / Research Head</span>
              </button>

              <button
                onClick={() => handleQuickLogin('coordinator')}
                disabled={submitting}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all text-left group"
              >
                <span className="text-xs font-bold text-slate-200 group-hover:text-brand-400">CSE Coordinator</span>
                <span className="text-[10px] text-slate-500 mt-0.5">HOD / Department Chair</span>
              </button>

              <button
                onClick={() => handleQuickLogin('faculty')}
                disabled={submitting}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all text-left group"
              >
                <span className="text-xs font-bold text-slate-200 group-hover:text-brand-400">Faculty / Inventor</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Dr. Alan Turing</span>
              </button>

              <button
                onClick={() => handleQuickLogin('iqac')}
                disabled={submitting}
                className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all text-left group"
              >
                <span className="text-xs font-bold text-slate-200 group-hover:text-brand-400">Management Auditor</span>
                <span className="text-[10px] text-slate-500 mt-0.5">IQAC / NAAC Commitee</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
