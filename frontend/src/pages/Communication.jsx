import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { ListSkeleton } from '../components/Skeleton';
import { 
  MessageSquare, Bell, AlertTriangle, Plus, 
  X, Check, Megaphone, Send, Calendar 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Communication = () => {
  const { user } = useAuth();
  
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  // Form states
  const [createOpen, setCreateOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    type: 'Announcement',
    recipientRole: 'All'
  });

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/communication');
      if (res.data.success) {
        setNotifs(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching communications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/communication', newNotice);
      if (res.data.success) {
        setCreateOpen(false);
        setNewNotice({ title: '', content: '', type: 'Announcement', recipientRole: 'All' });
        fetchNotifs();
      }
    } catch (err) {
      console.error('Error publishing notice:', err.message);
    }
  };

  const canWrite = user?.role !== 'Parent' && user?.role !== 'Front Desk Staff';

  const filteredNotifs = notifs.filter(n => {
    if (activeFilter === 'All') return true;
    return n.type === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Communication Center</h2>
          <p className="text-xs text-slate-400">Post announcements, view board messages, and review school notifications.</p>
        </div>
        {canWrite && (
          <button onClick={() => setCreateOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Publish Notice
          </button>
        )}
      </div>

      {/* Roster splits */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation / Filters list */}
        <GlassCard className="p-4 space-y-1 lg:col-span-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 block mb-2">Bulletin Filters</span>
          {[
            { key: 'All', name: 'All Bulletins', icon: Megaphone },
            { key: 'Announcement', name: 'Announcements', icon: Bell },
            { key: 'Alert', name: 'Emergency Alerts', icon: AlertTriangle },
            { key: 'Message', name: 'General Messages', icon: MessageSquare }
          ].map(f => {
            const Icon = f.icon;
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  isActive 
                    ? 'bg-brand-purple/15 text-brand-purple' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {f.name}
              </button>
            );
          })}
        </GlassCard>

        {/* Notices Board */}
        <GlassCard className="lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-6">
            <h3 className="text-base font-bold text-white font-display">Bulletin Board</h3>
            <span className="text-xs text-slate-500 font-medium">{filteredNotifs.length} bulletins active</span>
          </div>

          {loading ? (
            <ListSkeleton rows={3} />
          ) : filteredNotifs.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">No board messages posted for this filter.</p>
          ) : (
            <div className="space-y-6">
              {filteredNotifs.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-5 rounded-2xl border transition-colors ${
                    n.type === 'Alert' 
                      ? 'bg-red-500/5 border-red-500/15 shadow-glow-purple'
                      : 'bg-slate-950/40 border-slate-900'
                  }`}
                >
                  {/* Notice header */}
                  <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold border ${
                        n.type === 'Alert' 
                          ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                          : n.type === 'Message'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-brand-purple/10 text-brand-purple border-brand-purple/20'
                      }`}>
                        {n.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Author: <strong className="text-slate-400">{n.sender?.name || 'School Admin'}</strong> ({n.sender?.role || 'Staff'})
                    </span>
                  </div>

                  {/* Notice body */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-white text-sm">{n.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">{n.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Publish Notice Modal */}
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
                <h3 className="font-bold text-white text-base">Publish Bulletin Notice</h3>
                <button onClick={() => setCreateOpen(false)} className="p-1 rounded-lg hover:bg-slate-900 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Notice Title</label>
                  <input 
                    type="text" 
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    className="glass-input" 
                    required 
                    placeholder="Enter bulletin title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Notice Type</label>
                    <select 
                      value={newNotice.type}
                      onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value })}
                      className="glass-select"
                    >
                      <option value="Announcement">Announcement</option>
                      <option value="Alert">Emergency Alert</option>
                      <option value="Message">General Message</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Target Recipients</label>
                    <select 
                      value={newNotice.recipientRole}
                      onChange={(e) => setNewNotice({ ...newNotice, recipientRole: e.target.value })}
                      className="glass-select"
                    >
                      <option value="All">All Users</option>
                      <option value="Teacher">Teachers Only</option>
                      <option value="Parent">Parents Only</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Bulletin Content</label>
                  <textarea 
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    className="glass-input h-28" 
                    required 
                    placeholder="Enter notice details..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                  <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary flex items-center gap-1.5">
                    <Send className="w-4 h-4" />
                    Publish Bulletin
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Communication;
