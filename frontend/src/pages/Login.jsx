import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo shortcut credentials
  const fillRole = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative">
      {/* Decorative background glow circles */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-brand-purple opacity-[0.08] blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-brand-blue opacity-[0.08] blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-panel p-8 space-y-6 relative overflow-hidden"
      >
        {/* Glow border line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-purple via-brand-blue to-brand-cyan" />
        
        {/* Logo and header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center shadow-glow-purple">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">FirstCry Intellitots</h2>
          <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">Class-wise Student Profile Manager</p>
        </div>

        {/* Error notice */}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold"
          >
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input pl-12"
                placeholder="name@school.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input pl-12"
                placeholder="••••••••"
                required
              />
            </div>
          </div>


          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Quick Role Shortcuts for review evaluation */}
        <div className="space-y-3 pt-4 border-t border-slate-900/60">
          <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">Quick Demo Role Shortcuts</p>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => fillRole('superadmin@intellitots.com')}
              className="text-[10px] bg-slate-950/60 border border-slate-900 hover:border-brand-purple/40 text-slate-300 py-2 rounded-lg font-semibold transition-all hover:bg-slate-900/40"
            >
              Super Admin
            </button>
            <button 
              onClick={() => fillRole('admin@intellitots.com')}
              className="text-[10px] bg-slate-950/60 border border-slate-900 hover:border-brand-blue/40 text-slate-300 py-2 rounded-lg font-semibold transition-all hover:bg-slate-900/40"
            >
              School Admin
            </button>
            <button 
              onClick={() => fillRole('teacher@intellitots.com')}
              className="text-[10px] bg-slate-950/60 border border-slate-900 hover:border-brand-cyan/40 text-slate-300 py-2 rounded-lg font-semibold transition-all hover:bg-slate-900/40"
            >
              Teacher
            </button>
            <button 
              onClick={() => fillRole('parent@intellitots.com')}
              className="text-[10px] bg-slate-950/60 border border-slate-900 hover:border-brand-purple/40 text-slate-300 py-2 rounded-lg font-semibold transition-all hover:bg-slate-900/40"
            >
              Parent
            </button>
          </div>
          <div className="flex justify-center">
            <button 
              onClick={() => fillRole('staff@intellitots.com')}
              className="text-[10px] w-1/2 bg-slate-950/60 border border-slate-900 hover:border-slate-800 text-slate-300 py-2 rounded-lg font-semibold transition-all hover:bg-slate-900/40"
            >
              Front Desk Staff
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
