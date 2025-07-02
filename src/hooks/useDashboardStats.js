import { useState, useEffect } from 'react';
import { goalService } from '@/services/api/goalService';

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    averageProgress: 0,
    goalsTrend: 0,
    activeTrend: 0,
    completedTrend: 0,
    progressTrend: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const calculateStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const goals = await goalService.getAll();
      
      const totalGoals = goals.length;
      const activeGoals = goals.filter(g => g.status === 'active').length;
      const completedGoals = goals.filter(g => g.status === 'completed').length;
      
      const averageProgress = totalGoals > 0 
        ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / totalGoals)
        : 0;
      
      // Simulate trend calculations (in a real app, you'd compare with previous period)
      const goalsTrend = Math.floor(Math.random() * 20) - 10; // -10 to +10
      const activeTrend = Math.floor(Math.random() * 15);     // 0 to +15
      const completedTrend = Math.floor(Math.random() * 25);  // 0 to +25
      const progressTrend = Math.floor(Math.random() * 10);   // 0 to +10
      
      setStats({
        totalGoals,
        activeGoals,
        completedGoals,
        averageProgress,
        goalsTrend,
        activeTrend,
        completedTrend,
        progressTrend
      });
      
    } catch (err) {
      setError('Failed to calculate dashboard stats');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    calculateStats();
  }, []);
  
  return {
    stats,
    loading,
    error,
    refetch: calculateStats
  };
};