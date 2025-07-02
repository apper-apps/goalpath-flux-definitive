import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { format, subMonths } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Select from "@/components/atoms/Select";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import { chartService } from "@/services/api/chartService";
import { goalService } from "@/services/api/goalService";

const MoodCorrelationChart = ({ goalId = null, className = "" }) => {
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState(goalId || 'all');
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 3), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [chartData, setChartData] = useState([]);
  const [milestoneAnalytics, setMilestoneAnalytics] = useState([]);
  const [viewMode, setViewMode] = useState('correlation'); // 'correlation' or 'milestones'
  const [milestoneFilter, setMilestoneFilter] = useState('all'); // 'all', 'completed', 'pending'
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
      
      if (viewMode === 'correlation') {
        const data = await chartService.getMoodCorrelationData({
          goalId: selectedGoalId === 'all' ? null : parseInt(selectedGoalId),
          startDate,
          endDate
        });
        setChartData(data);
      } else {
        const analytics = await chartService.getMilestoneAnalytics({
          goalId: selectedGoalId === 'all' ? null : parseInt(selectedGoalId),
          startDate,
          endDate,
          milestoneFilter
        });
        setMilestoneAnalytics(analytics);
      }
    } catch (err) {
      setError(`Failed to load ${viewMode} data`);
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
  }, [selectedGoalId, startDate, endDate, viewMode, milestoneFilter]);

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
          <p className="text-white font-medium mb-2">
            {viewMode === 'correlation' 
              ? format(new Date(label), 'MMM d, yyyy')
              : `Milestone: ${payload[0]?.payload?.milestoneTitle || 'Unknown'}`
            }
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-300">
                {viewMode === 'correlation' 
                  ? `${entry.dataKey === 'progress' ? 'Progress' : 'Mood'}: ${entry.value}${entry.dataKey === 'progress' ? '%' : '/5'}`
                  : `${entry.dataKey === 'daysFromCompletion' ? 'Days from completion' : 'Mood impact'}: ${entry.value}${entry.dataKey === 'moodImpact' ? '/5' : ''}`
                }
              </span>
            </div>
          ))}
          {viewMode === 'milestones' && payload[0]?.payload && (
            <div className="mt-2 pt-2 border-t border-slate-600">
              <p className="text-xs text-slate-400">
                Completed: {format(new Date(payload[0].payload.completedAt), 'MMM d, yyyy')}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const milestoneFilterOptions = [
    { value: 'all', label: 'All Milestones' },
    { value: 'completed', label: 'Completed Only' },
    { value: 'pending', label: 'Pending Only' }
  ];

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
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <ApperIcon name="TrendingUp" size={20} className="text-primary" />
          <h3 className="text-xl font-display font-semibold text-white">
            {viewMode === 'correlation' ? 'Mood & Progress Correlation' : 'Milestone Impact Analytics'}
          </h3>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'correlation' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('correlation')}
          >
            <ApperIcon name="TrendingUp" size={14} className="mr-1" />
            Correlation
          </Button>
          <Button
            variant={viewMode === 'milestones' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('milestones')}
          >
            <ApperIcon name="Target" size={14} className="mr-1" />
            Milestones
          </Button>
        </div>
      </div>

{/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
        
        {viewMode === 'milestones' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Milestone Type
            </label>
            <Select
              value={milestoneFilter}
              onChange={setMilestoneFilter}
              options={milestoneFilterOptions}
              placeholder="Filter milestones..."
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
      {viewMode === 'correlation' ? (
        chartData.length === 0 ? (
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
        )
      ) : (
        milestoneAnalytics.length === 0 ? (
          <Empty
            title="No milestone data available"
            message="No milestone completion data found for the selected period and filters"
            icon="Target"
            compact={true}
          />
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={milestoneAnalytics} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="daysFromCompletion"
                  stroke="#9CA3AF"
                  fontSize={12}
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}d`}
                  label={{ value: 'Days from Milestone Completion', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  dataKey="moodImpact"
                  stroke="#9CA3AF"
                  fontSize={12}
                  domain={[1, 5]}
                  label={{ value: 'Mood Impact', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Scatter
                  dataKey="moodImpact"
                  fill="#F59E0B"
                  name="Mood Around Milestone"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )
      )}
      
      {/* Analytics Summary for Milestone View */}
      {viewMode === 'milestones' && milestoneAnalytics.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {milestoneAnalytics.filter(m => m.moodImpact >= 4).length}
            </div>
            <div className="text-sm text-slate-400">High Mood Impact</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-warning mb-1">
              {(milestoneAnalytics.reduce((sum, m) => sum + m.moodImpact, 0) / milestoneAnalytics.length).toFixed(1)}
            </div>
            <div className="text-sm text-slate-400">Average Mood Impact</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success mb-1">
              {milestoneAnalytics.length}
            </div>
            <div className="text-sm text-slate-400">Milestones Analyzed</div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MoodCorrelationChart;