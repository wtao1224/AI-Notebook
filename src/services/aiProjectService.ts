import { Project, Task, Goal } from '../types';

interface AIProjectSuggestion {
  type: 'project' | 'task' | 'optimization' | 'insight';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  confidence: number; // 0-1
  actionable: boolean;
  metadata?: any;
}

interface ProjectAnalytics {
  productivity: number;
  riskLevel: 'low' | 'medium' | 'high';
  completionPrediction: Date;
  bottlenecks: string[];
  recommendations: string[];
}

class AIProjectService {
  private readonly API_KEY = "sk-3qvdzx18J3qQdotCRx2k7jzpGpn4ITJeKquZzB1UpLha3tLu";
  private readonly API_URL = "https://api.moonshot.cn/v1/chat/completions";
  private readonly USE_MOCK_AI = false; // Set to true for development

  /**
   * Analyze projects and provide AI-powered insights
   */
  async analyzeProjects(projects: Project[], tasks: Task[]): Promise<ProjectAnalytics[]> {
    if (this.USE_MOCK_AI) {
      return this.getMockProjectAnalytics(projects, tasks);
    }

    try {
      const projectData = projects.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        priority: p.priority,
        progress: p.progress,
        taskCount: tasks.filter(t => t.projectId === p.id).length,
        completedTasks: tasks.filter(t => t.projectId === p.id && t.status === 'completed').length,
        createdAt: p.createdAt,
        dueDate: p.dueDate
      }));

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [
            {
              role: 'system',
              content: `You are an AI project management analyst. Analyze the provided project data and return insights in JSON format. For each project, provide:
              {
                "productivity": number (0-100),
                "riskLevel": "low" | "medium" | "high",
                "completionPrediction": ISO date string,
                "bottlenecks": string[],
                "recommendations": string[]
              }
              Return an array of these objects, one for each project.`
            },
            {
              role: 'user',
              content: `Analyze these projects: ${JSON.stringify(projectData)}`
            }
          ],
          max_tokens: 1500,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`AI API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      try {
        const parsedResponse = JSON.parse(aiResponse);
        // Convert ISO date strings to Date objects
        return parsedResponse.map((analytics: any) => ({
          ...analytics,
          completionPrediction: new Date(analytics.completionPrediction)
        }));
      } catch {
        // Fallback to mock data if AI response is not valid JSON
        return this.getMockProjectAnalytics(projects, tasks);
      }
    } catch (error) {
      console.error('AI Project Analysis Error:', error);
      return this.getMockProjectAnalytics(projects, tasks);
    }
  }

  /**
   * Generate AI-powered project suggestions
   */
  async generateProjectSuggestions(
    projects: Project[], 
    tasks: Task[], 
    goals: Goal[]
  ): Promise<AIProjectSuggestion[]> {
    if (this.USE_MOCK_AI) {
      return this.getMockProjectSuggestions(projects, tasks);
    }

    try {
      const context = {
        projectCount: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        pendingTasks: tasks.filter(t => t.status === 'todo').length,
        goals: goals.map(g => ({ title: g.title, type: g.type, progress: g.current / g.target }))
      };

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [
            {
              role: 'system',
              content: `You are an AI project management assistant. Based on the user's current projects, tasks, and goals, suggest actionable improvements. Return suggestions in JSON format:
              {
                "type": "project" | "task" | "optimization" | "insight",
                "title": string,
                "description": string,
                "priority": "low" | "medium" | "high",
                "confidence": number (0-1),
                "actionable": boolean
              }
              Provide 3-5 practical suggestions.`
            },
            {
              role: 'user',
              content: `Current context: ${JSON.stringify(context)}. What improvements do you suggest?`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`AI API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      try {
        const suggestions = JSON.parse(aiResponse);
        return Array.isArray(suggestions) ? suggestions : [suggestions];
      } catch {
        return this.getMockProjectSuggestions(projects, tasks);
      }
    } catch (error) {
      console.error('AI Suggestions Error:', error);
      return this.getMockProjectSuggestions(projects, tasks);
    }
  }

  /**
   * Generate project suggestions based on user context
   */
  async generateProjectSuggestionsWithContext(context: {
    existingProjects: Project[];
    recentTasks: Task[];
    userPreferences: {
      preferredCategories: string[];
      workingHours: number;
      timezone: string;
    };
  }): Promise<any[]> {
    if (this.USE_MOCK_AI) {
      return this.getMockProjectSuggestionsWithContext();
    }

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [
            {
              role: 'system',
              content: 'You are an AI project management assistant. Generate project suggestions based on user context and patterns.'
            },
            {
              role: 'user',
              content: `Based on my existing projects and preferences, suggest 3-5 new project ideas. Context: ${JSON.stringify(context)}`
            }
          ],
          max_tokens: 800,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`AI API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      try {
        const suggestions = JSON.parse(aiResponse);
        return Array.isArray(suggestions) ? suggestions : [suggestions];
      } catch {
        return this.getMockProjectSuggestionsWithContext();
      }
    } catch (error) {
      console.error('Error generating project suggestions:', error);
      return this.getMockProjectSuggestionsWithContext();
    }
  }

  /**
   * AI-powered task prioritization
   */
  async prioritizeTasks(tasks: Task[]): Promise<Task[]> {
    if (this.USE_MOCK_AI) {
      return this.getMockPrioritizedTasks(tasks);
    }

    try {
      const taskData = tasks.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        createdAt: t.createdAt,
        dueDate: t.dueDate
      }));

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [
            {
              role: 'system',
              content: `You are an AI task prioritization expert. Analyze the provided tasks and return them in optimal priority order. Consider urgency, importance, dependencies, and project context. Return an array of task IDs in priority order (highest to lowest priority).`
            },
            {
              role: 'user',
              content: `Prioritize these tasks: ${JSON.stringify(taskData)}`
            }
          ],
          max_tokens: 500,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`AI API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      try {
        const prioritizedIds = JSON.parse(aiResponse);
        const prioritizedTasks = prioritizedIds
          .map((id: string) => tasks.find(t => t.id === id))
          .filter(Boolean);
        
        // Add any tasks that weren't included in AI response
        const includedIds = new Set(prioritizedIds);
        const remainingTasks = tasks.filter(t => !includedIds.has(t.id));
        
        return [...prioritizedTasks, ...remainingTasks];
      } catch {
        return this.getMockPrioritizedTasks(tasks);
      }
    } catch (error) {
      console.error('AI Task Prioritization Error:', error);
      return this.getMockPrioritizedTasks(tasks);
    }
  }

  /**
   * Generate smart project templates based on user's work patterns
   */
  async generateProjectTemplate(projectType: string, userContext: any): Promise<Partial<Project> & { suggestedTasks: Partial<Task>[] }> {
    if (this.USE_MOCK_AI) {
      return this.getMockProjectTemplate(projectType);
    }

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'moonshot-v1-8k',
          messages: [
            {
              role: 'system',
              content: `You are an AI project template generator. Create a comprehensive project template with suggested tasks. Return JSON format:
              {
                "name": string,
                "description": string,
                "priority": "low" | "medium" | "high",
                "tags": string[],
                "suggestedTasks": [
                  {
                    "title": string,
                    "description": string,
                    "priority": "low" | "medium" | "high",
                    "estimatedHours": number
                  }
                ]
              }`
            },
            {
              role: 'user',
              content: `Create a project template for: ${projectType}. Context: ${JSON.stringify(userContext)}`
            }
          ],
          max_tokens: 800,
          temperature: 0.6
        })
      });

      if (!response.ok) {
        throw new Error(`AI API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      try {
        return JSON.parse(aiResponse);
      } catch {
        return this.getMockProjectTemplate(projectType);
      }
    } catch (error) {
      console.error('AI Template Generation Error:', error);
      return this.getMockProjectTemplate(projectType);
    }
  }



  // Mock implementations for development/fallback
  private getMockProjectAnalytics(projects: Project[], tasks: Task[]): ProjectAnalytics[] {
    return projects.map(project => {
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
      const productivity = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;
      
      // Calculate days until completion based on productivity (1-30 days)
      const daysUntilCompletion = Math.max(1, Math.min(30, Math.round(30 - (productivity * 0.3))));
      
      return {
        productivity: Math.round(productivity),
        riskLevel: productivity < 30 ? 'high' : productivity < 70 ? 'medium' : 'low',
        completionPrediction: new Date(Date.now() + daysUntilCompletion * 24 * 60 * 60 * 1000),
        bottlenecks: productivity < 50 ? ['Task dependencies', 'Resource allocation'] : [],
        recommendations: [
          productivity < 50 ? 'Consider breaking down large tasks' : 'Maintain current momentum',
          'Regular team check-ins recommended'
        ]
      };
    });
  }

  private getMockProjectSuggestions(projects: Project[], tasks: Task[]): AIProjectSuggestion[] {
    const suggestions: AIProjectSuggestion[] = [];
    
    if (projects.length === 0) {
      suggestions.push({
        type: 'project',
        title: 'Create Your First Project',
        description: 'Start organizing your work by creating a project to group related tasks.',
        priority: 'high',
        confidence: 0.9,
        actionable: true
      });
    }
    
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed');
    if (overdueTasks.length > 0) {
      suggestions.push({
        type: 'task',
        title: 'Address Overdue Tasks',
        description: `You have ${overdueTasks.length} overdue tasks that need attention.`,
        priority: 'high',
        confidence: 1.0,
        actionable: true
      });
    }
    
    const activeProjects = projects.filter(p => p.status === 'active');
    if (activeProjects.length > 5) {
      suggestions.push({
        type: 'optimization',
        title: 'Consider Project Consolidation',
        description: 'You have many active projects. Consider consolidating or prioritizing.',
        priority: 'medium',
        confidence: 0.7,
        actionable: true
      });
    }
    
    return suggestions;
  }

  private getMockPrioritizedTasks(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      // Priority: high > medium > low
      const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.priority] || 1;
      const bPriority = priorityWeight[b.priority] || 1;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Then by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      // Finally by creation date
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  private getMockProjectTemplate(projectType: string): Partial<Project> & { suggestedTasks: Partial<Task>[] } {
    const templates: Record<string, any> = {
      'web-development': {
        name: 'Web Development Project',
        description: 'A comprehensive web development project template',
        priority: 'medium',
        tags: ['web', 'development', 'frontend'],
        suggestedTasks: [
          { title: 'Project Setup', description: 'Initialize project structure and dependencies', priority: 'high', estimatedHours: 4 },
          { title: 'UI/UX Design', description: 'Create wireframes and design mockups', priority: 'high', estimatedHours: 16 },
          { title: 'Frontend Development', description: 'Implement user interface components', priority: 'medium', estimatedHours: 40 },
          { title: 'Backend Integration', description: 'Connect frontend with backend APIs', priority: 'medium', estimatedHours: 24 },
          { title: 'Testing & QA', description: 'Comprehensive testing and quality assurance', priority: 'high', estimatedHours: 16 },
          { title: 'Deployment', description: 'Deploy to production environment', priority: 'medium', estimatedHours: 8 }
        ]
      },
      'marketing-campaign': {
        name: 'Marketing Campaign',
        description: 'Strategic marketing campaign planning and execution',
        priority: 'high',
        tags: ['marketing', 'campaign', 'strategy'],
        suggestedTasks: [
          { title: 'Market Research', description: 'Analyze target audience and competitors', priority: 'high', estimatedHours: 12 },
          { title: 'Campaign Strategy', description: 'Develop comprehensive campaign strategy', priority: 'high', estimatedHours: 8 },
          { title: 'Content Creation', description: 'Create marketing materials and content', priority: 'medium', estimatedHours: 20 },
          { title: 'Channel Setup', description: 'Set up marketing channels and tools', priority: 'medium', estimatedHours: 6 },
          { title: 'Campaign Launch', description: 'Execute campaign launch', priority: 'high', estimatedHours: 4 },
          { title: 'Performance Monitoring', description: 'Track and analyze campaign performance', priority: 'medium', estimatedHours: 8 }
        ]
      }
    };
    
    return templates[projectType] || {
      name: `${projectType} Project`,
      description: `A project template for ${projectType}`,
      priority: 'medium',
      tags: [projectType],
      suggestedTasks: [
        { title: 'Planning Phase', description: 'Initial project planning and requirements gathering', priority: 'high', estimatedHours: 8 },
        { title: 'Implementation', description: 'Main implementation work', priority: 'medium', estimatedHours: 24 },
        { title: 'Review & Testing', description: 'Quality assurance and testing', priority: 'high', estimatedHours: 8 },
        { title: 'Finalization', description: 'Final touches and delivery', priority: 'medium', estimatedHours: 4 }
      ]
    };
  }

  private getMockProjectSuggestionsWithContext(): any[] {
    return [
      {
        id: '1',
        title: 'Personal Website Redesign',
        description: 'Update your personal portfolio with modern design trends',
        category: 'Web Development',
        estimatedDuration: '2-3 weeks',
        difficulty: 'Medium',
        tags: ['web', 'design', 'portfolio']
      },
      {
        id: '2',
        title: 'Mobile App Prototype',
        description: 'Create a prototype for your mobile application idea',
        category: 'Mobile Development',
        estimatedDuration: '3-4 weeks',
        difficulty: 'High',
        tags: ['mobile', 'prototype', 'app']
      },
      {
        id: '3',
        title: 'Content Marketing Strategy',
        description: 'Develop a comprehensive content marketing plan',
        category: 'Marketing',
        estimatedDuration: '1-2 weeks',
        difficulty: 'Low',
        tags: ['marketing', 'content', 'strategy']
      }
    ];
  }


}

export const aiProjectService = new AIProjectService();
export type { AIProjectSuggestion, ProjectAnalytics };