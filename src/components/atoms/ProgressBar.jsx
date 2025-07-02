import React, { useEffect, useState } from 'react';

const ProgressBar = ({ 
  progress = 0, 
  max = 100,
  showLabel = true,
  size = 'md',
  variant = 'primary',
  animated = true,
  className = ''
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, animated]);
  
  const percentage = Math.min(Math.max((displayProgress / max) * 100, 0), 100);
  
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  const variants = {
    primary: 'bg-gradient-primary',
    secondary: 'bg-gradient-to-r from-secondary to-secondary/80',
    accent: 'bg-gradient-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error'
  };
  
  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Progress</span>
          <span className="font-medium text-white">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-700 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`${variants[variant]} ${sizes[size]} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;