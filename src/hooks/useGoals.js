import { useState, useEffect } from 'react';
import { goalService } from '@/services/api/goalService';
import { milestoneService } from '@/services/api/milestoneService';

export const useGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const goalsData = await goalService.getAll();
      
      // Load milestones for each goal
      const goalsWithMilestones = await Promise.all(
        goalsData.map(async (goal) => {
          try {
            const milestones = await milestoneService.getByGoalId(goal.Id);
            return { ...goal, milestones };
          } catch (err) {
            return { ...goal, milestones: [] };
          }
        })
      );
      
      setGoals(goalsWithMilestones);
    } catch (err) {
      setError('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadGoals();
  }, []);
  
  const refetch = () => {
    loadGoals();
  };
  
  return {
    goals,
    loading,
    error,
    refetch
  };
};