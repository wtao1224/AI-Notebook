import React, { useState, useMemo } from 'react';
import { Task, Project, TimeEntry, Goal, Category } from '../types';

interface DashboardProps {
  tasks: Task[];
  projects: Project[];
  timeEntries: TimeEntry[];
  goals: Goal[];
  categories: Category[];
}

const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  projects,
  timeEntries,
  goals,
  categories
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Calculate date ranges
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (timeRange) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        return { start: weekStart, end: weekEnd };
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return { start: monthStart, end: monthEnd };
      default:
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
    }
  };

  const { start: rangeStart, end: rangeEnd } = getDateRange();

  // Filter data by time range and project
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      const inRange = taskDate >= rangeStart && taskDate < rangeEnd;
      const inProject = !selectedProject || task.projectId === selectedProject;
      return inRange && inProject;
    });
  }, [tasks, rangeStart, rangeEnd, selectedProject]);

  const filteredTimeEntries = useMemo(() => {
    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      const inRange = entryDate >= rangeStart && entryDate < rangeEnd;
      const inProject = !selectedProject || entry.projectId === selectedProject;
      return inRange && inProject;
    });
  }, [timeEntries, rangeStart, rangeEnd, selectedProject]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress').length;
    const totalTime = filteredTimeEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const workTime = filteredTimeEntries.filter(e => e.type === 'work').reduce((sum, entry) => sum + entry.duration, 0);
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks: totalTasks - completedTasks - inProgressTasks,
      totalTime,
      workTime,
      completionRate,
      averageTaskTime: completedTasks > 0 ? workTime / completedTasks : 0
    };
  }, [filteredTasks, filteredTimeEntries]);

  // Calculate productivity trends
  const productivityData = useMemo(() => {
    const days = [];
    const current = new Date(rangeStart);
    
    while (current < rangeEnd) {
      const dayStart = new Date(current);
      const dayEnd = new Date(current.getTime() + 24 * 60 * 60 * 1000);
      
      const dayTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= dayStart && taskDate < dayEnd;
      });
      
      const dayTimeEntries = filteredTimeEntries.filter(entry => {
        const entryDate = new Date(entry.startTime);
        return entryDate >= dayStart && entryDate < dayEnd;
      });
      
      days.push({
        date: new Date(current),
        tasksCompleted: dayTasks.filter(t => t.status === 'completed').length,
        totalTasks: dayTasks.length,
        timeSpent: dayTimeEntries.reduce((sum, entry) => sum + entry.duration, 0)
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [filteredTasks, filteredTimeEntries, rangeStart, rangeEnd]);

  // Calculate category distribution
  const categoryStats = useMemo(() => {
    const categoryMap = new Map();
    
    filteredTasks.forEach(task => {
      const category = task.category || 'Uncategorized';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { total: 0, completed: 0, time: 0 });
      }
      const stats = categoryMap.get(category);
      stats.total++;
      if (task.status === 'completed') stats.completed++;
    });
    
    filteredTimeEntries.forEach(entry => {
      const task = tasks.find(t => t.id === entry.taskId);
      const category = task?.category || 'Uncategorized';
      if (categoryMap.has(category)) {
        categoryMap.get(category).time += entry.duration;
      }
    });
    
    return Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      ...data,
      completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0
    }));
  }, [filteredTasks, filteredTimeEntries, tasks]);

  // Goal progress
  const goalProgress = useMemo(() => {
    return goals.map(goal => {
      let current = 0;
      
      switch (goal.unit) {
        case 'tasks':
          current = filteredTasks.filter(t => t.status === 'completed').length;
          break;
        case 'hours':
          current = Math.floor(stats.workTime / 60);
          break;
        case 'projects':
          current = projects.filter(p => p.status === 'completed').length;
          break;
        default:
          current = goal.current;
      }
      
      return {
        ...goal,
        current,
        progress: goal.target > 0 ? (current / goal.target) * 100 : 0
      };
    });
  }, [goals, filteredTasks, stats.workTime, projects]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6B7280';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Overview of your productivity and progress</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'today' | 'week' | 'month')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
              <p className="text-xs text-gray-500">{stats.completionRate.toFixed(1)}% completion rate</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Time Spent</p>
              <p className="text-2xl font-bold text-purple-600">{formatDuration(stats.totalTime)}</p>
              <p className="text-xs text-gray-500">{formatDuration(stats.workTime)} work time</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Task Time</p>
              <p className="text-2xl font-bold text-orange-600">{formatDuration(stats.averageTaskTime)}</p>
              <p className="text-xs text-gray-500">per completed task</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Trend</h3>
          <div className="space-y-4">
            {productivityData.map((day, index) => {
              const maxTasks = Math.max(...productivityData.map(d => d.totalTasks), 1);
              const maxTime = Math.max(...productivityData.map(d => d.timeSpent), 1);
              
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-gray-600">
                    {formatDate(day.date)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">Tasks:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(day.totalTasks / maxTasks) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12">
                        {day.tasksCompleted}/{day.totalTasks}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Time:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(day.timeSpent / maxTime) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12">
                        {formatDuration(day.timeSpent)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status</h3>
          <div className="space-y-4">
            {[
              { status: 'completed', label: 'Completed', count: stats.completedTasks },
              { status: 'in_progress', label: 'In Progress', count: stats.inProgressTasks },
              { status: 'todo', label: 'Pending', count: stats.pendingTasks }
            ].map(({ status, label, count }) => {
              const percentage = stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0;
              
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{label}</span>
                    <span>{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(status as Task['status'])}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Performance and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Category Performance */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
          <div className="space-y-4">
            {categoryStats.map(category => (
              <div key={category.name} className="border-l-4 pl-4" style={{ borderColor: getCategoryColor(category.name) }}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <span className="text-sm text-gray-600">
                    {category.completed}/{category.total} tasks
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Completion: {category.completionRate.toFixed(1)}%</span>
                  <span>Time: {formatDuration(category.time)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${category.completionRate}%`,
                      backgroundColor: getCategoryColor(category.name)
                    }}
                  />
                </div>
              </div>
            ))}
            {categoryStats.length === 0 && (
              <p className="text-gray-500 text-center py-4">No category data available</p>
            )}
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals Progress</h3>
          <div className="space-y-4">
            {goalProgress.map(goal => (
              <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{goal.title}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                    goal.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {goal.status.toUpperCase()}
                  </span>
                </div>
                {goal.description && (
                  <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                )}
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress: {goal.progress.toFixed(1)}%</span>
                  <span>{goal.current}/{goal.target} {goal.unit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      goal.progress >= 100 ? 'bg-green-500' :
                      goal.progress >= 75 ? 'bg-blue-500' :
                      goal.progress >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  />
                </div>
                {goal.deadline && (
                  <p className="text-xs text-gray-500 mt-1">
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
            {goalProgress.length === 0 && (
              <p className="text-gray-500 text-center py-4">No goals set</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;