import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { format, isWeekend } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import { milestoneService } from "@/services/api/milestoneService";

const MilestoneList = ({ milestones, onToggle, showCheckboxes = true, goalId }) => {
  // Track behavioral context and trigger smart adjustments when milestones are rendered
  useEffect(() => {
    if (milestones && milestones.length > 0 && goalId) {
      milestoneService.trackMilestoneViewing(goalId, milestones);
      
      // Trigger smart adjustment check
      milestoneService.checkAndApplySmartAdjustments(goalId, milestones)
        .then(adjustments => {
if (adjustments.length > 0) {     
            // Notify parent component about adjustments
            setTimeout(() => {
              let event;
              try {
                event = new CustomEvent('milestones-adjusted', {
                  detail: { adjustments, goalId }
                });
              } catch (e) {
                // Fallback for older browsers
                event = document.createEvent('CustomEvent');
                event.initCustomEvent('milestones-adjusted', false, false, {
                  adjustments, goalId
                });
              }
              window.dispatchEvent(event);
            }, 100);
          }
        })
        .catch(console.warn);
    }
  }, [milestones, goalId]);
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
onClick={async () => {
                // Track behavioral context before completion
                const completionContext = {
                  isWeekend: isWeekend(new Date()),
                  timeOfDay: new Date().getHours(),
                  daysSinceCreated: Math.floor((new Date() - new Date(milestone.createdAt)) / (1000 * 60 * 60 * 24))
                };

                onToggle(milestone.Id);
                
                if (!milestone.completed) {
                  // Record completion behavior for future pacing
                  await milestoneService.recordCompletionBehavior(
                    milestone.Id, 
                    goalId, 
                    completionContext
                  );
                  
                  // Check for stress indicators and trigger smart adjustments
                  try {
                    const stressAnalysis = await milestoneService.analyzeStressIndicators(goalId);
                    if (stressAnalysis.stressLevel > 0.6) {
                      const adjustments = await milestoneService.applyStressBasedAdjustments(goalId, stressAnalysis);
if (adjustments.length > 0) {
                        // Notify about stress-based adjustments
                        setTimeout(() => {
                          let event;
                          try {
                            event = new CustomEvent('stress-adjustments-applied', {
                              detail: { adjustments, stressLevel: stressAnalysis.stressLevel }
                            });
                          } catch (e) {
                            // Fallback for older browsers
                            event = document.createEvent('CustomEvent');
                            event.initCustomEvent('stress-adjustments-applied', false, false, {
                              adjustments, stressLevel: stressAnalysis.stressLevel
                            });
                          }
                          window.dispatchEvent(event);
                        }, 500);
                      }
                    }
                  } catch (error) {
                    console.warn('Smart adjustment failed:', error);
                  }
                  
// Trigger celebration for milestone completion
                  setTimeout(() => {
                    let event;
                    try {
                      event = new CustomEvent('milestone-completed', {
                        detail: {
                          type: 'milestone',
                          title: milestone.title,
                          message: `🎉 Milestone completed: ${milestone.title}!`
                        }
                      });
                    } catch (e) {
                      // Fallback for older browsers
                      event = document.createEvent('CustomEvent');
                      event.initCustomEvent('milestone-completed', false, false, {
                        type: 'milestone',
                        title: milestone.title,
                        message: `🎉 Milestone completed: ${milestone.title}!`
                      });
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
          
          <div className="flex flex-col items-end gap-1">
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
            
{/* Show context-aware difficulty indicator */}
            {milestone.difficulty && (
              <div className={`
                text-xs px-2 py-0.5 rounded-full flex items-center gap-1
                ${milestone.difficulty === 'light' 
                  ? 'bg-green-500/20 text-green-400' 
                  : milestone.difficulty === 'moderate'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }
              `}>
                <ApperIcon 
                  name={milestone.difficulty === 'light' ? 'Feather' : milestone.difficulty === 'moderate' ? 'Activity' : 'Zap'} 
                  size={10} 
                />
                {milestone.difficulty}
              </div>
            )}
            
            {/* Smart adjustment indicator */}
            {milestone.adjustedBy && (
              <div className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
                <ApperIcon name="Sparkles" size={10} />
                AI Adjusted
              </div>
            )}
            
            {/* Adjustment reason tooltip */}
            {milestone.adjustmentReason && (
              <div className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1" title={milestone.adjustmentReason}>
                <ApperIcon name="Info" size={10} />
                {milestone.adjustmentReason.includes('stress') ? 'Stress Relief' : 
                 milestone.adjustmentReason.includes('behind') ? 'Schedule Help' : 'Optimized'}
              </div>
            )}
            
            {/* Weekend-friendly indicator */}
            {milestone.weekendFriendly && isWeekend(new Date()) && (
              <div className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
                <ApperIcon name="Coffee" size={10} />
                Weekend-friendly
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MilestoneList;