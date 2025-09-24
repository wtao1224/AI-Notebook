export interface Document {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

export interface TodoItem {
  id: string
  content: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'high' | 'medium' | 'low'
  createdAt: Date
  updatedAt: Date
}

// Enhanced Task interface for project management
export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  tags: string[]
  assignee?: string
  dueDate?: Date
  estimatedHours?: number
  actualHours?: number
  projectId?: string
  parentTaskId?: string
  subtasks: string[]
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface Project {
  id: string
  name: string
  description?: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  startDate?: Date
  dueDate?: Date
  completedAt?: Date
  progress: number // 0-100
  color: string
  tags: string[]
  teamMembers: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  color: string
  icon?: string
  description?: string
  projectId?: string
  createdAt: Date
}

export interface TimeEntry {
  id: string
  taskId: string
  projectId?: string
  startTime: Date
  endTime?: Date
  duration: number // in minutes
  description?: string
  type: 'work' | 'break' | 'meeting' | 'other'
  createdAt: Date
}

export interface Goal {
  id: string
  title: string
  description?: string
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  target: number
  current: number
  unit: string // e.g., 'tasks', 'hours', 'projects'
  deadline?: Date
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  projectId?: string
  createdAt: Date
  updatedAt: Date
}

export interface DocumentFilter {
  searchTerm?: string
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface StorageProvider {
  // Document methods
  saveDocument(document: Document): Promise<void>
  getDocument(id: string): Promise<Document | null>
  getAllDocuments(): Promise<Document[]>
  deleteDocument(id: string): Promise<void>
  searchDocuments(query: string): Promise<Document[]>
  
  // Todo methods (legacy)
  saveTodo(todo: TodoItem): Promise<void>
  getAllTodos(): Promise<TodoItem[]>
  deleteTodo(id: string): Promise<void>
  updateTodo(todo: TodoItem): Promise<void>
  
  // Task methods
  saveTask(task: Task): Promise<void>
  getTask(id: string): Promise<Task | null>
  getAllTasks(): Promise<Task[]>
  getTasksByProject(projectId: string): Promise<Task[]>
  getTasksByCategory(category: string): Promise<Task[]>
  updateTask(task: Task): Promise<void>
  deleteTask(id: string): Promise<void>
  
  // Project methods
  saveProject(project: Project): Promise<void>
  getProject(id: string): Promise<Project | null>
  getAllProjects(): Promise<Project[]>
  updateProject(project: Project): Promise<void>
  deleteProject(id: string): Promise<void>
  
  // Category methods
  saveCategory(category: Category): Promise<void>
  getAllCategories(): Promise<Category[]>
  getCategoriesByProject(projectId?: string): Promise<Category[]>
  updateCategory(category: Category): Promise<void>
  deleteCategory(id: string): Promise<void>
  
  // Time tracking methods
  saveTimeEntry(entry: TimeEntry): Promise<void>
  getTimeEntriesByTask(taskId: string): Promise<TimeEntry[]>
  getTimeEntriesByProject(projectId: string): Promise<TimeEntry[]>
  getTimeEntriesByDateRange(start: Date, end: Date): Promise<TimeEntry[]>
  updateTimeEntry(entry: TimeEntry): Promise<void>
  deleteTimeEntry(id: string): Promise<void>
  
  // Goal methods
  saveGoal(goal: Goal): Promise<void>
  getAllGoals(): Promise<Goal[]>
  getGoalsByProject(projectId: string): Promise<Goal[]>
  updateGoal(goal: Goal): Promise<void>
  deleteGoal(id: string): Promise<void>
}