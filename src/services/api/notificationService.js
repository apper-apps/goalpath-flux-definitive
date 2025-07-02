import { nudgeService } from "./nudgeService";
import React from "react";
import Error from "@/components/ui/Error";
import mockData from "@/services/mockData/notifications.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Copy data to avoid mutations
const notifications = [...mockData];
let nextId = Math.max(...notifications.map(n => n.Id)) + 1;

export const notificationService = {
  async getAll() {
    await delay(300);
    return [...notifications];
  },

  async getById(id) {
    await delay(200);
    const notification = notifications.find(n => n.Id === parseInt(id));
    return notification ? { ...notification } : null;
  },

  async create(notificationData) {
    await delay(400);
    const newNotification = {
      Id: nextId++,
      ...notificationData,
      createdAt: new Date().toISOString()
    };
    notifications.push(newNotification);
    return { ...newNotification };
  },

  async generateNudge({ type, streak, longestStreak, context, goalId, goalTitle, progress }) {
    try {
      await delay(200);
      
      let nudge;
      
      if (type === 'streak_milestone' || type === 'streak_encouragement') {
        nudge = await nudgeService.generateStreakNudge({
          streak,
          longestStreak,
          type
        });
      } else if (type === 'progress') {
        nudge = await nudgeService.generateProgressBasedNudge({
          goalId,
          goalTitle,
          progress,
          streakContext: streak
        });
      } else {
        nudge = await nudgeService.generateContextualNudge({
          type,
          progress,
          streak,
          goalTitle,
          context
        });
      }
      
      if (nudge) {
        // Store as a special notification type
        const nudgeNotification = {
          Id: nextId++,
          title: 'AI Nudge',
          message: nudge.message,
          type: 'nudge',
          subtype: nudge.tone,
          read: false,
          createdAt: nudge.createdAt,
          goalId: goalId || null,
          context: nudge.context
        };
        
        notifications.unshift(nudgeNotification);
        return nudgeNotification;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to generate nudge:', error);
      return null;
    }
  },

  async createProgressNudge({ goalId, goalTitle, progress, type, streakContext }) {
    try {
      return await this.generateNudge({
        type: 'progress',
        goalId,
        goalTitle,
        progress,
        streak: streakContext,
        context: type
      });
    } catch (error) {
      console.error('Failed to create progress nudge:', error);
      return null;
    }
  },

  async createStreakNudge({ streak, longestStreak, type }) {
    try {
      return await this.generateNudge({
        type,
        streak,
        longestStreak,
        context: 'streak'
      });
    } catch (error) {
      console.error('Failed to create streak nudge:', error);
return null;
    }
  },

  async update(id, updateData) {
    await delay(350);
    const index = notifications.findIndex(n => n.Id === parseInt(id));
    if (index === -1) return null;
    
    notifications[index] = { ...notifications[index], ...updateData };
    return { ...notifications[index] };
  },

  async delete(id) {
    await delay(300);
    const index = notifications.findIndex(n => n.Id === parseInt(id));
    if (index === -1) return false;
    
    notifications.splice(index, 1);
    return true;
  },

  async markAsRead(id) {
    await delay(200);
    const notification = notifications.find(n => n.Id === parseInt(id));
    if (notification) {
      notification.read = true;
      return { ...notification };
    }
    return null;
  },

  async getUnreadCount() {
    await delay(100);
    return notifications.filter(n => !n.read).length;
  }
};