import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import GlassCard from '../components/GlassCard';
import { DashboardSkeleton } from '../components/Skeleton';
import { 
  Users, CalendarCheck, Landmark, Home, 
  FileText, Activity, Clock, ShieldCheck, Heart 
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, 
  LineElement, BarElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, 
  Title, Tooltip, Legend, Filler
);

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await axios.get('/dashboard/stats');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return <p className="text-slate-400">Error loading dashboard statistics.</p>;

  const role = data.role;

  // Chart configs
  const lineChartData = {
    labels: data.monthlyTrends?.map(t => t.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Attendance Rate %',
      data: data.monthlyTrends?.map(t => t.rate) || [94, 96, 95, 98, 97, 98],
      fill: true,
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124, 58, 237, 0.08)',
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: '#2563eb'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Outfit' },
        bodyFont: { family: 'Inter' },
        borderWidth: 1,
        borderColor: '#334155'
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { min: 80, max: 100, grid: { color: 'rgba(51, 65, 85, 0.2)' }, ticks: { color: '#94a3b8' } }
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl -z-10" />
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-display text-white">Welcome back, {user?.name}!</h2>
          <p className="text-slate-400 text-sm">Here is a summary of what's happening at FirstCry Intellitots today.</p>
        </div>
        <div>
          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-brand-purple/20 text-brand-purple border border-brand-purple/30 shadow-glow-purple">
            Role: {role}
          </span>
        </div>
      </div>

      {/* Render layout according to roles */}
      {(role === 'Super Admin' || role === 'School Admin' || role === 'Front Desk Staff') && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Active Students" 
              value={data.stats.totalStudents} 
              icon={Users} 
              colorClass="from-brand-purple to-pink-500"
            />
            <StatCard 
              title="Total Classes" 
              value={data.stats.totalClasses} 
              icon={Home} 
              colorClass="from-brand-blue to-indigo-500"
            />
            <StatCard 
              title="Today's Attendance" 
              value={`${data.stats.attendanceRate}%`} 
              icon={CalendarCheck} 
              colorClass="from-brand-cyan to-emerald-500"
            />
            <StatCard 
              title="Outstanding Dues" 
              value={`₹${data.stats.pendingFees.toLocaleString()}`} 
              icon={Landmark} 
              colorClass="from-amber-500 to-orange-500"
            />
          </div>

          {/* Graph and Logs split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="lg:col-span-2 flex flex-col justify-between h-[360px]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white font-display">Attendance Analytics</h3>
                  <p className="text-xs text-slate-400">Monthly average attendance tracking trends</p>
                </div>
                <span className="p-2 rounded-lg bg-slate-950/40 text-brand-purple"><Activity className="w-5 h-5" /></span>
              </div>
              <div className="flex-1 min-h-0 relative">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col h-[360px]">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800/40 pb-3">
                <h3 className="text-base font-bold text-white font-display">System Operations Log</h3>
                <span className="p-2 rounded-lg bg-slate-950/40 text-brand-blue"><Clock className="w-5 h-5" /></span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {data.recentLogs?.map((log) => (
                  <div key={log.id} className="text-xs p-3 rounded-xl bg-slate-950/40 border border-slate-900/60 flex items-start gap-3">
                    <span className="p-1.5 rounded-lg bg-slate-900 text-slate-400 mt-0.5"><ShieldCheck className="w-3.5 h-3.5" /></span>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-200">{log.action}</p>
                      <p className="text-slate-400 leading-tight">{log.details}</p>
                      <span className="text-[10px] text-slate-500 font-medium block pt-0.5">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {log.User?.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </>
      )}

      {role === 'Teacher' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Assigned Classes" 
              value={data.stats.managedClasses} 
              icon={Home} 
              colorClass="from-brand-blue to-indigo-500"
            />
            <StatCard 
              title="Class Strength" 
              value={data.stats.classStrength} 
              icon={Users} 
              colorClass="from-brand-purple to-pink-500"
            />
            <StatCard 
              title="Class Attendance" 
              value={`${data.stats.attendanceRate}%`} 
              icon={CalendarCheck} 
              colorClass="from-brand-cyan to-emerald-500"
            />
            <StatCard 
              title="Class Pending Fees" 
              value={`₹${data.stats.classPendingFees.toLocaleString()}`} 
              icon={Landmark} 
              colorClass="from-amber-500 to-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="lg:col-span-2">
              <h3 className="text-lg font-bold font-display text-white mb-4">Your Class Strength Overview</h3>
              <div className="space-y-4">
                {data.classes?.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{c.name}</h4>
                      <p className="text-xs text-slate-400">Class Room: {c.room || 'N/A'} | Capacity: {c.capacity}</p>
                    </div>
                    <span className="text-xs bg-brand-purple/10 text-brand-purple border border-brand-purple/20 px-3 py-1 rounded-full font-semibold">
                      Managed Class
                    </span>
                  </div>
                ))}
                {data.classes?.length === 0 && (
                  <p className="text-xs text-slate-500 py-6 text-center">No assigned classes listed.</p>
                )}
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-base font-bold font-display text-white mb-4 border-b border-slate-800 pb-2">Upcoming Activities</h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="p-3 rounded-lg bg-slate-950/30 border border-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-purple shrink-0" />
                  <span>Term evaluation sheet submission due Friday.</span>
                </li>
                <li className="p-3 rounded-lg bg-slate-950/30 border border-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan shrink-0" />
                  <span>Check allergy records before sports meet.</span>
                </li>
              </ul>
            </GlassCard>
          </div>
        </>
      )}

      {role === 'Parent' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Registered Children" 
              value={data.stats.childrenCount} 
              icon={Users} 
              colorClass="from-brand-purple to-pink-500"
            />
            <StatCard 
              title="Child Attendance Rate" 
              value={`${data.stats.attendanceRate}%`} 
              icon={CalendarCheck} 
              colorClass="from-brand-cyan to-emerald-500"
            />
            <StatCard 
              title="Child Pending Fees" 
              value={`₹${data.stats.pendingFees.toLocaleString()}`} 
              icon={Landmark} 
              colorClass="from-amber-500 to-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="text-lg font-bold font-display text-white mb-4">Your Children</h3>
              <div className="space-y-4">
                {data.children?.map((kid) => (
                  <div key={kid.id} className="p-4 rounded-xl bg-slate-950/40 border border-slate-900/60 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-purple/20 to-brand-blue/20 flex items-center justify-center font-bold text-brand-purple text-lg">
                      {kid.fullName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{kid.fullName}</h4>
                      <p className="text-xs text-slate-400">Class: {kid.Class?.name || 'Unassigned'} | Section: {kid.studentId}</p>
                    </div>
                  </div>
                ))}
                {data.children?.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-6">No children associated with this profile.</p>
                )}
              </div>
            </GlassCard>

            <GlassCard className="flex flex-col h-[280px]">
              <h3 className="text-base font-bold font-display text-white mb-4 border-b border-slate-800 pb-2">Recent Child Sign-ins</h3>
              <div className="flex-1 overflow-y-auto space-y-2">
                {data.attendance?.map((att) => (
                  <div key={att.id} className="text-xs p-3 rounded-lg bg-slate-950/20 border border-slate-900 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200">{att.Student?.fullName}</span>
                      <p className="text-[10px] text-slate-500">{att.date}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      att.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {att.status} (In: {att.checkInTime || 'N/A'})
                    </span>
                  </div>
                ))}
                {data.attendance?.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-6">No sign-in records for this child.</p>
                )}
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
