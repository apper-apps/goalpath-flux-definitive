import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FixedSizeList as List } from "react-window";
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
  const [displayCount, setDisplayCount] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  
  const { streak } = useStreak();
const loadCheckIns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await checkInService.getAll();
      setCheckIns(data);
      setHasMore(data.length > displayCount);
    } catch (err) {
      setError('Failed to load check-ins');
    } finally {
      setLoading(false);
    }
  };
  
  const loadMore = useCallback(() => {
    const newCount = displayCount + 10;
    setDisplayCount(newCount);
    setHasMore(checkIns.length > newCount);
  }, [displayCount, checkIns.length]);
  
  useEffect(() => {
    loadCheckIns();
  }, []);
  
  useEffect(() => {
    setHasMore(checkIns.length > displayCount);
  }, [checkIns.length, displayCount]);
  
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
  
  const CheckInItem = ({ index, style }) => {
    const checkIn = checkIns[index];
    if (!checkIn) return null;
    
    return (
      <div style={style}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-3 p-3 mx-2 mb-2 rounded-lg bg-surface border border-slate-600"
        >
          <div className="text-xl">{moodEmojis[checkIn.mood - 1]}</div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white text-sm">
                {format(new Date(checkIn.date), 'MMM d, yyyy')}
              </span>
              <span className="text-xs text-slate-400">
                {moodLabels[checkIn.mood - 1]}
              </span>
            </div>
            
            {checkIn.completedMilestones?.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-success mb-1">
                <ApperIcon name="Target" size={12} />
                {checkIn.completedMilestones.length} milestone{checkIn.completedMilestones.length !== 1 ? 's' : ''}
              </div>
            )}
            
            {checkIn.notes && (
              <p className="text-xs text-slate-400 truncate italic">
                "{checkIn.notes}"
              </p>
            )}
          </div>
          
          <div className="text-xs text-slate-500 text-right shrink-0">
            {format(new Date(checkIn.date), 'h:mm a')}
          </div>
        </motion.div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="p-4">
        <Loading />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
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
    <div className="p-4 space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-display font-bold gradient-text mb-2">
          Check-in History 📊
        </h1>
        <p className="text-slate-400">
          Track your daily progress and mood correlations
        </p>
      </motion.div>
      
{/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            className="bg-gradient-surface rounded-xl p-4 border border-slate-600/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold text-white">
                This Week
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <ApperIcon name="Calendar" size={14} />
                {format(weekData[0].date, 'MMM d')} - {format(weekData[6].date, 'MMM d')}
              </div>
            </div>
            
<div className="grid grid-cols-7 gap-3">
              {weekData.map((day, index) => (
                <div
                  key={index}
                  className={`
                    aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all duration-200
                    ${day.hasCheckIn 
                      ? 'border-success bg-success/10 text-success' 
                      : format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-600 text-slate-400'
                    }
                  `}
                >
                  <div className="text-xs font-medium">
                    {format(day.date, 'EEE')}
                  </div>
                  <div className="text-sm font-bold">
                    {format(day.date, 'd')}
                  </div>
                  {day.checkIn && (
                    <div className="text-sm">
                      {moodEmojis[day.checkIn.mood - 1]}
                    </div>
                  )}
                  {day.hasCheckIn && (
                    <ApperIcon name="CheckCircle" size={10} className="mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
          
{/* Recent Check-ins */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-surface rounded-xl p-4 border border-slate-600/50"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold text-white">
                Recent Check-ins
              </h2>
              <span className="text-sm text-slate-400">
                {Math.min(displayCount, checkIns.length)} of {checkIns.length}
              </span>
            </div>
            
            {checkIns.length > 0 && (
              <div className="h-80">
                <List
                  height={320}
                  itemCount={Math.min(displayCount, checkIns.length)}
                  itemSize={80}
                  itemData={checkIns}
                >
                  {CheckInItem}
                </List>
              </div>
            )}
            
            {hasMore && (
              <div className="mt-4 text-center">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={loadMore}
                >
                  Load More ({checkIns.length - displayCount} remaining)
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