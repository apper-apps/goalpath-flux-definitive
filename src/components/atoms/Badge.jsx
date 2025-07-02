import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const variants = {
    default: 'bg-slate-600 text-slate-200',
    primary: 'bg-gradient-primary text-white',
    secondary: 'bg-gradient-to-r from-secondary/20 to-secondary/10 text-secondary border border-secondary/30',
    accent: 'bg-gradient-accent text-white',
    success: 'bg-success/20 text-success border border-success/30',
    warning: 'bg-warning/20 text-warning border border-warning/30',
    error: 'bg-error/20 text-error border border-error/30',
    personal: 'bg-gradient-to-r from-accent/20 to-accent/10 text-accent border border-accent/30',
    professional: 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30'
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default Badge;