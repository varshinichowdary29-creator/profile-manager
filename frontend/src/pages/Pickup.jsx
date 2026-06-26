import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { ListSkeleton } from '../components/Skeleton';
import { 
  ShieldCheck, ShieldAlert, Key, UserCheck, 
  Plus, Check, X, Phone, UserPlus, Info 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Pickup = () => {
  const { user } = useAuth();
  
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Security verification states (Front desk console)
  const [selectedAuthId, setSelectedAuthId] = useState('');
  const [verificationPin, setVerificationPin] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Add guardian states
  const [createOpen, setCreateOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [newGuardian, setNewGuardian] = useState({
    studentId: '',
    name: '',
    relationship: '',
    contactNumber: '',
    pinCode: ''
  });

  const fetchAuthorizations = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/pickup');
      if (res.data.success) {
        setList(res.data.data);
      }
    } catch (err) {
      console.error('Error loading pickups:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/students');
      if (res.data.success) {
        setStudentsList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching students list:', err.message);
    }
  };

  useEffect(() => {
    fetchAuthorizations();
    if (user?.role !== 'Parent') {
      fetchStudents();
    }
  }, []);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedAuthId || !verificationPin) return;

    setVerifying(true);
    setVerificationResult(null);
    try {
      const res = await axios.post('/pickup/verify', {
        authorizationId: selectedAuthId,
        pinCode: verificationPin
      });
      if (res.data.success) {
        setVerificationResult({
          success: true,
          message: res.data.message,
          data: res.data.data
        });
        setVerificationPin('');
      }
    } catch (err) {
      setVerificationResult({
        success: false,
        message: err.response?.data?.message || 'Verification Failed: Invalid PIN code.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleAddGuardian = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newGuardian };
      // If parent, automatically bind to their children
      if (user?.role === 'Parent') {
        const statsRes = await axios.get('/dashboard/stats');
        if (statsRes.data.success && statsRes.data.children?.length > 0) {
          payload.studentId = statsRes.data.children[0].id;
        }
      }

      const res = await axios.post('/pickup', payload);
      if (res.data.success) {
        setCreateOpen(false);
        setNewGuardian({ studentId: '', name: '', relationship: '', contactNumber: '', pinCode: '' });
        fetchAuthorizations();
      }
    } catch (err) {
      console.error('Error adding pickup:', err.message);
    }
  };

  const isParent = user?.role === 'Parent';
  const showConsole = user?.role === 'Super Admin' || user?.role === 'School Admin' || user?.role === 'Front Desk Staff';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Pickup Authorization System</h2>
          <p className="text-xs text-slate-400">Manage authorized child pickup guardians, set checkout PIN codes, and audit school departures.</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Authorize Guardian
        </button>
      </div>

      {/* Security verification console (Admins/Staff only) */}
      {showConsole && (
        <GlassCard className="relative overflow-hidden border-brand-purple/20 bg-gradient-to-r from-slate-900/60 to-slate-900/40">
          <div className="absolute right-0 top-0 w-32 h-32 bg-brand-purple/5 rounded-full blur-2xl -z-10" />
          
          <div className="flex items-center gap-3 border-b border-slate-900 pb-3 mb-4">
            <span className="p-2 rounded-lg bg-brand-purple/10 text-brand-purple border border-brand-purple/20"><Key className="w-5 h-5" /></span>
            <div>
              <h3 className="font-bold text-white font-display text-base">Front Desk Verification Terminal</h3>
              <p className="text-xs text-slate-400">Verify guardian identity details and secure checkout PINs.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-400">Select Guardian Profile</label>
                <select 
                  value={selectedAuthId}
                  onChange={(e) => { setSelectedAuthId(e.target.value); setVerificationResult(null); }}
                  className="glass-select"
                  required
                >
                  <option value="">-- Choose Guardian to Verify --</option>
                  {list.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.relationship}) - Child: {a.Student?.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-400">Enter Security PIN Code</label>
                <input 
                  type="password" 
                  value={verificationPin}
                  onChange={(e) => setVerificationPin(e.target.value)}
                  className="glass-input text-center text-lg tracking-widest font-bold" 
                  placeholder="••••"
                  maxLength={4}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={verifying || !selectedAuthId}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {verifying ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserCheck className="w-5 h-5" />
                    Verify & Approve Checkout
                  </>
                )}
              </button>
            </form>

            {/* Verification Result Display */}
            <div className="h-full flex flex-col justify-center min-h-[160px]">
              <AnimatePresence mode="wait">
                {verificationResult ? (
                  <motion.div
                    key={verificationResult.success ? 'success' : 'fail'}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-5 rounded-2xl border text-center space-y-3 ${
                      verificationResult.success 
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-glow-cyan'
                        : 'bg-red-500/10 border-red-500/25 text-red-400'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto bg-slate-950/40">
                      {verificationResult.success ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{verificationResult.success ? 'Approval Granted!' : 'Verification Failed'}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{verificationResult.message}</p>
                    </div>
                    {verificationResult.success && (
                      <p className="text-[10px] text-slate-500">
                        Departure logged: {new Date(verificationResult.data.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <div className="p-6 rounded-2xl border border-slate-900 border-dashed text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                    <Info className="w-6 h-6 text-slate-600" />
                    <p>Enter a guardian profile and safety PIN in the dashboard to review clearances.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Roster list */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-900">
          <h3 className="text-base font-bold text-white font-display">Authorized Pickup Registry</h3>
          <span className="text-xs text-slate-400 font-semibold">{list.length} guardians authorized</span>
        </div>

        {loading ? (
          <ListSkeleton rows={3} />
        ) : list.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-6 text-center">No pickup guardians registered.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((auth) => (
              <div 
                key={auth.id} 
                className="p-5 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col justify-between hover:border-slate-800 transition-colors gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Guardian Card</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold border ${
                      auth.status === 'Authorized' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {auth.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">{auth.name}</h4>
                    <p className="text-xs text-slate-400">Relationship: <span className="font-semibold text-slate-300">{auth.relationship}</span></p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      {auth.contactNumber}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/30 border border-slate-900 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Child Authorized</p>
                    <p className="font-bold text-slate-300 leading-tight">{auth.Student?.fullName}</p>
                  </div>
                  {auth.pinCode && (
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 font-bold block">PIN</span>
                      <strong className="text-brand-cyan tracking-widest">{auth.pinCode}</strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Authorize Guardian Modal */}
      <AnimatePresence>
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <h3 className="font-bold text-white text-base">Authorize Pickup Guardian</h3>
                <button onClick={() => setCreateOpen(false)} className="p-1 rounded-lg hover:bg-slate-900 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddGuardian} className="space-y-4 text-xs">
                {!isParent && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Authorized Student</label>
                    <select 
                      value={newGuardian.studentId}
                      onChange={(e) => setNewGuardian({ ...newGuardian, studentId: e.target.value })}
                      className="glass-select"
                      required
                    >
                      <option value="">-- Choose Student --</option>
                      {studentsList.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Guardian Name</label>
                  <input 
                    type="text" 
                    value={newGuardian.name}
                    onChange={(e) => setNewGuardian({ ...newGuardian, name: e.target.value })}
                    className="glass-input" 
                    required 
                    placeholder="Enter full name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Relationship to Child</label>
                    <input 
                      type="text" 
                      value={newGuardian.relationship}
                      onChange={(e) => setNewGuardian({ ...newGuardian, relationship: e.target.value })}
                      className="glass-input" 
                      required 
                      placeholder="e.g. Uncle, Aunt, Nanny"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Contact Number</label>
                    <input 
                      type="text" 
                      value={newGuardian.contactNumber}
                      onChange={(e) => setNewGuardian({ ...newGuardian, contactNumber: e.target.value })}
                      className="glass-input" 
                      required 
                      placeholder="Mobile number"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Set Security PIN (4-digit, Optional)</label>
                  <input 
                    type="password" 
                    value={newGuardian.pinCode}
                    onChange={(e) => setNewGuardian({ ...newGuardian, pinCode: e.target.value })}
                    className="glass-input text-center tracking-widest font-bold" 
                    placeholder="Leave blank to auto-generate"
                    maxLength={4}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                  <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Approve Authorization</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pickup;
