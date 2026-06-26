import React from 'react';
import GlassCard from './GlassCard';

const StatCard = ({ title, value, icon: Icon, trend, colorClass = 'from-brand-purple to-brand-blue' }) => {
  return (
    <GlassCard className="flex items-center justify-between relative overflow-hidden group">
      {/* Background glow hover effect */}
      <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-gradient-to-tr ${colorClass} opacity-[0.03] group-hover:opacity-[0.08] blur-xl transition-all duration-500`} />
      
      <div>
        <span className="text-slate-400 text-sm font-medium tracking-wide block uppercase mb-1">{title}</span>
        <h3 className="text-3xl font-display font-bold text-white tracking-tight">{value}</h3>
        {trend && (
          <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1 mt-1.5">
            {trend}
          </span>
        )}
      </div>

      <div className={`p-3.5 rounded-xl bg-gradient-to-r ${colorClass} shadow-md group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </GlassCard>
  );
};

export default StatCard;
