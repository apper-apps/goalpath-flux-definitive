import * as tf from '@tensorflow/tfjs-node';

// Simple tone analysis model for nudge generation
class ToneAnalyzer {
  constructor() {
    this.model = null;
    this.initializeModel();
  }

  async initializeModel() {
    try {
      // Simple sentiment analysis using basic patterns
      // In a real implementation, you might load a pre-trained model
      this.model = {
        analyzeTone: (progress, context) => {
          if (progress >= 80) return 'encouraging_final_push';
          if (progress >= 60) return 'motivational_milestone';
          if (progress >= 40) return 'steady_progress';
          if (context === 'streak_recovery') return 'supportive_comeback';
          return 'gentle_encouragement';
        }
      };
    } catch (error) {
      console.error('Failed to initialize tone analyzer:', error);
      // Fallback to basic tone detection
      this.model = {
        analyzeTone: () => 'encouraging_final_push'
      };
    }
  }

  getTone(progress, context) {
    return this.model ? this.model.analyzeTone(progress, context) : 'encouraging_final_push';
  }
}

const toneAnalyzer = new ToneAnalyzer();

// AI-powered nudge message templates
const nudgeTemplates = {
  encouraging_final_push: [
    "You're {progress}% there — your future self will thank you! 🚀",
    "Almost at the finish line! {progress}% complete and counting ⭐",
    "The last {remaining}% is where champions are made! Keep pushing! 💪",
    "You've conquered {progress}% — the summit is within reach! 🏔️",
    "{progress}% done means you're closer than you think! Don't stop now! ✨"
  ],
  motivational_milestone: [
    "Wow! {progress}% complete — you're building something amazing! 🌟",
    "Look at you go! {progress}% and your momentum is unstoppable! 🔥",
    "You're {progress}% there and absolutely crushing it! Keep the energy high! ⚡",
    "Milestone unlocked: {progress}%! Your dedication is truly inspiring! 🎯",
    "{progress}% complete — you're proof that consistency creates miracles! ✨"
  ],
  steady_progress: [
    "Steady wins the race! You're {progress}% there and doing great! 🐢",
    "{progress}% complete — every step forward counts! Keep it up! 👣",
    "You're {progress}% in — small steps, big dreams! 🌱",
    "Progress is progress! {progress}% shows your commitment is real! 💫",
    "{progress}% and climbing — your journey is inspiring! 🧗‍♀️"
  ],
  supportive_comeback: [
    "{streak} days strong! Your comeback story is being written! 📖",
    "You're back and {streak} days in — resilience looks good on you! 💪",
    "{streak} day streak shows you're unstoppable! Welcome back, champion! 🏆",
    "Day {streak} of your amazing comeback journey! Keep rising! 🌅",
    "{streak} days and counting — you're proving that setbacks are setups for comebacks! 🚀"
  ],
  gentle_encouragement: [
    "Every journey starts with a single step — you're {progress}% on your way! 🌸",
    "You're {progress}% in and that's something to be proud of! 🌺",
    "{progress}% complete — you're making it happen, one day at a time! 🌙",
    "Look at that! {progress}% progress — you're already making a difference! ⭐",
    "You're {progress}% closer to your dreams today than yesterday! 🌈"
  ],
  streak_milestone: [
    "{streak} days strong! Your consistency is building something beautiful! 🌸",
    "Amazing! {streak} days of showing up — you're a force of nature! 🌊",
    "{streak} day streak! Your future self is doing a happy dance! 💃",
    "Incredible! {streak} days of dedication — you're rewriting your story! ✍️",
    "{streak} days and counting — your commitment is absolutely inspiring! 🌟"
  ]
};

// Smart nudge generation service
export const nudgeService = {
  async generateContextualNudge({ type, progress, streak, goalTitle, context }) {
    try {
      await toneAnalyzer.initializeModel();
      
      const tone = toneAnalyzer.getTone(progress, context);
      const templates = nudgeTemplates[tone] || nudgeTemplates.gentle_encouragement;
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      let message = template;
      
      // Replace placeholders with actual values
      if (progress !== undefined) {
        message = message.replace(/{progress}/g, progress);
        message = message.replace(/{remaining}/g, 100 - progress);
      }
      
      if (streak !== undefined) {
        message = message.replace(/{streak}/g, streak);
      }
      
      if (goalTitle) {
        message = message.replace(/{goalTitle}/g, goalTitle);
      }
      
      return {
        message,
        type: 'nudge',
        tone,
        createdAt: new Date().toISOString(),
        context: context || 'general'
      };
      
    } catch (error) {
      console.error('Failed to generate contextual nudge:', error);
      return {
        message: "You're making great progress — keep up the amazing work! 🌟",
        type: 'nudge',
        tone: 'encouraging_final_push',
        createdAt: new Date().toISOString(),
        context: 'fallback'
      };
    }
  },

  async generateProgressBasedNudge({ goalId, goalTitle, progress, streakContext }) {
    try {
      let context = 'general';
      
      if (progress >= 80) context = 'final_push';
      else if (progress >= 60) context = 'milestone_reached';
      else if (progress >= 40) context = 'steady_progress';
      
      return await this.generateContextualNudge({
        type: 'progress',
        progress,
        streak: streakContext,
        goalTitle,
        context
      });
      
    } catch (error) {
      console.error('Failed to generate progress nudge:', error);
      return null;
    }
  },

  async generateStreakNudge({ streak, longestStreak, type }) {
    try {
      let context = 'streak_maintenance';
      
      if (type === 'streak_milestone') context = 'streak_milestone';
      else if (type === 'streak_encouragement') context = 'streak_recovery';
      
      return await this.generateContextualNudge({
        type: 'streak',
        streak,
        context
      });
      
    } catch (error) {
      console.error('Failed to generate streak nudge:', error);
      return null;
    }
  }
};

export default nudgeService;