import React, { useState, useEffect } from 'react';
import { Project, Task, Goal } from '../types';
import { aiProjectService, AIProjectSuggestion, ProjectAnalytics } from '../services/aiProjectService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Progress } from '@/components/ui/progress';

interface AIProjectInsightsProps {
  projects: Project[];
  tasks: Task[];
  goals: Goal[];
  onProjectCreate?: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTaskCreate?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const AIProjectInsights: React.FC<AIProjectInsightsProps> = ({
  projects,
  tasks,
  goals,
  onProjectCreate,
  onTaskCreate
}) => {
  const [suggestions, setSuggestions] = useState<AIProjectSuggestion[]>([]);
  const [analytics, setAnalytics] = useState<ProjectAnalytics[]>([]);
  const [prioritizedTasks, setPrioritizedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'analytics' | 'prioritization'>('suggestions');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Auto-refresh insights when data changes
  useEffect(() => {
    const shouldRefresh = 
      Date.now() - lastRefresh.getTime() > 30000 || // 30 seconds
      suggestions.length === 0;
    
    if (shouldRefresh) {
      refreshInsights();
    }
  }, [projects, tasks, goals]);

  const refreshInsights = async () => {
    setIsLoading(true);
    try {
      const [newSuggestions, newAnalytics, newPrioritizedTasks] = await Promise.all([
        aiProjectService.generateProjectSuggestions(projects, tasks, goals),
        aiProjectService.analyzeProjects(projects, tasks),
        aiProjectService.prioritizeTasks(tasks, projects)
      ]);
      
      setSuggestions(newSuggestions);
      setAnalytics(newAnalytics);
      setPrioritizedTasks(newPrioritizedTasks);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = async (suggestion: AIProjectSuggestion) => {
    if (!suggestion.actionable) return;

    try {
      if (suggestion.type === 'project' && onProjectCreate) {
        // Generate a project template based on the suggestion
        const template = await aiProjectService.generateProjectTemplate(
          suggestion.title.toLowerCase().replace(/\s+/g, '-'),
          { projects, tasks, goals }
        );
        
        const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
          name: template.name || suggestion.title,
          description: template.description || suggestion.description,
          status: 'planning',
          priority: template.priority || suggestion.priority,
          progress: 0,
          color: '#3B82F6',
          tags: template.tags || [],
          teamMembers: []
        };
        
        onProjectCreate(newProject);
        
        // Create suggested tasks if available
        if (template.suggestedTasks && onTaskCreate) {
          template.suggestedTasks.forEach((taskTemplate, index) => {
            setTimeout(() => {
              const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
                title: taskTemplate.title || `Task ${index + 1}`,
                description: taskTemplate.description || '',
                status: 'todo',
                priority: taskTemplate.priority || 'medium',
                category: 'Work',
                tags: [],
                subtasks: []
              };
              onTaskCreate(newTask);
            }, index * 100); // Stagger task creation
          });
        }
      }
      
      // Remove applied suggestion
      setSuggestions(prev => prev.filter(s => s !== suggestion));
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (date: Date | string) => {
    // Convert string to Date if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(dateObj);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🤖 AI Project Insights
              {isLoading && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered suggestions and analytics for your projects
            </p>
          </div>
          <Button
            onClick={refreshInsights}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            🔄 Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              💡 Suggestions
              {suggestions.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {suggestions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
            <TabsTrigger value="prioritization">🎯 Task Priority</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="mt-4">
            <div className="space-y-3">
              {suggestions.length === 0 && !isLoading && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center">
                      🎉 Great job! No immediate suggestions at the moment. Your projects are well-organized.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{suggestion.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={getPriorityColor(suggestion.priority)}
                          >
                            {suggestion.priority}
                          </Badge>
                          <Badge variant="secondary">
                            {Math.round(suggestion.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {suggestion.type}
                          </Badge>
                          {suggestion.actionable && (
                            <Badge variant="outline" className="text-green-700 border-green-300">
                              ✓ Actionable
                            </Badge>
                          )}
                        </div>
                      </div>
                      {suggestion.actionable && (
                        <Button
                          onClick={() => handleApplySuggestion(suggestion)}
                          size="sm"
                          className="ml-4"
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <div className="space-y-4">
              {analytics.length === 0 && !isLoading && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center">
                      Create some projects to see AI-powered analytics and insights.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {analytics.map((analytic, index) => {
                const project = projects[index];
                if (!project) return null;
                
                return (
                  <Card key={project.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          {project.name}
                        </h4>
                        <Badge className={getRiskColor(analytic.riskLevel)}>
                          {analytic.riskLevel} risk
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Productivity Score</span>
                            <span>{analytic.productivity}%</span>
                          </div>
                          <Progress value={analytic.productivity} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            Predicted Completion
                          </div>
                          <div className="font-medium">
                            {formatDate(analytic.completionPrediction)}
                          </div>
                        </div>
                      </div>
                      
                      {analytic.bottlenecks.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-2">🚧 Bottlenecks:</div>
                          <div className="flex flex-wrap gap-1">
                            {analytic.bottlenecks.map((bottleneck, i) => (
                              <Badge key={i} variant="destructive" className="text-xs">
                                {bottleneck}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {analytic.recommendations.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-2">💡 Recommendations:</div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {analytic.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="prioritization" className="mt-4">
            <div className="space-y-3">
              {prioritizedTasks.length === 0 && !isLoading && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center">
                      Create some tasks to see AI-powered priority recommendations.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              <div className="text-sm text-muted-foreground mb-4">
                Tasks ordered by AI-recommended priority (most important first):
              </div>
              
              {prioritizedTasks.slice(0, 10).map((task, index) => {
                const project = projects.find(p => p.id === task.projectId);
                return (
                  <Card key={task.id} className={`${index < 3 ? 'border-l-4 border-l-orange-500' : ''}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-muted-foreground">
                              #{index + 1}
                            </span>
                            <h4 className="font-medium">{task.title}</h4>
                            <Badge 
                              variant="outline" 
                              className={getPriorityColor(task.priority)}
                            >
                              {task.priority}
                            </Badge>
                            {index < 3 && (
                              <Badge variant="destructive" className="text-xs">
                                High Priority
                              </Badge>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {project && (
                              <span className="flex items-center gap-1">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: project.color }}
                                />
                                {project.name}
                              </span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {prioritizedTasks.length > 10 && (
                <div className="text-center text-sm text-muted-foreground">
                  ... and {prioritizedTasks.length - 10} more tasks
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIProjectInsights;