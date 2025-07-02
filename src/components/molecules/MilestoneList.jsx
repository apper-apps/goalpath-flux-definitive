import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";

const MilestoneList = ({ milestones, onToggle, showCheckboxes = true }) => {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <ApperIcon name="Target" size={32} className="mx-auto mb-3 opacity-50" />
        <p>No milestones yet</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {milestones.map((milestone, index) => (
        <motion.div
          key={milestone.Id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`
            flex items-start gap-4 p-4 rounded-lg border transition-all duration-200
            ${milestone.completed 
              ? 'bg-success/10 border-success/30 text-success' 
              : 'bg-surface border-slate-600 hover:border-slate-500'
            }
          `}
        >
{showCheckboxes && (
            <button
              onClick={() => {
                onToggle(milestone.Id);
if (!milestone.completed) {
                  // Trigger celebration for milestone completion
                  setTimeout(() => {
                    const event = typeof CustomEvent !== 'undefined' 
                      ? new CustomEvent('milestone-completed', {
                          detail: {
                            type: 'milestone',
                            title: milestone.title,
                            message: `🎉 Milestone completed: ${milestone.title}!`
                          }
                        })
                      : new Event('milestone-completed');
                    
                    if (typeof CustomEvent === 'undefined' && event.detail === undefined) {
                      event.detail = {
                        type: 'milestone',
                        title: milestone.title,
                        message: `🎉 Milestone completed: ${milestone.title}!`
                      };
                    }
                    
                    window.dispatchEvent(event);
                  }, 100);
                }
              }}
              className={`
                flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${milestone.completed
                  ? 'bg-success border-success text-white bounce-in'
                  : 'border-slate-500 hover:border-primary'
                }
              `}
            >
              {milestone.completed && (
                <ApperIcon name="Check" size={14} />
              )}
            </button>
          )}
          
          <div className="flex-1 min-w-0">
            <h4 className={`
              font-medium transition-all duration-200
              ${milestone.completed 
                ? 'line-through text-success/80' 
                : 'text-white'
              }
            `}>
              {milestone.title}
            </h4>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <ApperIcon name="Calendar" size={12} />
                Due {format(new Date(milestone.dueDate), 'MMM d, yyyy')}
              </span>
              
              {milestone.completed && milestone.completedAt && (
                <span className="flex items-center gap-1 text-success">
                  <ApperIcon name="CheckCircle" size={12} />
                  Completed {format(new Date(milestone.completedAt), 'MMM d')}
                </span>
              )}
            </div>
          </div>
          
          <div className={`
            flex-shrink-0 text-xs px-2 py-1 rounded-full
            ${milestone.completed 
              ? 'bg-success/20 text-success' 
              : new Date(milestone.dueDate) < new Date()
                ? 'bg-error/20 text-error'
                : 'bg-primary/20 text-primary'
            }
          `}>
            {milestone.completed 
              ? 'Complete' 
              : new Date(milestone.dueDate) < new Date()
                ? 'Overdue'
                : 'Pending'
            }
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MilestoneList;