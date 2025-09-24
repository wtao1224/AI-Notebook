import React, { useState, useEffect } from 'react';
import { TimeEntry, Task, Project } from '../types';

interface TimeTrackerProps {
  timeEntries: TimeEntry[];
  tasks: Task[];
  projects: Project[];
  onTimeEntryCreate: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => void;
  onTimeEntryUpdate: (entry: TimeEntry) => void;
  onTimeEntryDelete: (entryId: string) => void;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({
  timeEntries,
  tasks,
  projects,
  onTimeEntryCreate,
  onTimeEntryUpdate,
  onTimeEntryDelete
}) => {
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [description, setDescription] = useState('');
  const [entryType, setEntryType] = useState<'work' | 'break' | 'meeting' | 'other'>('work');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [view, setView] = useState<'tracker' | 'history' | 'analytics'>('tracker');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  // Update current time every second for active timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const startTimer = () => {
    if (!selectedTask && !selectedProject) {
      alert('Please select a task or project');
      return;
    }

    const newEntry: Omit<TimeEntry, 'id' | 'createdAt'> = {
      taskId: selectedTask,
      projectId: selectedProject || undefined,
      startTime: new Date(),
      duration: 0,
      description: description.trim() || undefined,
      type: entryType
    };

    onTimeEntryCreate(newEntry);
    // Find the created entry (this is a simplified approach)
    setTimeout(() => {
      const latestEntry = timeEntries[timeEntries.length - 1];
      if (latestEntry && !latestEntry.endTime) {
        setActiveEntry(latestEntry);
      }
    }, 100);
  };

  const stopTimer = () => {
    if (activeEntry) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - activeEntry.startTime.getTime()) / 1000 / 60); // in minutes
      
      const updatedEntry: TimeEntry = {
        ...activeEntry,
        endTime,
        duration
      };
      
      onTimeEntryUpdate(updatedEntry);
      setActiveEntry(null);
      setDescription('');
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getCurrentDuration = () => {
    if (!activeEntry) return 0;
    return Math.floor((currentTime.getTime() - activeEntry.startTime.getTime()) / 1000 / 60);
  };

  const getTaskName = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task?.title || 'Unknown Task';
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const getTodayEntries = () => {
    const today = new Date().toDateString();
    return timeEntries.filter(entry => 
      new Date(entry.startTime).toDateString() === today
    );
  };

  const getFilteredEntries = () => {
    const filterDate = new Date(dateFilter).toDateString();
    return timeEntries.filter(entry => 
      new Date(entry.startTime).toDateString() === filterDate
    );
  };

  const getTotalTimeToday = () => {
    return getTodayEntries().reduce((total, entry) => total + entry.duration, 0);
  };

  const getTotalTimeByType = (type: TimeEntry['type']) => {
    return getTodayEntries()
      .filter(entry => entry.type === type)
      .reduce((total, entry) => total + entry.duration, 0);
  };

  const getWeeklyStats = () => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEntries = timeEntries.filter(entry => 
      new Date(entry.startTime) >= weekStart
    );
    
    return {
      totalTime: weekEntries.reduce((total, entry) => total + entry.duration, 0),
      workTime: weekEntries.filter(e => e.type === 'work').reduce((total, entry) => total + entry.duration, 0),
      breakTime: weekEntries.filter(e => e.type === 'break').reduce((total, entry) => total + entry.duration, 0),
      entries: weekEntries.length
    };
  };

  if (view === 'history') {
    const filteredEntries = getFilteredEntries();
    
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Time History</h1>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setView('tracker')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Tracker
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Entries for {new Date(dateFilter).toLocaleDateString()}</h2>
            <p className="text-sm text-gray-600">
              Total: {formatDuration(filteredEntries.reduce((total, entry) => total + entry.duration, 0))}
            </p>
          </div>
          <div className="divide-y">
            {filteredEntries.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No time entries for this date
              </div>
            ) : (
              filteredEntries.map(entry => {
                const taskName = getTaskName(entry.taskId);
                const projectName = getProjectName(entry.projectId);
                
                return (
                  <div key={entry.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            entry.type === 'work' ? 'bg-blue-100 text-blue-800' :
                            entry.type === 'break' ? 'bg-green-100 text-green-800' :
                            entry.type === 'meeting' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.type.toUpperCase()}
                          </span>
                          <span className="font-medium">{taskName}</span>
                          {projectName && (
                            <span className="text-sm text-gray-600">• {projectName}</span>
                          )}
                        </div>
                        {entry.description && (
                          <p className="text-sm text-gray-600 mb-1">{entry.description}</p>
                        )}
                        <div className="text-sm text-gray-500">
                          {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : 'Running'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{formatDuration(entry.duration)}</span>
                        <button
                          onClick={() => onTimeEntryDelete(entry.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'analytics') {
    const weeklyStats = getWeeklyStats();
    const todayTotal = getTotalTimeToday();
    
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Time Analytics</h1>
            <button
              onClick={() => setView('tracker')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Tracker
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">Today</h3>
            <p className="text-2xl font-bold text-blue-600">{formatDuration(todayTotal)}</p>
            <p className="text-sm text-gray-600">{getTodayEntries().length} entries</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">This Week</h3>
            <p className="text-2xl font-bold text-green-600">{formatDuration(weeklyStats.totalTime)}</p>
            <p className="text-sm text-gray-600">{weeklyStats.entries} entries</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">Work Time Today</h3>
            <p className="text-2xl font-bold text-purple-600">{formatDuration(getTotalTimeByType('work'))}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">Break Time Today</h3>
            <p className="text-2xl font-bold text-orange-600">{formatDuration(getTotalTimeByType('break'))}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-4">Time by Type (Today)</h3>
            <div className="space-y-3">
              {(['work', 'break', 'meeting', 'other'] as const).map(type => {
                const time = getTotalTimeByType(type);
                const percentage = todayTotal > 0 ? (time / todayTotal) * 100 : 0;
                
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{type}</span>
                      <span>{formatDuration(time)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          type === 'work' ? 'bg-blue-500' :
                          type === 'break' ? 'bg-green-500' :
                          type === 'meeting' ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {timeEntries.slice(-5).reverse().map(entry => {
                const taskName = getTaskName(entry.taskId);
                const projectName = getProjectName(entry.projectId);
                
                return (
                  <div key={entry.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{taskName}</p>
                      {projectName && (
                        <p className="text-xs text-gray-600">{projectName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatDuration(entry.duration)}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(entry.startTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Time Tracker</h1>
            <p className="text-gray-600">Track time spent on tasks and projects</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('history')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              📋 History
            </button>
            <button
              onClick={() => setView('analytics')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              📊 Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Controls */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
            <h2 className="text-lg font-semibold mb-4">Timer</h2>
            
            {activeEntry ? (
              <div className="text-center">
                <div className="mb-4">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {formatDuration(getCurrentDuration())}
                  </div>
                  <p className="text-gray-600">
                    Working on: {getTaskName(activeEntry.taskId)}
                  </p>
                  {getProjectName(activeEntry.projectId) && (
                    <p className="text-sm text-gray-500">
                      Project: {getProjectName(activeEntry.projectId)}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Started at: {formatTime(activeEntry.startTime)}
                  </p>
                </div>
                <button
                  onClick={stopTimer}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  ⏹️ Stop Timer
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a task</option>
                    {tasks.map(task => (
                      <option key={task.id} value={task.id}>{task.title}</option>
                    ))}
                  </select>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a project (optional)</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value as TimeEntry['type'])}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="work">Work</option>
                    <option value="break">Break</option>
                    <option value="meeting">Meeting</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="text-center">
                  <button
                    onClick={startTimer}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    ▶️ Start Timer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Today's Entries */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Today's Entries</h2>
            <div className="space-y-3">
              {getTodayEntries().length === 0 ? (
                <p className="text-gray-500 text-center py-4">No entries today</p>
              ) : (
                getTodayEntries().slice(-5).reverse().map(entry => {
                  const taskName = getTaskName(entry.taskId);
                  const projectName = getProjectName(entry.projectId);
                  
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            entry.type === 'work' ? 'bg-blue-100 text-blue-800' :
                            entry.type === 'break' ? 'bg-green-100 text-green-800' :
                            entry.type === 'meeting' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.type}
                          </span>
                          <span className="font-medium text-sm">{taskName}</span>
                        </div>
                        {projectName && (
                          <p className="text-xs text-gray-600">{projectName}</p>
                        )}
                        {entry.description && (
                          <p className="text-xs text-gray-600">{entry.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatDuration(entry.duration)}</p>
                        <p className="text-xs text-gray-500">
                          {formatTime(entry.startTime)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Today's Summary */}
          <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
            <h3 className="font-semibold mb-3">Today's Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Time</span>
                <span className="font-medium">{formatDuration(getTotalTimeToday())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Work Time</span>
                <span className="font-medium">{formatDuration(getTotalTimeByType('work'))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Break Time</span>
                <span className="font-medium">{formatDuration(getTotalTimeByType('break'))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Entries</span>
                <span className="font-medium">{getTodayEntries().length}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setView('history')}
                className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                📋 View History
              </button>
              <button
                onClick={() => setView('analytics')}
                className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                📊 View Analytics
              </button>
              <a
                href="/pomodoro"
                className="block w-full px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-center"
              >
                🍅 Pomodoro Timer
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;