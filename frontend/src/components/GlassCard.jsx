import React from 'react';

const GlassCard = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`glass-panel p-6 ${onClick ? 'cursor-pointer hover:border-slate-700/60 hover:shadow-black/20 hover:scale-[1.01] transition-all duration-300' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassCard;
