import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-primary text-white hover:brightness-110 focus:ring-primary shadow-lg hover:shadow-xl transform hover:scale-[1.02]',
    secondary: 'bg-surface text-slate-300 hover:text-white hover:bg-slate-700 focus:ring-surface border border-slate-600',
    accent: 'bg-gradient-accent text-white hover:brightness-110 focus:ring-accent shadow-lg hover:shadow-xl transform hover:scale-[1.02] glow-accent',
    ghost: 'text-slate-400 hover:text-white hover:bg-surface focus:ring-slate-600',
    danger: 'bg-error text-white hover:bg-red-600 focus:ring-error',
    success: 'bg-success text-white hover:bg-green-600 focus:ring-success'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <motion.button
      className={classes}
      disabled={disabled || loading}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;