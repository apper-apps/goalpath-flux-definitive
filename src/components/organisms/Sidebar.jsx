import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  
  const navItems = [
    {
      path: '/',
      name: 'Dashboard',
      icon: 'LayoutDashboard',
      description: 'Overview & progress'
    },
    {
      path: '/goals',
      name: 'Goals',
      icon: 'Target',
      description: 'Manage your goals'
    },
    {
      path: '/check-ins',
      name: 'Check-ins',
      icon: 'CheckCircle2',
      description: 'Daily progress tracking'
    },
    {
      path: '/settings',
      name: 'Settings',
      icon: 'Settings',
      description: 'App preferences'
    }
  ];
  
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-gradient-surface border-r border-slate-600/50 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:block
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <ApperIcon name="Target" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold gradient-text">
                  GoalPath AI
                </h1>
                <p className="text-xs text-slate-400">Smart Goal Tracking</p>
              </div>
            </div>
            
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <ApperIcon name="X" size={20} className="text-slate-400" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => window.innerWidth < 1024 && onToggle()}
                    className={`
                      group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-primary text-white shadow-lg' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }
                    `}
                  >
                    <ApperIcon 
                      name={item.icon} 
                      size={20} 
                      className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${isActive ? 'text-white/70' : 'text-slate-500'}`}>
                        {item.description}
                      </div>
                    </div>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="w-1 h-6 bg-white rounded-full"
                      />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-slate-600/50">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
                <ApperIcon name="Sparkles" size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">AI-Powered</div>
                <div className="text-xs text-primary">Smart milestone generation</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;