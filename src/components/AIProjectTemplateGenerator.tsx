import React, { useState } from 'react';
import { Project, Task } from '../types';
import { aiProjectService } from '../services/aiProjectService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface AIProjectTemplateGeneratorProps {
  onProjectCreate: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  existingProjects: Project[];
  existingTasks: Task[];
}

interface ProjectTemplate {
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  suggestedTasks: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimatedHours?: number;
  }>;
}

const AIProjectTemplateGenerator: React.FC<AIProjectTemplateGeneratorProps> = ({
  onProjectCreate,
  onTaskCreate,
  existingProjects,
  existingTasks
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectType, setProjectType] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [generatedTemplate, setGeneratedTemplate] = useState<ProjectTemplate | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [projectColor, setProjectColor] = useState('#3B82F6');

  const predefinedTypes = [
    { value: 'web-development', label: '🌐 Web Development', description: 'Frontend/backend web applications' },
    { value: 'mobile-app', label: '📱 Mobile App', description: 'iOS/Android mobile applications' },
    { value: 'marketing-campaign', label: '📢 Marketing Campaign', description: 'Digital marketing and promotion' },
    { value: 'research-project', label: '🔬 Research Project', description: 'Academic or business research' },
    { value: 'event-planning', label: '🎉 Event Planning', description: 'Conference, workshop, or event organization' },
    { value: 'product-launch', label: '🚀 Product Launch', description: 'New product or feature launch' },
    { value: 'content-creation', label: '✍️ Content Creation', description: 'Blog, video, or multimedia content' },
    { value: 'business-process', label: '⚙️ Business Process', description: 'Workflow optimization and automation' },
    { value: 'learning-development', label: '📚 Learning & Development', description: 'Training programs and skill development' },
    { value: 'custom', label: '🎨 Custom Project', description: 'Define your own project type' }
  ];

  const generateTemplate = async () => {
    if (!projectType) return;
    
    setIsGenerating(true);
    try {
      const userContext = {
        existingProjectTypes: existingProjects.map(p => p.tags).flat(),
        projectCount: existingProjects.length,
        averageTasksPerProject: existingTasks.length / Math.max(existingProjects.length, 1),
        customDescription: customDescription.trim()
      };

      const template = await aiProjectService.generateProjectTemplate(projectType, userContext);
      setGeneratedTemplate(template as ProjectTemplate);
      
      // Select all tasks by default
      setSelectedTasks(new Set(template.suggestedTasks?.map((_, index) => index) || []));
    } catch (error) {
      console.error('Failed to generate template:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTaskSelection = (taskIndex: number, checked: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(taskIndex);
    } else {
      newSelected.delete(taskIndex);
    }
    setSelectedTasks(newSelected);
  };

  const createProjectFromTemplate = () => {
    if (!generatedTemplate) return;

    // Create the project
    const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      name: generatedTemplate.name,
      description: generatedTemplate.description,
      status: 'planning',
      priority: generatedTemplate.priority,
      progress: 0,
      color: projectColor,
      tags: generatedTemplate.tags || [],
      teamMembers: []
    };

    onProjectCreate(newProject);

    // Create selected tasks with a delay to ensure project is created first
    setTimeout(() => {
      generatedTemplate.suggestedTasks?.forEach((taskTemplate, index) => {
        if (selectedTasks.has(index)) {
          const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
            title: taskTemplate.title,
            description: taskTemplate.description,
            status: 'todo',
            priority: taskTemplate.priority,
            category: 'Work',
            tags: generatedTemplate.tags || [],
            subtasks: []
          };
          
          // Stagger task creation to avoid overwhelming the UI
          setTimeout(() => onTaskCreate(newTask), index * 100);
        }
      });
    }, 500);

    // Reset form
    setGeneratedTemplate(null);
    setProjectType('');
    setCustomDescription('');
    setSelectedTasks(new Set());
    setIsOpen(false);
  };

  const resetForm = () => {
    setGeneratedTemplate(null);
    setProjectType('');
    setCustomDescription('');
    setSelectedTasks(new Set());
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          🤖 AI Project Generator
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🤖 AI-Powered Project Template Generator
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!generatedTemplate ? (
            // Step 1: Project Type Selection
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Select Project Type</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose a project type to generate an AI-powered template with suggested tasks and structure.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {predefinedTypes.map((type) => (
                    <Card 
                      key={type.value}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        projectType === type.value ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setProjectType(type.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{type.label.split(' ')[0]}</div>
                          <div>
                            <h4 className="font-medium">{type.label.substring(2)}</h4>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {projectType === 'custom' && (
                <div>
                  <Label htmlFor="custom-description">Describe Your Project</Label>
                  <Textarea
                    id="custom-description"
                    placeholder="Describe what kind of project you want to create. Be as specific as possible to get better AI suggestions..."
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Label htmlFor="project-color">Project Color</Label>
                <input
                  id="project-color"
                  type="color"
                  value={projectColor}
                  onChange={(e) => setProjectColor(e.target.value)}
                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={generateTemplate}
                  disabled={!projectType || isGenerating || (projectType === 'custom' && !customDescription.trim())}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating Template...
                    </>
                  ) : (
                    '🎯 Generate AI Template'
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // Step 2: Review and Customize Template
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📋 Generated Project Template
                    <Badge variant="secondary">AI Generated</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-medium">Project Name</Label>
                    <Input 
                      value={generatedTemplate.name} 
                      onChange={(e) => setGeneratedTemplate(prev => prev ? {...prev, name: e.target.value} : null)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="font-medium">Description</Label>
                    <Textarea 
                      value={generatedTemplate.description} 
                      onChange={(e) => setGeneratedTemplate(prev => prev ? {...prev, description: e.target.value} : null)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div>
                      <Label className="font-medium">Priority</Label>
                      <Select 
                        value={generatedTemplate.priority} 
                        onValueChange={(value: 'low' | 'medium' | 'high') => 
                          setGeneratedTemplate(prev => prev ? {...prev, priority: value} : null)
                        }
                      >
                        <SelectTrigger className="w-32 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {generatedTemplate.tags?.map((tag, index) => (
                          <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Tasks</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select which tasks you want to create with this project. You can modify them later.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generatedTemplate.suggestedTasks?.map((task, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <Checkbox
                          id={`task-${index}`}
                          checked={selectedTasks.has(index)}
                          onCheckedChange={(checked) => handleTaskSelection(index, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Label htmlFor={`task-${index}`} className="font-medium cursor-pointer">
                              {task.title}
                            </Label>
                            <Badge 
                              variant="outline" 
                              className={getPriorityColor(task.priority)}
                            >
                              {task.priority}
                            </Badge>
                            {task.estimatedHours && (
                              <Badge variant="secondary" className="text-xs">
                                ~{task.estimatedHours}h
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {selectedTasks.size} of {generatedTemplate.suggestedTasks?.length || 0} tasks selected
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedTasks(new Set())}
                      >
                        Select None
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedTasks(new Set(generatedTemplate.suggestedTasks?.map((_, i) => i) || []))}
                      >
                        Select All
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-3">
                <Button onClick={createProjectFromTemplate} className="flex-1">
                  ✨ Create Project ({selectedTasks.size} tasks)
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  ← Back
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIProjectTemplateGenerator;