import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";

const Settings = () => {
  const [settings, setSettings] = useState({
    reminderTime: '09:00',
    reminderEnabled: true,
    reminderFrequency: 'daily',
    theme: 'dark',
    language: 'en',
    exportFormat: 'json',
    autoBackup: true,
    soundEnabled: true,
    emailNotifications: false
  });
  
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('goalpath-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);
  
  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Save to localStorage
      localStorage.setItem('goalpath-settings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Settings saved successfully! ⚙️');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };
  
const handleExport = () => {
    const data = {
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goalpath-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Settings exported successfully!');
  };
  
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
      const defaultSettings = {
        reminderTime: '09:00',
        reminderEnabled: true,
        reminderFrequency: 'daily',
        theme: 'dark',
        language: 'en',
        exportFormat: 'json',
        autoBackup: true,
        soundEnabled: true,
        emailNotifications: false
      };
      
      setSettings(defaultSettings);
      localStorage.setItem('goalpath-settings', JSON.stringify(defaultSettings));
      toast.success('Settings reset to default');
    }
  };
  
  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'custom', label: 'Custom' }
  ];
  
  const themeOptions = [
    { value: 'dark', label: 'Dark Theme' },
    { value: 'light', label: 'Light Theme' },
    { value: 'auto', label: 'Auto (System)' }
  ];
  
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' }
  ];
  
  const exportOptions = [
    { value: 'json', label: 'JSON' },
    { value: 'csv', label: 'CSV' },
    { value: 'pdf', label: 'PDF' }
  ];
  
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-display font-bold gradient-text mb-4">
          Settings ⚙️
        </h1>
        <p className="text-slate-400 text-lg">
          Customize your GoalPath AI experience
        </p>
      </motion.div>
      
      {/* Reminders Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-surface rounded-xl p-8 border border-slate-600/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/20">
            <ApperIcon name="Bell" size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white">
              Reminders & Notifications
            </h2>
            <p className="text-slate-400">Stay on track with smart reminders</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-slate-600">
              <div>
                <h4 className="font-medium text-white">Enable Reminders</h4>
                <p className="text-sm text-slate-400">Get daily check-in reminders</p>
              </div>
              <button
                onClick={() => handleChange('reminderEnabled', !settings.reminderEnabled)}
                className={`
                  w-12 h-6 rounded-full transition-colors duration-200 flex items-center
                  ${settings.reminderEnabled ? 'bg-primary' : 'bg-slate-600'}
                `}
              >
                <div className={`
                  w-5 h-5 bg-white rounded-full transition-transform duration-200
                  ${settings.reminderEnabled ? 'translate-x-6' : 'translate-x-0.5'}
                `} />
              </button>
            </div>
            
            <Input
              label="Reminder Time"
              type="time"
              value={settings.reminderTime}
              onChange={(e) => handleChange('reminderTime', e.target.value)}
              disabled={!settings.reminderEnabled}
            />
          </div>
          
          <div className="space-y-4">
            <Select
              label="Reminder Frequency"
              value={settings.reminderFrequency}
              onChange={(e) => handleChange('reminderFrequency', e.target.value)}
              options={frequencyOptions}
              disabled={!settings.reminderEnabled}
            />
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-slate-600">
              <div>
                <h4 className="font-medium text-white">Sound Notifications</h4>
                <p className="text-sm text-slate-400">Play sound for reminders</p>
              </div>
              <button
                onClick={() => handleChange('soundEnabled', !settings.soundEnabled)}
                className={`
                  w-12 h-6 rounded-full transition-colors duration-200 flex items-center
                  ${settings.soundEnabled ? 'bg-primary' : 'bg-slate-600'}
                `}
              >
                <div className={`
                  w-5 h-5 bg-white rounded-full transition-transform duration-200
                  ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}
                `} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Appearance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-surface rounded-xl p-8 border border-slate-600/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-accent/20">
            <ApperIcon name="Palette" size={24} className="text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white">
              Appearance & Language
            </h2>
            <p className="text-slate-400">Customize the look and feel</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Theme"
            value={settings.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            options={themeOptions}
          />
          
          <Select
            label="Language"
            value={settings.language}
            onChange={(e) => handleChange('language', e.target.value)}
            options={languageOptions}
          />
        </div>
      </motion.div>
      
      {/* Data & Privacy Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-surface rounded-xl p-8 border border-slate-600/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-success/20">
            <ApperIcon name="Shield" size={24} className="text-success" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white">
              Data & Privacy
            </h2>
            <p className="text-slate-400">Manage your data and privacy settings</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-surface border border-slate-600">
              <div>
                <h4 className="font-medium text-white">Auto Backup</h4>
                <p className="text-sm text-slate-400">Automatically backup your data</p>
              </div>
              <button
                onClick={() => handleChange('autoBackup', !settings.autoBackup)}
                className={`
                  w-12 h-6 rounded-full transition-colors duration-200 flex items-center
                  ${settings.autoBackup ? 'bg-primary' : 'bg-slate-600'}
                `}
              >
                <div className={`
                  w-5 h-5 bg-white rounded-full transition-transform duration-200
                  ${settings.autoBackup ? 'translate-x-6' : 'translate-x-0.5'}
                `} />
              </button>
            </div>
            
            <Select
              label="Export Format"
              value={settings.exportFormat}
              onChange={(e) => handleChange('exportFormat', e.target.value)}
              options={exportOptions}
            />
          </div>
          
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Download" size={16} />
              Export Data
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleReset}
              className="flex items-center gap-2 text-error hover:text-error"
            >
              <ApperIcon name="RotateCcw" size={16} />
              Reset Settings
            </Button>
          </div>
        </div>
      </motion.div>
      
      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          loading={loading}
          className="px-12 py-4 text-lg glow"
        >
          <ApperIcon name="Save" size={20} className="mr-3" />
          Save Settings
        </Button>
      </motion.div>
    </div>
  );
};

export default Settings;