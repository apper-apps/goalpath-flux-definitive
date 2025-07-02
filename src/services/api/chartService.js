import { goalService } from '@/services/api/goalService';
import { checkInService } from '@/services/api/checkInService';
import { milestoneService } from '@/services/api/milestoneService';
import { isWithinInterval, parseISO, format } from 'date-fns';

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

  delay(ms = 200) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const chartService = new ChartService();