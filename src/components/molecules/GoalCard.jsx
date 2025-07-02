import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import ProgressBar from '@/components/atoms/ProgressBar';
import Button from '@/components/atoms/Button';
import { format } from 'date-fns';

const GoalCard = ({ goal, onEdit, onDelete, showActions = true }) => {
  const getCategoryVariant = (category) => {
    return category === 'personal' ? 'personal' : 'professional';
  };
  
  const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysRemaining = getDaysRemaining(goal.targetDate);
  
return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-surface rounded-xl p-4 sm:p-6 border border-slate-600/50 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl"
    >
<div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <Link to={`/goals/${goal.Id}`}>
            <h3 className="text-base sm:text-lg font-display font-semibold text-white hover:text-primary transition-colors cursor-pointer line-clamp-2">
              {goal.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={getCategoryVariant(goal.category)} size="sm">
              <ApperIcon 
                name={goal.category === 'personal' ? 'Heart' : 'Briefcase'} 
                size={12} 
                className="mr-1"
              />
              {goal.category}
            </Badge>
          </div>
        </div>
{showActions && (
          <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(goal)}
              className="p-1.5 sm:p-2 min-w-0"
            >
              <ApperIcon name="Edit2" size={14} className="sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(goal.Id)}
              className="p-1.5 sm:p-2 hover:text-error min-w-0"
            >
              <ApperIcon name="Trash2" size={14} className="sm:w-4 sm:h-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <ProgressBar
          progress={goal.progress}
          variant="primary"
          animated={true}
        />
      </div>
      
<div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-0 text-xs sm:text-sm text-slate-400">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="flex items-center gap-1">
            <ApperIcon name="Target" size={12} className="sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline">{goal.milestones?.length || 0} milestones</span>
            <span className="xs:hidden">{goal.milestones?.length || 0}</span>
          </span>
          <span className="flex items-center gap-1">
            <ApperIcon name="Calendar" size={12} className="sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">{daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}</span>
            <span className="sm:hidden">{daysRemaining > 0 ? `${daysRemaining}d` : 'Late'}</span>
          </span>
        </div>
        
        <div className={`flex items-center gap-1 ${goal.status === 'completed' ? 'text-success' : goal.status === 'paused' ? 'text-warning' : 'text-primary'}`}>
          <ApperIcon 
            name={goal.status === 'completed' ? 'CheckCircle' : goal.status === 'paused' ? 'Pause' : 'Play'} 
            size={14} 
          />
          <span className="capitalize">{goal.status}</span>
        </div>
      </div>
      
{goal.description && (
        <p className="text-slate-400 text-xs sm:text-sm mt-2 sm:mt-3 line-clamp-2">
          {goal.description}
        </p>
      )}
    </motion.div>
  );
};

export default GoalCard;