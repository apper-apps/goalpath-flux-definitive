import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatCard from "@/components/molecules/StatCard";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { checkInService } from "@/services/api/checkInService";
import { useStreak } from "@/hooks/useStreak";
import { eachDayOfInterval, endOfWeek, format, startOfWeek } from "date-fns";
import { toast } from "react-toastify";

const CheckIns = () => {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  
  const { streak } = useStreak();
  
  const loadCheckIns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await checkInService.getAll();
      setCheckIns(data);
    } catch (err) {
      setError('Failed to load check-ins');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadCheckIns();
  }, []);
  
  const moodEmojis = ['😞', '😕', '😐', '😊', '😄'];
  const moodLabels = ['Very Bad', 'Bad', 'Okay', 'Good', 'Excellent'];
  
  const getWeekData = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return daysInWeek.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const checkIn = checkIns.find(ci => 
        format(new Date(ci.date), 'yyyy-MM-dd') === dayStr
      );
      
      return {
        date: day,
        checkIn,
        hasCheckIn: !!checkIn
      };
    });
  };
  
  const getStats = () => {
    const totalCheckIns = checkIns.length;
    const avgMood = checkIns.length > 0 
      ? (checkIns.reduce((sum, ci) => sum + ci.mood, 0) / checkIns.length).toFixed(1)
      : 0;
    
    const thisWeekCheckIns = checkIns.filter(ci => {
      const checkInDate = new Date(ci.date);
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      return checkInDate >= weekStart && checkInDate <= weekEnd;
    }).length;
    
    const completedMilestones = checkIns.reduce((sum, ci) => 
      sum + (ci.completedMilestones?.length || 0), 0
    );
    
    return {
      totalCheckIns,
      avgMood,
      thisWeekCheckIns,
      completedMilestones
    };
  };
  
  if (loading) {
    return (
      <div className="p-6">
        <Loading />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <Error 
          message="Failed to load check-ins. Please try again."
          onRetry={loadCheckIns}
        />
      </div>
    );
  }
  
  const stats = getStats();
  const weekData = getWeekData();
  
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-display font-bold gradient-text mb-4">
          Check-in History 📊
        </h1>
        <p className="text-slate-400 text-lg">
          Track your daily progress and mood correlations
        </p>
      </motion.div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Current Streak"
          value={`${streak} days`}
          icon="Flame"
          variant="primary"
        />
        <StatCard
          title="Total Check-ins"
          value={stats.totalCheckIns}
          icon="CheckCircle2"
          variant="success"
        />
        <StatCard
          title="Average Mood"
          value={stats.avgMood}
          icon="Smile"
          variant="accent"
          subtitle={stats.avgMood > 0 ? moodLabels[Math.round(stats.avgMood) - 1] : 'No data'}
        />
        <StatCard
          title="Milestones Hit"
          value={stats.completedMilestones}
          icon="Target"
          variant="warning"
        />
      </div>
      
      {checkIns.length === 0 ? (
        <Empty
          title="No check-ins yet"
          message="Start your journey by completing your first daily check-in"
icon="CheckCircle2"
          actionLabel="Complete Check-in"
          onAction={() => {
            // Trigger check-in modal through parent component
            const event = new window.CustomEvent('openCheckIn');
            window.dispatchEvent(event);
          }}
        />
      ) : (
        <>
          {/* Weekly View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-surface rounded-xl p-6 border border-slate-600/50"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-white">
                This Week
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <ApperIcon name="Calendar" size={16} />
                {format(weekData[0].date, 'MMM d')} - {format(weekData[6].date, 'MMM d')}
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-4">
              {weekData.map((day, index) => (
                <div
                  key={index}
                  className={`
                    aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-3 transition-all duration-200
                    ${day.hasCheckIn 
                      ? 'border-success bg-success/10 text-success' 
                      : format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-600 text-slate-400'
                    }
                  `}
                >
                  <div className="text-xs font-medium mb-1">
                    {format(day.date, 'EEE')}
                  </div>
                  <div className="text-lg font-bold mb-1">
                    {format(day.date, 'd')}
                  </div>
                  {day.checkIn && (
                    <div className="text-lg">
                      {moodEmojis[day.checkIn.mood - 1]}
                    </div>
                  )}
                  {day.hasCheckIn && (
                    <ApperIcon name="CheckCircle" size={12} className="mt-1" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Recent Check-ins */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-surface rounded-xl p-6 border border-slate-600/50"
          >
            <h2 className="text-2xl font-display font-bold text-white mb-6">
              Recent Check-ins
            </h2>
            
            <div className="space-y-4">
              {checkIns.slice(0, 10).map((checkIn, index) => (
                <motion.div
                  key={checkIn.Id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-surface border border-slate-600"
                >
                  <div className="text-2xl">{moodEmojis[checkIn.mood - 1]}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-white">
                        {format(new Date(checkIn.date), 'EEEE, MMM d, yyyy')}
                      </span>
                      <span className="text-sm text-slate-400">
                        {moodLabels[checkIn.mood - 1]}
                      </span>
                    </div>
                    
                    {checkIn.completedMilestones?.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-success">
                        <ApperIcon name="Target" size={14} />
                        {checkIn.completedMilestones.length} milestone{checkIn.completedMilestones.length !== 1 ? 's' : ''} completed
                      </div>
                    )}
                    
                    {checkIn.notes && (
                      <p className="text-sm text-slate-400 mt-2 italic">
                        "{checkIn.notes}"
                      </p>
                    )}
                  </div>
                  
                  <div className="text-xs text-slate-500 text-right">
                    {format(new Date(checkIn.date), 'h:mm a')}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {checkIns.length > 10 && (
              <div className="mt-6 text-center">
                <Button variant="secondary">
                  Load More Check-ins
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default CheckIns;