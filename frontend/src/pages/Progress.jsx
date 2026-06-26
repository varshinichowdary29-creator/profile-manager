import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { ListSkeleton } from '../components/Skeleton';
import { 
  Award, Radar as RadarIcon, Star, Plus, 
  X, Check, ClipboardList, BookOpen 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, RadialLinearScale, PointElement, 
  LineElement, Filler, Tooltip, Legend 
} from 'chart.js';

ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend
);

const Progress = () => {
  const { user } = useAuth();
  
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(true);

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    category: 'Cognitive',
    date: new Date().toISOString().split('T')[0],
    reports: [
      { skillName: 'Logic Reasoning', score: 4, remarks: '' },
      { skillName: 'Creative Thinking', score: 3, remarks: '' },
      { skillName: 'Focus Duration', score: 4, remarks: '' }
    ]
  });

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await axios.get('/students');
      if (res.data.success) {
        setStudents(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedStudentId(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching students list:', err.message);
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchAssessments = async (studentId) => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/progress/${studentId}`);
      if (res.data.success) {
        setAssessments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching progress reports:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      fetchAssessments(selectedStudentId);
    }
  }, [selectedStudentId]);

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        studentId: selectedStudentId,
        title: newAssessment.title,
        category: newAssessment.category,
        date: newAssessment.date,
        reports: newAssessment.reports
      };

      const res = await axios.post('/progress', payload);
      if (res.data.success) {
        setFormOpen(false);
        // Reset form
        setNewAssessment({
          title: '',
          category: 'Cognitive',
          date: new Date().toISOString().split('T')[0],
          reports: [
            { skillName: 'Logic Reasoning', score: 4, remarks: '' },
            { skillName: 'Creative Thinking', score: 3, remarks: '' },
            { skillName: 'Focus Duration', score: 4, remarks: '' }
          ]
        });
        fetchAssessments(selectedStudentId);
      }
    } catch (err) {
      console.error('Error creating assessment:', err.message);
    }
  };

  const handleScoreChange = (idx, val) => {
    setNewAssessment({
      ...newAssessment,
      reports: newAssessment.reports.map((r, i) => i === idx ? { ...r, score: parseInt(val) } : r)
    });
  };

  const handleRemarksChange = (idx, val) => {
    setNewAssessment({
      ...newAssessment,
      reports: newAssessment.reports.map((r, i) => i === idx ? { ...r, remarks: val } : r)
    });
  };

  const isParent = user?.role === 'Parent';
  const canWrite = user?.role === 'Super Admin' || user?.role === 'School Admin' || user?.role === 'Teacher';

  // Construct Radar Chart Data dynamically based on loaded assessments
  const getRadarData = (assessment) => {
    const labels = assessment.progressReports?.map(r => r.skillName) || [];
    const scores = assessment.progressReports?.map(r => r.score) || [];
    
    return {
      labels,
      datasets: [
        {
          label: assessment.title,
          data: scores,
          backgroundColor: 'rgba(124, 58, 237, 0.2)',
          borderColor: '#7c3aed',
          borderWidth: 2,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#2563eb'
        }
      ]
    };
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderWidth: 1,
        borderColor: '#334155'
      }
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(51, 65, 85, 0.2)' },
        grid: { color: 'rgba(51, 65, 85, 0.2)' },
        pointLabels: { color: '#94a3b8', font: { family: 'Outfit', size: 10 } },
        ticks: { color: '#64748b', backdropColor: 'transparent', stepSize: 1 },
        min: 0,
        max: 5
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Learning & Milestone Progress</h2>
          <p className="text-xs text-slate-400">Track child development matrices, document developmental milestones, and review radial charts.</p>
        </div>
        {canWrite && (
          <button 
            onClick={() => setFormOpen(true)} 
            disabled={!selectedStudentId}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Evaluate Student
          </button>
        )}
      </div>

      {/* Select Student Controls (Only for non-parents) */}
      {!isParent && !studentsLoading && (
        <GlassCard className="p-4 flex flex-col sm:flex-row items-center gap-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Student Folder:</span>
          <select 
            value={selectedStudentId} 
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="glass-select max-w-sm"
          >
            {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>)}
          </select>
        </GlassCard>
      )}

      {/* Roster Listing */}
      {loading ? (
        <ListSkeleton rows={3} />
      ) : assessments.length === 0 ? (
        <GlassCard className="text-center py-12 text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
          <BookOpen className="w-8 h-8 text-slate-650" />
          <p>No development reviews logged yet for this student.</p>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {assessments.map((assessment) => (
            <GlassCard key={assessment.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Radar Chart */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-full text-left mb-2">
                  <span className="text-[10px] text-brand-purple bg-brand-purple/10 px-2.5 py-0.5 rounded-full font-bold border border-brand-purple/20">
                    Category: {assessment.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5 font-display">{assessment.title}</h3>
                  <p className="text-[10px] text-slate-500">Evaluated on: {assessment.date}</p>
                </div>
                
                {/* Graph wrapper */}
                <div className="w-full h-[220px] relative">
                  <Radar data={getRadarData(assessment)} options={radarOptions} />
                </div>
              </div>

              {/* Skills rating checklist */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-900 pb-1">Development Breakdown</h4>
                <div className="space-y-3">
                  {assessment.progressReports?.map((report) => (
                    <div key={report.id} className="text-xs space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{report.skillName}</span>
                        <div className="flex text-amber-400 gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${
                                i < report.score ? 'fill-current' : 'text-slate-700'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                      {report.remarks && (
                        <p className="text-slate-400 leading-tight bg-slate-950/20 p-2 rounded border border-slate-900/60 font-medium">
                          {report.remarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Evaluate Student Modal */}
      <AnimatePresence>
        {formOpen && (
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
              className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative z-10 p-6 flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between border-b border-slate-900 pb-3 shrink-0">
                <h3 className="font-bold text-white text-base">Register Developmental Evaluation</h3>
                <button onClick={() => setFormOpen(false)} className="p-1 rounded-lg hover:bg-slate-900 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAssessment} className="flex-1 overflow-y-auto space-y-4 text-xs py-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-400">Evaluation Sheet Title</label>
                  <input 
                    type="text" 
                    value={newAssessment.title}
                    onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                    className="glass-input" 
                    required 
                    placeholder="e.g. Q2 Milestone Audit - Fine Motor"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Development Category</label>
                    <select 
                      value={newAssessment.category}
                      onChange={(e) => setNewAssessment({ ...newAssessment, category: e.target.value })}
                      className="glass-select"
                    >
                      <option value="Cognitive">Cognitive</option>
                      <option value="Physical/Motor">Physical/Motor</option>
                      <option value="Language">Language</option>
                      <option value="Social/Emotional">Social/Emotional</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-400">Assessment Date</label>
                    <input 
                      type="date" 
                      value={newAssessment.date}
                      onChange={(e) => setNewAssessment({ ...newAssessment, date: e.target.value })}
                      className="glass-input" 
                      required 
                    />
                  </div>
                </div>

                {/* Checklist editor */}
                <div className="border-t border-slate-900 pt-4 space-y-3">
                  <label className="font-bold text-slate-200 block uppercase tracking-wider text-[9px]">Milestone Skill Items</label>
                  
                  {newAssessment.reports.map((report, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/30 rounded-xl border border-slate-900 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-slate-200 text-xs">{report.skillName}</span>
                        <div className="flex items-center gap-1.5">
                          <label className="text-[10px] text-slate-500 font-bold">Rating:</label>
                          <select 
                            value={report.score}
                            onChange={(e) => handleScoreChange(idx, e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 focus:outline-none focus:border-brand-purple/40"
                          >
                            <option value="1">1 / 5</option>
                            <option value="2">2 / 5</option>
                            <option value="3">3 / 5</option>
                            <option value="4">4 / 5</option>
                            <option value="5">5 / 5</option>
                          </select>
                        </div>
                      </div>
                      <input 
                        type="text" 
                        value={report.remarks}
                        onChange={(e) => handleRemarksChange(idx, e.target.value)}
                        className="bg-slate-950/40 border border-slate-900 rounded px-2.5 py-1 w-full text-[11px] placeholder-slate-650 focus:outline-none focus:border-brand-purple/40"
                        placeholder="Progress comments..."
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-900 shrink-0">
                  <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Register Assessment</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Progress;
