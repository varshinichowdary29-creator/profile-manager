import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { ListSkeleton } from '../components/Skeleton';
import { 
  Calendar, CheckCircle2, AlertTriangle, AlertCircle, 
  HelpCircle, Save, Check, XCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from 'axios';

const Attendance = () => {
  const { user } = useAuth();
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [sheet, setSheet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [classesList, setClassesList] = useState([]);

  const fetchAttendanceSheet = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/attendance', {
        params: { classId: selectedClass, date }
      });
      if (res.data.success) {
        setSheet(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axiosInstance.get('/classes');
        if (res.data.success && res.data.data.length > 0) {
          setClassesList(res.data.data);
          setSelectedClass(res.data.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching classes:', err.message);
      }
    };
    if (user?.role !== 'Parent') {
      fetchClasses();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'Parent') {
      if (selectedClass) {
        fetchAttendanceSheet();
      }
    } else {
      // Parent role retrieves their own child's logs
      fetchParentChildLogs();
    }
  }, [date, selectedClass]);

  const [parentLogs, setParentLogs] = useState([]);
  const fetchParentChildLogs = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/dashboard/stats');
      if (res.data.success) {
        setParentLogs(res.data.attendance || []);
      }
    } catch (err) {
      console.error('Error loading parent logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setSheet(sheet.map(item => {
      if (item.studentId === studentId) {
        let checkIn = item.checkInTime;
        let checkOut = item.checkOutTime;
        
        if (status === 'Present') {
          checkIn = '09:00 AM';
          checkOut = '03:30 PM';
        } else if (status === 'Late') {
          checkIn = '09:45 AM';
          checkOut = '03:30 PM';
        } else {
          checkIn = '';
          checkOut = '';
        }

        return { ...item, status, checkInTime: checkIn, checkOutTime: checkOut };
      }
      return item;
    }));
  };

  const handleTimeChange = (studentId, field, val) => {
    setSheet(sheet.map(item => {
      if (item.studentId === studentId) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  const handleRemarksChange = (studentId, val) => {
    setSheet(sheet.map(item => {
      if (item.studentId === studentId) {
        return { ...item, remarks: val };
      }
      return item;
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        date,
        attendanceList: sheet.map(s => ({
          studentId: s.studentId,
          status: s.status,
          checkInTime: s.checkInTime,
          checkOutTime: s.checkOutTime,
          remarks: s.remarks
        }))
      };

      const res = await axiosInstance.post('/attendance', payload);
      if (res.data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchAttendanceSheet();
      }
    } catch (err) {
      console.error('Error saving attendance:', err.message);
    } finally {
      setSaving(false);
    }
  };

  const isParent = user?.role === 'Parent';

  // Stats summaries
  const presentCount = sheet.filter(s => s.status === 'Present').length;
  const absentCount = sheet.filter(s => s.status === 'Absent').length;
  const lateCount = sheet.filter(s => s.status === 'Late').length;
  const excusedCount = sheet.filter(s => s.status === 'Excused').length;
  const presenceRate = sheet.length > 0 ? Math.round(((presentCount + lateCount) / sheet.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Daily Attendance</h2>
          <p className="text-xs text-slate-400">Mark daily check-ins, record lates, and review classroom metrics.</p>
        </div>
        {!isParent && (
          <button 
            onClick={handleSaveAttendance} 
            disabled={saving || sheet.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saveSuccess ? (
              <>
                <Check className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Submit Register
              </>
            )}
          </button>
        )}
      </div>

      {isParent ? (
        /* Parent View - Children logs calendar list */
        <div className="grid grid-cols-1 gap-6">
          <GlassCard>
            <h3 className="text-lg font-bold font-display text-white mb-4">Your Child's Attendance Calendar</h3>
            {loading ? (
              <ListSkeleton rows={3} />
            ) : parentLogs.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No check-in entries logged yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Arrival</th>
                      <th className="py-3 px-4">Departure</th>
                      <th className="py-3 px-4">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {parentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/20 text-slate-200">
                        <td className="py-3.5 px-4 font-semibold">{log.Student?.fullName}</td>
                        <td className="py-3.5 px-4">{log.date}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            log.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : log.status === 'Late' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-300">{log.checkInTime || '--'}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-300">{log.checkOutTime || '--'}</td>
                        <td className="py-3.5 px-4 text-slate-400">{log.remarks || '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      ) : (
        /* Staff / Teacher View - Full Class Grid */
        <>
          {/* Controls Bar */}
          <GlassCard className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Select Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="glass-input pl-10" 
                />
              </div>
            </div>

            {/* Select Class */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Class Room</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="glass-select"
              >
                {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Summary Widget */}
            <div className="flex gap-4 items-center justify-around bg-slate-950/40 p-3 rounded-xl border border-slate-900">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Presence Rate</p>
                <h4 className="text-xl font-bold font-display text-white">{presenceRate}%</h4>
              </div>
              <div className="flex gap-2.5 text-[10px] font-semibold text-slate-400">
                <p className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />{presentCount} P</p>
                <p className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />{lateCount} L</p>
                <p className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />{absentCount} A</p>
              </div>
            </div>
          </GlassCard>

          {/* Roster Sheet Card */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-900/60">
              <h3 className="text-base font-bold text-white font-display">Student Roll Register</h3>
              <span className="text-xs text-slate-400 font-semibold">{sheet.length} student profiles found</span>
            </div>

            {loading ? (
              <ListSkeleton rows={4} />
            ) : sheet.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">No students registered in this class.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Status Marking</th>
                      <th className="py-3 px-4">Arrival</th>
                      <th className="py-3 px-4">Departure</th>
                      <th className="py-3 px-4">Journal Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40">
                    {sheet.map((student) => (
                      <tr key={student.studentId} className="hover:bg-slate-900/10 text-slate-200">
                        {/* Name */}
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-100">{student.fullName}</p>
                          <span className="text-[10px] text-slate-500 font-semibold">{student.studentIdCode}</span>
                        </td>
                        
                        {/* Toggle state */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-lg border border-slate-900 w-fit">
                            <button 
                              onClick={() => handleStatusChange(student.studentId, 'Present')}
                              className={`p-1 px-2.5 rounded-md font-bold transition-all text-[10px] ${
                                student.status === 'Present' 
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              Present
                            </button>
                            <button 
                              onClick={() => handleStatusChange(student.studentId, 'Late')}
                              className={`p-1 px-2.5 rounded-md font-bold transition-all text-[10px] ${
                                student.status === 'Late' 
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' 
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              Late
                            </button>
                            <button 
                              onClick={() => handleStatusChange(student.studentId, 'Absent')}
                              className={`p-1 px-2.5 rounded-md font-bold transition-all text-[10px] ${
                                student.status === 'Absent' 
                                  ? 'bg-red-500/15 text-red-400 border border-red-500/20' 
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              Absent
                            </button>
                            <button 
                              onClick={() => handleStatusChange(student.studentId, 'Excused')}
                              className={`p-1 px-2.5 rounded-md font-bold transition-all text-[10px] ${
                                student.status === 'Excused' 
                                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' 
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              Excused
                            </button>
                          </div>
                        </td>

                        {/* Check-In */}
                        <td className="py-3 px-4">
                          <input 
                            type="text" 
                            value={student.checkInTime}
                            onChange={(e) => handleTimeChange(student.studentId, 'checkInTime', e.target.value)}
                            className="bg-slate-950/40 border border-slate-900 rounded px-2 py-1 w-20 text-center font-semibold placeholder-slate-600 focus:outline-none focus:border-brand-purple/40"
                            placeholder="--:--"
                            disabled={student.status === 'Absent' || student.status === 'Excused'}
                          />
                        </td>

                        {/* Check-Out */}
                        <td className="py-3 px-4">
                          <input 
                            type="text" 
                            value={student.checkOutTime}
                            onChange={(e) => handleTimeChange(student.studentId, 'checkOutTime', e.target.value)}
                            className="bg-slate-950/40 border border-slate-900 rounded px-2 py-1 w-20 text-center font-semibold placeholder-slate-600 focus:outline-none focus:border-brand-purple/40"
                            placeholder="--:--"
                            disabled={student.status === 'Absent' || student.status === 'Excused'}
                          />
                        </td>

                        {/* Remarks */}
                        <td className="py-3 px-4">
                          <input 
                            type="text" 
                            value={student.remarks}
                            onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                            className="bg-slate-950/40 border border-slate-900 rounded px-2.5 py-1 w-full placeholder-slate-600 focus:outline-none focus:border-brand-purple/40"
                            placeholder="Optional notes..."
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </>
      )}
    </div>
  );
};

export default Attendance;
