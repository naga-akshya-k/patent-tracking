import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, Lock, ArrowRight, User as UserIcon } from 'lucide-react';
import eecCampus from '../assets/eec_campus.jpg';
import eecLogo from '../assets/eec_logo.png';

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
    
    if (role === 'admin') {
      u = 'admin';
      p = 'Admin123!';
    } else {
      u = 'iqac';
      p = 'Iqac123!';
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
    <div 
      className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-cover bg-center select-none"
      style={{ backgroundImage: `url(${eecCampus})` }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-slate-950/20 backdrop-brightness-[0.85] pointer-events-none"></div>

      {/* Central Login Card Container */}
      <main className="z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[390px] bg-[#1a2f42]/75 backdrop-blur-[6px] border border-slate-700/35 rounded-lg p-6 md:p-8 shadow-2xl flex flex-col gap-4 text-left">
          
          {/* Logo and Subtitle */}
          <div className="text-center">
            <img 
              src={eecLogo} 
              alt="Easwari Engineering College Logo" 
              className="w-28 h-28 mx-auto object-contain bg-white rounded-full p-0.5"
            />
            <span className="block text-[11px] font-extrabold text-slate-300 tracking-[0.3em] uppercase mt-2">
              AUTONOMOUS
            </span>
          </div>

          {error && (
            <div className="p-3 rounded bg-red-950/40 border border-red-800/50 text-red-200 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white tracking-wide">
                Username or Email
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-slate-350 focus:border-sky-500 rounded px-3 py-2 text-slate-900 text-sm outline-none shadow-inner"
                placeholder="Enter username"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-white tracking-wide">
                  Password
                </label>
                <a 
                  href="#forgot" 
                  onClick={(e) => { e.preventDefault(); alert("Please contact the Admin Office to reset credentials."); }}
                  className="text-[11px] text-slate-300 hover:text-white transition-colors"
                >
                  Forgot your password?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-350 focus:border-sky-500 rounded px-3 py-2 text-slate-900 text-sm outline-none shadow-inner"
                placeholder="Enter password"
              />
            </div>

            {/* Log In Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-b from-[#1483cc] to-[#0c6ba8] hover:from-[#1691e2] hover:to-[#0f7ebc] active:scale-[0.99] text-white text-sm font-extrabold py-2 px-4 rounded shadow-md border border-[#0d649d] tracking-wide transition-all mt-4"
            >
              {submitting ? 'LOGGING IN...' : 'Log In'}
            </button>

          </form>

          {/* Admin quick login for demo */}
          <div className="pt-4 border-t border-slate-650 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="w-full py-2 text-xs font-bold rounded bg-slate-950/40 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-900/50 transition-colors tracking-wide uppercase"
            >
              Demo Login (Admin Office)
            </button>
          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="z-10 text-center pb-4 px-4">
        <p className="text-white/60 text-xs font-semibold drop-shadow-sm font-sans tracking-wide">
          © Heraizen Technologies Pvt. Ltd.
        </p>
      </footer>

    </div>
  );
};
