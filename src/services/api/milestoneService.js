import milestonesData from '@/services/mockData/milestones.json';
import { isWeekend, addDays, differenceInDays, format } from 'date-fns';

class MilestoneService {
  constructor() {
    this.milestones = [...milestonesData];
    this.nextId = Math.max(...this.milestones.map(m => m.Id)) + 1;
    this.behaviorData = {
      completionPatterns: [],
      weekendPreferences: {},
      difficultyPreferences: {},
      pacingHistory: []
    };
  }
  async getAll() {
    await this.delay();
    return [...this.milestones];
  }
  
  async getById(id) {
    await this.delay();
    const milestone = this.milestones.find(m => m.Id === id);
    if (!milestone) {
      throw new Error('Milestone not found');
    }
    return { ...milestone };
  }
  
  async getByGoalId(goalId) {
    await this.delay();
    return this.milestones
      .filter(m => m.goalId === goalId)
      .map(m => ({ ...m }));
  }
  
  async create(milestoneData) {
    await this.delay();
    const newMilestone = {
      ...milestoneData,
      Id: this.nextId++,
      completed: false,
      completedAt: null
    };
    this.milestones.push(newMilestone);
    return { ...newMilestone };
  }
  
async update(id, milestoneData) {
    await this.delay();
    const index = this.milestones.findIndex(m => m.Id === id);
    if (index === -1) {
      throw new Error('Milestone not found');
    }
    
    const oldMilestone = { ...this.milestones[index] };
    const updatedData = { ...milestoneData };
    
    // If milestone is being completed, add completion timestamp
    if (updatedData.completed && !oldMilestone.completed) {
      updatedData.completedAt = new Date().toISOString();
    }
    
    this.milestones[index] = { ...this.milestones[index], ...updatedData };
    
    // Return completion info for celebration triggers
    const wasCompleted = !oldMilestone.completed && updatedData.completed;
    
    return { 
      ...this.milestones[index], 
      justCompleted: wasCompleted 
    };
  }
  
  async delete(id) {
    await this.delay();
    const index = this.milestones.findIndex(m => m.Id === id);
    if (index === -1) {
      throw new Error('Milestone not found');
    }
    
    this.milestones.splice(index, 1);
    return true;
  }
// Context-aware milestone generation with behavioral analysis
  async generateContextAwareMilestones(goalData) {
    await this.delay();
    
    try {
      const { checkInService } = await import('./checkInService');
      const checkIns = await checkInService.getAll();
      
      // Analyze user behavior patterns
      const behaviorAnalysis = this.analyzeBehaviorPatterns(checkIns);
      
      // Generate base milestones
      const baseMilestones = this.generateBaseMilestones(goalData);
      
      // Apply adaptive pacing based on user patterns
      const adaptiveMilestones = this.applyAdaptivePacing(baseMilestones, behaviorAnalysis, goalData);
      
      // Adjust for weekend preferences
      const weekendOptimizedMilestones = this.optimizeForWeekends(adaptiveMilestones, behaviorAnalysis);
      
      return weekendOptimizedMilestones;
      
    } catch (error) {
      console.warn('Context-aware generation failed, using fallback:', error);
      return this.generateBaseMilestones(goalData);
    }
  }
  
  // Analyze user behavior patterns from check-ins and milestone completions
  analyzeBehaviorPatterns(checkIns) {
    const patterns = {
      completionVelocity: 'moderate',
      weekendActivity: 'low',
      preferredDifficulty: 'moderate',
      moodCorrelation: {},
      timePreferences: {}
    };
    
    if (!checkIns || checkIns.length === 0) return patterns;
    
    // Analyze completion velocity
    const completionDays = checkIns
      .filter(c => c.completedMilestones && c.completedMilestones.length > 0)
      .map(c => new Date(c.date).getDay());
    
    patterns.completionVelocity = completionDays.length > 5 ? 'high' : 
                                  completionDays.length > 2 ? 'moderate' : 'low';
    
    // Analyze weekend activity
    const weekendCompletions = completionDays.filter(day => day === 0 || day === 6).length;
    const weekdayCompletions = completionDays.filter(day => day > 0 && day < 6).length;
    
    patterns.weekendActivity = weekendCompletions > (weekdayCompletions * 0.4) ? 'high' : 'low';
    
    // Analyze mood correlation with completions
    checkIns.forEach(checkIn => {
      const hasCompletions = checkIn.completedMilestones && checkIn.completedMilestones.length > 0;
      const dayType = isWeekend(new Date(checkIn.date)) ? 'weekend' : 'weekday';
      
      if (!patterns.moodCorrelation[dayType]) {
        patterns.moodCorrelation[dayType] = { moods: [], completions: [] };
      }
      
      patterns.moodCorrelation[dayType].moods.push(checkIn.mood);
      patterns.moodCorrelation[dayType].completions.push(hasCompletions ? 1 : 0);
    });
    
    return patterns;
  }
  
  // Generate base milestones for a goal
  generateBaseMilestones(goalData) {
    const { title, description, targetDate, category } = goalData;
    const duration = differenceInDays(new Date(targetDate), new Date());
    const milestoneCount = Math.min(Math.max(Math.floor(duration / 7), 3), 8); // 3-8 milestones
    
    const baseMilestones = [];
    const increment = duration / (milestoneCount + 1);
    
    for (let i = 1; i <= milestoneCount; i++) {
      const dueDate = addDays(new Date(), Math.floor(increment * i));
      const progress = Math.floor((i / milestoneCount) * 100);
      
      baseMilestones.push({
        title: this.generateMilestoneTitle(title, i, milestoneCount, progress),
        description: this.generateMilestoneDescription(category, progress),
        dueDate: dueDate.toISOString(),
        difficulty: 'moderate',
        weekendFriendly: false,
        order: i
      });
    }
    
    return baseMilestones;
  }
  
  // Apply adaptive pacing based on user behavior
  applyAdaptivePacing(milestones, behaviorAnalysis) {
    const { completionVelocity } = behaviorAnalysis;
    
    return milestones.map((milestone, index) => {
      let adjustedDueDate = new Date(milestone.dueDate);
      
      // Adjust timing based on completion velocity
      if (completionVelocity === 'high') {
        // User completes tasks quickly, can handle tighter deadlines
        adjustedDueDate = addDays(adjustedDueDate, -1);
      } else if (completionVelocity === 'low') {
        // User needs more time, extend deadlines
        adjustedDueDate = addDays(adjustedDueDate, 2);
      }
      
      // Adjust difficulty based on user patterns
      let difficulty = milestone.difficulty;
      if (index === 0 || index === milestones.length - 1) {
        difficulty = completionVelocity === 'low' ? 'light' : 'moderate';
      }
      
      return {
        ...milestone,
        dueDate: adjustedDueDate.toISOString(),
        difficulty
      };
    });
  }
  
  // Optimize milestones for weekend preferences
  optimizeForWeekends(milestones, behaviorAnalysis) {
    const { weekendActivity } = behaviorAnalysis;
    
    return milestones.map(milestone => {
      const dueDate = new Date(milestone.dueDate);
      const isWeekendDue = isWeekend(dueDate);
      
      let adjustedMilestone = { ...milestone };
      
      // If milestone is due on weekend and user has low weekend activity
      if (isWeekendDue && weekendActivity === 'low') {
        adjustedMilestone.difficulty = 'light';
        adjustedMilestone.weekendFriendly = true;
        adjustedMilestone.title = this.makeWeekendFriendly(milestone.title);
      }
      
      // If milestone is due on weekday but user prefers weekend work
      if (!isWeekendDue && weekendActivity === 'high') {
        // Suggest moving to weekend
        const nextWeekend = this.getNextWeekend(dueDate);
        if (differenceInDays(nextWeekend, dueDate) <= 3) {
          adjustedMilestone.dueDate = nextWeekend.toISOString();
          adjustedMilestone.weekendFriendly = true;
        }
      }
      
      return adjustedMilestone;
    });
  }
  
  // Helper methods for milestone generation
  generateMilestoneTitle(goalTitle, index, total, progress) {
    const progressStages = [
      'Initial Setup',
      'Foundation Building', 
      'Core Development',
      'Implementation',
      'Refinement',
      'Optimization',
      'Testing & Review',
      'Final Completion'
    ];
    
    const stage = progressStages[Math.min(index - 1, progressStages.length - 1)];
    return `${stage}: ${goalTitle} (${progress}%)`;
  }
  
  generateMilestoneDescription(category, progress) {
    const descriptions = {
      personal: [
        'Set up your learning environment and gather resources',
        'Establish daily practice routine and initial goals',
        'Focus on core skills development and consistency',
        'Apply knowledge through practical exercises',
        'Refine techniques and address weak areas',
        'Optimize your approach based on progress',
        'Test your skills and prepare for final push',
        'Complete final objectives and celebrate success'
      ],
      professional: [
        'Research requirements and set up development environment',
        'Create project structure and initial implementation',
        'Develop core features and functionality',
        'Implement advanced features and integrations',
        'Refine code quality and performance',
        'Optimize for production and scalability',
        'Conduct testing and quality assurance',
        'Deploy and finalize project deliverables'
      ]
    };
    
    const categoryDescriptions = descriptions[category] || descriptions.personal;
    const index = Math.floor((progress / 100) * (categoryDescriptions.length - 1));
    return categoryDescriptions[index];
  }
  
  makeWeekendFriendly(title) {
    const weekendPrefixes = [
      'Relaxed Review:',
      'Weekend Exploration:',
      'Casual Progress:',
      'Light Work:'
    ];
    
    const prefix = weekendPrefixes[Math.floor(Math.random() * weekendPrefixes.length)];
    return title.replace(/^[^:]+:/, prefix);
  }
  
  getNextWeekend(fromDate) {
    const date = new Date(fromDate);
    const daysUntilSaturday = (6 - date.getDay()) % 7;
    return addDays(date, daysUntilSaturday || 7);
  }
  
  // Track behavioral data for future improvements
  async recordCompletionBehavior(milestoneId, goalId, context) {
    await this.delay(100);
    
    this.behaviorData.completionPatterns.push({
      milestoneId,
      goalId,
      completedAt: new Date().toISOString(),
      context
    });
    
    // Keep only recent data (last 100 entries)
    if (this.behaviorData.completionPatterns.length > 100) {
      this.behaviorData.completionPatterns = this.behaviorData.completionPatterns.slice(-100);
    }
  }
  
  async trackMilestoneViewing(goalId, milestones) {
    await this.delay(50);
    
    // Track viewing patterns for future optimization
    this.behaviorData.pacingHistory.push({
      goalId,
      viewedAt: new Date().toISOString(),
      milestoneCount: milestones.length,
      weekendMilestones: milestones.filter(m => isWeekend(new Date(m.dueDate))).length
    });
  }
  
  delay(ms = 200) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const milestoneService = new MilestoneService();