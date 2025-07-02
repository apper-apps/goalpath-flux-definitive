import checkInsData from '@/services/mockData/checkIns.json';

class CheckInService {
  constructor() {
    this.checkIns = [...checkInsData];
    this.nextId = Math.max(...this.checkIns.map(c => c.Id)) + 1;
  }
  
  async getAll() {
    await this.delay();
    return [...this.checkIns].sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  
  async getById(id) {
    await this.delay();
    const checkIn = this.checkIns.find(c => c.Id === id);
    if (!checkIn) {
      throw new Error('Check-in not found');
    }
    return { ...checkIn };
  }
  
  async create(checkInData) {
    await this.delay();
    const newCheckIn = {
      ...checkInData,
      Id: this.nextId++
    };
    this.checkIns.push(newCheckIn);
    return { ...newCheckIn };
  }
  
  async update(id, checkInData) {
    await this.delay();
    const index = this.checkIns.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error('Check-in not found');
    }
    
    this.checkIns[index] = { ...this.checkIns[index], ...checkInData };
    return { ...this.checkIns[index] };
  }
  
  async delete(id) {
    await this.delay();
    const index = this.checkIns.findIndex(c => c.Id === id);
    if (index === -1) {
      throw new Error('Check-in not found');
    }
    
    this.checkIns.splice(index, 1);
    return true;
  }
// Get recent mood data for stress analysis
  async getRecentMoodData(goalId) {
    await this.delay();
    
    // Return recent check-ins sorted by date (most recent first)
    const recentCheckIns = [...this.checkIns]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 14); // Last 2 weeks
    
    return recentCheckIns;
  }
  
  // Analyze mood patterns for stress detection
  async analyzeMoodPatterns() {
    await this.delay();
    
    const recentCheckIns = await this.getRecentMoodData();
    const moodCounts = {};
    const stressIndicators = ['stressed', 'overwhelmed', 'anxious', 'frustrated', 'burned_out'];
    
    recentCheckIns.forEach(checkIn => {
      if (checkIn.mood) {
        moodCounts[checkIn.mood] = (moodCounts[checkIn.mood] || 0) + 1;
      }
    });
    
    const totalMoods = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
    const stressCount = stressIndicators.reduce((sum, mood) => sum + (moodCounts[mood] || 0), 0);
    
    return {
      totalEntries: totalMoods,
      stressPercentage: totalMoods > 0 ? (stressCount / totalMoods) * 100 : 0,
      dominantMood: Object.keys(moodCounts).reduce((a, b) => moodCounts[a] > moodCounts[b] ? a : b, 'neutral'),
      moodDistribution: moodCounts,
      trendingStressed: stressCount > totalMoods * 0.4
    };
  }
  
  delay(ms = 250) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const checkInService = new CheckInService();