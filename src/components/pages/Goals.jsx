import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GoalCard from '@/components/molecules/GoalCard';
import GoalForm from '@/components/molecules/GoalForm';
import FilterBar from '@/components/molecules/FilterBar';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { useGoals } from '@/hooks/useGoals';
import { goalService } from '@/services/api/goalService';
import { milestoneService } from '@/services/api/milestoneService';
import { toast } from 'react-toastify';

const Goals = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  
  const { goals, loading, error, refetch } = useGoals();
  
  const filters = [
    { value: 'all', label: 'All Goals', icon: 'Target', count: goals.length },
    { value: 'active', label: 'Active', icon: 'Play', count: goals.filter(g => g.status === 'active').length },
    { value: 'completed', label: 'Completed', icon: 'CheckCircle', count: goals.filter(g => g.status === 'completed').length },
    { value: 'personal', label: 'Personal', icon: 'Heart', count: goals.filter(g => g.category === 'personal').length },
    { value: 'professional', label: 'Professional', icon: 'Briefcase', count: goals.filter(g => g.category === 'professional').length }
  ];
  
  const filteredGoals = goals.filter(goal => {
    const matchesFilter = filter === 'all' || goal.status === filter || goal.category === filter;
    const matchesSearch = !searchQuery || 
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });
  
  const generateAIMilestones = (goalTitle, category) => {
    // Simulate AI milestone generation
    const milestoneTemplates = {
      personal: [
        { title: 'Set up a tracking system', days: 7 },
        { title: 'Create a daily routine', days: 14 },
        { title: 'Establish weekly check-ins', days: 21 },
        { title: 'Review and adjust approach', days: 30 },
        { title: 'Celebrate major milestone', days: 45 }
      ],
      professional: [
        { title: 'Research and plan approach', days: 10 },
        { title: 'Develop initial framework', days: 20 },
        { title: 'Implement first phase', days: 35 },
        { title: 'Gather feedback and iterate', days: 50 },
        { title: 'Finalize and document results', days: 65 }
      ]
    };
    
    const templates = milestoneTemplates[category] || milestoneTemplates.personal;
    const baseDate = new Date();
    
    return templates.map((template, index) => ({
      title: template.title,
      dueDate: new Date(baseDate.getTime() + template.days * 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      completedAt: null
    }));
  };
  
  const handleSubmit = async (formData) => {
    try {
      setFormLoading(true);
      
      if (editingGoal) {
        // Update existing goal
        await goalService.update(editingGoal.Id, {
          ...formData,
          progress: editingGoal.progress // Preserve existing progress
        });
        toast.success('Goal updated successfully! 🎯');
      } else {
        // Create new goal
        const newGoal = await goalService.create({
          ...formData,
          progress: 0,
          createdAt: new Date().toISOString()
        });
        
        // Generate AI milestones
        const aiMilestones = generateAIMilestones(formData.title, formData.category);
        
        // Create milestones
        for (const milestone of aiMilestones) {
          await milestoneService.create({
            ...milestone,
            goalId: newGoal.Id
          });
        }
        
        toast.success('Goal created with AI-generated milestones! 🚀');
      }
      
      refetch();
      setShowForm(false);
      setEditingGoal(null);
    } catch (error) {
      toast.error('Failed to save goal. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };
  
  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return;
    }
    
    try {
      await goalService.delete(goalId);
      // Delete associated milestones
      const milestones = await milestoneService.getByGoalId(goalId);
      for (const milestone of milestones) {
        await milestoneService.delete(milestone.Id);
      }
      
      refetch();
      toast.success('Goal deleted successfully');
    } catch (error) {
      toast.error('Failed to delete goal. Please try again.');
    }
  };
  
  const handleCancel = () => {
    setShowForm(false);
    setEditingGoal(null);
  };
  
  if (loading) {
    return (
      <div className="p-6">
        <Loading type="goals" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <Error 
          message="Failed to load goals. Please try again."
          onRetry={refetch}
        />
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto"
          >
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="mb-4"
              >
                <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
                Back to Goals
              </Button>
              
              <h1 className="text-3xl font-display font-bold gradient-text mb-2">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h1>
              <p className="text-slate-400">
                {editingGoal 
                  ? 'Update your goal details and milestones'
                  : 'Let AI help you break down your goal into actionable milestones'
                }
              </p>
            </div>
            
            <div className="bg-gradient-surface rounded-xl p-8 border border-slate-600/50">
              <GoalForm
                goal={editingGoal}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={formLoading}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-display font-bold gradient-text mb-2">
                  Your Goals
                </h1>
                <p className="text-slate-400">
                  {filteredGoals.length} {filter === 'all' ? '' : filter} goal{filteredGoals.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <Button
                variant="primary"
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 glow"
              >
                <ApperIcon name="Plus" size={16} />
                Create Goal
              </Button>
            </div>
            
            <FilterBar
              activeFilter={filter}
              onFilterChange={setFilter}
              filters={filters}
              showSearch={true}
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search goals..."
            />
            
            {filteredGoals.length === 0 ? (
              <Empty
                title={
                  searchQuery 
                    ? "No matching goals" 
                    : filter === 'all' 
                      ? "No goals yet" 
                      : `No ${filter} goals`
                }
                message={
                  searchQuery
                    ? "Try adjusting your search terms or filters"
                    : filter === 'all'
                      ? "Transform your dreams into achievable goals with AI-powered milestone generation"
                      : `You don't have any ${filter} goals at the moment`
                }
                icon="Target"
                actionLabel={searchQuery ? "Clear Search" : "Create Your First Goal"}
                onAction={searchQuery ? () => setSearchQuery('') : () => setShowForm(true)}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredGoals.map((goal, index) => (
                  <motion.div
                    key={goal.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GoalCard
                      goal={goal}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      showActions={true}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Goals;