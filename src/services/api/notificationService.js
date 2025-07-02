import mockData from '@/services/mockData/notifications.json';

let notifications = [...mockData];
let nextId = Math.max(...notifications.map(n => n.Id)) + 1;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const notificationService = {
  async getAll() {
    await delay(300);
    return [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getById(id) {
    await delay(300);
    const notification = notifications.find(n => n.Id === parseInt(id));
    if (!notification) {
      throw new Error('Notification not found');
    }
    return { ...notification };
  },

  async create(notificationData) {
    await delay(300);
    const newNotification = {
      Id: nextId++,
      ...notificationData,
      read: false,
      createdAt: new Date().toISOString()
    };
    notifications.push(newNotification);
    return { ...newNotification };
  },

  async update(id, data) {
    await delay(300);
    const index = notifications.findIndex(n => n.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Notification not found');
    }
    
    notifications[index] = {
      ...notifications[index],
      ...data,
      Id: notifications[index].Id // Preserve original Id
    };
    
    return { ...notifications[index] };
  },

  async delete(id) {
    await delay(300);
    const index = notifications.findIndex(n => n.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Notification not found');
    }
    
    const deleted = notifications.splice(index, 1)[0];
    return { ...deleted };
  },

  async markAsRead(id) {
    await delay(300);
    const index = notifications.findIndex(n => n.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Notification not found');
    }
    
    notifications[index].read = true;
    return { ...notifications[index] };
  }
};