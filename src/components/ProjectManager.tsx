import React, { useState, useEffect } from 'react';
import { Project, Task, Category, Goal } from '../types';
import KanbanBoard from './KanbanBoard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, Target, Clock, AlertCircle, CheckCircle, Circle, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import AIProjectTemplateGenerator from './AIProjectTemplateGenerator';
import { aiProjectService } from '../services/aiProjectService';

interface ProjectManagerProps {
  projects: Project[];
  tasks: Task[];
  categories: Category[];
  onProjectCreate: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onProjectDelete: (projectId: string) => void;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onCategoryCreate: (category: Omit<Category, 'id' | 'createdAt'>) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  tasks,
  categories,
  onProjectCreate,
  onProjectDelete,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onCategoryCreate
}) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [view, setView] = useState<'overview' | 'kanban' | 'projects'>('overview');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showAiInsights, setShowAiInsights] = useState(false);
  
  // New project form state
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectPriority, setNewProjectPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newProjectColor, setNewProjectColor] = useState('#3B82F6');
  const [newProjectDueDate, setNewProjectDueDate] = useState('');
  
  // New category form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#6B7280');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');

  const currentProject = selectedProject ? projects.find(p => p.id === selectedProject) : null;
  const projectTasks = selectedProject ? tasks.filter(t => t.projectId === selectedProject) : tasks;
  const projectCategories = selectedProject ? categories.filter(c => c.projectId === selectedProject) : categories;

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || undefined,
        status: 'planning',
        priority: newProjectPriority,
        color: newProjectColor,
        tags: [],
        teamMembers: [],
        progress: 0,
        dueDate: newProjectDueDate ? new Date(newProjectDueDate) : undefined
      };
      onProjectCreate(newProject);
      setNewProjectName('');
      setNewProjectDescription('');
      setNewProjectPriority('medium');
      setNewProjectColor('#3B82F6');
      setNewProjectDueDate('');
      setShowNewProjectForm(false);
    }
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Omit<Category, 'id' | 'createdAt'> = {
        name: newCategoryName.trim(),
        color: newCategoryColor,
        icon: newCategoryIcon.trim() || undefined,
        projectId: selectedProject || undefined
      };
      onCategoryCreate(newCategory);
      setNewCategoryName('');
      setNewCategoryColor('#6B7280');
      setNewCategoryIcon('');
      setShowNewCategoryForm(false);
    }
  };

  // AI-powered functionality
  const loadAiSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const suggestions = await aiProjectService.generateProjectSuggestionsWithContext({
        existingProjects: projects,
        recentTasks: tasks.slice(-10),
        userPreferences: {
          preferredCategories: categories.map(c => c.name),
          workingHours: 8,
          timezone: 'UTC'
        }
      });
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to load AI suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const applyAiSuggestion = (suggestion: any) => {
    setNewProjectName(suggestion.name);
    setNewProjectDescription(suggestion.description);
    setNewProjectPriority(suggestion.priority || 'medium');
    setNewProjectColor(suggestion.color || '#3B82F6');
    setNewProjectDueDate(suggestion.suggestedDueDate ? new Date(suggestion.suggestedDueDate).toISOString().split('T')[0] : '');
    setShowNewProjectForm(true);
  };

  // Load AI suggestions on component mount
  useEffect(() => {
    if (projects.length > 0) {
      loadAiSuggestions();
    }
  }, [projects.length]);

  const getProjectProgress = (project: Project) => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (view === 'kanban') {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('overview')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Overview
            </button>
            {currentProject && (
              <h1 className="text-xl font-bold text-gray-900">
                {currentProject.name} - Kanban Board
              </h1>
            )}
          </div>
        </div>
        <KanbanBoard
          tasks={projectTasks}
          projects={projects}
          categories={projectCategories}
          onTaskUpdate={onTaskUpdate}
          onTaskCreate={onTaskCreate}
          onTaskDelete={onTaskDelete}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              🤖 AI-Powered Project Manager
            </h1>
            <p className="text-gray-600">Manage your projects, tasks, and workflows with intelligent AI assistance</p>
          </div>
          <div className="flex gap-2">
            <AIProjectTemplateGenerator
              onProjectCreate={onProjectCreate}
              onTaskCreate={onTaskCreate}
              existingProjects={projects}
              existingTasks={tasks}
            />
            <button
              onClick={() => setShowAiInsights(!showAiInsights)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              🧠 AI Insights
            </button>
            <button
              onClick={() => setView(view === 'overview' ? 'projects' : 'overview')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {view === 'overview' ? 'Manage Projects' : 'Overview'}
            </button>
            <button
              onClick={() => setShowNewProjectForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + New Project
            </button>
          </div>
        </div>

        {/* AI Insights Panel */}
        {showAiInsights && (
          <div className="mb-6 border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                🧠 AI Project Insights
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Powered by AI</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">📊 Project Analytics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Completion Rate:</span>
                    <span className="font-medium">
                      {projects.length > 0 ? Math.round((projects.filter(p => p.status === 'completed').length / projects.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Progress:</span>
                    <span className="font-medium">
                      {projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + getProjectProgress(p), 0) / projects.length) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>High Priority Projects:</span>
                    <span className="font-medium text-red-600">
                      {projects.filter(p => p.priority === 'high').length}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">💡 AI Suggestions</h4>
                {isLoadingSuggestions ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    Generating suggestions...
                  </div>
                ) : aiSuggestions.length > 0 ? (
                  <div className="space-y-2">
                    {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                      <div key={index} className="p-2 bg-white rounded border border-purple-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{suggestion.name}</span>
                          <button
                            onClick={() => applyAiSuggestion(suggestion)}
                            className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {suggestion.description?.substring(0, 60)}...
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Create more projects to get AI suggestions
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-purple-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  💡 Tip: AI analyzes your project patterns to provide personalized suggestions
                </span>
                <button
                  onClick={loadAiSuggestions}
                  disabled={isLoadingSuggestions}
                  className="px-3 py-1 text-sm bg-white border border-purple-200 text-purple-700 rounded hover:bg-purple-50 transition-colors disabled:opacity-50"
                >
                  🔄 Refresh Insights
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mb-4">
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
          <button
            onClick={() => setView('kanban')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📋 Kanban Board
          </button>
          <button
            onClick={() => setShowNewCategoryForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Category
          </button>
        </div>
      </div>

      {/* New Project Form Modal */}
      {showNewProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Create New Project</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <textarea
                placeholder="Project description (optional)"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex gap-3">
                <select
                  value={newProjectPriority}
                  onChange={(e) => setNewProjectPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <input
                  type="color"
                  value={newProjectColor}
                  onChange={(e) => setNewProjectColor(e.target.value)}
                  className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  title="Project color"
                />
              </div>
              <input
                type="date"
                value={newProjectDueDate}
                onChange={(e) => setNewProjectDueDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Due date (optional)"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateProject}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Project
              </button>
              <button
                onClick={() => setShowNewProjectForm(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Category Form Modal */}
      {showNewCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Create New Category</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Icon (emoji or text)"
                  value={newCategoryIcon}
                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  title="Category color"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateCategory}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Category
              </button>
              <button
                onClick={() => setShowNewCategoryForm(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {view === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects Overview */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Projects Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map(project => {
                const progress = getProjectProgress(project);
                const projectTaskCount = tasks.filter(t => t.projectId === project.id).length;
                
                return (
                  <div key={project.id} className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                      </div>
                      <div className="flex gap-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(project.status)}`}>
                          {project.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(project.priority)}`}>
                          {project.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {project.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    )}
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: project.color
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>📋 {projectTaskCount} tasks</span>
                      {project.dueDate && (
                        <span>📅 Due: {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(project.dueDate)}</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setSelectedProject(project.id);
                          setView('kanban');
                        }}
                        className="flex-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Open Kanban
                      </button>
                      <button
                        onClick={() => setSelectedProject(project.id)}
                        className="flex-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Quick Stats */}
            <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
              <h3 className="font-semibold mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Projects</span>
                  <span className="font-medium">{projects.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Projects</span>
                  <span className="font-medium">{projects.filter(p => p.status === 'active').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Tasks</span>
                  <span className="font-medium">{tasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed Tasks</span>
                  <span className="font-medium">{tasks.filter(t => t.status === 'completed').length}</span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm">{category.icon} {category.name}</span>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-gray-500">No categories yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Projects Management View */
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Manage Projects</h2>
          <div className="space-y-4">
            {projects.map(project => {
              const progress = getProjectProgress(project);
              
              return (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-sm text-gray-600">{project.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <button
                        onClick={() => onProjectDelete(project.id)}
                        className="text-red-500 hover:text-red-700 px-2 py-1 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress: {progress}%</span>
                      <span>{tasks.filter(t => t.projectId === project.id).length} tasks</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: project.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;