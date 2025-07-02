import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const Error = ({ 
  message = "Something went wrong", 
  onRetry,
  icon = "AlertTriangle",
  title = "Oops!"
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-error/20 to-error/10 flex items-center justify-center">
        <ApperIcon 
          name={icon} 
          size={32} 
          className="text-error"
        />
      </div>
      
      <h3 className="text-xl font-display font-semibold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-slate-400 mb-6 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="primary"
          className="px-6 py-3"
        >
          <ApperIcon name="RefreshCw" size={16} className="mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default Error;