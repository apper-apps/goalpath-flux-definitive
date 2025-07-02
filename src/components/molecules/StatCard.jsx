import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  variant = 'default',
  subtitle,
  className = ''
}) => {
  const variants = {
    default: 'bg-gradient-surface border-slate-600/50',
    primary: 'bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30',
    success: 'bg-gradient-to-br from-success/20 to-success/5 border-success/30',
    warning: 'bg-gradient-to-br from-warning/20 to-warning/5 border-warning/30',
    accent: 'bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30'
  };
  
  const iconColors = {
    default: 'text-slate-400',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    accent: 'text-accent'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`
        ${variants[variant]} rounded-xl p-6 border transition-all duration-300 
        hover:shadow-lg ${className}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-white/5 ${iconColors[variant]}`}>
          <ApperIcon name={icon} size={24} />
        </div>
        
        {trend && (
          <div className={`
            flex items-center gap-1 text-xs px-2 py-1 rounded-full
            ${trend > 0 
              ? 'bg-success/20 text-success' 
              : trend < 0 
                ? 'bg-error/20 text-error'
                : 'bg-slate-600/20 text-slate-400'
            }
          `}>
            <ApperIcon 
              name={trend > 0 ? 'TrendingUp' : trend < 0 ? 'TrendingDown' : 'Minus'} 
              size={12} 
            />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-display font-bold text-white mb-1">
          {value}
        </h3>
        <p className="text-slate-400 text-sm">{title}</p>
        {subtitle && (
          <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;