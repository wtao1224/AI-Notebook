import React, { useState } from 'react';
import { Task, Project, Category } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  onTaskUpdate: (task: Task) => void;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTaskDelete: (taskId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  projects,
  categories,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete
}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  const columns = [
    { id: 'todo', title: 'To Do', status: 'todo' as const, color: 'bg-gray-100' },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress' as const, color: 'bg-blue-100' },
    { id: 'review', title: 'Review', status: 'review' as const, color: 'bg-yellow-100' },
    { id: 'completed', title: 'Completed', status: 'completed' as const, color: 'bg-green-100' }
  ];

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      const updatedTask = {
        ...draggedTask,
        status,
        updatedAt: new Date(),
        ...(status === 'completed' && { completedAt: new Date() })
      };
      onTaskUpdate(updatedTask);
    }
    setDraggedTask(null);
  };

  const handleCreateTask = (status: Task['status']) => {
    if (newTaskTitle.trim()) {
      const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        status,
        priority: selectedPriority,
        category: selectedCategory || 'general',
        tags: [],
        projectId: selectedProject || undefined,
        subtasks: [],
        completedAt: status === 'completed' ? new Date() : undefined
      };
      onTaskCreate(newTask);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setShowNewTaskForm(null);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6B7280';
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.name;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kanban Board</h1>
        <p className="text-gray-600">Drag and drop tasks between columns to update their status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map(column => {
          const columnTasks = tasks.filter(task => task.status === column.status);
          
          return (
            <div
              key={column.id}
              className={`${column.color} rounded-lg p-4 min-h-96`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">
                  {column.title} ({columnTasks.length})
                </h2>
                <button
                  onClick={() => setShowNewTaskForm(column.id)}
                  className="text-gray-600 hover:text-gray-800 text-xl font-bold"
                  title="Add new task"
                >
                  +
                </button>
              </div>

              {/* New Task Form */}
              {showNewTaskForm === column.id && (
                <div className="bg-white rounded-lg p-3 mb-3 shadow-sm border">
                  <input
                    type="text"
                    placeholder="Task title..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <textarea
                    placeholder="Description (optional)..."
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                  <div className="flex gap-2 mb-2">
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value as Task['priority'])}
                      className="flex-1 p-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="flex-1 p-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  {projects.length > 0 && (
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full p-1 text-xs border border-gray-300 rounded mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">No Project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCreateTask(column.status)}
                      className="flex-1 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Add Task
                    </button>
                    <button
                      onClick={() => setShowNewTaskForm(null)}
                      className="flex-1 px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Tasks */}
              <div className="space-y-3">
                {columnTasks.map(task => {
                  const projectName = getProjectName(task.projectId);
                  
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className="bg-white rounded-lg p-3 shadow-sm border cursor-move hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-sm leading-tight">
                          {task.title}
                        </h3>
                        <button
                          onClick={() => onTaskDelete(task.id)}
                          className="text-gray-400 hover:text-red-500 text-xs ml-2"
                          title="Delete task"
                        >
                          ×
                        </button>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <span 
                          className="px-2 py-1 text-xs font-medium rounded text-white"
                          style={{ backgroundColor: getCategoryColor(task.category) }}
                        >
                          {task.category}
                        </span>
                      </div>
                      
                      {projectName && (
                        <div className="text-xs text-gray-500 mb-1">
                          📁 {projectName}
                        </div>
                      )}
                      
                      {task.dueDate && (
                        <div className="text-xs text-gray-500 mb-1">
                          📅 Due: {formatDate(task.dueDate)}
                        </div>
                      )}
                      
                      {task.estimatedHours && (
                        <div className="text-xs text-gray-500">
                          ⏱️ Est: {task.estimatedHours}h
                          {task.actualHours && ` | Actual: ${task.actualHours}h`}
                        </div>
                      )}
                      
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags.map(tag => (
                            <span key={tag} className="px-1 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
