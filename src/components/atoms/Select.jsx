import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const Select = ({ 
  label, 
  error, 
  options = [],
  className = '',
  required = false,
  ...props 
}) => {
  const selectClasses = `
    w-full px-4 py-3 bg-surface border rounded-lg text-white 
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary 
    focus:border-transparent appearance-none cursor-pointer
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
      <div className="relative">
        <select className={selectClasses} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-surface text-white">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ApperIcon name="ChevronDown" size={20} className="text-slate-400" />
        </div>
      </div>
      {error && (
        <p className="text-error text-sm">{error}</p>
      )}
    </div>
  );
};

export default Select;