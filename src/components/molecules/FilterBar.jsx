import React from 'react';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const FilterBar = ({ 
  activeFilter, 
  onFilterChange, 
  filters = [],
  showSearch = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...'
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className="flex items-center gap-2"
          >
            {filter.icon && <ApperIcon name={filter.icon} size={16} />}
            {filter.label}
            {filter.count !== undefined && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {filter.count}
              </span>
            )}
          </Button>
        ))}
      </div>
      
      {showSearch && (
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <ApperIcon 
            name="Search" 
            size={20} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}
    </div>
  );
};

export default FilterBar;