import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const Empty = ({ 
  title = "Nothing here yet",
  message = "Get started by creating your first item",
  icon = "Plus",
  actionLabel = "Get Started",
  onAction,
  illustration
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {illustration ? (
        <div className="w-32 h-32 mb-8 rounded-full bg-gradient-primary opacity-10 flex items-center justify-center">
          {illustration}
        </div>
      ) : (
        <div className="w-20 h-20 mb-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center glow">
          <ApperIcon 
            name={icon} 
            size={40} 
            className="text-primary"
          />
        </div>
      )}
      
      <h3 className="text-2xl font-display font-bold gradient-text mb-4">
        {title}
      </h3>
      
      <p className="text-slate-400 mb-8 max-w-md text-lg">
        {message}
      </p>
      
      {onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          size="lg"
          className="px-8 py-4 text-lg glow"
        >
          <ApperIcon name={icon} size={20} className="mr-3" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;