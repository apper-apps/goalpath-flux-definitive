import { format, isWithinInterval, parseISO } from "date-fns";
import React from "react";
import Error from "@/components/ui/Error";
import { milestoneService } from "@/services/api/milestoneService";
import { goalService } from "@/services/api/goalService";
import { checkInService } from "@/services/api/checkInService";

class ChartService {
  async getMoodCorrelationData({ goalId = null, startDate, endDate }) {
    await this.delay();
    
    try {
      const [goals, checkIns, allMilestones] = await Promise.all([
        goalService.getAll(),
        checkInService.getAll(),
        milestoneService.getAll()
      ]);

      // Filter goals if specific goal selected
      const targetGoals = goalId ? goals.filter(g => g.Id === goalId) : goals;
      
      // Filter check-ins by date range
      const filteredCheckIns = checkIns.filter(checkIn => {
        const checkInDate = parseISO(checkIn.date);
        return isWithinInterval(checkInDate, {
          start: parseISO(startDate),
          end: parseISO(endDate)
        });
      });

      // Create data points for each day with check-ins
      const dataPoints = [];
      
      for (const checkIn of filteredCheckIns) {
        const checkInDate = parseISO(checkIn.date);
        const dateKey = format(checkInDate, 'yyyy-MM-dd');
        
        // Calculate progress for the date
        let totalProgress = 0;
        let goalCount = 0;
        
        for (const goal of targetGoals) {
          // Get milestones for this goal
          const goalMilestones = allMilestones.filter(m => m.goalId === goal.Id);
          
          if (goalMilestones.length === 0) {
            // Use goal progress directly if no milestones
            totalProgress += goal.progress || 0;
            goalCount++;
            continue;
          }
          
          // Calculate progress based on milestones completed by this date
          const completedByDate = goalMilestones.filter(milestone => {
            if (!milestone.completed || !milestone.completedAt) return false;
            
            const completedDate = parseISO(milestone.completedAt);
            return completedDate <= checkInDate;
          });
          
          const progressForGoal = goalMilestones.length > 0 
            ? Math.round((completedByDate.length / goalMilestones.length) * 100)
            : 0;
          
          totalProgress += progressForGoal;
          goalCount++;
        }
        
        const averageProgress = goalCount > 0 ? Math.round(totalProgress / goalCount) : 0;
        
        // Check if we already have a data point for this date
        const existingPoint = dataPoints.find(dp => dp.date === dateKey);
        
        if (existingPoint) {
          // Average the mood and progress if multiple check-ins on same date
          existingPoint.mood = Math.round((existingPoint.mood + checkIn.mood) / 2);
          existingPoint.progress = Math.round((existingPoint.progress + averageProgress) / 2);
        } else {
          dataPoints.push({
            date: dateKey,
            mood: checkIn.mood,
            progress: averageProgress
          });
        }
      }
      
      // Sort by date
      dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      return dataPoints;
      
    } catch (error) {
      console.error('Error generating mood correlation data:', error);
      throw new Error('Failed to generate mood correlation data');
    }
}

  async getMilestoneAnalytics({ goalId = null, startDate, endDate, milestoneFilter = 'all' }) {
    await this.delay();
    
    try {
      const [goals, checkIns, allMilestones] = await Promise.all([
        goalService.getAll(),
        checkInService.getAll(),
        milestoneService.getAll()
      ]);

      // Filter goals if specific goal selected
      const targetGoals = goalId ? goals.filter(g => g.Id === goalId) : goals;
      const targetGoalIds = targetGoals.map(g => g.Id);
      
      // Get milestones for target goals within date range
      let milestones = allMilestones.filter(milestone => {
        if (!targetGoalIds.includes(milestone.goalId)) return false;
        
        // Filter by completion status
        if (milestoneFilter === 'completed' && !milestone.completed) return false;
        if (milestoneFilter === 'pending' && milestone.completed) return false;
        
        // For completed milestones, check if completed within date range
        if (milestone.completed && milestone.completedAt) {
          const completedDate = parseISO(milestone.completedAt);
          return isWithinInterval(completedDate, {
            start: parseISO(startDate),
            end: parseISO(endDate)
          });
        }
        
        // For pending milestones, check if due date is within range
        if (!milestone.completed && milestone.dueDate) {
          const dueDate = parseISO(milestone.dueDate);
          return isWithinInterval(dueDate, {
            start: parseISO(startDate),
            end: parseISO(endDate)
          });
        }
        
        return false;
      });

      // Analyze mood impact around milestone completion
      const analytics = [];
      
      for (const milestone of milestones) {
        if (!milestone.completed || !milestone.completedAt) continue;
        
        const completionDate = parseISO(milestone.completedAt);
        
        // Find check-ins within 7 days before and after completion
        const relevantCheckIns = checkIns.filter(checkIn => {
          const checkInDate = parseISO(checkIn.date);
          const daysDiff = Math.abs((checkInDate - completionDate) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7;
        });
        
        // Calculate mood impact around completion
        for (const checkIn of relevantCheckIns) {
          const checkInDate = parseISO(checkIn.date);
          const daysFromCompletion = Math.round((checkInDate - completionDate) / (1000 * 60 * 60 * 24));
          
          analytics.push({
            milestoneId: milestone.Id,
            milestoneTitle: milestone.title,
            goalId: milestone.goalId,
            completedAt: milestone.completedAt,
            daysFromCompletion,
            moodImpact: checkIn.mood,
            checkInDate: checkIn.date
          });
        }
      }
      
      // Sort by days from completion
      analytics.sort((a, b) => a.daysFromCompletion - b.daysFromCompletion);
      
      return analytics;
      
    } catch (error) {
      console.error('Error generating milestone analytics:', error);
      throw new Error('Failed to generate milestone analytics');
}
  }

  // Progress Forecasting Implementation
  async getProgressForecast({ goalId, includeConfidenceFactors = false }) {
    await this.delay();
    
    try {
      const [goals, checkIns, allMilestones] = await Promise.all([
        goalService.getAll(),
        checkInService.getAll(),
        milestoneService.getAll()
      ]);

      const goal = goals.find(g => g.Id === goalId);
      if (!goal) {
        throw new Error('Goal not found');
      }

      const goalMilestones = allMilestones.filter(m => m.goalId === goalId);
      const goalCheckIns = checkIns.filter(c => c.goalId === goalId || !c.goalId); // Include general check-ins
      
      // Calculate current progress metrics
      const progressMetrics = this.calculateProgressMetrics(goal, goalMilestones, goalCheckIns);
      
      // Analyze completion patterns and pace
      const paceAnalysis = this.analyzePace(goalMilestones, goalCheckIns);
      
      // Calculate forecasting confidence
      const confidenceFactors = this.calculateConfidenceFactors(progressMetrics, paceAnalysis, goalCheckIns);
      
      // Generate completion probability and estimated date
      const forecast = this.generateCompletionForecast(goal, progressMetrics, paceAnalysis, confidenceFactors);
      
      return {
        ...forecast,
        currentProgress: progressMetrics.currentProgress,
        paceAnalysis,
        ...(includeConfidenceFactors && { confidenceFactors })
      };
      
    } catch (error) {
      console.error('Error generating progress forecast:', error);
      throw new Error('Failed to generate progress forecast');
    }
  }

  calculateProgressMetrics(goal, milestones, checkIns) {
    const now = new Date();
    const goalStart = new Date(goal.createdAt);
    const goalEnd = new Date(goal.targetDate);
    
    // Calculate time-based progress
    const totalDuration = goalEnd - goalStart;
    const elapsedTime = now - goalStart;
    const timeProgress = Math.min(Math.max(elapsedTime / totalDuration, 0), 1);
    
    // Calculate milestone-based progress
    const completedMilestones = milestones.filter(m => m.completed).length;
    const totalMilestones = milestones.length;
    const milestoneProgress = totalMilestones > 0 ? completedMilestones / totalMilestones : 0;
    
    // Calculate weighted current progress
    const currentProgress = totalMilestones > 0 ? milestoneProgress : (goal.progress || 0) / 100;
    
    return {
      currentProgress,
      timeProgress,
      milestoneProgress,
      completedMilestones,
      totalMilestones,
      daysElapsed: Math.floor(elapsedTime / (1000 * 60 * 60 * 24)),
      daysRemaining: Math.ceil((goalEnd - now) / (1000 * 60 * 60 * 24)),
      totalDays: Math.ceil(totalDuration / (1000 * 60 * 60 * 24))
    };
  }

  analyzePace(milestones, checkIns) {
    const now = new Date();
    const recentPeriod = 14; // Last 14 days
    const recentDate = new Date(now.getTime() - (recentPeriod * 24 * 60 * 60 * 1000));
    
    // Analyze milestone completion pace
    const recentCompletions = milestones.filter(m => 
      m.completed && m.completedAt && new Date(m.completedAt) >= recentDate
    );
    
    const olderCompletions = milestones.filter(m => 
      m.completed && m.completedAt && new Date(m.completedAt) < recentDate
    );
    
    const recentPace = recentCompletions.length / recentPeriod; // completions per day
    const historicalPace = olderCompletions.length / Math.max(
      (recentDate - new Date(Math.min(...milestones.map(m => new Date(m.createdAt || m.dueDate))))) / (1000 * 60 * 60 * 24),
      1
    );
    
    // Analyze check-in consistency
    const recentCheckIns = checkIns.filter(c => new Date(c.date) >= recentDate);
    const checkInConsistency = recentCheckIns.length / recentPeriod;
    
    // Calculate pace trend
    const paceVelocity = recentPace - historicalPace;
    const paceDirection = paceVelocity > 0.1 ? 'accelerating' : 
                         paceVelocity < -0.1 ? 'decelerating' : 'steady';
    
    return {
      recentPace,
      historicalPace,
      checkInConsistency,
      paceDirection,
      paceVelocity,
      recentCompletions: recentCompletions.length,
      consistencyScore: Math.min(checkInConsistency * 7, 1) // 0-1 scale, 1 check-in per day = 1.0
    };
  }

  calculateConfidenceFactors(progressMetrics, paceAnalysis, checkIns) {
    const factors = {};
    
    // Time alignment factor (how well progress aligns with time)
    const timeAlignment = 1 - Math.abs(progressMetrics.currentProgress - progressMetrics.timeProgress);
    factors.timeAlignment = Math.max(timeAlignment, 0.2); // Minimum 0.2
    
    // Pace consistency factor
    const paceConsistency = paceAnalysis.consistencyScore;
    factors.paceConsistency = paceConsistency;
    
    // Momentum factor (recent activity level)
    const recentActivity = Math.min(paceAnalysis.recentPace * 7, 1); // Weekly completion rate
    factors.momentum = recentActivity;
    
    // Check-in frequency factor
    const checkInFrequency = Math.min(paceAnalysis.checkInConsistency, 1);
    factors.checkInFrequency = checkInFrequency;
    
    // Historical performance factor
    const completionRate = progressMetrics.totalMilestones > 0 ? 
      progressMetrics.completedMilestones / progressMetrics.totalMilestones : 0.5;
    factors.historicalPerformance = completionRate;
    
    // Calculate overall confidence score
    const weights = {
      timeAlignment: 0.25,
      paceConsistency: 0.20,
      momentum: 0.20,
      checkInFrequency: 0.15,
      historicalPerformance: 0.20
    };
    
    const overallConfidence = Object.keys(weights).reduce((sum, key) => 
      sum + (factors[key] * weights[key]), 0
    );
    
    return {
      ...factors,
      overallConfidence: Math.max(Math.min(overallConfidence, 0.95), 0.15), // Clamp between 15-95%
      weights
    };
  }

  generateCompletionForecast(goal, progressMetrics, paceAnalysis, confidenceFactors) {
    const now = new Date();
    const targetDate = new Date(goal.targetDate);
    
    // Calculate different forecast scenarios
    const scenarios = this.calculateForecastScenarios(progressMetrics, paceAnalysis);
    
    // Select primary scenario based on confidence and current trends
    const primaryScenario = this.selectPrimaryScenario(scenarios, confidenceFactors, paceAnalysis);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      goal, progressMetrics, paceAnalysis, confidenceFactors, primaryScenario
    );
    
    return {
      projectedCompletionDate: primaryScenario.completionDate,
      confidenceLevel: confidenceFactors.overallConfidence,
      completionProbability: primaryScenario.probability,
      onTrack: primaryScenario.completionDate <= targetDate,
      daysAheadBehind: Math.round((targetDate - new Date(primaryScenario.completionDate)) / (1000 * 60 * 60 * 24)),
      scenarios,
      primaryScenario: primaryScenario.name,
      recommendations,
      trend: paceAnalysis.paceDirection,
      riskFactors: this.identifyRiskFactors(progressMetrics, paceAnalysis, confidenceFactors)
    };
  }

  calculateForecastScenarios(progressMetrics, paceAnalysis) {
    const now = new Date();
    const remainingProgress = 1 - progressMetrics.currentProgress;
    
    // Conservative scenario (lower pace)
    const conservativePace = Math.max(paceAnalysis.historicalPace * 0.8, 0.01);
    const conservativeDays = Math.ceil(remainingProgress / conservativePace);
    
    // Realistic scenario (current pace)
    const realisticPace = Math.max(
      (paceAnalysis.recentPace + paceAnalysis.historicalPace) / 2, 0.01
    );
    const realisticDays = Math.ceil(remainingProgress / realisticPace);
    
    // Optimistic scenario (higher pace)
    const optimisticPace = Math.max(paceAnalysis.recentPace * 1.2, conservativePace);
    const optimisticDays = Math.ceil(remainingProgress / optimisticPace);
    
    return {
      conservative: {
        name: 'conservative',
        completionDate: new Date(now.getTime() + (conservativeDays * 24 * 60 * 60 * 1000)).toISOString(),
        daysToComplete: conservativeDays,
        probability: 0.85,
        pace: conservativePace
      },
      realistic: {
        name: 'realistic',
        completionDate: new Date(now.getTime() + (realisticDays * 24 * 60 * 60 * 1000)).toISOString(),
        daysToComplete: realisticDays,
        probability: 0.65,
        pace: realisticPace
      },
      optimistic: {
        name: 'optimistic',
        completionDate: new Date(now.getTime() + (optimisticDays * 24 * 60 * 60 * 1000)).toISOString(),
        daysToComplete: optimisticDays,
        probability: 0.35,
        pace: optimisticPace
      }
    };
  }

  selectPrimaryScenario(scenarios, confidenceFactors, paceAnalysis) {
    // High confidence and accelerating pace -> optimistic
    if (confidenceFactors.overallConfidence > 0.7 && paceAnalysis.paceDirection === 'accelerating') {
      return scenarios.optimistic;
    }
    
    // Low confidence or decelerating pace -> conservative
    if (confidenceFactors.overallConfidence < 0.4 || paceAnalysis.paceDirection === 'decelerating') {
      return scenarios.conservative;
    }
    
    // Default to realistic scenario
    return scenarios.realistic;
  }

  generateRecommendations(goal, progressMetrics, paceAnalysis, confidenceFactors, primaryScenario) {
    const recommendations = [];
    const now = new Date();
    const targetDate = new Date(goal.targetDate);
    const isOnTrack = new Date(primaryScenario.completionDate) <= targetDate;
    
    // Time-based recommendations
    if (!isOnTrack) {
      const daysOverdue = Math.round((new Date(primaryScenario.completionDate) - targetDate) / (1000 * 60 * 60 * 24));
      recommendations.push({
        type: 'schedule',
        priority: 'high',
        message: `You're projected to finish ${daysOverdue} days late. Consider increasing your pace or adjusting milestones.`,
        action: 'Increase check-in frequency and milestone completion rate'
      });
    }
    
    // Pace-based recommendations
    if (paceAnalysis.paceDirection === 'decelerating') {
      recommendations.push({
        type: 'pace',
        priority: 'medium',
        message: 'Your completion pace has slowed recently. Consider breaking down remaining milestones into smaller tasks.',
        action: 'Simplify upcoming milestones'
      });
    }
    
    // Consistency recommendations
    if (paceAnalysis.consistencyScore < 0.5) {
      recommendations.push({
        type: 'consistency',
        priority: 'medium',
        message: 'More frequent check-ins could improve your tracking accuracy and motivation.',
        action: 'Aim for daily or every-other-day check-ins'
      });
    }
    
    // Confidence-based recommendations
    if (confidenceFactors.overallConfidence < 0.5) {
      recommendations.push({
        type: 'confidence',
        priority: 'low',
        message: 'Forecast confidence is low due to irregular patterns. Maintain consistent progress for better predictions.',
        action: 'Focus on building steady habits'
      });
    }
    
    // Positive reinforcement
    if (isOnTrack && paceAnalysis.paceDirection === 'accelerating') {
      recommendations.push({
        type: 'positive',
        priority: 'info',
        message: 'Great momentum! You\'re on track and accelerating. Keep up the excellent work!',
        action: 'Maintain current pace'
      });
    }
    
    return recommendations;
  }

  identifyRiskFactors(progressMetrics, paceAnalysis, confidenceFactors) {
    const risks = [];
    
    if (progressMetrics.daysRemaining < 7 && progressMetrics.currentProgress < 0.8) {
      risks.push('Limited time remaining with significant work left');
    }
    
    if (paceAnalysis.consistencyScore < 0.3) {
      risks.push('Inconsistent check-in pattern affecting accuracy');
    }
    
    if (paceAnalysis.recentPace < paceAnalysis.historicalPace * 0.5) {
      risks.push('Recent pace significantly below historical average');
    }
    
    if (confidenceFactors.momentum < 0.2) {
      risks.push('Low recent activity level');
    }
    
    return risks;
  }

  delay(ms = 200) {
return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const chartService = new ChartService();