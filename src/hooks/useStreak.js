import { useState, useEffect } from 'react';
import { checkInService } from '@/services/api/checkInService';
import { format, differenceInDays } from 'date-fns';

export const useStreak = () => {
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState(null);
  
  const calculateStreak = async () => {
    try {
      const checkIns = await checkInService.getAll();
      
      if (checkIns.length === 0) {
        setStreak(0);
        setLongestStreak(0);
        setLastCheckIn(null);
        return;
      }
      
      // Sort check-ins by date (newest first)
      const sortedCheckIns = checkIns.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      setLastCheckIn(sortedCheckIns[0].date);
      
      // Calculate current streak
      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;
      const today = new Date();
      
      // Check if there's a check-in today or yesterday
      const latestCheckIn = new Date(sortedCheckIns[0].date);
      const daysDiff = differenceInDays(today, latestCheckIn);
      
      if (daysDiff <= 1) {
        // Start counting from the most recent check-in
        let previousDate = latestCheckIn;
        currentStreak = 1;
        tempStreak = 1;
        
        for (let i = 1; i < sortedCheckIns.length; i++) {
          const currentDate = new Date(sortedCheckIns[i].date);
          const daysBetween = differenceInDays(previousDate, currentDate);
          
          if (daysBetween === 1) {
            // Consecutive days
            currentStreak++;
            tempStreak++;
          } else if (daysBetween === 0) {
            // Same day (multiple check-ins)
            tempStreak++;
          } else {
            // Break in streak
            maxStreak = Math.max(maxStreak, tempStreak);
            tempStreak = 1;
            if (i === 1) currentStreak = 0; // Reset current streak if break is at the beginning
          }
          
          previousDate = currentDate;
        }
        
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        // No recent check-in, streak is broken
        currentStreak = 0;
        
        // Calculate historical longest streak
        let tempStreak = 1;
        let previousDate = new Date(sortedCheckIns[0].date);
        
        for (let i = 1; i < sortedCheckIns.length; i++) {
          const currentDate = new Date(sortedCheckIns[i].date);
          const daysBetween = differenceInDays(previousDate, currentDate);
          
          if (daysBetween <= 1) {
            tempStreak++;
          } else {
            maxStreak = Math.max(maxStreak, tempStreak);
            tempStreak = 1;
          }
          
          previousDate = currentDate;
        }
        
        maxStreak = Math.max(maxStreak, tempStreak);
      }
      
      setStreak(currentStreak);
      setLongestStreak(maxStreak);
      
    } catch (error) {
      console.error('Failed to calculate streak:', error);
    }
  };
  
  useEffect(() => {
    calculateStreak();
  }, []);
  
  const updateStreak = () => {
    calculateStreak();
  };
  
  return {
    streak,
    longestStreak,
    lastCheckIn,
    updateStreak
  };
};