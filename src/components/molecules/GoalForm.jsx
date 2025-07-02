import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Input from '@/components/atoms/Input';
import Textarea from '@/components/atoms/Textarea';
import Select from '@/components/atoms/Select';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { format } from 'date-fns';

const GoalForm = ({ 
  goal = null, 
  template = null,
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  // Calculate target date for template
  const getTemplateTargetDate = () => {
    if (template?.suggestedDuration) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + template.suggestedDuration);
      return format(targetDate, 'yyyy-MM-dd');
    }
    return '';
  };

  const [formData, setFormData] = useState({
    title: goal?.title || template?.title || '',
    description: goal?.description || template?.description || '',
    category: goal?.category || template?.category || 'personal',
    targetDate: goal?.targetDate ? format(new Date(goal.targetDate), 'yyyy-MM-dd') : getTemplateTargetDate(),
    status: goal?.status || 'active'
  });
  
  const [errors, setErrors] = useState({});
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  
  const categoryOptions = [
    { value: 'personal', label: 'Personal' },
    { value: 'professional', label: 'Professional' }
  ];
  
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' }
  ];
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.targetDate) {
      newErrors.targetDate = 'Target date is required';
    } else if (new Date(formData.targetDate) <= new Date()) {
      newErrors.targetDate = 'Target date must be in the future';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        targetDate: new Date(formData.targetDate).toISOString()
      });
    }
  };
  
const generateAIMilestones = async () => {
    setShowAISuggestions(true);
    
    try {
      // Import milestone service for context-aware generation
      const { milestoneService } = await import('@/services/api/milestoneService');
      
      // Generate context-aware milestones based on user behavior
      const contextAwareMilestones = await milestoneService.generateContextAwareMilestones({
        goalTitle: formData.title,
        goalDescription: formData.description,
        category: formData.category,
        targetDate: formData.targetDate,
        userPreferences: {
          preferredDifficulty: 'adaptive', // Will adapt based on user history
          weekendTaskPreference: 'lighter', // Prefer lighter tasks on weekends
          pacingStyle: 'consistent' // Can be 'aggressive', 'consistent', or 'relaxed'
        }
      });
      
      console.log('Generated context-aware milestones:', contextAwareMilestones);
      
      // Simulate processing time for better UX
      setTimeout(() => {
        setShowAISuggestions(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error generating context-aware milestones:', error);
      setShowAISuggestions(false);
    }
  };
  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Goal Title"
            required
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={errors.title}
            placeholder="Enter your goal title..."
          />
        </div>
        
        <Select
          label="Category"
          required
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          options={categoryOptions}
          error={errors.category}
        />
        
        <Input
          label="Target Date"
          type="date"
          required
          value={formData.targetDate}
          onChange={(e) => handleChange('targetDate', e.target.value)}
          error={errors.targetDate}
        />
        
        {goal && (
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            options={statusOptions}
          />
        )}
        
        <div className="md:col-span-2">
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe your goal in detail..."
            rows={4}
          />
        </div>
      </div>
      
{template && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-accent/5 border border-accent/20 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <ApperIcon name={template.icon} size={16} className="text-accent" />
            <h4 className="font-medium text-white">Template Selected</h4>
          </div>
          <p className="text-slate-400 text-sm">
            Using "{template.title}" template with {template.milestoneTemplates.length} pre-designed milestones
          </p>
        </motion.div>
      )}

      {!goal && !template && formData.title && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-primary/5 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-white flex items-center gap-2">
              <ApperIcon name="Sparkles" size={20} className="text-primary" />
              AI Milestone Generator
            </h4>
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={generateAIMilestones}
              loading={showAISuggestions}
            >
              Generate Milestones
            </Button>
</div>
          <p className="text-slate-400 text-sm mb-3">
            Generate smart milestones that adapt to your completion patterns and suggest lighter tasks for weekends.
          </p>
          
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full">
              <ApperIcon name="Brain" size={12} />
              Behavioral Learning
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 rounded-full">
              <ApperIcon name="Coffee" size={12} />
              Weekend-Friendly
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full">
              <ApperIcon name="TrendingUp" size={12} />
              Adaptive Pacing
            </div>
          </div>
        </motion.div>
      )}
      <div className="flex gap-3 pt-6 border-t border-slate-600">
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          className="flex-1"
        >
          <ApperIcon name={goal ? "Save" : "Plus"} size={20} className="mr-2" />
          {goal ? 'Update Goal' : 'Create Goal'}
        </Button>
        
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </motion.form>
  );
};

export default GoalForm;