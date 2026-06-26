import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { ListSkeleton } from '../components/Skeleton';
import { 
  HeartPulse, ShieldAlert, Edit3, X, 
  CheckCircle, Plus, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Medical = () => {
  const { user } = useAuth();
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Edit Form States
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    medicalConditions: '',
    emergencyProcedures: '',
    healthNotes: '',
    allergies: []
  });

  const [allergyInput, setAllergyInput] = useState({
    allergen: '',
    severity: 'Low',
    reaction: '',
    treatment: ''
  });

  const fetchMedicalRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/medical');
      if (res.data.success) {
        setRecords(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching medical records:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const handleEditClick = (record) => {
    setSelectedRecord(record);
    setFormData({
      medicalConditions: record.medicalConditions || '',
      emergencyProcedures: record.emergencyProcedures || '',
      healthNotes: record.healthNotes || '',
      allergies: record.allergies || []
    });
    setFormOpen(true);
  };

  const handleAddAllergy = () => {
    if (!allergyInput.allergen) return;
    setFormData({
      ...formData,
      allergies: [...formData.allergies, allergyInput]
    });
    setAllergyInput({ allergen: '', severity: 'Low', reaction: '', treatment: '' });
  };

  const handleRemoveAllergy = (idx) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter((_, i) => i !== idx)
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/medical/${selectedRecord.id}`, formData);
      if (res.data.success) {
        setFormOpen(false);
        fetchMedicalRecords();
      }
    } catch (err) {
      console.error('Error updating health logs:', err.message);
    }
  };

  const canWrite = user?.role !== 'Parent';

  // Count metrics
  const totalAllergiesCount = records.reduce((acc, r) => acc + (r.allergies?.length || 0), 0);
  const criticalAllergiesCount = records.reduce((acc, r) => acc + (r.allergies?.filter(a => a.severity === 'High').length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Health & Allergy Center</h2>
          <p className="text-xs text-slate-400">Monitor daycare allergy logs, document chronic health cases, and inspect critical emergency protocols.</p>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center justify-between relative overflow-hidden bg-gradient-to-r from-slate-900/60 to-slate-900/40">
          <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl" />
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Critical Allergies Listed</span>
            <h3 className="text-3xl font-display font-black text-red-400">{criticalAllergiesCount} Cases</h3>
            <p className="text-xs text-slate-400">High-severity anaphylaxis alerts requiring direct teacher supervision.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-500/20 text-red-400 border border-red-500/35 shadow-glow-purple">
            <ShieldAlert className="w-7 h-7" />
          </div>
        </GlassCard>

        <GlassCard className="flex items-center justify-between relative overflow-hidden bg-gradient-to-r from-slate-900/60 to-slate-900/40">
          <div className="absolute right-0 top-0 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl" />
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Active Allergens</span>
            <h3 className="text-3xl font-display font-black text-brand-blue">{totalAllergiesCount} Declared</h3>
            <p className="text-xs text-slate-400">Mild, moderate, or high-risk dietary and contact food items mapped.</p>
          </div>
          <div className="p-4 rounded-xl bg-brand-blue/20 text-brand-blue border border-brand-blue/35">
            <HeartPulse className="w-7 h-7" />
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 bg-slate-900/20">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-300">Staff Action Matrix</p>
            <p className="text-slate-500 mt-0.5 leading-tight">All class teachers are trained on epinephrine auto-injectors and emergency medicine placement.</p>
          </div>
        </GlassCard>
      </div>

      {/* Roster Listing */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-900">
          <h3 className="text-base font-bold text-white font-display">Student Health Roster</h3>
          <span className="text-xs text-slate-400 font-semibold">{records.length} files logged</span>
        </div>

        {loading ? (
          <ListSkeleton rows={3} />
        ) : records.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-6 text-center">No student health records loaded.</p>
        ) : (
          <div className="space-y-4">
            {records.map((rec) => (
              <div 
                key={rec.id} 
                className="p-5 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 transition-all grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
              >
                {/* Child info */}
                <div>
                  <h4 className="font-bold text-white text-sm">{rec.Student?.fullName}</h4>
                  <p className="text-xs text-slate-400">Class: {rec.Student?.Class?.name || 'Unassigned'} | ID: {rec.Student?.studentId}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Blood Group: <strong className="text-slate-300">{rec.Student?.bloodGroup || 'Not set'}</strong></p>
                  
                  {canWrite && (
                    <button 
                      onClick={() => handleEditClick(rec)}
                      className="mt-3 text-[10px] font-bold text-brand-purple hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Modify Health Profile
                    </button>
                  )}
                </div>

                {/* Allergies list */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Food / Item Allergies</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.allergies?.map((a) => (
                      <span 
                        key={a.id} 
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1.5 ${
                          a.severity === 'High' 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-glow-purple' 
                            : a.severity === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}
                      >
                        {a.allergen}
                        <span className="text-[8px] uppercase font-extrabold opacity-60">({a.severity})</span>
                      </span>
                    ))}
                    {(!rec.allergies || rec.allergies.length === 0) && (
                      <span className="text-xs text-slate-600 italic">No allergies registered</span>
                    )}
                  </div>
                </div>

                {/* Emergency details */}
                <div className="space-y-1.5 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-900">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Emergency Action Protocol</p>
                  <p className="text-slate-200"><strong className="text-slate-400">Diagnosis:</strong> {rec.medicalConditions || 'Healthy'}</p>
                  <p className="text-slate-300 leading-relaxed"><strong className="text-slate-400">Action:</strong> {rec.emergencyProcedures || 'Call parents, follow standard daycare guidelines.'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Edit Health Modal */}
      <AnimatePresence>
        {formOpen && selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFormOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6 flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between border-b border-slate-900 pb-3 shrink-0">
                <h3 className="font-bold text-white text-base">Edit Health Profile: {selectedRecord.Student?.fullName}</h3>
                <button onClick={() => setFormOpen(false)} className="p-1 rounded-lg hover:bg-slate-900 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto space-y-4 text-xs py-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Medical Diagnoses / Conditions</label>
                  <textarea 
                    value={formData.medicalConditions}
                    onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                    className="glass-input h-16" 
                    placeholder="e.g. Mild asthma, lactose intolerance..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Emergency Response Procedures</label>
                  <textarea 
                    value={formData.emergencyProcedures}
                    onChange={(e) => setFormData({ ...formData, emergencyProcedures: e.target.value })}
                    className="glass-input h-16" 
                    placeholder="Instructions for immediate support during events"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-400">General Health / Locker Notes</label>
                  <input 
                    type="text" 
                    value={formData.healthNotes}
                    onChange={(e) => setFormData({ ...formData, healthNotes: e.target.value })}
                    className="glass-input" 
                    placeholder="e.g. Keep warm water bottles, watch nap timings"
                  />
                </div>

                {/* Allergies editor */}
                <div className="border-t border-slate-900 pt-4 space-y-3">
                  <label className="font-bold text-slate-200 block uppercase tracking-wider text-[9px]">Configure Allergy List</label>
                  
                  {/* Current list */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {formData.allergies.map((a, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1.5"
                      >
                        {a.allergen} ({a.severity})
                        <button type="button" onClick={() => handleRemoveAllergy(idx)} className="text-red-400 hover:text-red-300">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    {formData.allergies.length === 0 && (
                      <p className="text-xs text-slate-500 italic">No custom allergies assigned.</p>
                    )}
                  </div>

                  {/* Add form */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-900 items-end">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[9px] text-slate-500 font-bold block">Allergen Item</label>
                      <input 
                        type="text" 
                        value={allergyInput.allergen}
                        onChange={(e) => setAllergyInput({ ...allergyInput, allergen: e.target.value })}
                        className="glass-input py-1.5 px-3" 
                        placeholder="e.g. Gluten"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-bold block">Severity</label>
                      <select 
                        value={allergyInput.severity}
                        onChange={(e) => setAllergyInput({ ...allergyInput, severity: e.target.value })}
                        className="glass-select py-1.5 px-3"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleAddAllergy}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 py-2 rounded-lg font-bold flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-900 shrink-0">
                  <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Update Health Dossier</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Medical;
