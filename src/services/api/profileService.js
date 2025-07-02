import mockData from '@/services/mockData/profile.json';

let profile = { ...mockData };

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const profileService = {
  async get() {
    await delay(300);
    return { ...profile };
  },

  async update(data) {
    await delay(300);
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email) {
      throw new Error('First name, last name, and email are required');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }
    
    profile = {
      ...profile,
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return { ...profile };
  }
};