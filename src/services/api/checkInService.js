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
  
  delay(ms = 250) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const checkInService = new CheckInService();