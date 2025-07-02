import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import ProgressBar from "@/components/atoms/ProgressBar";
import Button from "@/components/atoms/Button";
import MoodCorrelationChart from "@/components/molecules/MoodCorrelationChart";
import MilestoneList from "@/components/molecules/MilestoneList";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Goals from "@/components/pages/Goals";
import { milestoneService } from "@/services/api/milestoneService";
import { chartService } from "@/services/api/chartService";
import { goalService } from "@/services/api/goalService";

const GoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
const [goal, setGoal] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Listen for smart adjustment events
  useEffect(() => {
    const handleMilestonesAdjusted = (event) => {
      const { adjustments } = event.detail;
      if (adjustments.length > 0) {
        // Reload milestones to show adjustments
        loadData();
        toast.info(`🤖 Smart adjustments applied to ${adjustments.length} milestone(s) to help you stay on track!`, {
          autoClose: 5000
        });
      }
    };
    
    const handleStressAdjustments = (event) => {
      const { adjustments, stressLevel } = event.detail;
      if (adjustments.length > 0) {
        loadData();
        toast.success(`😌 Simplified ${adjustments.length} milestone(s) to reduce stress. You've got this!`, {
          autoClose: 6000
        });
      }
    };
    
    window.addEventListener('milestones-adjusted', handleMilestonesAdjusted);
    window.addEventListener('stress-adjustments-applied', handleStressAdjustments);
    
    return () => {
      window.removeEventListener('milestones-adjusted', handleMilestonesAdjusted);
      window.removeEventListener('stress-adjustments-applied', handleStressAdjustments);
    };
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
const [goalData, milestonesData, forecastData] = await Promise.all([
        goalService.getById(parseInt(id)),
        milestoneService.getByGoalId(parseInt(id)),
        chartService.getProgressForecast({ goalId: parseInt(id), includeConfidenceFactors: true })
      ]);
      
      setGoal(goalData);
      setMilestones(milestonesData);
      setForecast(forecastData);
    } catch (err) {
      setError('Failed to load goal details');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadData();
  }, [id]);
  
const handleMilestoneToggle = async (milestoneId) => {
    try {
      const milestone = milestones.find(m => m.Id === milestoneId);
      const updatedMilestone = {
        ...milestone,
        completed: !milestone.completed,
        completedAt: !milestone.completed ? new Date().toISOString() : null
      };
      
      await milestoneService.update(milestoneId, updatedMilestone);
      
      // Update local state
      const updatedMilestones = milestones.map(m => 
        m.Id === milestoneId ? updatedMilestone : m
      );
      setMilestones(updatedMilestones);
      
      // Calculate and update goal progress
      const completedCount = updatedMilestones.filter(m => m.completed).length;
      const totalCount = updatedMilestones.length;
      const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      
      const updatedGoal = { ...goal, progress: newProgress };
      await goalService.update(goal.Id, updatedGoal);
      setGoal(updatedGoal);
      
      // Trigger smart adjustment analysis after milestone completion
      if (updatedMilestone.completed) {
        try {
          const adjustments = await milestoneService.checkAndApplySmartAdjustments(goal.Id, updatedMilestones);
          if (adjustments.length > 0) {
            // Reload data to show any adjustments
            setTimeout(() => loadData(), 1000);
          }
        } catch (adjustError) {
          console.warn('Smart adjustment check failed:', adjustError);
        }
      }
      
      toast.success(
        updatedMilestone.completed 
          ? 'Milestone completed! 🎉' 
          : 'Milestone unmarked'
      );
    } catch (error) {
      toast.error('Failed to update milestone');
    }
  };
  
  const getCategoryVariant = (category) => {
    return category === 'personal' ? 'personal' : 'professional';
  };
  
const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return 'text-success';
    if (confidence >= 0.5) return 'text-warning';
    return 'text-error';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-error bg-error/10 text-error';
      case 'medium': return 'border-warning bg-warning/10 text-warning';
      case 'low': return 'border-primary bg-primary/10 text-primary';
      default: return 'border-success bg-success/10 text-success';
    }
  };
  if (loading) {
    return (
      <div className="p-6">
        <Loading />
      </div>
    );
  }
  
  if (error || !goal) {
    return (
      <div className="p-6">
        <Error 
          message={error || "Goal not found"}
          onRetry={() => navigate('/goals')}
          icon="ArrowLeft"
          title="Back to Goals"
        />
      </div>
    );
  }
  
  const daysRemaining = getDaysRemaining(goal.targetDate);
  const completedMilestones = milestones.filter(m => m.completed).length;
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
    {/* Header */}
    <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate("/goals")} className="mb-4">
            <ApperIcon name="ArrowLeft" size={16} className="mr-2" />Back to Goals
                    </Button>
        <motion.div
            initial={{
                opacity: 0,
                y: 20
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            className="bg-gradient-surface rounded-xl p-8 border border-slate-600/50">
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                        <div
                            className={`
                  p-3 rounded-lg 
                  ${goal.category === "personal" ? "bg-gradient-to-br from-accent/20 to-accent/10" : "bg-gradient-to-br from-primary/20 to-primary/10"}
                `}>
                            <ApperIcon
                                name={goal.category === "personal" ? "Heart" : "Briefcase"}
                                size={24}
                                className={goal.category === "personal" ? "text-accent" : "text-primary"} />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-display font-bold text-white mb-2">
                                {goal.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant={getCategoryVariant(goal.category)}>
                                    {goal.category}
                                </Badge>
                                <Badge
                                    variant={goal.status === "completed" ? "success" : goal.status === "paused" ? "warning" : "primary"}>
                                    <ApperIcon
                                        name={goal.status === "completed" ? "CheckCircle" : goal.status === "paused" ? "Pause" : "Play"}
                                        size={12}
                                        className="mr-1" />
                                    {goal.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    {goal.description && <p className="text-slate-300 text-lg mb-6">
                        {goal.description}
                    </p>}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold gradient-text">
                                {goal.progress}%
                                                  </div>
                            <div className="text-sm text-slate-400">Complete</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-success">
                                {completedMilestones}
                            </div>
                            <div className="text-sm text-slate-400">Milestones Done</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-primary">
                                {milestones.length}
                            </div>
                            <div className="text-sm text-slate-400">Total Milestones</div>
                        </div>
                        <div>
                            <div
                                className={`text-2xl font-bold ${daysRemaining > 0 ? "text-warning" : "text-error"}`}>
                                {Math.abs(daysRemaining)}
                            </div>
                            <div className="text-sm text-slate-400">Days {daysRemaining > 0 ? "Left" : "Overdue"}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:w-80">
                    <div className="space-y-4">
                        <ProgressBar progress={goal.progress} variant="primary" size="lg" animated={true} />
                        <div className="text-sm text-slate-400 space-y-2">
                            <div className="flex justify-between">
                                <span>Created:</span>
                                <span>{format(new Date(goal.createdAt), "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Target Date:</span>
                                <span>{format(new Date(goal.targetDate), "MMM d, yyyy")}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="flex-1"
                                onClick={() => navigate(`/goals`)}>
                                <ApperIcon name="Edit2" size={16} className="mr-2" />Edit
                                                  </Button>
                            <Button variant="ghost" size="sm" className="p-2">
                                <ApperIcon name="Share2" size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    </div>
    {/* Milestones */}
    <motion.div
        initial={{
            opacity: 0,
            y: 20
        }}
        animate={{
            opacity: 1,
            y: 0
        }}
        transition={{
            delay: 0.2
        }}
        className="bg-gradient-surface rounded-xl p-8 border border-slate-600/50">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">Milestones
                                </h2>
<p className="text-slate-400">
                    {completedMilestones} of {milestones.length} completed
                </p>
            </div>
            <Button variant="accent" size="sm">
                <ApperIcon name="Plus" size={16} className="mr-2" />Add Milestone
            </Button>
        </div>
        <MilestoneList
            milestones={milestones}
            onToggle={handleMilestoneToggle}
            showCheckboxes={true}
            goalId={goal.Id}
        />
    </motion.div>

    {/* Progress Forecasting */}
    {forecast && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-surface rounded-xl p-6 sm:p-8 border border-slate-600/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
            <ApperIcon name="TrendingUp" size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white">Progress Forecast</h2>
            <p className="text-slate-400">AI-powered completion predictions based on your patterns</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Forecast Summary */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-slate-600/30">
              <div>
                <p className="text-sm text-slate-400 mb-1">Projected Completion</p>
                <p className="text-lg font-semibold text-white">
                  {format(new Date(forecast.projectedCompletionDate), "MMM d, yyyy")}
                </p>
              </div>
              <div className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${forecast.onTrack 
                  ? 'bg-success/20 text-success' 
                  : 'bg-warning/20 text-warning'
                }
              `}>
                {forecast.onTrack 
                  ? `${Math.abs(forecast.daysAheadBehind)} days ahead` 
                  : `${Math.abs(forecast.daysAheadBehind)} days behind`
                }
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-slate-600/30">
              <div>
                <p className="text-sm text-slate-400 mb-1">Forecast Confidence</p>
                <p className={`text-lg font-semibold ${getConfidenceColor(forecast.confidenceLevel)}`}>
                  {Math.round(forecast.confidenceLevel * 100)}%
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ApperIcon 
                  name={forecast.trend === 'accelerating' ? 'TrendingUp' : 
                        forecast.trend === 'decelerating' ? 'TrendingDown' : 'Minus'} 
                  size={16} 
                  className={
                    forecast.trend === 'accelerating' ? 'text-success' : 
                    forecast.trend === 'decelerating' ? 'text-error' : 'text-slate-400'
                  }
                />
                <span className="text-sm text-slate-400 capitalize">{forecast.trend}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-slate-600/30">
              <p className="text-sm text-slate-400 mb-2">Completion Probability</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar 
                    progress={forecast.completionProbability * 100} 
                    variant="primary" 
                    size="sm"
                  />
                </div>
                <span className="text-sm font-medium text-white">
                  {Math.round(forecast.completionProbability * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Scenario Analysis */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white mb-3">Forecast Scenarios</h3>
            {Object.entries(forecast.scenarios).map(([key, scenario]) => (
              <div 
                key={key}
                className={`
                  p-3 rounded-lg border transition-all duration-200
                  ${scenario.name === forecast.primaryScenario 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-white/5 border-slate-600/30'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white capitalize">{scenario.name}</span>
                  <span className="text-xs text-slate-400">{Math.round(scenario.probability * 100)}% likely</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    {format(new Date(scenario.completionDate), "MMM d")}
                  </span>
                  <span className="text-slate-400">
                    {scenario.daysToComplete} days
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {forecast.recommendations && forecast.recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {forecast.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={`
                    p-4 rounded-lg border transition-all duration-200 hover:bg-white/5
                    ${getPriorityColor(rec.priority)}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <ApperIcon 
                      name={
                        rec.type === 'schedule' ? 'Clock' :
                        rec.type === 'pace' ? 'Zap' :
                        rec.type === 'consistency' ? 'Target' :
                        rec.type === 'positive' ? 'Star' : 'Info'
                      } 
                      size={16} 
                      className="mt-0.5 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium mb-1">{rec.message}</p>
                      <p className="text-xs opacity-80">{rec.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {forecast.riskFactors && forecast.riskFactors.length > 0 && (
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
            <div className="flex items-start gap-3">
              <ApperIcon name="AlertTriangle" size={16} className="text-warning mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-warning mb-2">Risk Factors</p>
                <ul className="text-xs text-warning/80 space-y-1">
                  {forecast.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-warning/60 mt-2 flex-shrink-0"></span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    )}

    {/* Mood Correlation Chart */}
{/* Mood Correlation Chart */}
    <motion.div
        initial={{
            opacity: 0,
            y: 20
        }}
        animate={{
            opacity: 1,
            y: 0
        }}
        transition={{
            delay: 0.5
        }}
        className="bg-gradient-surface rounded-xl p-8 border border-slate-600/50"
    >
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10">
                <ApperIcon name="Heart" size={24} className="text-accent" />
            </div>
            <div>
                <h2 className="text-2xl font-display font-bold text-white">Mood Correlation</h2>
                <p className="text-slate-400">How your mood affects goal progress</p>
            </div>
        </div>
        <MoodCorrelationChart goalId={goal.Id} />
    </motion.div>
</div>
  );
};

export default GoalDetail;