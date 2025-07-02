import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import MoodCorrelationChart from "@/components/molecules/MoodCorrelationChart";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import ProgressBar from "@/components/atoms/ProgressBar";
import Button from "@/components/atoms/Button";
import MilestoneList from "@/components/molecules/MilestoneList";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Goals from "@/components/pages/Goals";
import { milestoneService } from "@/services/api/milestoneService";
import { goalService } from "@/services/api/goalService";

const GoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [goal, setGoal] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [goalData, milestonesData] = await Promise.all([
        goalService.getById(parseInt(id)),
        milestoneService.getByGoalId(parseInt(id))
      ]);
      
      setGoal(goalData);
      setMilestones(milestonesData);
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
                    {completedMilestones}of {milestones.length}completed
                                </p>
            </div>
            <Button variant="accent" size="sm">
                <ApperIcon name="Plus" size={16} className="mr-2" />Add Milestone
                          </Button>
        </div>
        <MilestoneList
            milestones={milestones}
            onToggle={handleMilestoneToggle}
            onToggle={handleMilestoneToggle}
            showCheckboxes={true} />
    </motion.div>
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
            delay: 0.4
        }}>
        <MoodCorrelationChart goalId={goal.Id} />
    </motion.div></div>
  );
};

export default GoalDetail;