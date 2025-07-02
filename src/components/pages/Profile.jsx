import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import { profileService } from '@/services/api/profileService';
import { toast } from 'react-toastify';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.get();
      setProfile(data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await profileService.update(profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: 'User' },
    { id: 'preferences', name: 'Preferences', icon: 'Settings' },
    { id: 'account', name: 'Account', icon: 'Shield' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <ApperIcon name="AlertCircle" size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-slate-400">Failed to load profile</p>
          <Button onClick={loadProfile} className="mt-4">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Profile</h1>
          <p className="text-slate-400">Manage your account information and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-surface border border-slate-600/50 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-slate-400">{profile.email}</p>
              <p className="text-sm text-slate-500">Member since {profile.memberSince}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{profile.stats.totalGoals}</div>
              <div className="text-sm text-slate-400">Total Goals</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-accent">{profile.stats.completedGoals}</div>
              <div className="text-sm text-slate-400">Completed</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">{profile.stats.currentStreak}</div>
              <div className="text-sm text-slate-400">Day Streak</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{profile.stats.totalCheckIns}</div>
              <div className="text-sm text-slate-400">Check-ins</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gradient-surface border border-slate-600/50 rounded-xl overflow-hidden">
          <div className="border-b border-slate-600/50">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary border-b-2 border-primary'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <ApperIcon name={tab.icon} size={16} />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        First Name
                      </label>
                      <Input
                        value={profile.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Last Name
                      </label>
                      <Input
                        value={profile.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter your last name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Phone
                      </label>
                      <Input
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Time Zone
                      </label>
                      <Select
                        value={profile.preferences.timezone}
                        onChange={(e) => handleInputChange('preferences', {
                          ...profile.preferences,
                          timezone: e.target.value
                        })}
                        options={[
                          { value: 'UTC', label: 'UTC' },
                          { value: 'America/New_York', label: 'Eastern Time' },
                          { value: 'America/Chicago', label: 'Central Time' },
                          { value: 'America/Denver', label: 'Mountain Time' },
                          { value: 'America/Los_Angeles', label: 'Pacific Time' }
                        ]}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Language
                      </label>
                      <Select
                        value={profile.preferences.language}
                        onChange={(e) => handleInputChange('preferences', {
                          ...profile.preferences,
                          language: e.target.value
                        })}
                        options={[
                          { value: 'en', label: 'English' },
                          { value: 'es', label: 'Spanish' },
                          { value: 'fr', label: 'French' },
                          { value: 'de', label: 'German' }
                        ]}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-white">Notification Settings</h4>
                    
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={profile.preferences.emailNotifications}
                          onChange={(e) => handleInputChange('preferences', {
                            ...profile.preferences,
                            emailNotifications: e.target.checked
                          })}
                          className="w-4 h-4 text-primary bg-slate-800 border-slate-600 rounded focus:ring-primary"
                        />
                        <span className="text-slate-300">Email notifications</span>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={profile.preferences.pushNotifications}
                          onChange={(e) => handleInputChange('preferences', {
                            ...profile.preferences,
                            pushNotifications: e.target.checked
                          })}
                          className="w-4 h-4 text-primary bg-slate-800 border-slate-600 rounded focus:ring-primary"
                        />
                        <span className="text-slate-300">Push notifications</span>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={profile.preferences.weeklyReports}
                          onChange={(e) => handleInputChange('preferences', {
                            ...profile.preferences,
                            weeklyReports: e.target.checked
                          })}
                          className="w-4 h-4 text-primary bg-slate-800 border-slate-600 rounded focus:ring-primary"
                        />
                        <span className="text-slate-300">Weekly progress reports</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                      <h4 className="text-md font-medium text-white mb-2">Account Status</h4>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-500 text-sm">Active</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                      <h4 className="text-md font-medium text-white mb-2">Data Export</h4>
                      <p className="text-slate-400 text-sm mb-3">
                        Download all your goal data and progress history
                      </p>
                      <Button variant="outline" size="sm">
                        <ApperIcon name="Download" size={16} className="mr-2" />
                        Export Data
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-red-900/20 rounded-lg border border-red-500/20">
                      <h4 className="text-md font-medium text-red-400 mb-2">Danger Zone</h4>
                      <p className="text-slate-400 text-sm mb-3">
                        Permanently delete your account and all associated data
                      </p>
                      <Button variant="outline" size="sm" className="text-red-400 border-red-400 hover:bg-red-500/10">
                        <ApperIcon name="Trash2" size={16} className="mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </>
            ) : (
              <>
                <ApperIcon name="Save" size={16} />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;