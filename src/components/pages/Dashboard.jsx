import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import StatCard from '@/components/molecules/StatCard';
import GoalCard from '@/components/molecules/GoalCard';
import FilterBar from '@/components/molecules/FilterBar';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import MoodCorrelationChart from '@/components/molecules/MoodCorrelationChart';
import { useGoals } from '@/hooks/useGoals';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const Dashboard = () => {
  const [filter, setFilter] = useState('all');
  const { goals, loading, error, refetch } = useGoals();
  const { stats, loading: statsLoading } = useDashboardStats();
  
  const filters = [
    { value: 'all', label: 'All Goals', icon: 'Target' },
    { value: 'personal', label: 'Personal', icon: 'Heart' },
    { value: 'professional', label: 'Professional', icon: 'Briefcase' },
    { value: 'active', label: 'Active', icon: 'Play' },
    { value: 'completed', label: 'Completed', icon: 'CheckCircle' }
  ];
  
  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    if (filter === 'personal' || filter === 'professional') {
      return goal.category === filter;
    }
    return goal.status === filter;
  });
  
  if (loading || statsLoading) {
    return <Loading type="dashboard" />;
  }
  
  if (error) {
    return (
      <div className="p-6">
        <Error 
          message="Failed to load dashboard data. Please try again."
          onRetry={refetch}
        />
      </div>
    );
  }
  
return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
className="text-center"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold gradient-text mb-3 sm:mb-4">
          Welcome Back! 🚀
        </h1>
<p className="text-slate-400 text-sm sm:text-base lg:text-lg">
          Track your progress and achieve your dreams with AI-powered insights
        </p>
      </motion.div>
      
{/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          title="Total Goals"
          value={stats.totalGoals}
          icon="Target"
          variant="primary"
          trend={stats.goalsTrend}
        />
        <StatCard
          title="Active Goals"
          value={stats.activeGoals}
          icon="Play"
          variant="success"
          trend={stats.activeTrend}
        />
        <StatCard
          title="Completed Goals"
          value={stats.completedGoals}
          icon="CheckCircle"
          variant="accent"
          trend={stats.completedTrend}
        />
        <StatCard
          title="Average Progress"
          value={`${stats.averageProgress}%`}
          icon="TrendingUp"
          variant="warning"
          trend={stats.progressTrend}
        />
      </div>
      
      {/* Goals Section */}
      <div>
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
              Your Goals
</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              {filteredGoals.length} {filter === 'all' ? '' : filter} goal{filteredGoals.length !== 1 ? 's' : ''}
            </p>
          </div>
          
<Link to="/goals">
            <Button variant="primary" className="flex items-center gap-2 text-sm sm:text-base">
              <ApperIcon name="Plus" size={14} className="sm:w-4 sm:h-4" />
              New Goal
            </Button>
          </Link>
        </div>
        
        <FilterBar
          activeFilter={filter}
          onFilterChange={setFilter}
          filters={filters}
        />
        
        {filteredGoals.length === 0 ? (
          <Empty
            title={filter === 'all' ? "No goals yet" : `No ${filter} goals`}
            message={
              filter === 'all' 
                ? "Start your journey by creating your first goal with AI assistance"
                : `You don't have any ${filter} goals at the moment`
            }
            icon="Target"
            actionLabel="Create Your First Goal"
            onAction={() => window.location.href = '/goals'}
          />
) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredGoals.map((goal, index) => (
              <motion.div
                key={goal.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GoalCard 
                  goal={goal} 
                  showActions={false}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
{/* Mood Correlation Chart */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MoodCorrelationChart />
        </motion.div>
      )}

      {/* Quick Actions */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-surface rounded-xl p-6 border border-slate-600/50"
        >
          <h3 className="text-xl font-display font-semibold text-white mb-4">
            Quick Actions
</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Link to="/goals">
<Button variant="secondary" className="w-full justify-start text-xs sm:text-sm py-2 sm:py-3">
                <ApperIcon name="Plus" size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Add New Goal</span>
                <span className="xs:hidden">Add Goal</span>
              </Button>
            </Link>
<Link to="/check-ins">
              <Button variant="secondary" className="w-full justify-start text-xs sm:text-sm py-2 sm:py-3">
                <ApperIcon name="CheckCircle2" size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">View Check-ins</span>
                <span className="xs:hidden">Check-ins</span>
              </Button>
            </Link>
<Link to="/settings">
              <Button variant="secondary" className="w-full justify-start text-xs sm:text-sm py-2 sm:py-3">
                <ApperIcon name="Settings" size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
                Settings
              </Button>
            </Link>
<Button variant="secondary" className="w-full justify-start text-xs sm:text-sm py-2 sm:py-3">
              <ApperIcon name="Download" size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Export Progress</span>
              <span className="xs:hidden">Export</span>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;