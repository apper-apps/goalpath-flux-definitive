import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Select from '@/components/atoms/Select';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { chartService } from '@/services/api/chartService';
import { goalService } from '@/services/api/goalService';
import { format, subMonths } from 'date-fns';

const MoodCorrelationChart = ({ goalId = null, className = "" }) => {
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState(goalId || 'all');
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGoals = async () => {
    try {
      const goalsData = await goalService.getAll();
      setGoals(goalsData);
    } catch (err) {
      console.error('Failed to load goals:', err);
    }
  };

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await chartService.getMoodCorrelationData({
        goalId: selectedGoalId === 'all' ? null : parseInt(selectedGoalId),
        startDate,
        endDate
      });
      
      setChartData(data);
    } catch (err) {
      setError('Failed to load mood correlation data');
      console.error('Chart data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    loadChartData();
  }, [selectedGoalId, startDate, endDate]);

  const goalOptions = [
    { value: 'all', label: 'All Goals' },
    ...goals.map(goal => ({
      value: goal.Id.toString(),
      label: goal.title
    }))
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{format(new Date(label), 'MMM d, yyyy')}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-300">
                {entry.dataKey === 'progress' ? 'Progress' : 'Mood'}: {entry.value}
                {entry.dataKey === 'progress' ? '%' : '/5'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`bg-gradient-surface rounded-xl p-6 border border-slate-600/50 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <ApperIcon name="TrendingUp" size={20} className="text-primary" />
          <h3 className="text-xl font-display font-semibold text-white">
            Mood & Progress Correlation
          </h3>
        </div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gradient-surface rounded-xl p-6 border border-slate-600/50 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <ApperIcon name="TrendingUp" size={20} className="text-primary" />
          <h3 className="text-xl font-display font-semibold text-white">
            Mood & Progress Correlation
          </h3>
        </div>
        <Error 
          message={error}
          onRetry={loadChartData}
          compact={true}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-surface rounded-xl p-6 border border-slate-600/50 ${className}`}
    >
      <div className="flex items-center gap-2 mb-6">
        <ApperIcon name="TrendingUp" size={20} className="text-primary" />
        <h3 className="text-xl font-display font-semibold text-white">
          Mood & Progress Correlation
        </h3>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {!goalId && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Goal
            </label>
            <Select
              value={selectedGoalId}
              onChange={setSelectedGoalId}
              options={goalOptions}
              placeholder="Select goal..."
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Start Date
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            End Date
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <Empty
          title="No data available"
          message="No mood or progress data found for the selected period"
          icon="BarChart3"
          compact={true}
        />
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => format(new Date(value), 'MMM d')}
              />
              <YAxis 
                yAxisId="progress"
                orientation="left"
                stroke="#9CA3AF"
                fontSize={12}
                domain={[0, 100]}
              />
              <YAxis 
                yAxisId="mood"
                orientation="right"
                stroke="#9CA3AF"
                fontSize={12}
                domain={[1, 5]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="progress"
                type="monotone"
                dataKey="progress"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Progress (%)"
              />
              <Line
                yAxisId="mood"
                type="monotone"
                dataKey="mood"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                name="Mood (1-5)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default MoodCorrelationChart;