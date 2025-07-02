import goalsData from '@/services/mockData/goals.json';

class GoalService {
  constructor() {
    this.goals = [...goalsData];
    this.nextId = Math.max(...this.goals.map(g => g.Id)) + 1;
  }
  
  async getAll() {
    await this.delay();
    return [...this.goals];
  }
  
  async getById(id) {
    await this.delay();
    const goal = this.goals.find(g => g.Id === id);
    if (!goal) {
      throw new Error('Goal not found');
    }
    return { ...goal };
  }
  
  async create(goalData) {
    await this.delay();
    const newGoal = {
      ...goalData,
      Id: this.nextId++,
      createdAt: new Date().toISOString(),
      progress: 0,
      status: 'active'
    };
    this.goals.push(newGoal);
    return { ...newGoal };
  }
  
async update(id, goalData) {
    await this.delay();
    const index = this.goals.findIndex(g => g.Id === id);
    if (index === -1) {
      throw new Error('Goal not found');
    }
    
    const oldGoal = { ...this.goals[index] };
    this.goals[index] = { ...this.goals[index], ...goalData };
    
    // Check if goal just completed (progress reached 100% or status changed to completed)
    const justCompleted = (
      (oldGoal.progress < 100 && this.goals[index].progress >= 100) ||
      (oldGoal.status !== 'completed' && this.goals[index].status === 'completed')
    );
    
    return { 
      ...this.goals[index], 
      justCompleted 
    };
  }
  
  async delete(id) {
    await this.delay();
    const index = this.goals.findIndex(g => g.Id === id);
    if (index === -1) {
      throw new Error('Goal not found');
    }
    
    this.goals.splice(index, 1);
    return true;
  }
  
  delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const goalService = new GoalService();