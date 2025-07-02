import milestonesData from '@/services/mockData/milestones.json';

class MilestoneService {
  constructor() {
    this.milestones = [...milestonesData];
    this.nextId = Math.max(...this.milestones.map(m => m.Id)) + 1;
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
    
    this.milestones[index] = { ...this.milestones[index], ...milestoneData };
    return { ...this.milestones[index] };
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
  
  delay(ms = 200) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const milestoneService = new MilestoneService();