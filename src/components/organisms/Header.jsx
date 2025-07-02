import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import useOnClickOutside from "use-onclickoutside";
import { toast } from "react-toastify";
import { useGoals } from "@/hooks/useGoals";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import { notificationService } from "@/services/api/notificationService";

const Header = ({ onMenuToggle, onCheckIn, streak = 0 }) => {
const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nudges, setNudges] = useState([]);
  const { goals } = useGoals();
const notificationRef = useRef(null);
  
  useOnClickOutside(notificationRef, () => {
    setNotificationDropdownOpen(false);
  });
  
useEffect(() => {
    loadNotifications();
    generateContextualNudges();
  }, []);

  useEffect(() => {
    // Generate new nudges when goals data changes
    if (goals.length > 0) {
      generateContextualNudges();
    }
  }, [goals]);
  
  const loadNotifications = async () => {
    try {
      setNotificationLoading(true);
      const data = await notificationService.getAll();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setNotificationLoading(false);
    }
  };

  const generateContextualNudges = async () => {
    try {
      if (goals.length > 0) {
        // Generate progress-based nudges for goals near completion
        const nearCompletionGoals = goals.filter(goal => {
          const progress = goal.milestones ? 
            (goal.milestones.filter(m => m.completed).length / goal.milestones.length * 100) : 
            goal.progress || 0;
          return progress >= 70 && progress < 100;
        });

        for (const goal of nearCompletionGoals) {
          const progress = goal.milestones ? 
            (goal.milestones.filter(m => m.completed).length / goal.milestones.length * 100) : 
            goal.progress || 0;
          
          const nudge = await notificationService.createProgressNudge({
            goalId: goal.Id,
            goalTitle: goal.title,
            progress: Math.round(progress),
            type: 'near_completion',
            streakContext: streak
          });
          
          if (nudge) {
            setNudges(prev => [...prev, nudge]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to generate contextual nudges:', error);
    }
  };
  
  const handleNotificationClick = () => {
    setNotificationDropdownOpen(!notificationDropdownOpen);
  };
  
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.Id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(unreadNotifications.map(n => notificationService.markAsRead(n.Id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/goals':
        return 'Goals';
      case '/check-ins':
        return 'Check-ins';
      case '/settings':
return 'Settings';
      case '/profile':
        return 'Profile';
      default:
        if (location.pathname.startsWith('/goals/')) {
          return 'Goal Details';
        }
        return 'GoalPath AI';
    }
  };
  const getPageDescription = () => {
    switch (location.pathname) {
      case '/':
        return 'Track your progress and stay motivated';
      case '/goals':
        return 'Manage your personal and professional goals';
      case '/check-ins':
        return 'Daily progress tracking and mood correlation';
      case '/settings':
return 'Customize your goal tracking experience';
      case '/profile':
        return 'Manage your account and preferences';
      default:
        if (location.pathname.startsWith('/goals/')) {
          return 'View milestones and track progress';
        }
        return 'Smart goal tracking with AI assistance';
    }
  };
  return (
    <header className="bg-gradient-surface border-b border-slate-600/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <ApperIcon name="Menu" size={20} className="text-slate-400" />
          </button>
          
          <div>
            <h1 className="text-2xl font-display font-bold text-white">
              {getPageTitle()}
            </h1>
            <p className="text-slate-400 text-sm">
              {getPageDescription()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Streak Counter */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <ApperIcon name="Flame" size={16} className="text-primary" />
            <span className="text-primary font-medium">{streak} day streak</span>
          </div>
          
          {/* Quick Check-in Button */}
          <Button
            variant="accent"
            size="md"
            onClick={onCheckIn}
            className="flex items-center gap-2"
          >
            <ApperIcon name="CheckCircle2" size={16} />
            <span className="hidden sm:inline">Quick Check-in</span>
          </Button>
          
{/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="md"
              className="p-2 relative"
              onClick={handleNotificationClick}
            >
              <ApperIcon name="Bell" size={20} />
{(unreadCount + nudges.length) > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-xs text-white font-medium">
                  {(unreadCount + nudges.length) > 9 ? '9+' : (unreadCount + nudges.length)}
                </span>
              )}
            </Button>
            <AnimatePresence>
              {notificationDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden"
                >
<div className="p-4 border-b border-slate-600 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Notifications & Nudges</h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-primary hover:text-primary-light"
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  
<div className="max-h-80 overflow-y-auto">
                    {notificationLoading ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-slate-400 text-sm mt-2">Loading notifications...</p>
                      </div>
) : (notifications.length === 0 && nudges.length === 0) ? (
                      <div className="p-6 text-center">
                        <ApperIcon name="Bell" size={32} className="text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-400">No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-600">
                        {/* Display Nudges First */}
                        {nudges.map((nudge, index) => (
                          <div
                            key={`nudge-${index}`}
                            className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-l-2 border-l-gradient-to-b border-l-primary hover:bg-slate-700/30 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                                <ApperIcon name="Zap" size={16} className="text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-white text-sm font-medium">AI Nudge</p>
                                  <span className="px-2 py-1 bg-gradient-to-r from-primary to-accent text-white text-xs rounded-full font-medium">
                                    Smart Tip
                                  </span>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">{nudge.message}</p>
                                <p className="text-slate-500 text-xs mt-2">{nudge.createdAt}</p>
                              </div>
                              <button
                                onClick={() => setNudges(prev => prev.filter((_, i) => i !== index))}
                                className="p-1 rounded-full hover:bg-slate-600 transition-colors"
                              >
                                <ApperIcon name="X" size={14} className="text-slate-400" />
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {/* Display Regular Notifications */}
                        {notifications.map((notification) => (
                          <div
                            key={notification.Id}
                            className={`p-4 hover:bg-slate-700/50 transition-colors cursor-pointer ${
                              !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                            }`}
                            onClick={() => !notification.read && handleMarkAsRead(notification.Id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                notification.type === 'achievement' ? 'bg-accent/20' :
                                notification.type === 'goal' ? 'bg-primary/20' :
                                notification.type === 'reminder' ? 'bg-yellow-500/20' :
                                'bg-slate-600'
                              }`}>
                                <ApperIcon 
                                  name={
                                    notification.type === 'achievement' ? 'Trophy' :
                                    notification.type === 'goal' ? 'Target' :
                                    notification.type === 'reminder' ? 'Clock' :
                                    'Info'
                                  } 
                                  size={16} 
                                  className={
                                    notification.type === 'achievement' ? 'text-accent' :
                                    notification.type === 'goal' ? 'text-primary' :
                                    notification.type === 'reminder' ? 'text-yellow-500' :
                                    'text-slate-400'
                                  }
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium">{notification.title}</p>
                                <p className="text-slate-400 text-xs mt-1">{notification.message}</p>
                                <p className="text-slate-500 text-xs mt-1">{notification.createdAt}</p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;