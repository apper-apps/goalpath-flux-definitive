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
      pacingHistory: [],
      stressIndicators: [],
      adjustmentHistory: [],
      moodPatterns: {}
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
      
      // Apply smart adjustments if user shows stress patterns
      const stressAnalysis = await this.analyzeStressIndicators(goalData.Id || 0);
      if (stressAnalysis.stressLevel > 0.5) {
        return this.applyPreemptiveAdjustments(weekendOptimizedMilestones, stressAnalysis);
      }
      
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
  
// SMART ADJUSTMENT ENGINE
  
  // Main entry point for smart adjustments
  async checkAndApplySmartAdjustments(goalId, milestones) {
    await this.delay(100);
    
    try {
      const adjustments = [];
      
      // Check if user is behind schedule
      const scheduleAnalysis = this.analyzeScheduleAdherence(milestones);
      if (scheduleAnalysis.behindSchedule) {
        const scheduleAdjustments = await this.applyScheduleBasedAdjustments(goalId, milestones, scheduleAnalysis);
        adjustments.push(...scheduleAdjustments);
      }
      
      // Check for stress indicators
      const stressAnalysis = await this.analyzeStressIndicators(goalId);
      if (stressAnalysis.stressLevel > 0.6) {
        const stressAdjustments = await this.applyStressBasedAdjustments(goalId, stressAnalysis);
        adjustments.push(...stressAdjustments);
      }
      
      // Record adjustment history
      if (adjustments.length > 0) {
        this.behaviorData.adjustmentHistory.push({
          goalId,
          adjustedAt: new Date().toISOString(),
          adjustmentCount: adjustments.length,
          reasons: adjustments.map(a => a.reason)
        });
      }
      
      return adjustments;
      
    } catch (error) {
      console.warn('Smart adjustment failed:', error);
      return [];
    }
  }
  
  // Analyze if user is behind schedule
  analyzeScheduleAdherence(milestones) {
    const now = new Date();
    const overdueMilestones = milestones.filter(m => 
      !m.completed && new Date(m.dueDate) < now
    );
    
    const upcomingMilestones = milestones.filter(m => 
      !m.completed && new Date(m.dueDate) >= now && 
      differenceInDays(new Date(m.dueDate), now) <= 7
    );
    
    const totalIncomplete = milestones.filter(m => !m.completed).length;
    const behindScheduleRatio = overdueMilestones.length / Math.max(totalIncomplete, 1);
    
    return {
      behindSchedule: behindScheduleRatio > 0.3 || overdueMilestones.length >= 2,
      overdueMilestones,
      upcomingMilestones,
      severityLevel: behindScheduleRatio > 0.6 ? 'high' : behindScheduleRatio > 0.3 ? 'medium' : 'low'
    };
  }
  
  // Analyze stress indicators from mood and behavior
  async analyzeStressIndicators(goalId) {
    try {
      const { checkInService } = await import('./checkInService');
      const checkIns = await checkInService.getRecentMoodData(goalId);
      
      let stressLevel = 0;
      let stressReasons = [];
      
      // Analyze recent mood patterns
      const recentMoods = checkIns.slice(0, 7); // Last 7 check-ins
      const stressedMoods = recentMoods.filter(c => 
        c.mood && ['stressed', 'overwhelmed', 'anxious', 'frustrated'].includes(c.mood.toLowerCase())
      );
      
      if (stressedMoods.length > 2) {
        stressLevel += 0.4;
        stressReasons.push('frequent stress reported');
      }
      
      // Check completion velocity decline
      const completionPatterns = this.behaviorData.completionPatterns.filter(p => p.goalId === goalId);
      if (completionPatterns.length > 5) {
        const recentCompletions = completionPatterns.slice(-5);
        const earlierCompletions = completionPatterns.slice(-10, -5);
        
        if (recentCompletions.length < earlierCompletions.length * 0.7) {
          stressLevel += 0.3;
          stressReasons.push('completion velocity declined');
        }
      }
      
      // Check for weekend avoidance (stress indicator)
      const weekendAvoidance = this.detectWeekendAvoidance(goalId);
      if (weekendAvoidance) {
        stressLevel += 0.2;
        stressReasons.push('weekend productivity decline');
      }
      
      return {
        stressLevel: Math.min(stressLevel, 1.0),
        reasons: stressReasons,
        recommendation: stressLevel > 0.7 ? 'major_simplification' : 
                      stressLevel > 0.5 ? 'moderate_adjustment' : 'minor_tweaks'
      };
      
    } catch (error) {
      console.warn('Stress analysis failed:', error);
      return { stressLevel: 0, reasons: [], recommendation: 'none' };
    }
  }
  
  // Apply schedule-based adjustments
  async applyScheduleBasedAdjustments(goalId, milestones, scheduleAnalysis) {
    const adjustments = [];
    
    // Reschedule overdue milestones
    for (const milestone of scheduleAnalysis.overdueMilestones) {
      const newDueDate = addDays(new Date(), this.calculateRescheduleBuffer(scheduleAnalysis.severityLevel));
      
      await this.update(milestone.Id, {
        ...milestone,
        dueDate: newDueDate.toISOString(),
        adjustedBy: 'smart_engine',
        adjustmentReason: 'Rescheduled due to being behind schedule'
      });
      
      adjustments.push({
        milestoneId: milestone.Id,
        type: 'reschedule',
        reason: 'behind_schedule',
        oldDate: milestone.dueDate,
        newDate: newDueDate.toISOString()
      });
    }
    
    // Simplify upcoming milestones if severely behind
    if (scheduleAnalysis.severityLevel === 'high') {
      for (const milestone of scheduleAnalysis.upcomingMilestones.slice(0, 2)) {
        if (milestone.difficulty !== 'light') {
          await this.update(milestone.Id, {
            ...milestone,
            difficulty: 'light',
            adjustedBy: 'smart_engine',
            adjustmentReason: 'Simplified to help catch up'
          });
          
          adjustments.push({
            milestoneId: milestone.Id,
            type: 'simplify',
            reason: 'catch_up_assistance'
          });
        }
      }
    }
    
    return adjustments;
  }
  
  // Apply stress-based adjustments
  async applyStressBasedAdjustments(goalId, stressAnalysis) {
    const adjustments = [];
    const goalMilestones = await this.getByGoalId(goalId);
    const upcomingMilestones = goalMilestones.filter(m => 
      !m.completed && new Date(m.dueDate) > new Date()
    ).slice(0, 3); // Next 3 milestones
    
    for (const milestone of upcomingMilestones) {
      let needsAdjustment = false;
      const updates = { ...milestone };
      
      // Simplify difficulty based on stress level
      if (stressAnalysis.recommendation === 'major_simplification' && milestone.difficulty !== 'light') {
        updates.difficulty = 'light';
        updates.adjustmentReason = 'Simplified to reduce stress';
        needsAdjustment = true;
      }
      
      // Extend deadline for stress relief
      if (stressAnalysis.stressLevel > 0.7) {
        const extension = stressAnalysis.stressLevel > 0.8 ? 5 : 3;
        updates.dueDate = addDays(new Date(milestone.dueDate), extension).toISOString();
        updates.adjustmentReason = updates.adjustmentReason ? 
          `${updates.adjustmentReason} and extended for stress relief` : 
          'Extended deadline for stress relief';
        needsAdjustment = true;
      }
      
      // Make weekend-friendly if stress is high
      if (stressAnalysis.stressLevel > 0.6 && !milestone.weekendFriendly) {
        updates.weekendFriendly = true;
        updates.title = this.makeWeekendFriendly(milestone.title);
        needsAdjustment = true;
      }
      
      if (needsAdjustment) {
        updates.adjustedBy = 'smart_engine';
        await this.update(milestone.Id, updates);
        
        adjustments.push({
          milestoneId: milestone.Id,
          type: 'stress_relief',
          reason: 'stress_level_high',
          adjustments: Object.keys(updates).filter(k => updates[k] !== milestone[k])
        });
      }
    }
    
    return adjustments;
  }
  
  // Helper methods for smart adjustments
  calculateRescheduleBuffer(severityLevel) {
    switch (severityLevel) {
      case 'high': return 7; // 1 week buffer
      case 'medium': return 4; // 4 days buffer
      default: return 2; // 2 days buffer
    }
  }
  
  detectWeekendAvoidance(goalId) {
    const completions = this.behaviorData.completionPatterns.filter(p => p.goalId === goalId);
    const weekendCompletions = completions.filter(c => isWeekend(new Date(c.completedAt)));
    return completions.length > 10 && weekendCompletions.length / completions.length < 0.1;
  }
  
  applyPreemptiveAdjustments(milestones, stressAnalysis) {
    return milestones.map(milestone => {
      if (stressAnalysis.stressLevel > 0.7) {
        return {
          ...milestone,
          difficulty: 'light',
          dueDate: addDays(new Date(milestone.dueDate), 2).toISOString(),
          adjustedBy: 'smart_engine',
          adjustmentReason: 'Pre-adjusted based on stress patterns'
        };
      }
      return milestone;
    });
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