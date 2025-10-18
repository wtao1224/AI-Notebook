import React, { useState, useEffect } from 'react';
import { Task, Project, TimeEntry, Goal, Category } from '../types';
import Dashboard from './Dashboard';
import KanbanBoard from './KanbanBoard';
import ProjectManager from './ProjectManager';
import GoalManager from './GoalManager';
import TimeTracker from './TimeTracker';
import AIProjectInsights from './AIProjectInsights';
import AIProjectTemplateGenerator from './AIProjectTemplateGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

type TabType = 'dashboard' | 'kanban' | 'projects' | 'goals' | 'time';

const ProjectManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Mock data initialization (in a real app, this would come from your storage service)
  useEffect(() => {
    // Initialize with some sample data
    const sampleCategories: Category[] = [
      { id: '1', name: 'Work', color: '#3B82F6', description: 'Work-related tasks', createdAt: new Date() },
      { id: '2', name: 'Personal', color: '#10B981', description: 'Personal tasks', createdAt: new Date() },
      { id: '3', name: 'Learning', color: '#8B5CF6', description: 'Learning and development', createdAt: new Date() },
    ];

    const sampleProjects: Project[] = [
      {
        id: '1',
        name: 'Website Redesign',
        description: 'Redesign company website',
        status: 'active',
        priority: 'high',
        startDate: new Date(),
        progress: 45,
        color: '#3B82F6',
        tags: ['web', 'design'],
        teamMembers: ['user1', 'user2'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Mobile App',
        description: 'Develop mobile application',
        status: 'planning',
        priority: 'medium',
        progress: 10,
        color: '#10B981',
        tags: ['mobile', 'app'],
        teamMembers: ['user1'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Design homepage mockup',
        description: 'Create wireframes and mockups for the new homepage',
        status: 'todo',
        priority: 'high',
        category: 'Work',
        tags: ['design', 'ui'],
        projectId: '1',
        subtasks: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        title: 'Set up development environment',
        description: 'Configure development tools and dependencies',
        status: 'in_progress',
        priority: 'medium',
        category: 'Work',
        tags: ['setup', 'dev'],
        projectId: '2',
        subtasks: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const sampleGoals: Goal[] = [
      {
        id: '1',
        title: 'Complete 10 tasks this week',
        description: 'Finish at least 10 tasks to improve productivity',
        type: 'weekly',
        unit: 'tasks',
        target: 10,
        current: 3,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setCategories(sampleCategories);
    setProjects(sampleProjects);
    setTasks(sampleTasks);
    setGoals(sampleGoals);
    setTimeEntries([]);
  }, []);

  // Task management functions
  const handleCreateTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // Project management functions
  const handleCreateProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id 
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    ));
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    // Also remove tasks associated with this project
    setTasks(prev => prev.filter(task => task.projectId !== id));
  };

  // Goal management functions
  const handleCreateGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const handleUpdateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id 
        ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
        : goal
    ));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  // Category management functions
  const handleCreateCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(category => 
      category.id === id ? { ...category, ...updates } : category
    ));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  // Time tracking functions
  const handleCreateTimeEntry = (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setTimeEntries(prev => [...prev, newEntry]);
  };

  const handleUpdateTimeEntry = (entry: TimeEntry) => {
    setTimeEntries(prev => prev.map(existingEntry => 
      existingEntry.id === entry.id ? entry : existingEntry
    ));
  };

  const handleDeleteTimeEntry = (id: string) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'kanban', label: '📋 Kanban', icon: '📋' },
    { id: 'projects', label: '📁 Projects', icon: '📁' },
    { id: 'goals', label: '🎯 Goals', icon: '🎯' },
    { id: 'time', label: '⏱️ Time Tracker', icon: '⏱️' }
  ];

  // renderActiveTab function removed - now using proper TabsContent components

  return (
    <div className="h-screen bg-background flex flex-col">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="h-full flex flex-col">
        {/* Header with Tabs */}
        <Card className="rounded-none border-x-0 border-t-0">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-2xl">Project Management</CardTitle>
                <p className="text-muted-foreground">Manage your tasks, projects, goals, and time in one place</p>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-5">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <span>{tab.icon}</span>
                  <span>{tab.label.replace(/^.+ /, '')}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </CardHeader>
        </Card>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="dashboard" className="m-0">
            <div className="p-6 space-y-6">
              {/* AI Insights Section */}
              <div className="mb-6">
                <AIProjectInsights 
                  projects={projects}
                  tasks={tasks}
                  goals={goals}
                  onTaskUpdate={handleUpdateTask}
                  onProjectUpdate={handleUpdateProject}
                />
              </div>
              
              {/* AI Template Generator */}
              <div className="mb-6">
                <AIProjectTemplateGenerator 
                  onProjectCreate={handleCreateProject}
                  onTaskCreate={handleCreateTask}
                  categories={categories}
                />
              </div>
              
              <Dashboard
                tasks={tasks}
                projects={projects}
                timeEntries={timeEntries}
                goals={goals}
                categories={categories}
                onTaskCreate={handleCreateTask}
                onTaskUpdate={handleUpdateTask}
                onTaskDelete={handleDeleteTask}
              />
            </div>
          </TabsContent>
          <TabsContent value="kanban" className="m-0">
            <KanbanBoard
              tasks={tasks}
              projects={projects}
              categories={categories}
              onTaskUpdate={handleUpdateTask}
            />
          </TabsContent>
          <TabsContent value="projects" className="m-0">
            <ProjectManager
              projects={projects}
              tasks={tasks}
              categories={categories}
              goals={goals}
              onProjectCreate={handleCreateProject}
              onProjectUpdate={handleUpdateProject}
              onProjectDelete={handleDeleteProject}
              onTaskCreate={handleCreateTask}
              onTaskUpdate={handleUpdateTask}
              onTaskDelete={handleDeleteTask}
              onCategoryCreate={handleCreateCategory}
            />
          </TabsContent>
          <TabsContent value="goals" className="m-0">
            <GoalManager
              goals={goals}
              projects={projects}
              onGoalCreate={handleCreateGoal}
              onGoalUpdate={handleUpdateGoal}
              onGoalDelete={handleDeleteGoal}
            />
          </TabsContent>
          <TabsContent value="time" className="m-0">
            <TimeTracker
              timeEntries={timeEntries}
              tasks={tasks}
              projects={projects}
              onTimeEntryCreate={handleCreateTimeEntry}
              onTimeEntryUpdate={handleUpdateTimeEntry}
              onTimeEntryDelete={handleDeleteTimeEntry}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ProjectManagement;