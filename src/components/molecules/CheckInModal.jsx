import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { format } from 'date-fns';

const CheckInModal = ({ 
  isOpen, 
  onClose, 
  goals = [], 
  streak = 0,
  onSubmit,
  isLoading = false
}) => {
  const [selectedMilestones, setSelectedMilestones] = useState([]);
  const [mood, setMood] = useState(3);
  const [notes, setNotes] = useState('');
  
  const moodOptions = [
    { value: 1, emoji: '😞', label: 'Very Bad' },
    { value: 2, emoji: '😕', label: 'Bad' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '😊', label: 'Good' },
    { value: 5, emoji: '😄', label: 'Excellent' }
  ];
  
  const toggleMilestone = (milestoneId) => {
    setSelectedMilestones(prev => 
      prev.includes(milestoneId)
        ? prev.filter(id => id !== milestoneId)
        : [...prev, milestoneId]
    );
  };
  
  const handleSubmit = () => {
    const checkInData = {
      date: new Date().toISOString(),
      mood,
      completedMilestones: selectedMilestones,
      notes: notes.trim()
    };
    
    onSubmit(checkInData);
  };
  
  const activeMilestones = goals
    .filter(goal => goal.status === 'active')
    .flatMap(goal => 
      (goal.milestones || [])
        .filter(milestone => !milestone.completed)
        .map(milestone => ({ ...milestone, goalTitle: goal.title, goalCategory: goal.category }))
    );
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-surface rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-600/50"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold gradient-text">
                Daily Check-in
              </h2>
              <p className="text-slate-400 mt-1">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">{streak}</div>
                <div className="text-xs text-slate-400">Day Streak</div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <ApperIcon name="X" size={20} />
              </Button>
            </div>
          </div>
          
          {/* Mood Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-4">How are you feeling today?</h3>
            <div className="grid grid-cols-5 gap-3">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200 text-center
                    ${mood === option.value 
                      ? 'border-primary bg-primary/10 scale-105' 
                      : 'border-slate-600 hover:border-slate-500'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">{option.emoji}</div>
                  <div className="text-xs text-slate-400">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Milestones */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-4">
              Complete Milestones ({selectedMilestones.length})
            </h3>
            
            {activeMilestones.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <ApperIcon name="Target" size={32} className="mx-auto mb-3 opacity-50" />
                <p>No active milestones to complete</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activeMilestones.map((milestone) => (
                  <div
                    key={milestone.Id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-surface border border-slate-600"
                  >
                    <button
                      type="button"
                      onClick={() => toggleMilestone(milestone.Id)}
                      className={`
                        flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
                        ${selectedMilestones.includes(milestone.Id)
                          ? 'bg-primary border-primary text-white'
                          : 'border-slate-400 hover:border-primary'
                        }
                      `}
                    >
                      {selectedMilestones.includes(milestone.Id) && (
                        <ApperIcon name="Check" size={12} />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white">{milestone.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                        <span className={`
                          px-2 py-0.5 rounded-full text-xs
                          ${milestone.goalCategory === 'personal' 
                            ? 'bg-accent/20 text-accent' 
                            : 'bg-primary/20 text-primary'
                          }
                        `}>
                          {milestone.goalTitle}
                        </span>
                        <span>Due {format(new Date(milestone.dueDate), 'MMM d')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did today go? Any thoughts or reflections..."
              rows={3}
              className="w-full px-4 py-3 bg-surface border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              variant="primary"
              loading={isLoading}
              className="flex-1"
            >
              <ApperIcon name="CheckCircle" size={20} className="mr-2" />
              Complete Check-in
            </Button>
            
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CheckInModal;