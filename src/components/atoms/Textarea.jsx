import React from 'react';

const Textarea = ({ 
  label, 
  error, 
  className = '',
  required = false,
  rows = 4,
  ...props 
}) => {
  const textareaClasses = `
    w-full px-4 py-3 bg-surface border rounded-lg text-white placeholder-slate-400 
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary 
    focus:border-transparent resize-none
    ${error ? 'border-error' : 'border-slate-600 hover:border-slate-500'}
    ${className}
  `;
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      {error && (
        <p className="text-error text-sm">{error}</p>
      )}
    </div>
  );
};

export default Textarea;