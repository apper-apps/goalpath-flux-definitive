import React from 'react';
import { useLocation } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const Header = ({ onMenuToggle, onCheckIn, streak = 0 }) => {
  const location = useLocation();
  
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
          <Button
            variant="ghost"
            size="md"
            className="p-2 relative"
          >
            <ApperIcon name="Bell" size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;